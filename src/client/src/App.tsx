import React, { Fragment } from 'react';
import './css/App.css';
import SideMenu from './components/SideMenu';
import MainContent from './components/MainContent';
import Checkers from './components/Checkers';
import { PieceColor } from './classes/Game';

const App: React.FC = () => {

  return (
    <Fragment>
      <MainContent>
        <h1>CS451 Checkers</h1>
        {/* temp for testing - server would set color normally */}
        <Checkers player={PieceColor.RED}/>
      </MainContent>
      <SideMenu 
        topChildren={[
          <div key={'1'}/>]} 
        midChildren={[
          <div key={'11'}/>]} 
        bottomChildren={[
          <div key={'111'}/>]}/>
    </Fragment>
  );
}

export default App;
