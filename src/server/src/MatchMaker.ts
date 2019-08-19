import GameInstance from './GameInstance';
import Queue from './Queue';
import PlayerPromise from './PlayerPromise';
import { Status } from '../../client/src/classes/Game';

class MatchMaker {
    // TODO: Remove games once they are over
    private _queue: Queue<PlayerPromise>;
    private _games: Map<string, GameInstance>;
    private _players: Map<string, string>;

    constructor() {
        this._queue = new Queue();
        this._games = new Map();
        this._players = new Map();
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
        let promise = new Promise((resolve: (value?: boolean) => void) => {
            tempResolve = resolve;
        });

        this._queue.enqueue(new PlayerPromise(playerID, tempResolve));

        if (this._queue.length() > 1) {
            this._createGame();
        }

        return promise;
    }

    public getStatus(playerID: string): [Status, string] {
        if (this._queue.peek().id === playerID) {
            return [Status.QUEUE, undefined];
        }

        let gameID = this._players.get(playerID);
        if (gameID) {
            let gameInstance = this._games.get(gameID);
            return [gameInstance.status, gameInstance.board];
        }

        return [Status.ERROR, undefined];
    }

    public updateBoard(playerID: string, board: string): Status {
        if (this.getStatus(playerID)[0] === Status.GOOD) {
            let gameInstance = this._games.get(
                this._players.get(playerID)
            );

            gameInstance.updateBoard(board);
            return gameInstance.status;
        }
        return Status.ERROR;
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
