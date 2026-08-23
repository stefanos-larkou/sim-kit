# Sim Kit

The shared foundation of the simulation visualisers: a seeded generator, playback timing, an
element-size hook, persistence hooks, and the two MUI controls every one of them needs. A React component library with no domain of its own.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [Repository layout](#repository-layout)
  - [Playback is one number](#playback-is-one-number)
  - [Two entry points](#two-entry-points)
- [Getting started](#getting-started)
- [Using it in an application](#using-it-in-an-application)
  - [Installing](#installing)
  - [Seeded randomness](#seeded-randomness)
  - [Playback](#playback)
  - [Controls](#controls)
  - [Persistence](#persistence)
  - [Testing stubs](#testing-stubs)
  - [Peer dependencies](#peer-dependencies)
- [Testing](#testing)
- [Licence](#licence)

## Features

| Export | What it is for |
| --- | --- |
| `createRandom` | A seeded generator, so a simulation can be reproduced exactly |
| `usePlayback`, `Playback` | Play, pause, step, scrub and reset over an event count |
| `advanceIndex`, `clampIndex`, `lastIndex`, `stepIndex` | The pure arithmetic underneath it |
| `EMPTY_INDEX`, `MAX_FRAME_MS` | Playback's own constants |
| `useElementSize`, `Pixel` | A `ResizeObserver` hook, so a canvas can size itself to its host |
| `usePersistedNumber`, `usePersistedChoice`, `usePersistedFlag` | A control's value, remembered between visits |
| `withinRange`, `fraction`, `geometric` | Clamping and the two slider scales |
| `ControlSlider`, `NumberField` | A labelled slider paired with a clamped numeric input |

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript 6.0 |
| UI | MUI 9 with Emotion |
| Build | Vite 8, library mode with two entries and `vite-plugin-dts` |
| Tests | Vitest 4 with jsdom and React Testing Library |

## Architecture

### Repository layout

```text
src/
  core/          Pure logic - no React, no DOM
  hooks/         React state and effects
  components/    MUI controls
  index.ts       The library entry point
  testing.ts     The testing entry point
  test-setup.ts  This repository's own vitest setup
```

### Playback is one number

A simulation is an ordered list of events. Playback is a single **fractional index** into it, so
stepping, scrubbing and pausing are all the same operation on one number, and any position is one
slice away in either direction.

The index starts at `-1`, meaning nothing revealed, so a run that finds nothing still visibly tries
rather than sitting at its first event from the outset.

The index advances by elapsed time multiplied by a rate, which is what decouples speed from frame
rate. `requestAnimationFrame` fires once per display refresh, so a 60Hz screen gives a frame every
`1 / 60 = 16.67ms`, and `advanceIndex` turns that into a distance:

```text
16.67ms / 1000 x 2000 events per second = 33.3 events in that frame
```

A slower screen simply covers the same distance in fewer, larger steps. Without this, playback
speed is whatever the machine happens to manage.

### Two entry points

`.` is the library. `./testing` is the jsdom stubs, and it exists because `useElementSize` needs a
`ResizeObserver` that jsdom does not provide. Without a shared stub, every consumer re-copies the
same one, which is the duplication this package exists to end.

Test helpers never appear in the main entry, so a consumer's production bundle cannot pull in a
stub by accident. This repository's own `test-setup.ts` imports from `testing.ts` exactly as a
consumer would, which is what keeps the published stubs honest: if they break, these tests fail
first.

## Getting started

### Prerequisites

- Node 24+

```bash
npm install
```

| Command | What it does |
| --- | --- |
| `npm test` | Vitest, headless |
| `npm run lint` | ESLint |
| `npm run build` | Both entries and type declarations into `dist/` |
| `npm run check` | Lint, test and build - what CI runs |

There is no `npm start`. This package has no application to run.

## Using it in an application

### Installing

A git dependency. There is no published package:

```bash
npm i github:stefanos-larkou/sim-kit
```

`prepare` builds `dist/` on install, so a consumer never sees TypeScript source. Two consequences
follow, and both matter:

- **A consumer's CI must not use `npm ci --ignore-scripts`**, or `prepare` never runs and `main`
  points at a `dist` that was never built.
- **npm rewrites `github:` into an ssh URL** in the lockfile, so a CI runner with no SSH key needs
  `git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"` before it
  installs.

A lockfile pins a commit SHA, and a plain `npm install` will not move it. Reaching a consumer takes `npm update @stefanos-larkou/sim-kit` there, and the
updated lockfile committed.

### Seeded randomness

```tsx
import { createRandom } from "@stefanos-larkou/sim-kit";

const random = createRandom(seed);
```

`createRandom` is a linear congruential generator, and its seed *is* its state. That has the
consequence that **seeds that are close together do not give independent streams.**

```text
createRandom(seed + i)              every stream starts almost identically
                                    the first draw differs by about 0.0004

createRandom(master())              the same stream at a different offset,
                                    while the distribution still looks uniform
```

Draw an entire ensemble from **one** generator, consumed linearly, rather than creating one per
simulation from related seeds. The whole run stays reproducible from a single number, and the runs
are genuinely independent.

### Playback

```tsx
import { usePlayback } from "@stefanos-larkou/sim-kit";

const playback = usePlayback(events.length, eventsPerSecond, autoPlay);
```

Returns `index`, `playing`, `started`, and the four actions `toggle`, `step`, `scrubTo` and `reset` -
narrow named actions, never a raw setter.

### Controls

```tsx
import { ControlSlider, NumberField } from "@stefanos-larkou/sim-kit";

<ControlSlider label="Speed" value={speed} min={1} max={100} onChange={setSpeed} />
```

`ControlSlider` pairs a labelled MUI slider with a `NumberField` that clamps whatever is typed into
it. Both take their label as a prop.

> **Never space a slider with its own margin.** Its root is `content-box` at `width: 100%`, so a
> margin makes it overflow its column instead of shrinking. Put the space on the neighbour.

### Persistence

```tsx
import { usePersistedNumber } from "@stefanos-larkou/sim-kit";

const [cellCount, setCellCount] = usePersistedNumber("find-my-way:cell-count", 150, 30, 3000);
```

The key is the consumer's, prefix and all. Anything read back is validated and clamped, because it
may have been written by an older version or edited by hand.

### Testing stubs

```ts
import { resetObservers, stubResizeObserver } from "@stefanos-larkou/sim-kit/testing";

stubResizeObserver();

afterEach(() => resetObservers());
```

`observers` records every stub created, so a test can drive a resize with `send({ width, height })`,
assert what was observed, and assert `disconnected` after unmount. Each consumer keeps its own
canvas stub, since they need different ones.

### Peer dependencies

React, React DOM, MUI and Emotion are peer dependencies, never regular ones. A second copy of React
in a consumer's tree throws "invalid hook call", and a second copy of MUI means the controls render
outside the host's theme - which fails silently, so nothing tells you.

This is also why `npm link` does not work for local development against this package. A symlinked
package resolves its peers from its own real path, so it loads its own React no matter what the
consumer's resolver is told, and neither `resolve.dedupe` nor `server.deps.inline` fixes it. Use
`npm pack` and install the tarball instead - it produces a real directory with normal hoisting.

## Testing

```bash
npm test
```

Headless, no browser and no server. Every module with behaviour has a test beside it; types and the
two entry files do not.

Coverage here is worth more than coverage anywhere else: a bug in this package is a bug in every
consumer at once, and it will be found in the consumer, where it looks like the consumer's fault.

Random output is tested by its invariants rather than its value - that a seed repeats, that two
seeds diverge, that every value falls in `[0, 1)`. Every hook that observes, subscribes or schedules
is tested for what it releases on unmount, because an observer that outlives its component is a leak
a consumer inherits.

## Licence

MIT ([LICENSE](LICENSE)).
