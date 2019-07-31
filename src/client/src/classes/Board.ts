import Square from './Square';
import Piece from "./Piece";
import { PieceColor, SquareColor, indexToCoordinates, 
  coordinatesToIndex, Coordinates } from './Game';

class Board {
  private _squares: Square[];
  private _pieces: Piece[];
  private _redPieces: Piece[];
  private _whitePieces: Piece[];
  private _kings: Piece[];
  private _capturedReds: Piece[];
  private _capturedWhites : Piece[];

  constructor(initialValues: string[]) {
    if(initialValues.length !== 64) {
      throw new Error('The board must be provided with 64 initial values.');
    }

    this._squares = [];
    this._pieces = [];
    this._redPieces = [];
    this._whitePieces = [];
    this._kings = [];
    this._capturedReds = [];
    this._capturedWhites = [];

    initialValues.forEach((val, i) => {
      if(val.length !== 1)
        throw new Error('Each initial value must be of length 1.');

      const [x, y] = indexToCoordinates(i);
      const squareColor = (x + y) % 2 === 1 ? SquareColor.GREEN : SquareColor.YELLOW;

      if(val === 'r') {
        const piece = new Piece(PieceColor.RED, i);
        const square = new Square(i, squareColor, piece);
        this._pieces.push(piece);
        this._squares.push(square);
        this._redPieces.push(piece);
      } else if(val === 'w') {
        const piece = new Piece(PieceColor.WHITE, i);
        const square = new Square(i, squareColor, piece);
        this._pieces.push(piece);
        this._squares.push(square);
        this._whitePieces.push(piece);
      } else {
        const square = new Square(i, squareColor);
        this._squares.push(square);
      }
    });

    if(this._pieces.length !== 16 || 
      this._redPieces.length !== 8 || 
      this._whitePieces.length !== 8) {
        throw new Error('Invalid initial values. There must be 8 white and red pieces');
    }
  }
  
  get squares() : Square[] {
    return this._squares;
  }

  get pieces() : Piece[] {
    return this._pieces;
  }

  get redPieces() : Piece[] {
    return this._redPieces;
  }

  get whitePieces() : Piece[] {
    return this._whitePieces;
  }

  get kings() : Piece[] {
    return this._kings;
  }

  private areCoordinatesOccupied(coords: Coordinates) {
    return this._pieces.some((p) => {
      return p.coordinates[0] === coords[0] && 
      p.coordinates[1] === coords[1];
    });
  }

  private areCoordinatesOccupiedByEnemy(color: PieceColor, coords: Coordinates) {
    return this._pieces.some((p) => {
      return p.coordinates[0] === coords[0] && 
      p.coordinates[1] === coords[1] &&
      p.color !== color;
    });
  }

  private findCaptures(piece: Piece, validDiffs: Coordinates[]) : [Coordinates[], Coordinates[]] {
    const validCaptures : Coordinates[] = [];
    const uncheckedDiffs : Coordinates[] = [...validDiffs];
    const { coordinates, color } = piece;
    validDiffs.forEach((val, i) => {
      let possible: Coordinates = [val[0] + coordinates[0], val[1] + coordinates[1]];
      // Out of bounds
      if(possible.some(val => val < 0 || val > 7)) {
        return;
      }

      if(this.areCoordinatesOccupiedByEnemy(color, possible)) {
        possible = [possible[0] + val[0], possible[1] + val[1]];
          if(this.areCoordinatesOccupied(possible)) {
            return;
          } else {
            validCaptures.push(possible);
            uncheckedDiffs.splice(i, 1);
          }
      }
    });

    return [validCaptures, uncheckedDiffs];
  }

  private _getValidMoves(piece: Piece, hasCaptured: boolean) : Coordinates[] {
    const validDiffs: Coordinates[] = [[-1, -1], [1, -1]];
    if (piece.isKing) {
      validDiffs.push([-1, 1], [1, 1]);
    }
    const validMoves : Coordinates[] = [];
    const [validCaptures, uncheckedDiffs] = this.findCaptures(piece, validDiffs);
    if(validCaptures.length > 0) {
      validMoves.push(...validCaptures);
    }

    const { coordinates } = piece; 
    if(!hasCaptured && uncheckedDiffs.length > 0) {
      uncheckedDiffs.forEach((val) => {
        let possible: Coordinates = [val[0] + coordinates[0], val[1] + coordinates[1]];
         // Out of bounds
        if(possible.some(val => val < 0 || val > 7)) {
          return;
        }

        if(!this.areCoordinatesOccupied(possible)) {
          validMoves.push(possible);
        }
      });
    }

    return validMoves;
  }
 
  public getValidMoves(piecePosition: Coordinates, hasCaptured: boolean) : Coordinates[] {
    if (piecePosition.some(val => val < 0 || val > 7)) {
      throw new Error('Invalid piece index.');
    }

    const index = coordinatesToIndex(piecePosition);
    const piece = this._squares[index].piece;
    if(piece === null) {
      throw new Error('Tried to get valid moves on a square that has no piece');
    }
    return this._getValidMoves(piece, hasCaptured);
  }

  get capturedReds() : Piece[] {
    return this._capturedReds;
  }

  get capturedWhites() : Piece[] {
    return this._capturedWhites;
  }
}

export default Board;