import React from 'react';
import './css/App.css';
import Board from './components/Board';

const App: React.FC = () => {
  const initialPositions = '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split('');

  return (
    <div className="content">
      <Board positions={initialPositions}/>
    </div>
  );
}

export default App;
