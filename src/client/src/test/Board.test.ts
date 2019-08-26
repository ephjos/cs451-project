import Board from '../classes/Board';
import {PieceColor, SquareColor} from "../classes/Game";
import Piece from "../classes/Piece";
import Square from "../classes/Square";


//TODO Test all the remaining sad paths

const capturePositions = `-r-r-r-r
                          r-r-r---
                          -w------
                          ------w-
                          -w------
                          ----r--w
                          -w-w-w-w
                          --------`.replace(/(\n|\t|\s)/g, '').split('');

const SingleRedCapturePositions = `-r-r-r-r
                                   r-r-r---
                                   --------
                                   --w---w-
                                   -w------
                                   ----r--w
                                   -w-w---w
                                   ------w-`.replace(/(\n|\t|\s)/g, '').split('');

const originalPositions = `-r-r-r-r
                           r-r-r-r-
                           --------
                           --------
                           --------
                           --------
                           -w-w-w-w
                           w-w-w-w-`.replace(/(\n|\t|\s)/g, '').split('');

const kingCapturePositions = `-/r/-/r/-/r/-/r/
                              r/-/r/-/-/-/-/-/
                              -/w/-/-/-/-/-/-/
                              -/-/-/-/-/-/w/-/
                              -/w/-/-/-/-/-/-/
                              -/-/-/-/r/-/-/w/
                              -/w/-/w/-/w/-/w/
                              -/-/r!/-/-/-/-/-`.replace(/(\n|\t|\s)/g, '').split('/');

const kingMovePositions = `-/r/-/r/-/r/-/r/
                           r/-/r/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/w/-/-/-/w/-/
                           -/w/-/-/-/-/-/-/
                           w/-/-/-/r/-/-/w/
                           -/-/-/-/-/-/-/w/
                           -/-/r!/-/w/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');

const capturedPositions = `r*/w*/-/r/-/r/-/r/-/r/
                           r/-/r/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/w/-/-/-/w/-/
                           -/w/-/-/-/-/-/-/
                           w/-/-/-/r/-/-/w/
                           -/-/-/-/-/-/-/w/
                           -/-/-/-/-/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');

const getPositions = `r*/w*/-/r/-/r/-/r/-/r/
                           r/-/r/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/w/-/-/-/w/-/
                           -/w/-/-/-/-/-/-/
                           w/-/-/-/-/-/-/w/
                           -/-/-/-/-/-/-/w/
                           -/-/-/-/r!/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');


const ValueSizeThreeBoard = `-/r/-/r/-/r/-/r/
                           r/-/r/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/w/-/-/-/w/-/
                           -/w/-/-/-/-/-/-/
                           w/-/-/-/r/-/-/w/
                           -/-/-/-/-/-/-/w/
                           -/-/r!T/-/w/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');

const  boardWithLessThan64Values= `-/r/-/r/-/r/-/r/
                                   r/-/r/-/-/-/-/-/
                                   -/-/-/-/-/-/-/-/
                                   -/-/w/-/-/-/w/-/
                                   -/w/-/-/-/-/-/-/
                                   w/-/-/-/r/-/-/w/
                                   -/-/-/-/-/-/-/w/
                                   -/-/-/w/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');

const edgeCasePositions = `r*/r*/w*/-/r/-/-/-/-/-/r/
                           r/-/r/-/-/-/w/-/
                           -/r/-/w/-/-/-/r/
                           -/-/-/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/-/-/-/-/-/-/
                           -/-/-/-/-/-/-/w/
                           w/-/w/-/w/-/w/-`.replace(/(\n|\t|\s)/g, '').split('/');


const captureBoard = new Board(capturePositions.reverse());
const staticBoard = new Board(originalPositions.reverse());
const originalBoard = new Board(originalPositions.reverse());
const kingMoveBoard = new Board(kingMovePositions.reverse());
const kingCaptureBoard = new Board(kingCapturePositions.reverse());
const SingleRedCaptureBoard = new Board(SingleRedCapturePositions.reverse());
const edgeCaseBoard = new Board(edgeCasePositions.reverse());


test('computeAllValidMoves EdgeCase', async () => {
    await edgeCaseBoard.computeAllValidMoves(PieceColor.RED);
    // @ts-ignore
    const data = edgeCaseBoard._validMovesCache;
    expect(data.size).toBe(6);
});

test('serializeToArray', () => {
    expect(staticBoard.serializeToArray()).toEqual(originalPositions.reverse());
    expect(kingCaptureBoard.serializeToArray()).toEqual(kingCapturePositions);
});

test('Constructor', () => {
    expect( () => new Board(boardWithLessThan64Values))
        .toThrowError(new Error('The board must be provided with at least 64 initial values.'));
    expect(() => new Board(ValueSizeThreeBoard))
        .toThrowError(new Error('Each initial value must be of length 1 or 2.'));
    const capturedBoard = new Board(capturedPositions.reverse());
    // @ts-ignore
    const redData = capturedBoard._capturedReds;
    // @ts-ignore
    const whiteData = capturedBoard._capturedWhites;
    const redPiece = new Piece(PieceColor.RED, null, false);
    const whitePiece = new Piece(PieceColor.WHITE, null, false);
    expect(redData).toEqual([redPiece]);
    expect(whiteData).toEqual([whitePiece]);
});

//TODO fix get kings check
test('Get', () => {
    const getBoard = new Board(getPositions.reverse());
    // @ts-ignore
    const squaresData = getBoard.squares;
    // @ts-ignore
    const piecesData = getBoard.pieces;
    // @ts-ignore
    const redData = getBoard.redPieces;
    // @ts-ignore
    const whiteData = getBoard.whitePieces;
    // @ts-ignore
    const kingsData = getBoard.kings;
    // @ts-ignore
    const capturedRedsDate = getBoard.capturedReds;
    // @ts-ignore
    const capturedWhitesDate = getBoard.capturedWhites;

    const square = new Square(63, SquareColor.YELLOW);
    const piece = new Piece(PieceColor.RED, 62, false);
    const redPiece = new Piece(PieceColor.RED, 62, false);
    const whitePiece = new Piece(PieceColor.WHITE, 37, false);
    const kings = new Piece(PieceColor.RED, 3, true);
    const capturedWhitePiece = new Piece(PieceColor.WHITE, null, false);
    const captureRedPiece = new Piece(PieceColor.RED, null, false);

    expect(squaresData.pop()).toEqual(square);
    expect(piecesData.pop()).toEqual(piece);
    expect(redData.pop()).toEqual(redPiece);
    expect(whiteData.pop()).toEqual(whitePiece);
    expect(kingsData).toEqual([kings]);
    expect(capturedRedsDate).toEqual([captureRedPiece]);
    expect(capturedWhitesDate).toEqual([capturedWhitePiece]);


});


test('getValidMoves', () => {
    //checks a piece with two captures
    expect(captureBoard.getValidMoves([3,2],false)).toEqual([[1,0],[5,0]]);

    //checks a piece with one capture and continues
    expect(captureBoard.getValidMoves([5,6],false)).toEqual([[7,4]]);

    //checks if a piece can be moved when a capture is present;
    expect(captureBoard.getValidMoves([3,6],false)).toEqual([[2, 5], [4, 5]]);

    //normal board movement
    expect(originalBoard.getValidMoves([1,6],false)).toEqual([[0,5],[2,5]]);

    //trying to move a select a square without a piece
    expect(() => originalBoard.getValidMoves([8,4],false))
        .toThrowError(new Error('Invalid piece coordinates.'));

    //trying to move a select a square without a piece
    expect(() => originalBoard.getValidMoves([4,4],false))
        .toThrowError(new Error('Tried to get valid moves on a square that has no piece.'))
});

test('computeAllValidMoves SingleRedCapture', async () => {
    await SingleRedCaptureBoard.computeAllValidMoves(PieceColor.RED);
    // @ts-ignore
    const data = SingleRedCaptureBoard._validMovesCache;
    expect(data.values().next().value.toString()).toBe('5,0');
});

test('computeAllValidMoves Regular moves ', async () => {
    await originalBoard.computeAllValidMoves(PieceColor.RED);
    // @ts-ignore
    const data = originalBoard._validMovesCache;
    expect(data.values().next().value.toString()).toBe('');
});

test('movePieceToPosition', () => {
    //moving red pieces
    //testing a moving to an occupied square
    expect(() => originalBoard.movePieceToPosition([0,7], [1,6]))
        .toThrowError(new Error('Tried to move to an occupied square'));

    //testing a invalid capture outside range
    expect(() => captureBoard.movePieceToPosition([7,6], [4,3]))
        .toThrowError(new Error(`Invalid capture move - move is outside of capture range.`));

    //testing a invalid capture no square to be captured
    expect(() => captureBoard.movePieceToPosition([3,6], [5,4]))
        .toThrowError(new Error('Invalid capture move - no piece on square to capture.'));

    //testing a invalid capture tried to capture own piece
    expect(() => captureBoard.movePieceToPosition([2,7], [4,5]))
        .toThrowError(new Error('Tried to capture own color piece.'));

    //testing a invalid origin
    expect(() => captureBoard.movePieceToPosition([8,2], [4,0]))
        .toThrowError(new Error('Invalid piece coordinates.'));

    //testing a invalid destination
    expect(() => captureBoard.movePieceToPosition([3,2], [8,0]))
        .toThrowError(new Error('Invalid piece coordinates.'));

    //testing a empty origin piece
    expect(() => captureBoard.movePieceToPosition([4,4], [4,0]))
        .toThrowError(new Error('Tried to move a non-existent piece.'));

    //testing a red capture white move
    expect(captureBoard.movePieceToPosition([3,2], [1,0])).toBeTruthy();

    //testing a regular move
    expect(originalBoard.movePieceToPosition([1,6], [0,5])).toBeFalsy();

    //testing a regular king capture
    expect(kingCaptureBoard.movePieceToPosition([5,0], [7,2])).toBeTruthy();

    ////testing a mutli king valid moves
    expect(kingCaptureBoard.getValidMoves([7,2],true)).toEqual([[5,4]]);

    //testing a mutli king capture
    expect(kingCaptureBoard.movePieceToPosition([7,2], [5,4])).toBeTruthy();

    //testing a regular king move
    expect(kingMoveBoard.movePieceToPosition([5,0], [6,1])).toBeFalsy();
});
