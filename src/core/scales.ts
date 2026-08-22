export function withinRange(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
}

export function fraction(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

export function geometric(ratio: number, min: number, max: number): number {
    return min * (max / min) ** ratio;
}
