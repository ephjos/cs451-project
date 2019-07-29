import React from 'react';
import '../css/Square.css';

const Square : React.FC<{color: string}> = (props) => {
  return <span className={`square fill-${props.color}`}/>
}

export default Square;