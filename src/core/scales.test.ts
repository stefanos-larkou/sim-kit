import { describe, expect, it } from "vitest";
import { fraction, geometric, withinRange } from "./scales";

describe("withinRange", () => {
    it("holds a value inside the range", () => {
        expect(withinRange(150, 1, 100)).toBe(100);
        expect(withinRange(-5, 1, 100)).toBe(1);
        expect(withinRange(42, 1, 100)).toBe(42);
    });

    it("falls back to the minimum for a value that is not a number", () => {
        expect(withinRange(Number.NaN, 30, 1000)).toBe(30);
    });
});

describe("fraction", () => {
    it("maps the ends of the range onto zero and one", () => {
        expect(fraction(1, 1, 100)).toBeCloseTo(0);
        expect(fraction(100, 1, 100)).toBeCloseTo(1);
    });

    it("maps the middle of the range onto a half", () => {
        expect(fraction(50.5, 1, 100)).toBeCloseTo(0.5);
    });
});

describe("geometric", () => {
    it("maps zero and one onto the ends of the range", () => {
        expect(geometric(0, 1, 2000)).toBeCloseTo(1);
        expect(geometric(1, 1, 2000)).toBeCloseTo(2000);
    });

    it("puts the halfway point at the geometric mean rather than the arithmetic one", () => {
        expect(geometric(0.5, 1, 2000)).toBeCloseTo(Math.sqrt(2000));
        expect(geometric(0.5, 1, 2000)).toBeLessThan((1 + 2000) / 2);
    });

    it("multiplies by a constant factor for each equal step", () => {
        const first = geometric(0.5, 1, 2000) / geometric(0.25, 1, 2000);
        const second = geometric(0.75, 1, 2000) / geometric(0.5, 1, 2000);
        expect(first).toBeCloseTo(second);
    });
});
