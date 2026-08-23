import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ControlSlider } from "./ControlSlider";

const SETTLING_MS = 300;

function Editable({ min, max }: { min: number; max: number; }) {
    const [value, setValue] = useState(min);
    return <ControlSlider label="Speed" value={value} min={min} max={max} onChange={setValue} />;
}

function type(digits: string) {
    fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: digits } });
}

describe("ControlSlider", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("moves with each keystroke but waits before calling a typed value settled", () => {
        const onChange = vi.fn();
        const onCommit = vi.fn();
        render(<ControlSlider label="Speed" value={1} min={1} max={100} onChange={onChange} onCommit={onCommit} />);
        type("42");
        expect(onChange).toHaveBeenCalledWith(42);
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("settles on a typed value once the typing stops", () => {
        const onCommit = vi.fn();
        render(<ControlSlider label="Speed" value={1} min={1} max={100} onChange={vi.fn()} onCommit={onCommit} />);
        type("42");
        act(() => vi.advanceTimersByTime(SETTLING_MS));
        expect(onCommit).toHaveBeenCalledExactlyOnceWith(42);
    });

    it("settles once on the last of several keystrokes, not once on each", () => {
        const onCommit = vi.fn();
        render(<ControlSlider label="Speed" value={1} min={1} max={1000} onChange={vi.fn()} onCommit={onCommit} />);
        ["4", "40", "400"].forEach(digits => {
            type(digits);
            act(() => vi.advanceTimersByTime(SETTLING_MS / 2));
        });
        act(() => vi.advanceTimersByTime(SETTLING_MS));
        expect(onCommit).toHaveBeenCalledExactlyOnceWith(400);
    });

    it("asks nothing of a value the typing was abandoned on", () => {
        const onCommit = vi.fn();
        const { unmount } = render(<ControlSlider label="Speed" value={1} min={1} max={100} onChange={vi.fn()} onCommit={onCommit} />);
        type("42");
        unmount();
        act(() => vi.advanceTimersByTime(SETTLING_MS));
        expect(onCommit).not.toHaveBeenCalled();
    });

    it("asks for nothing extra when no one is listening for a settled value", () => {
        const onChange = vi.fn();
        render(<ControlSlider label="Speed" value={1} min={1} max={100} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "42" } });
        expect(onChange).toHaveBeenCalledWith(42);
    });

    it("holds a typed value at the maximum once the field is left", () => {
        render(<Editable min={1} max={100} />);
        type("150");
        fireEvent.blur(screen.getByLabelText("Speed value"));
        expect(screen.getByLabelText("Speed value")).toHaveValue(100);
    });

    it("holds a typed value at the minimum once the field is left", () => {
        render(<Editable min={30} max={1000} />);
        type("5");
        fireEvent.blur(screen.getByLabelText("Speed value"));
        expect(screen.getByLabelText("Speed value")).toHaveValue(30);
    });

    it("shows the same value on the slider and the input", () => {
        render(<Editable min={1} max={100} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "42" } });
        expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "42");
    });
});
