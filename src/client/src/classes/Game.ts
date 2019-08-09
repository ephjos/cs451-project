export type Coordinates = [number, number];

export enum PieceColor {
  RED = 'red', 
  WHITE = 'white',
}

export enum SquareColor {
  GREEN = 'green',
  YELLOW = 'yellow',
}

export function indexToCoordinates(i: number) : Coordinates {
  const x = i % 8;
  const y = Math.floor(i / 8);
  return [x, y];
}

export function coordinatesToIndex(coords: Coordinates) : number {
  const base = 8 * coords[1];
  const offset = base + coords[0];
  return offset;
}

export function generateV4UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

