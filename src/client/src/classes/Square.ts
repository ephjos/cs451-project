import Piece from "./Piece";
import { SquareColor, Coordinates, indexToCoordinates } from "./Game";

class Square {
  private _index: number;
  private _piece: Piece | null;
  private _color: SquareColor;
  private _coordinates: Coordinates;

  constructor(index: number, color: SquareColor, piece?: Piece) {
    this._index = index;
    this._color = color;
    this._piece = piece? piece: null;
    this._coordinates = indexToCoordinates(this._index);
  }

  set piece(piece: Piece | null) {
    this._piece = piece;
  }

  get piece() : Piece | null {
    return this._piece;
  }

  get color() : SquareColor {
    return this._color;
  }

  get coordinates() : Coordinates {
    return this._coordinates;
  }
}

export default Square;