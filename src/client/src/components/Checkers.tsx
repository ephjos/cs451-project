import React from 'react';
import BoardView from './BoardView';
import { PieceColor, Coordinates } from '../classes/Game';
import Board from '../classes/Board';

interface CheckersProps {
  player: PieceColor;
  history?: string[][];
}

interface CheckersState {
  board: Board;
  positions: string[];
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
      positions,
      selected: null,
      highlighted: [],
      history: [Array.from(positions)],
    };
  }

  handleSquareClick = (coords: Coordinates) => {
    this.setState( { selected: coords });
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