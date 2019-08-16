import PlayerPromise from '../src/PlayerPromise'

test('copies id', () => {
    let check = false
    let resolve = (value: boolean) => check = value
    let id = "an id"
    let pp = new PlayerPromise(id, resolve)

    expect(pp.id).toEqual(id)
});

test('properly calls resolve function', () => {
    let check = false
    let resolve = (value: boolean) => check = value
    let id = "an id"
    let pp = new PlayerPromise(id, resolve)

    expect(check).toEqual(false)
    pp.resolve(true)
    expect(check).toEqual(true)
});