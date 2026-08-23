import { ThemeProvider, createTheme } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useThemeMode } from "./useThemeMode";

const PLAIN = { light: createTheme(), dark: createTheme({ palette: { mode: "dark" } }) };
const VARIABLE = createTheme({ cssVariables: { colorSchemeSelector: "class" }, colorSchemes: { light: true, dark: true } });

function Reader() {
    return <span data-testid="mode">{useThemeMode()}</span>;
}

function shown(): string {
    return screen.getByTestId("mode").textContent ?? "";
}

function systemScheme(scheme: string) {
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes("dark") && scheme === "dark",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
    }));
}

afterEach(() => vi.unstubAllGlobals());

describe("useThemeMode", () => {
    it("reads a plain theme's own mode", () => {
        render(<ThemeProvider theme={PLAIN.dark}><Reader /></ThemeProvider>);
        expect(shown()).toBe("dark");
    });

    it("reads a plain theme's light mode too", () => {
        render(<ThemeProvider theme={PLAIN.light}><Reader /></ThemeProvider>);
        expect(shown()).toBe("light");
    });

    it("reads the scheme a variable theme is actually showing", () => {
        render(<ThemeProvider theme={VARIABLE} defaultMode="dark" noSsr><Reader /></ThemeProvider>);
        expect(shown()).toBe("dark");
    });

    it("follows the system when a variable theme defers to it", () => {
        systemScheme("dark");
        render(<ThemeProvider theme={VARIABLE} defaultMode="system" noSsr><Reader /></ThemeProvider>);
        expect(shown()).toBe("dark");
    });
});
