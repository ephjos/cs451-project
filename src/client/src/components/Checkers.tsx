import React from 'react';
import BoardView from './BoardView';
import { PieceColor, Coordinates, coordinatesToIndex } from '../classes/Game';
import Board from '../classes/Board';

interface CheckersProps {
  player: PieceColor;
  hasFirstTurn: boolean;
  history?: string[][];
}

interface CheckersState {
  board: Board;
  selected: Coordinates | null;
  highlighted: [number, number][];
  history: string[][];
  hasTurn: boolean;
  hasCaptured: boolean;
}

class Checkers extends React.Component<CheckersProps, CheckersState> {
  constructor(props: CheckersProps) {
    super(props);

    const { history } = props;
    const hasHistory = history && history.length > 0;
    const positions =  hasHistory ? history![history!.length - 1] : this.getInitialPositions();
    const board = new Board(positions);

    this.state = {
      board,
      selected: null,
      highlighted: [],
      history: [[...positions]],
      hasTurn: props.hasFirstTurn,
      hasCaptured: false,
    };
  }

  getPlayerPieces = () => {
    switch (this.props.player) {
      case PieceColor.RED: return this.state.board.redPieces;
      case PieceColor.WHITE: return this.state.board.whitePieces;
    }
  }

  /**
   * if selected is null,
   * if coords are for square on which there is no peice of our color (or empty)
   * do nothing
   * else select that piece, get valid moves and highlight them
   * 
   * if selected is not null (meaning a piece of our color is selected)
   * if where we are selecting is highlighted make that move
   * else do nothing
   * 
   * optionally we allow user to unselect his chosen piece by cliking on it
   * 
   */
  handleSquareClick = (coords: Coordinates) => {
    if(!this.state.hasTurn) {
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
      const newHighlighted = ([] as any[]).concat(highlighted, validMoves);
      this.setState({ selected: coords, highlighted: newHighlighted });
      return;
    } else {
      if(selected[0] === coords[0] && selected[1] === coords[1]) {
        //this is optional but is better in when testing
        // we can also just allow this if it has no valid moves
        this.setState({ selected: null, highlighted: [] });
        return;
      }
      const isValidMove = highlighted.some(([x, y]) => {
        return x === coords[0] && y === coords[1];
      });

      if(!isValidMove){
        return;
      } 
      const preserveTurn = board.movePieceToPosition(selected, coords);
      const history = [...this.state.history];
      history.push(board.serializeToArray());

      if(preserveTurn) {
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
          this.setState({ selected: coords, highlighted: validMoves });
          return;
        }
      }

      this.setState({
        selected: null, 
        highlighted: [], 
        board,
        history,
        hasTurn: false,
      });
      /**
       * At this point we disable the UI and send history to the server
       * then basically wait till we get a response
       */
      this.sendToServerAndWait()
        .then((res) => {
        // Render new data
      }).catch((err) => {
        // If error either lost connection or server issue
        // Game probably has to end here
      });
    }
  }

  sendToServerAndWait = async () => {
    return;
  }

  getInitialPositions = () => {
    const intitialPositions = '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split('');
    
    // Bunch of test situations - this one tests basic captures
    // Also tests conversion to king piece (which is not implemented rn)
    // const intitialPositions = '-r-r-r-rr-r-r---w--------w----w-------------r--w---w-w-ww-------'.split('');    
    
    if(this.props.player === PieceColor.RED) {
      intitialPositions.reverse();
    }

    return intitialPositions;
  }

  render= () => {
    return (
      <BoardView
        board={this.state.board}
        onSquareClick={this.handleSquareClick}
        selected={this.state.selected}
        highlighted={this.state.highlighted}
        hasTurn={this.state.hasTurn}
        />
    );
  }
}

export default Checkers;