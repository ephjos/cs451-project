import React from 'react';
import '../css/MainContent.css';

const MainContent: React.FC = (props) => {
  return <div className="main-content">{props.children}</div>;
};

export default MainContent;