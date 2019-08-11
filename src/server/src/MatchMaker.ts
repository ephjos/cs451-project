import GameInstance from './GameInstance'
import Queue from './Queue'
import { Status } from '../../client/src/classes/Game'

type addToQueueCallback = (currentTurn?: boolean) => void

class MatchMaker {
    // TODO: Remove games once they are over
    private _queue: Queue
    private _games: Map<string, GameInstance>
    private _players: Map<string, string>
    private _otherCallback: addToQueueCallback

    constructor() {
        this._queue = new Queue()
        this._games = new Map()
        this._players = new Map();
    }

    private _createGame(callback: addToQueueCallback) {
        // Get two players at front of queue
        let p1 = this._queue.dequeue();
        let p2 = this._queue.dequeue();

        // Create GameInstance
        let gameInstance = new GameInstance(p1, p2);
        let gameID = gameInstance.instanceID

        // Map players to instanceID
        this._players.set(p1, gameID);
        this._players.set(p2, gameID);

        // Map instanceID to GameInstance object
        this._games.set(gameID, gameInstance);

        // Tell both clients a match has been made
        // TODO: Change to promises
        callback(false)
        this._otherCallback(true)
    }

    public addToQueue(playerID: string, callback: addToQueueCallback) {
        this._queue.enqueue(playerID)

        if (this._queue.length() == 2) {
            this._createGame(callback)
        } else {
            this._otherCallback = callback;
        }
    }

    public getStatus(playerID: string): [Status, string] {
        if (this._queue.peek() == playerID) {
            return [Status.QUEUE, undefined];
        }

        let gameID = this._players.get(playerID);
        if (gameID) {
            let gameInstance = this._games.get(gameID);
            return [gameInstance.status, gameInstance.board]
        }

        return [Status.ERROR, undefined]
    }

    public updateBoard(playerID: string, board: string): Status {
        if (this.getStatus(playerID)[0] == Status.GOOD) {
            let gameInstance = this._games.get(
                this._players.get(playerID)
            )

            gameInstance.updateBoard(board)
            return gameInstance.status
        }
        return Status.ERROR
    }

    public forfeit(playerID: string): Status {
        if (this.getStatus(playerID)[0] == Status.GOOD) {
            let gameInstance = this._games.get(
                this._players.get(playerID)
            )

            gameInstance.status = Status.FORFEIT

            return gameInstance.status
        } else {
            return Status.ERROR
        }
    }

    public endGame(playerID: string) {
        if (this.getStatus(playerID)[0] == Status.GOOD) {
            let gameInstance = this._games.get(
                this._players.get(playerID)
            )

            gameInstance.status = Status.END

            return gameInstance.status
        } else {
            return Status.ERROR
        }
    }

}

export default MatchMaker