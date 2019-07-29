import React from 'react';
import './css/App.css';
import Piece from './components/Piece';

const App: React.FC = () => {
  return (
    <div className="content">
      <Piece color="red"/>
    </div>
  );
}

export default App;
