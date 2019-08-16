import MatchMaker from '../src/MatchMaker'
import { Status } from '../../client/src/classes/Game';

test('can create games', () => {
    let p1 = 'p1'
    let c1 = false
    let r1 = () => { c1 = true }

    let p2 = 'p2'
    let c2 = false
    let r2 = () => { c2 = true }

    let mm = new MatchMaker()

    mm.addToQueue(p1).then((bool) => {
        r1()
        expect(c1).toBeTruthy()
        expect(c2).toBeTruthy()
    }).catch(() => {
    })

    expect(c1).toBeFalsy()
    expect(c2).toBeFalsy()

    mm.addToQueue(p2).then((bool) => {
        r2()
        expect(c1).toBeTruthy()
        expect(c2).toBeTruthy()
    }).catch(() => {
    })

});

test('properly handles status', () => {
    let p1 = 'p1'
    let p2 = 'p2'

    let mm = new MatchMaker()

    mm.addToQueue(p1).then(() => {
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined])
    }).catch(() => { })

    expect(mm.getStatus(p1)).toEqual([Status.QUEUE, undefined])
    expect(mm.getStatus(p2)).toEqual([Status.ERROR, undefined])

    mm.addToQueue(p2).then(() => {
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined])
    }).catch(() => { })
});

test('properly handles board updates', () => {
    let p1 = 'p1'
    let p2 = 'p2'

    let mm = new MatchMaker()
    let testBoard = 'this is a board'

    let promises: any[] = []

    expect(mm.updateBoard(p1, testBoard)).toEqual(Status.ERROR)
    expect(mm.updateBoard(p2, testBoard)).toEqual(Status.ERROR)

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p1).then(() => {
            resolve()
        }).catch(() => { })
    }))

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p2).then(() => {
            resolve()
        }).catch(() => { })
    }))

    Promise.all(promises).then((value: any[]) => {
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined])

        expect(mm.updateBoard(p1, testBoard)).toEqual(Status.GOOD)
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, testBoard])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, testBoard])

        testBoard = 'this is another board'

        expect(mm.updateBoard(p2, testBoard)).toEqual(Status.GOOD)
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, testBoard])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, testBoard])
    })
});

test('properly handles forfeit', () => {
    let p1 = 'p1'
    let p2 = 'p2'

    let mm = new MatchMaker()

    let promises: any[] = []

    expect(mm.forfeit(p1)).toEqual(Status.ERROR)
    expect(mm.forfeit(p2)).toEqual(Status.ERROR)

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p1).then(() => {
            resolve()
        }).catch(() => { })
    }))

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p2).then(() => {
            resolve()
        }).catch(() => { })
    }))

    Promise.all(promises).then((value: any[]) => {
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined])

        expect(mm.forfeit(p1)).toEqual(Status.FORFEIT)

        expect(mm.getStatus(p1)).toEqual([Status.FORFEIT, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.FORFEIT, undefined])
    })
});

test('properly handles end game', () => {
    let p1 = 'p1'
    let p2 = 'p2'

    let mm = new MatchMaker()

    let promises: any[] = []

    expect(mm.endGame(p1)).toEqual(Status.ERROR)
    expect(mm.endGame(p2)).toEqual(Status.ERROR)

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p1).then(() => {
            resolve()
        }).catch(() => { })
    }))

    promises.concat(new Promise((resolve) => {
        mm.addToQueue(p2).then(() => {
            resolve()
        }).catch(() => { })
    }))

    Promise.all(promises).then((value: any[]) => {
        expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined])

        expect(mm.endGame(p1)).toEqual(Status.END)

        expect(mm.getStatus(p1)).toEqual([Status.END, undefined])
        expect(mm.getStatus(p2)).toEqual([Status.END, undefined])
    })
});
