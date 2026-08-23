import { useColorScheme, useTheme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export function useThemeMode(): ThemeMode {
    const theme = useTheme();
    const { mode, systemMode } = useColorScheme();
    const chosen = mode === "system" ? systemMode : mode;

    return chosen ?? theme.palette.mode;
}
