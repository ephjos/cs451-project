import React from 'react';
import '../css/Piece.css';

const SideWidget : React.FC = (props) => {
  return <div className={`side-widget`}>{props.children}</div>;
}

export default SideWidget;