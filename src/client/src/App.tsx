import React, { Fragment } from 'react';
import './css/App.css';
import Board from './components/Board';
import SideMenu from './components/SideMenu';
import MainContent from './components/MainContent';

const App: React.FC = () => {
  const initialPositions = '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split('');

  return (
    <Fragment>
      <MainContent>
        <h1>CS451 Checkers</h1>
        <Board positions={initialPositions}/>
      </MainContent>
      <SideMenu 
        topChildren={[
          <div/>]} 
        midChildren={[
          <div/>]} 
        bottomChildren={[
          <div/>]}/>
    </Fragment>
  );
}

export default App;
