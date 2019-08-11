class Queue {
    private _array: any[]

    constructor() {
        this._array = []
    }

    public enqueue(value: any) {
        this._array = this._array.concat(value)
    }

    public peek() {
        return this._array[0]
    }

    public dequeue() {
        let front = this.peek()
        this._array = this._array.slice(1)
        return front
    }

    public length() {
        return this._array.length
    }
}

export default Queue