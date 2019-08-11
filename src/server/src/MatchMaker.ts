import GameInstance from './GameInstance'
import Queue from './Queue'
import { Status } from './util'

class MatchMaker {
    private _queue: Queue
    private _games: Map<string, GameInstance>
    private _players: Map<string, string>
    private _otherCallback: () => void

    constructor() {
        this._queue = new Queue()
        this._games = new Map()
        this._players = new Map();
    }

    private _createGame(callback: () => void) {
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
        callback()
        this._otherCallback()
    }

    public addToQueue(playerID: string, callback: () => void) {
        this._queue.enqueue(playerID)

        if (this._queue.length() == 2) {
            this._createGame(callback)
        } else {
            this._otherCallback = callback;
        }
    }

    public getStatus(playerID: string): number {
        if (this._queue.peek() == playerID) {
            return Status.QUEUE;
        }

        let gameID = this._players.get(playerID);
        if (gameID) {
            let gameInstance = this._games.get(gameID);
            return gameInstance.status
        }

        return Status.ERROR
    }
    public endGame(playerID: string) { }

}

export default MatchMaker