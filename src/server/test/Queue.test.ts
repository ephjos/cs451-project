import Queue from '../src/Queue'

test('creates empty queue', () => {
    let q = new Queue()

    expect(q.peek()).toBeUndefined()
});


test('properly calculates length', () => {
    let q = new Queue()
    let l = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

    l.forEach((n) => { q.enqueue(n) })

    expect(q.length()).toEqual(l.length)
});

test('properly peeks', () => {
    let q = new Queue()
    let l = [1, 2, 3]

    l.forEach((n) => { q.enqueue(n) })

    expect(q.peek()).toEqual(l[0])
});

test('properly enqueues and dequeues', () => {
    let q = new Queue()
    let l = [1, 2, 3]

    l.forEach((n) => { q.enqueue(n) })

    l.forEach((n) => {
        expect(q.dequeue()).toEqual(n)
    })
});

test('properly handles different types', () => {
    let checkQueue = (l: any[]) => {
        let q = new Queue()

        l.forEach((n) => { q.enqueue(n) })

        l.forEach((n) => {
            expect(q.dequeue()).toEqual(n)
        })
    }

    let num = [1, 2, 3, 4, 5]
    checkQueue(num)
    checkQueue([num, num, num, num, num])

    let str = ["1", "2", "3", "4", "5"]
    checkQueue(str)
    checkQueue([str, str, str, str, str])

    let fun = [() => { }, () => { }, () => { }, () => { }, () => { }]
    checkQueue(fun)
    checkQueue([fun, fun, fun, fun, fun])

});