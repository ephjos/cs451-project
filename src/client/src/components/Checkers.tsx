import React, { ReactNode } from 'react';
import BoardView from './BoardView';
import { PieceColor, Coordinates, coordinatesToIndex, MoveResponse, EndResponse, DisconnectResponse, Status } from '../classes/Game';
import Board from '../classes/Board';
import Piece from '../classes/Piece';
import '../css/Board.css';

interface CheckersProps {
  player: PieceColor;
  hasFirstTurn: boolean;
  onEnd: (endMsg: string) => Promise<undefined>;
  onForfeit: (forfeitMsg: string) => Promise<undefined>;
  onMove: (moves: string[][]) => Promise<MoveResponse>;
  onStatus: () => Promise<Status>;
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
  heartbeat: NodeJS.Timeout | null;
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
    this.state.board.computeAllValidMoves(this.props.player).then(() => {
      this.setState({ computedMoves: true });
    });
    this.setState({ heartbeat: setInterval(this.props.onStatus, 10000) });
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
        // Here is where we handle if a capture was made
        // By now the piece should have moved to our selected coords
        const piece = board.squares[coordinatesToIndex(coords)].piece;
        const isValidSelection = piece !== null && piece.color === this.props.player;
        
        // But if data update goes wrong then we have to indicate
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
        hasTurn: false,
        computedMoves: false,
      });
      /**
       * At this point we disable the UI and send history to the server
       * then basically wait till we get a response
       */
      // Do not forget to precompute moves again upon receiving moves
      this.props.onMove(turnMoves)
        .then(async (res) => {
          await this.handleNewMoves(res);
        })
        .catch(() => {
          clearInterval(this.state.heartbeat!);
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
      clearInterval(this.state.heartbeat!);
      this.props.onEnd(message);
    }
  };

  handleNewMoves = async (res: MoveResponse): Promise<undefined> => {
    const { status, newMoves } = res;
    
    if(status === Status.END) {
      clearInterval(this.state.heartbeat!);
      this.props.onEnd(`You lost! But don't give up!`);
      return;
    } else if (status === Status.DISCONNECT) {
      clearInterval(this.state.heartbeat!);
      this.props.onEnd('Your opponent disconnected!');
      return;
    }
    const history = [...this.state.history];
    history.push(...newMoves);
    await this.renderReceivedMoves(newMoves);
    this.checkAndHandleWinner();
    this.setState({
      turnMoves: [],
      history,
      hasTurn: true,
    }, () => {
      this.state.board.computeAllValidMoves(this.props.player).then(() => {
        this.setState({ computedMoves: true });
      });
    });
    return;
  };

  renderReceivedMoves = async (moves: string[][]): Promise<undefined> => {
    for(const move of moves) {
      setTimeout(() => {
        this.setState({ board: new Board(move)});
      }, 1000);
    }
    return;
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