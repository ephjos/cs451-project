import React from 'react';
import '../css/Overlay.css';

const Overlay: React.FC<{color: string}> = (props) => {
  return <div className={`overlay fill-${props.color}`}/>;
};

export default Overlay;
