import React from 'react';
import '../css/Square.css';

const Square : React.FC<{color: string}> = (props) => {
  return <div className={`square fill-${props.color}`}>{props.children}</div>
}

export default Square;