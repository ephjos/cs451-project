import { Status, generateV4UUID } from './util'

class GameInstance {
    private _instanceID: string
    private _p1ID: string
    private _p2ID: string
    private _board: string
    private _status: Status

    constructor(p1ID: any, p2ID: any) {
        this._instanceID = generateV4UUID()
        this._p1ID = p1ID;
        this._p2ID = p2ID;
        this._board = undefined
        this._status = Status.GOOD
    }

    public updateBoard(board: any) {
        this._board = board;
    }

    get instanceID() {
        return this._instanceID;
    }

    get p1ID() {
        return this._p1ID;
    }

    get p2ID() {
        return this._p2ID;
    }

    get board() {
        return this._board;
    }

    get status() {
        return this._status;
    }

    set status(status: Status) {
        this._status = status;
    }

}

export default GameInstance