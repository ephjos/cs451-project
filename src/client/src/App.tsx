import React, { ReactNode } from 'react';
import './css/App.css';
import SideMenu from './components/SideMenu';
import MainContent from './components/MainContent';
import Checkers from './components/Checkers';
import { PieceColor, REQUEST_DOMAIN, ConnectResponse,
  DisconnectResponse, EndResponse, MoveResponse } from './classes/Game';
import axios from 'axios';
import to from 'await-to-js';

interface AppState {
  inGame: boolean;
  firstTurn: boolean;
  player: PieceColor | null;
  disableFind: boolean;
}

class App extends React.Component<{}, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      inGame: false,
      firstTurn: false,
      player: null,
      disableFind: false,
    };
  }

  resetState = (): void => {
    this.setState({
      inGame: false,
      firstTurn: false,
      player: null,
      disableFind: false,
    });
  };

  renderPage = (): JSX.Element => {
    const { inGame, disableFind, player, firstTurn } = this.state;
    if(!inGame) {
      return (
        <button 
          disabled={disableFind}
          onClick={this.handleConnect}>
          {disableFind ? 'Searching...': 'Find a game'}
        </button>
      );
    } else {
      return (
        <Checkers 
          player={player!}
          hasFirstTurn={firstTurn}
          onMove={this.handleMove}
          onEnd={this.handleEnd}
          onForfeit={this.handleForfeit}/>
      );
    }
  };

  handleConnect = (): void => {
    this.setState({ disableFind: true });

    axios.request<ConnectResponse>({
      url: `${REQUEST_DOMAIN}/connect`,
    })
      .then((response) => {
        const { currentTurn } = response.data;
        this.setState({
          inGame: true,
          firstTurn: currentTurn,
          player: currentTurn ? PieceColor.WHITE : PieceColor.RED,
          disableFind: false,
        });
      }).catch((reason) => {
        window.alert(reason);
        this.resetState();
      });
  };

  handleEnd = async (endMsg: string): Promise<undefined> => {
    const [error, response] = await to(axios.get<EndResponse>(`${REQUEST_DOMAIN}/end`));
    console.log(response);
    if(error !== null) {
      throw error;
    }
    window.alert(endMsg);
    this.resetState();
    return;
  };

  handleForfeit = async (forfeitMsg: string): Promise<undefined> => {
    const [error, response] = await to(axios.get<DisconnectResponse>(`${REQUEST_DOMAIN}/disconnect`));
    console.log(response);
    if(error !== null) {
      throw error;
    }
    window.alert(forfeitMsg);
    this.resetState();
    return;
  };

  handleMove = async (moves: string[][]): Promise<MoveResponse> => {
    const [error, response] = await to(axios.post<MoveResponse>(
      `${REQUEST_DOMAIN}/move`, {
        moves,
      }));
    if(error !== null) {
      throw error;
    }
    return response!.data;
  };
  
  render = (): ReactNode => {
    return (
      <React.Fragment>
        <MainContent>
          <h1 className="title">CS451 Checkers</h1>
          {this.renderPage()}
        </MainContent>
        <SideMenu 
          topChildren={[
            <div key="topChildren"/>]} 
          midChildren={[
            <div key="midChildren"/>]} 
          bottomChildren={[
            <div key="bottomChildren"/>]}/>
      </React.Fragment>
    );
  };
}

export default App;
