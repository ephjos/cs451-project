import Queue from '../src/Queue';

test('creates empty queue', (): void => {
  let q = new Queue();

  expect(q.peek()).toBeUndefined();
  return;
});


test('properly calculates length', (): void => {
  let q = new Queue();
  let l = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  l.forEach((n): void => { q.enqueue(n); });

  expect(q.length()).toEqual(l.length);
  return;
});

test('properly peeks', (): void => {
  let q = new Queue();
  let l = [1, 2, 3];

  l.forEach((n): void => { q.enqueue(n); });

  expect(q.peek()).toEqual(l[0]);
  return;
});

test('properly enqueues and dequeues', (): void => {
  let q = new Queue();
  let l = [1, 2, 3];

  l.forEach((n): void => { q.enqueue(n); });

  l.forEach((n): void => {
    expect(q.dequeue()).toEqual(n);
  });
  return;
});

test('properly handles different types', (): void => {
  let checkQueue = (l: any[]): void => {
    let q = new Queue();

    l.forEach((n): void => { q.enqueue(n); });

    l.forEach((n): void => {
      expect(q.dequeue()).toEqual(n);
    });
  };

  let num = [1, 2, 3, 4, 5];
  checkQueue(num);
  checkQueue([num, num, num, num, num]);

  let str = ["1", "2", "3", "4", "5"];
  checkQueue(str);
  checkQueue([str, str, str, str, str]);

  let f = (): void => { };
  let fun = [f, f, f, f, f];
  checkQueue(fun);
  checkQueue([fun, fun, fun, fun, fun]);
  return;
});