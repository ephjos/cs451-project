import React from 'react';
import BoardView from './BoardView';
import { PieceColor, Coordinates, coordinatesToIndex } from '../classes/Game';
import Board from '../classes/Board';

interface CheckersProps {
  player: PieceColor;
  history?: string[][];
}

interface CheckersState {
  board: Board;
  selected: Coordinates | null;
  highlighted: [number, number][];
  history: string[][];
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
  handleSquareClick = async (coords: Coordinates) => {
    const { board, selected, highlighted } = this.state;
    if(selected === null) {
      const piece = board.squares[coordinatesToIndex(coords)].piece;
      const isValidSelection = piece !== null && piece.color === this.props.player;
      
      if(!isValidSelection) {
        return;
      } else {
        const validMoves = board.getValidMoves(coords, false);
        const newHighlighted = ([] as any[]).concat(highlighted, validMoves);
        this.setState({ selected: coords, highlighted: newHighlighted });
        return;
      }
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
      } else {
        board.movePieceToPosition(selected, coords);
        const history = [...this.state.history];
        history.push(board.serializeToArray());
        this.setState({
          selected: null, 
          highlighted: [], 
          board,
          history,
        });
        /**
         * At this point we disable the UI and send history to the server
         * then basically wait till we get a response
         */
        await this.sendToServerAndWait();
      }
    }
  }

  sendToServerAndWait = async () => {
    return;
  }

  getInitialPositions = () => {
    const intitialPositions = '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split('');
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
        />
    );
  }
}

export default Checkers;