export enum Status {
    GOOD = 0,
    END = 1,
    FORFEIT = 2,
    DISCONNECT = 3,
    QUEUE = 4,
    ERROR = 100
}

export function generateV4UUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // eslint-disable-next-line
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}