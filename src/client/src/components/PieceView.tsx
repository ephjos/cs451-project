import React from 'react';
import '../css/Piece.css';
import Piece from '../classes/Piece';

const PieceView: React.FC<{piece: Piece}> = (props) => {
  return <span className={`piece fill-${props.piece.color} ${props.piece.isKing ? 'king' : ''}`}/>;
};

export default PieceView;