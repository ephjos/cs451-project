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
  heartbeat: number;
}

class App extends React.Component<{}, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      inGame: false,
      firstTurn: false,
      player: null,
      disableFind: false,
      heartbeat: 0,
    };
  }

  resetState = (): void => {
    this.setState({
      inGame: false,
      firstTurn: false,
      player: null,
      disableFind: false,
    });
    window.clearInterval(this.state.heartbeat);
    window.removeEventListener('beforeunload', this.handleUnload);
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
          setHeartbeat={this.setHeartbeat}
          onEnd={this.handleEnd}
          onForfeit={this.handleForfeit}
          onUnload={this.handleUnload}/>
      );
    }
  };
  
  setHeartbeat = (id: number): void => {
    this.setState({ heartbeat: id });
  }

  handleUnload = async (): Promise<undefined> => {
    if(this.state.inGame) {
      await this.handleForfeit('You left the game');
      window.removeEventListener('beforeunload', this.handleUnload);
    }
    return;
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
      console.log('Called end after game ended.'); // this is the most likely scenario
    }
    window.alert(endMsg);
    window.clearInterval(this.state.heartbeat);
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
      this.handleEnd(`You won the game! Congratulations!`);
    } else if((status === Status.QUEUE && this.state.inGame) || status === Status.ERROR) {
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
