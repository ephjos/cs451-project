type Resolve = (value?: boolean) => void;

class PlayerPromise {
  private _id: string;
  private _resolve: Resolve;

  constructor(id: string, resolve: Resolve) {
    this._id = id;
    this._resolve = resolve;
  }

  get id(): string {
    return this._id;
  }

  public resolve(currentTurn: boolean): void {
    this._resolve(currentTurn);
  }

}

export default PlayerPromise;