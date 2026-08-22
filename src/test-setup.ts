import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { resetObservers, stubResizeObserver } from "./testing";

stubResizeObserver();

afterEach(() => {
    cleanup();
    localStorage.clear();
    resetObservers();
});