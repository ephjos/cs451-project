import React from 'react';
import '../css/Square.css';
import Square from '../classes/Square';

export interface SquareProps {
  square: Square;
  clickHandler: () => void;
  selected: boolean;
}

const SquareView: React.FC<SquareProps> = (props) => {
  return (
    <div
      className={`square fill-${props.square.color}`} 
      onClick={props.clickHandler}
    >
      {props.children}
      {props.selected && <div className="square-overlay"/>}
    </div>
  );
};

export default SquareView;