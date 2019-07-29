import React from 'react';
import '../css/Piece.css';

const Piece : React.FC<{color: string}> = (props) => {
  return <span className={`piece ${props.color}`}/>
}

export default Piece;