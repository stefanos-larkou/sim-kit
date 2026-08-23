import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./NumberField";

interface EditableProps {
    start: number;
    min: number;
    max: number;
    step?: number;
    showLabel?: boolean;
}

function Editable({ start, min, max, step, showLabel }: EditableProps) {
    const [value, setValue] = useState(start);

    return (
        <NumberField
            label="Speed"
            value={value}
            min={min}
            max={max}
            step={step}
            showLabel={showLabel}
            onChange={setValue}
        />
    );
}

describe("NumberField", () => {
    it("increases the value by the step", async () => {
        render(<Editable start={50} min={1} max={100} step={5} />);
        await userEvent.click(screen.getByRole("button", { name: "Increase speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(55);
    });

    it("decreases the value by the step", async () => {
        render(<Editable start={50} min={1} max={100} step={5} />);
        await userEvent.click(screen.getByRole("button", { name: "Decrease speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(45);
    });

    it("will not increase past the maximum", async () => {
        render(<Editable start={100} min={1} max={100} />);
        await userEvent.click(screen.getByRole("button", { name: "Increase speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(100);
    });

    it("will not decrease below the minimum", async () => {
        render(<Editable start={30} min={30} max={1000} />);
        await userEvent.click(screen.getByRole("button", { name: "Decrease speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(30);
    });

    it("lets a number be typed through the digits the range does not allow", () => {
        render(<Editable start={400} min={50} max={3000} />);
        const field = screen.getByLabelText("Speed value");
        ["1", "12", "120", "1200"].forEach(digits => fireEvent.change(field, { target: { value: digits } }));
        expect(field).toHaveValue(1200);
    });

    it("leaves the value where it was while the typing is out of range", () => {
        const onChange = vi.fn();
        render(<NumberField label="Speed" value={400} min={50} max={3000} onChange={onChange} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "1" } });
        expect(onChange).not.toHaveBeenCalled();
    });

    it("brings a value the range does not reach back into it on the way out", () => {
        render(<Editable start={400} min={50} max={3000} />);
        const field = screen.getByLabelText("Speed value");
        fireEvent.change(field, { target: { value: "9000" } });
        fireEvent.blur(field);
        expect(field).toHaveValue(3000);
    });

    it("keeps the value it had when the field is emptied and left", () => {
        render(<Editable start={400} min={50} max={3000} />);
        const field = screen.getByLabelText("Speed value");
        fireEvent.change(field, { target: { value: "" } });
        fireEvent.blur(field);
        expect(field).toHaveValue(400);
    });

    it("takes the arrows over anything half typed", async () => {
        render(<Editable start={400} min={50} max={3000} step={5} />);
        fireEvent.change(screen.getByLabelText("Speed value"), { target: { value: "1" } });
        await userEvent.click(screen.getByRole("button", { name: "Increase speed" }));
        expect(screen.getByLabelText("Speed value")).toHaveValue(405);
    });

    it("names the field with a visible label when asked", () => {
        render(<Editable start={1} min={1} max={100} showLabel />);
        expect(screen.getByLabelText("Speed")).toBeInTheDocument();
    });
});
