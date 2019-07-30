import React, { Fragment } from 'react';
import MainContent from './MainContent';
import Board from './Board';
import SideMenu from './SideMenu';

interface CheckersProps {
  playerColor: string,
  initialPositions: string[];
}

interface CheckersState {
  positions: string[];
}

class Checkers extends React.Component<CheckersProps, CheckersState> {
  constructor(props: CheckersProps) {
    super(props);
    this.state = {
      positions: props.initialPositions || '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split(''),
    };
  }

  getInitialState() {
    const intitialPositions = '-r-r-r-rr-r-r-r----------------------------------w-w-w-ww-w-w-w-'.split('');
    if(this.props.playerColor === 'white') {
      intitialPositions.reverse();
    }

    return intitialPositions;
  }

  render() {
    return (
      <Fragment>
        <MainContent>
          <h1>CS451 Checkers</h1>
          <Board positions={this.state.positions}/>
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
}

export default Checkers;