export interface Pixel {
    x: number;
    y: number;
}

export interface Playback {
    index: number;
    playing: boolean;
    started: boolean;
    toggle: () => void;
    step: (direction: number) => void;
    scrubTo: (index: number) => void;
    reset: () => void;
}
