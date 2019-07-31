import { PieceColor, indexToCoordinates, Coordinates } from "./Game";
import Square from "./Square";

class Piece {
  private _color: PieceColor;
  private _index: number;
  private _coordinates: Coordinates;
  private _king: boolean;

  constructor(color: PieceColor, index: number, square: Square | null, isKing?:boolean) {
    this._color = color;
    this._index = index;
    this._coordinates = indexToCoordinates(this._index);
    this._king = isKing? isKing : false;
  }

  get color() : PieceColor {
    return this._color;
  }

  get coordinates() : Coordinates {
    return this._coordinates;
  }

  set coordinates(p: Coordinates) {
    if(p.some((x) => x < 0 || x > 7)) {
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