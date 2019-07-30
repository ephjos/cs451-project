import React from 'react';
import '../css/SquareWrapper.css';

const Square : React.FC<{color: string}> = (props) => {
  return <div className="square-wrapper">{props.children}</div>
}

export default Square;
