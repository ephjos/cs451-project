import MatchMaker from '../src/MatchMaker';
import { Status } from '../../client/src/classes/Game';

test('can create games', (): void => {
  let p1 = 'p1';
  let c1 = false;
  let r1 = (): void => { c1 = true; };

  let p2 = 'p2';
  let c2 = false;
  let r2 = (): void => { c2 = true; };

  let mm = new MatchMaker();

  mm.addToQueue(p1).then((): void => {
    r1();
    expect(c1).toBeTruthy();
    expect(c2).toBeTruthy();
  }).catch((): void => {
  });

  expect(c1).toBeFalsy();
  expect(c2).toBeFalsy();

  mm.addToQueue(p2).then((): void => {
    r2();
    expect(c1).toBeTruthy();
    expect(c2).toBeTruthy();
  }).catch((): void => {
  });

});

test('properly handles status', (): void => {
  let p1 = 'p1';
  let p2 = 'p2';

  let mm = new MatchMaker();

  mm.addToQueue(p1).then((): void => {
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined]);
  }).catch((): void => { });

  expect(mm.getStatus(p1)).toEqual([Status.QUEUE, undefined]);
  expect(mm.getStatus(p2)).toEqual([Status.ERROR, undefined]);

  mm.addToQueue(p2).then((): void => {
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined]);
  }).catch((): void => { });
});

test('properly handles move updates', (): void => {
  let p1 = 'p1';
  let p2 = 'p2';

  let mm = new MatchMaker();
  let testMoves = [['a'], ['b'], ['c']];

  let promises: Promise<any>[] = [];

  expect(mm.updateMoves(p1, testMoves)).toEqual(Status.ERROR);
  expect(mm.updateMoves(p2, testMoves)).toEqual(Status.ERROR);

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p1).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p2).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  Promise.all(promises).then((): void => {
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined]);

    expect(mm.updateMoves(p1, testMoves)).toEqual(Status.GOOD);
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, testMoves]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, testMoves]);

    testMoves = [['c'], ['b'], ['a']];

    expect(mm.updateMoves(p2, testMoves)).toEqual(Status.GOOD);
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, testMoves]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, testMoves]);
  });
});

test('properly handles forfeit', (): void => {
  let p1 = 'p1';
  let p2 = 'p2';

  let mm = new MatchMaker();

  let promises: Promise<any>[] = [];

  expect(mm.forfeit(p1)).toEqual(Status.ERROR);
  expect(mm.forfeit(p2)).toEqual(Status.ERROR);

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p1).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p2).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  Promise.all(promises).then((): void => {
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined]);

    expect(mm.forfeit(p1)).toEqual(Status.FORFEIT);

    expect(mm.getStatus(p1)).toEqual([Status.FORFEIT, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.FORFEIT, undefined]);
  });
});

test('properly handles end game', (): void => {
  let p1 = 'p1';
  let p2 = 'p2';

  let mm = new MatchMaker();

  let promises: Promise<any>[] = [];

  expect(mm.endGame(p1)).toEqual(Status.ERROR);
  expect(mm.endGame(p2)).toEqual(Status.ERROR);

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p1).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  promises.concat(new Promise((resolve): void => {
    mm.addToQueue(p2).then((): void => {
      resolve();
    }).catch((): void => { });
  }));

  Promise.all(promises).then((): void => {
    expect(mm.getStatus(p1)).toEqual([Status.GOOD, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.GOOD, undefined]);

    expect(mm.endGame(p1)).toEqual(Status.END);

    expect(mm.getStatus(p1)).toEqual([Status.END, undefined]);
    expect(mm.getStatus(p2)).toEqual([Status.END, undefined]);
  });
});
