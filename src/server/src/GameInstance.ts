import { Status, generateV4UUID } from '../../client/src/classes/Game';

class GameInstance {
  private _instanceID: string;
  private _p1ID: string;
  private _p2ID: string;
  private _board: string[];
  private _lastMoves: string[][];
  private _status: Status;

  constructor(p1ID: string, p2ID: string) {
    this._instanceID = generateV4UUID();
    this._p1ID = p1ID;
    this._p2ID = p2ID;
    this._board = undefined;
    this._status = Status.GOOD;
  }

  public updateMoves(moves: string[][]): void {
    this._board = moves[moves.length - 1];
    this._lastMoves = moves;
  }

  get instanceID(): string {
    return this._instanceID;
  }

  get p1ID(): string {
    return this._p1ID;
  }

  get p2ID(): string {
    return this._p2ID;
  }

  get board(): string[] {
    return this._board;
  }

  get moves(): string[][] {
    return this._lastMoves;
  }

  get status(): Status {
    return this._status;
  }

  set status(status: Status) {
    this._status = status;
  }

}

export default GameInstance;