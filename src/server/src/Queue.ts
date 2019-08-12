class Queue<T> {
  private _array: T[];

  constructor() {
    this._array = [];
  }

  public enqueue(value: T): void {
    this._array.push(value);
  }

  public peek(): T {
    return this._array[0];
  }

  public dequeue(): T {
    return this._array.shift();
  }

  public length(): number {
    return this._array.length;
  }
}

export default Queue;