import { Slider, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { NumberField } from "./NumberField";

const SETTLING_MS = 300;

interface ControlSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number | null;
    marks?: { value: number; }[];
    onChange: (value: number) => void;
    onCommit?: (value: number) => void;
}

export function ControlSlider({ label, value, min, max, step, marks, onChange, onCommit }: ControlSliderProps) {
    const settling = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const held = () => clearTimeout(settling.current);

    useEffect(() => held, []);

    const typed = (next: number) => {
        onChange(next);
        if (!onCommit) return;

        held();
        settling.current = setTimeout(() => onCommit(next), SETTLING_MS);
    };

    const settle = (next: number) => {
        held();
        onCommit?.(next);
    };

    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%" }}>
            <Typography variant="body1" color="text.secondary" sx={{ width: 96 }}>
                {label}
            </Typography>
            <Slider
                value={value}
                min={min}
                max={max}
                step={step}
                marks={marks}
                valueLabelDisplay="auto"
                onChange={(_event, next) => onChange(next)}
                onChangeCommitted={(_event, next) => settle(next)}
                aria-label={label}
                sx={{ flex: 1 }}
            />
            <NumberField label={label} value={value} min={min} max={max} step={step ?? 1} onChange={typed} />
        </Stack>
    );
}
