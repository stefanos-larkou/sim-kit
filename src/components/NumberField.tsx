import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconButton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { withinRange } from "../core/scales";

interface NumberFieldProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    showLabel?: boolean;
    width?: number | string;
    onChange: (value: number) => void;
}

const NO_NATIVE_SPINNERS = {
    "& input[type=number]": { MozAppearance: "textfield" },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
        WebkitAppearance: "none",
        margin: 0
    }
};

export function NumberField({ label, value, min, max, step = 1, showLabel = false, width = 120, onChange }: NumberFieldProps) {
    const [draft, setDraft] = useState<string | undefined>(undefined);

    const edit = (text: string) => {
        setDraft(text);

        const typed = Number(text);
        if (text !== "" && typed === withinRange(typed, min, max)) onChange(typed);
    };

    const leave = () => {
        if (draft === undefined) return;

        setDraft(undefined);
        if (draft !== "") onChange(withinRange(Number(draft), min, max));
    };

    const nudge = (by: number) => {
        setDraft(undefined);
        onChange(withinRange(value + by, min, max));
    };

    return (
        <TextField
            type="number"
            size="medium"
            label={showLabel ? label : undefined}
            value={draft ?? value}
            onChange={event => edit(event.target.value)}
            onBlur={leave}
            slotProps={{
                htmlInput: {
                    min,
                    max,
                    step,
                    "aria-label": showLabel ? undefined : `${label} value`
                },
                input: {
                    endAdornment: (
                        <Stack sx={{ mr: -1 }}>
                            <IconButton
                                size="small"
                                aria-label={`Increase ${label.toLowerCase()}`}
                                onClick={() => nudge(step)}
                                sx={{ p: 0 }}
                            >
                                <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                aria-label={`Decrease ${label.toLowerCase()}`}
                                onClick={() => nudge(-step)}
                                sx={{ p: 0 }}
                            >
                                <KeyboardArrowDownIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )
                }
            }}
            sx={{ width, ...NO_NATIVE_SPINNERS }}
        />
    );
}
