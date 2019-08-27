import React, { ReactNode } from 'react';
import BoardView from './BoardView';
import { PieceColor, Coordinates, coordinatesToIndex, MoveResponse, 
   Status, StatusResponse } from '../classes/Game';
import Board from '../classes/Board';
import Piece from '../classes/Piece';
import '../css/Board.css';

interface CheckersProps {
  player: PieceColor;
  hasFirstTurn: boolean;
  onEnd: (endMsg: string) => Promise<undefined>;
  onForfeit: (forfeitMsg: string) => Promise<undefined>;
  onSendMoves: (moves: string[][]) => Promise<StatusResponse>;
  onReceiveMoves: () => Promise<MoveResponse>;
  onStatus: () => Promise<Status>;
  onUnload: () => Promise<undefined>;
  setHeartbeat: (id: number) => void; // Pass interval ID to parent (App.tsx) so when status fails we can clear it
}

interface CheckersState {
  board: Board;
  selected: Coordinates | null;
  highlighted: Coordinates[];
  history: string[][];
  turnMoves: string[][];
  hasTurn: boolean;
  hasCaptured: boolean;
  computedMoves: boolean;
  heartbeat: number | null;
}

class Checkers extends React.Component<CheckersProps, CheckersState> {
  constructor(props: CheckersProps) {
    super(props);

    const positions = this.getInitialPositions();
    const board = new Board(positions);

    this.state = {
      board,
      selected: null,
      highlighted: [],
      history: [[...positions]],
      turnMoves: [],
      hasTurn: props.hasFirstTurn,
      hasCaptured: false,
      computedMoves: false,
      heartbeat: null,
    };
  }

  componentDidMount = (): void => {
    if(this.state.hasTurn) {
      this.state.board.computeAllValidMoves(this.props.player).then(() => {
        this.setState({ computedMoves: true });
      });
    } else {
      this.props.onReceiveMoves().then(async (moves: MoveResponse) => {
        await this.handleNewMoves(moves);
      });
    }
    const heartbeat = window.setInterval(this.props.onStatus, 10000);
    this.props.setHeartbeat(heartbeat);
    this.setState({ heartbeat });
    window.addEventListener('beforeunload', this.props.onUnload);
  };

  getPlayerPieces = (): Piece[] => {
    switch (this.props.player) {
    case PieceColor.RED: return this.state.board.redPieces;
    case PieceColor.WHITE: return this.state.board.whitePieces;
    }
  };

  handleSquareClick = (coords: Coordinates): void => {
    if(!this.state.hasTurn) {
      return;
    }

    // Should be rare but means board is still computing moves so board has to be unresponsive
    if(!this.state.computedMoves) {
      return;
    }

    const { board, selected, highlighted } = this.state;
    if(selected === null) {
      const piece = board.squares[coordinatesToIndex(coords)].piece;
      const isValidSelection = piece !== null && piece.color === this.props.player;
      
      if(!isValidSelection) {
        return;
      }

      const validMoves = board.getValidMoves(coords, false);
      const newHighlighted = ([] as Coordinates[]).concat(highlighted, validMoves);
      this.setState({ selected: coords, highlighted: newHighlighted });
      return;
    } else {
      if(selected[0] === coords[0] && selected[1] === coords[1] && !this.state.hasCaptured) {
        this.setState({ selected: null, highlighted: [] });
        return;
      }
      const isValidMove = highlighted.some(([x, y]) => {
        return x === coords[0] && y === coords[1];
      });

      if(!isValidMove){
        return;
      }
      const wasKing = board.squares[coordinatesToIndex(selected)].piece!.isKing;
      const preserveTurn = board.movePieceToPosition(selected, coords);
      const becameKing = !wasKing && board.squares[coordinatesToIndex(coords)].piece!.isKing;
      const turnMoves = [...this.state.turnMoves];
      turnMoves.push(board.serializeToArray());

      // Once a piece becomes king the turn has to end
      if(preserveTurn && !becameKing) {
        const piece = board.squares[coordinatesToIndex(coords)].piece;
        const isValidSelection = piece !== null && piece.color === this.props.player;

        if(!isValidSelection) {
          console.error("Piece was not updated to position after capture!");
          return;
        }

        const validMoves = board.getValidMoves(coords, true);
        if(validMoves.length !== 0) {
          this.setState({ selected: coords,
            highlighted: validMoves,
            hasCaptured: true,
            turnMoves,
          });
          return;
        }
      }

      const history = [...this.state.history];
      history.push(...turnMoves);

      this.setState({
        selected: null, 
        highlighted: [], 
        board,
        history,
        hasCaptured: false,
        computedMoves: false,
      });

      this.props.onSendMoves(turnMoves)
        .then((res) => {
          const status = res.status;
          if(status === Status.END) {
            window.clearInterval(this.state.heartbeat!);
            this.props.onEnd(`You won the game! congratulations!`);
            return;
          } else if (status === Status.DISCONNECT) {
            window.clearInterval(this.state.heartbeat!);
            this.props.onEnd('Your opponent disconnected!');
            return;
          }

          this.checkAndHandleWinner();
          this.setState({ hasTurn: false });
          this.props.onReceiveMoves().then(async (moves: MoveResponse) => {
            await this.handleNewMoves(moves);
          });
        })
        .catch((error) => {
          console.log(error);
          window.clearInterval(this.state.heartbeat!);
          this.props.onForfeit('You lost connection with the server.');
        });
    }
  };

  checkAndHandleWinner = (): void => {
    const winner = this.state.board.getGameWinner();
    let message;
    if(winner) {
      if(winner === this.props.player) {
        message = 'Congratulations! You won!';
      } else {
        message = `You lost! But don't give up!`;
      }
      window.clearInterval(this.state.heartbeat!);
      this.props.onEnd(message);
    }
  };

  handleNewMoves = async (res: MoveResponse): Promise<undefined> => {
    const { status, newMoves } = res;
    
    if(status === Status.END) {
      window.clearInterval(this.state.heartbeat!);
      this.props.onEnd(`You lost! But don't give up!`);
      return;
    } else if (status === Status.DISCONNECT || status === Status.ERROR) {
      window.clearInterval(this.state.heartbeat!);
      this.props.onEnd('Your opponent disconnected!');
      return;
    }
    const history = [...this.state.history];
    history.push(...newMoves);
    this.setState({ hasTurn: true });
    await this.renderReceivedMoves(newMoves);
    this.checkAndHandleWinner();
    this.setState({
      turnMoves: [],
      history,
    }, () => {
      this.state.board.computeAllValidMoves(this.props.player).then(() => {
        this.setState({ computedMoves: true });
      });
    });
    return;
  };

  renderReceivedMoves = async (moves: string[][]): Promise<undefined> => {
    // have to reverse the board part
    const reversedMoves: string[][] = [];
    moves.forEach((move) => {
      const board = move.slice(0, 64);
      board.reverse();
      if(move.length > 64)
      board.push(...move.slice(64));
      reversedMoves.push(board);
    });
    let promise: Promise<undefined> = new Promise((resolve): void => {
      for(let i = 0; i < reversedMoves.length; i++) {
        window.setTimeout(() => {
          this.setState({ board: new Board(reversedMoves[i])});
          if(i === reversedMoves.length - 1) {
            resolve(undefined);
          }
        }, (1000 * (i + 1)) - ((i + 1) * 10));
      }
    });
    
    return promise;
  };

  getInitialPositions = (): string[] => {
    const intitialPositions = `-r-r-r-r
                               r-r-r-r-
                               --------
                               --------
                               --------
                               --------
                               -w-w-w-w
                               w-w-w-w-`.replace(/(\n|\t|\s)/g, '').split('');

    if(this.props.player === PieceColor.RED) {
      intitialPositions.reverse();
    }
    return intitialPositions;
  };

  render = (): ReactNode => {
    return (
      <div className="board-container">
        <BoardView
          board={this.state.board}
          onSquareClick={this.handleSquareClick}
          selected={this.state.selected}
          highlighted={this.state.highlighted}
          hasTurn={this.state.hasTurn}
        />
      </div>
    );
  };
}

export default Checkers;