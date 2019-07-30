import React from 'react';
import '../css/Board.css';
import Square from './Square';
import Piece from './Piece';


export interface BoardProps {
  positions: string[];

}

const Board : React.FC<BoardProps> = (props) => {
  const indexToCoordinates = (i: number) : [number, number] => {
    const x = i % 8;
    const y = Math.floor(i / 8);
    return [x, y];
  }

  const getPieceColor = (p: string) => {
    switch (p) {
      case 'r': return 'red';
      case 'w': return 'white';
      default: return null;
    }
  }

  const renderPiece = (i: number, x: number, y: number) => {
    const color = getPieceColor(props.positions[i]);
    if(color !== null)
      return <Piece color={color}/>;
    return null;
  };
  
  const renderSquare = (i: number) => {
    const [x, y] = indexToCoordinates(i);
    const color  = (x + y) % 2 === 1 ? 'yellow' : 'green'; 

    return (
      <Square key={i} color={color}>
        {renderPiece(i, x, y)}
      </Square>
    )
  };

  const renderSquares = () => {
    const squares = [];
    for(let i = 0; i < 64; i += 1) {
      squares.push(renderSquare(i));
    }

    return squares;
  }

  return (
    <div className="board">
      {renderSquares()}
    </div>
  );
}

export default Board;