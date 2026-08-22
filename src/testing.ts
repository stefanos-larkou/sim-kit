export const observers: ResizeObserverStub[] = [];

export class ResizeObserverStub {
    readonly callback: ResizeObserverCallback;
    observed: Element[] = [];
    disconnected = false;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observers.push(this);
    }

    observe(element: Element) {
        this.observed.push(element);
    }

    unobserve() { }

    disconnect() {
        this.disconnected = true;
    }

    send(size: { width: number; height: number; }) {
        this.callback([{ contentRect: size } as ResizeObserverEntry], this);
    }
}

export function stubResizeObserver(): void {
    globalThis.ResizeObserver = ResizeObserverStub;
}

export function resetObservers(): void {
    observers.length = 0;
}