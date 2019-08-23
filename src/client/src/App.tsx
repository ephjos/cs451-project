import React, { ReactNode } from 'react';
import './css/App.css';
import SideMenu from './components/SideMenu';
import MainContent from './components/MainContent';
import Checkers from './components/Checkers';
import { PieceColor, REQUEST_DOMAIN, ConnectResponse,
  DisconnectResponse, EndResponse, MoveResponse, StatusResponse, Status } from './classes/Game';
import axios from 'axios';
import to from 'await-to-js';

axios.defaults.withCredentials = true;

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
          onStatus={this.handleStatus}
          onSendMoves={this.handleSendMoves}
          onReceiveMoves={this.handleReceiveMoves}
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
    console.error(error);
    window.alert(forfeitMsg);
    this.resetState();
    return;
  };

  handleSendMoves = async (moves: string[][]): Promise<StatusResponse> => {
    const [error, response] = await to(axios.post<StatusResponse>(
      `${REQUEST_DOMAIN}/sendMoves`, {
        moves,
      }));
    if(error !== null) {
      throw error;
    }
    return response!.data;
  };

  handleReceiveMoves = async (): Promise<MoveResponse> => {
    const [error, response] = await to(axios.get<MoveResponse>(`${REQUEST_DOMAIN}/receiveMoves`));
    if(error !== null) {
      throw error;
    }
    return response!.data;
  };

  handleStatus = async (): Promise<Status> => {
    const [error, response] = await to(axios.get<StatusResponse>(`${REQUEST_DOMAIN}/status`));
    console.log(response);
    if(error !== null) {
      throw error;
    }
    if(response === undefined) {
      window.alert('Lost connection to the game.');
      this.resetState();
      return Status.ERROR;
    }
    const { status } = response.data;
    if (status === Status.FORFEIT) {
      window.alert('Your opponent forfeited. You won!');
      this.resetState();
    } else if(status === Status.DISCONNECT) {
      window.alert('Your opponent lost connection to the game.');
      this.resetState();
    } else if(status === Status.END) {
      this.handleEnd(`You lost! But don't give up!`);
    } else if((status === Status.QUEUE && this.state.inGame) || Status.ERROR) { // This should never happen!!
      window.alert('There was an unexpected error with your game. Sorry!');
      this.resetState();
    }
    return status; 
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
