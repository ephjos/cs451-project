import GameInstance from './GameInstance';
import Queue from './Queue';
import PlayerPromise from './PlayerPromise';
import { Status } from '../../client/src/classes/Game';

type MovesPromise = (moves: string[][]) => void;

class MatchMaker {
  // TODO: Remove games once they are over
  private _queue: Queue<PlayerPromise>;
  private _games: Map<string, GameInstance>;
  private _players: Map<string, string>;
  private _pendingMoves: Map<string, MovesPromise>;

  constructor() {
    this._queue = new Queue();
    this._games = new Map();
    this._players = new Map();
    this._pendingMoves = new Map();
  }

  private _createGame(): void {
    // Get two players at front of queue
    let p1 = this._queue.dequeue();
    let p2 = this._queue.dequeue();

    let p1ID = p1.id;
    let p2ID = p2.id;

    // Create GameInstance
    let gameInstance = new GameInstance(p1ID, p2ID);
    let gameID = gameInstance.instanceID;

    // Map players to instanceID
    this._players.set(p1ID, gameID);
    this._players.set(p2ID, gameID);

    // Map instanceID to GameInstance object
    this._games.set(gameID, gameInstance);

    p1.resolve(true);
    p2.resolve(false);
  }

  public addToQueue(playerID: string): Promise<boolean> {

    // Save promise resolve function for later call
    let tempResolve = undefined;
    let promise = new Promise((resolve: (value?: boolean) => void): void => {
      tempResolve = resolve;
    });

    this._queue.enqueue(new PlayerPromise(playerID, tempResolve));

    if (this._queue.length() > 1) {
      this._createGame();
    }

    return promise;
  }

  public getStatus(playerID: string): [Status, string[][]] {
    if (this._queue.peek() && this._queue.peek().id === playerID) {
      return [Status.QUEUE, undefined];
    }

    let gameID = this._players.get(playerID);
    if (gameID) {
      let gameInstance = this._games.get(gameID);
      return [gameInstance.status, gameInstance.moves];
    }

    return [Status.ERROR, undefined];
  }

  public updateMoves(playerID: string, moves: string[][]): Status {
    if (this.getStatus(playerID)[0] === Status.GOOD) {
      let gameInstance = this._games.get(this._players.get(playerID));
      gameInstance.updateMoves(moves);
      // resolve other player's receiveMoves promise
      let opponentId = gameInstance.p2ID === playerID ? gameInstance.p1ID : gameInstance.p2ID;
      let opponentResolve = this._pendingMoves.get(this._players.get(opponentId));
      console.log(`opponentResolve: ${opponentResolve}`);
      opponentResolve(moves);
      return gameInstance.status;
    }
    return Status.ERROR; // Check this value clientside
  }

  public waitForMoves(playerID: string): Promise<string[][]> {
    let tempResolve = undefined;
    let promise = new Promise((resolve: MovesPromise): void => {
      tempResolve = resolve;
    });

    this._pendingMoves.set(this._players.get(playerID), tempResolve);
    return promise;
  }

  public forfeit(playerID: string): Status {
    if (this.getStatus(playerID)[0] === Status.GOOD) {
      let gameInstance = this._games.get(
        this._players.get(playerID)
      );

      gameInstance.status = Status.FORFEIT;

      return gameInstance.status;
    } else {
      return Status.ERROR;
    }
  }

  public endGame(playerID: string): Status {
    if (this.getStatus(playerID)[0] === Status.GOOD) {
      let gameInstance = this._games.get(
        this._players.get(playerID)
      );

      gameInstance.status = Status.END;

      return gameInstance.status;
    } else {
      return Status.ERROR;
    }
  }

}

export default MatchMaker;
