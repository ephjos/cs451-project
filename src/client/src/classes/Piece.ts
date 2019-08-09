import { PieceColor, indexToCoordinates, Coordinates } from "./Game";

class Piece {
  private _color: PieceColor;
  private _coordinates: Coordinates | null;
  private _king: boolean;

  constructor(color: PieceColor, index: number | null, isKing?:boolean) {
    this._color = color;
    this._coordinates = index !== null ? indexToCoordinates(index) : null;
    this._king = isKing? isKing : false;
  }

  get color() : PieceColor {
    return this._color;
  }

  get coordinates() : Coordinates | null {
    return this._coordinates;
  }

  set coordinates(p: Coordinates | null) {
    if(p !== null && p.some((x) => x < 0 || x > 7)) {
      throw new Error('Coordinates must be between (0, 0) and (7, 7).');
    }
    this._coordinates = p;
  }

  get isKing() : boolean {
    return this._king;
  }

  public setAsKing() : void {
    this._king = true;
  }
}

export default Piece;