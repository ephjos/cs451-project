import React from 'react';
import '../css/Board.css';
import SquareView from './SquareView';
import PieceView from './PieceView';
import Board from '../classes/Board';
import Square from '../classes/Square';
import Piece from '../classes/Piece';
import { Coordinates, generateV4UUID } from '../classes/Game';

export interface BoardProps {
  board: Board;
  onSquareClick: (coords: Coordinates) => void;
  selected: [number, number] | null;
  highlighted: [number, number][];
  hasTurn: boolean;
}

const BoardView: React.FC<BoardProps> = (props) => {
  const renderCaptured = (): JSX.Element => {
    const board = props.board;
    const capturedReds = board.capturedReds.length;
    const capturedWhites = board.capturedWhites.length;
    return (
      <React.Fragment>
        <p>Captured</p>
        <div className="board-captured-reds">
          <span className="captured fill-red"></span>
          <p className="captured-count">{capturedReds}</p>
        </div>
        <div className="board-captured-whites">
          <span className="captured fill-white"></span>
          <p className="captured-count">{capturedWhites}</p>
        </div>
      </React.Fragment>
    );
  };

  const renderPiece = (piece: Piece): JSX.Element => {
    return <PieceView key={generateV4UUID()} piece={piece} />;
  };

  const renderSquare = (square: Square): JSX.Element => {
    const [x, y] = square.coordinates;
    const selected = props.selected !== null && props.selected[0] === x && props.selected[1] === y;
    const highlighted = props.highlighted.some(([xPos, yPos]) => x === xPos && y === yPos);
    return (
      <SquareView
        key={square.coordinates.toString()}
        square={square}
        clickHandler={(): void => props.onSquareClick(square.coordinates)}
        selected={selected || highlighted}
      >
        {square.piece && renderPiece(square.piece)}
      </SquareView>
    );
  };

  const renderSquares = (): JSX.Element[] => {
    const squares: JSX.Element[] = [];
    props.board.squares.forEach((square) => squares.push(renderSquare(square)));
    return squares;
  };

  return (
    <React.Fragment>
      <div className="board">
        {renderSquares()}
        {!props.hasTurn &&
          <div className="board-overlay">
            <p className="board-overlay-text">Waiting for Opponent...</p>
          </div>}
      </div>
      <div className="board-captured">
        {renderCaptured()}
      </div>
    </React.Fragment>
  );
};

export default BoardView;