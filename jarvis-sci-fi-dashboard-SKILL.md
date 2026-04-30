---
name: jarvis-sci-fi-dashboard-designer
description: create animated, futuristic, jarvis-style ai command-center dashboards and upgrade existing frontends to a full cinematic sci-fi hud experience. use when the user asks for jarvis vibe, ai dashboards, realtime agent dashboards, futuristic react/tailwind interfaces, animated hud panels, holographic command centers, sci-fi admin panels, or when they want an existing frontend visually aligned with a new futuristic design while preserving structure and updating code for current library APIs.
---

# Jarvis Sci-Fi Dashboard Designer

## Core objective
Create a futuristic, animated Jarvis-style AI command center that feels alive, intelligent, cinematic, and production-ready.

Do not make static mockups unless the user explicitly asks. Prefer animated, interactive UI with realtime-feeling telemetry, active command states, pulse effects, scan sweeps, orbiting HUD elements, holographic panels, and smooth micro-interactions.

Balance the vibe with usability: the result must be readable, responsive, accessible, and maintainable.

## Critical existing-code rule
When working on an existing frontend, read the current code first before making changes.

Preserve the existing project structure, routes, components, state model, data flow, filenames, and business logic unless the user explicitly asks for restructuring.

Only modify the files required to align the frontend with the new Jarvis/futuristic design and to fix compatibility issues caused by new or updated libraries.

Do not rewrite the app from scratch. Do not rename components, move files, change APIs, alter backend contracts, or replace working logic unless required for the requested visual/animation update.

When library versions have changed, update code to match current APIs while keeping behavior the same. Typical examples:
- Replace deprecated imports or component props.
- Fix React, Next.js, Tailwind, Framer Motion, Recharts, Lucide, or shadcn/ui usage for the installed versions.
- Keep package changes minimal and justified.
- Prefer compatibility fixes over broad refactors.

## Default aesthetic
Use a dark, high-contrast, premium sci-fi interface with:

- Deep space background: near-black, navy, graphite, radial gradients, subtle noise, and layered grid fields.
- Animated HUD atmosphere: scanner sweeps, radial glows, pulse rings, floating particles, subtle parallax, orbit paths, waveform strips, and live status pings.
- Holographic panels: selective glass/liquid-glass only for shells, overlays, nav, command bars, and hero cards.
- Solid readable surfaces for dense text, charts, logs, forms, and controls.
- Cyan/blue/violet/emerald neon accents used intentionally, not everywhere.
- Thin vector borders, corner brackets, circuit traces, grid overlays, radar arcs, and status chips.
- Bento-grid layout for modular command-center composition.
- Continuous but restrained movement so the dashboard feels operational, not distracting.

## Animation requirements
Every full dashboard should include motion unless the user opts out.

Use animation for:
- Initial load: panels fade/slide/stagger into place.
- Live indicators: pulse, ping, breathing glow, small status loops.
- Hero intelligence area: scanline, radar sweep, orbital ring, waveform, or hologram motion.
- Cards: hover lift, active border glow, subtle shimmer on selected state.
- Logs: newest events animate in smoothly.
- Command input: focus glow, typing cursor, active listening waveform.
- Progress and telemetry: animated rings, bars, counters, or chart transitions.

Rules:
- Keep animations subtle and purposeful.
- Respect `prefers-reduced-motion`.
- Avoid infinite heavy animations on many elements.
- Use transform and opacity where possible for performance.
- Do not animate dense tables or large lists unnecessarily.

## Layout principles
Use a command-center hierarchy:

1. Top command bar
   - AI name/status, time, environment, command input, global search, connection health.
2. Left rail
   - Core modules: Overview, Agents, Systems, Mission, Logs, Automations, Settings.
3. Main bento grid
   - Large primary intelligence panel.
   - Smaller telemetry, tasks, alerts, and chart modules.
4. Right context column
   - Live agent feed, alerts, recommendations, system diagnostics.
5. Bottom strip when useful
   - Realtime logs, voice waveform, execution queue, or active workflow trace.

For desktop, prefer asymmetric CSS grid layouts. For mobile, collapse into stacked cards with sticky command input.

## Visual design rules

### Color
Use 1 primary neon accent and 1 secondary accent. Avoid rainbow dashboards.

Recommended palettes:

- Jarvis blue: background `#050812`, surface `#0B1020`, primary `#38BDF8`, secondary `#A78BFA`, alert `#F59E0B`.
- Quantum green: background `#030712`, surface `#07111F`, primary `#34D399`, secondary `#22D3EE`, alert `#FB7185`.
- Stark amber: background `#070707`, surface `#111827`, primary `#FBBF24`, secondary `#60A5FA`, alert `#EF4444`.

### Typography
Use a readable sans font for most UI. Use mono only for labels, telemetry, logs, coordinates, IDs, and system statuses.

Recommended pairing:
- Display/headings: Inter, Geist, Space Grotesk, Sora, or Orbitron only for short titles.
- UI/body: Inter, Geist Sans, IBM Plex Sans.
- Telemetry/logs: JetBrains Mono, IBM Plex Mono, Geist Mono.

### Glass and glow
Use glow as feedback and hierarchy, not decoration.

Good:
- Thin glowing borders on active cards.
- Soft radial glow behind hero widgets.
- Subtle backdrop blur on floating nav or modal surfaces.
- Animated gradient edge only on key active components.

Avoid:
- Blur on dense table/log/chart panels.
- Heavy outer glows around every card.
- Low-contrast transparent text areas.
- Random neon colors with no state meaning.

## Dashboard modules to include by default
When creating a full Jarvis dashboard, include these modules unless the user specifies otherwise:

- AI Core Status: online/offline, model, latency, confidence, active mode.
- Voice/Command Input: prominent command bar with placeholder such as “Ask Jarvis to execute…”
- Agent Fleet: active agents, queued jobs, failed jobs, success rate.
- Mission Timeline: current workflows and upcoming automations.
- System Telemetry: CPU, memory, API usage, database health, uptime.
- Threat/Alert Panel: warnings, anomalies, required human approvals.
- Live Event Stream: timestamped logs with severity tags.
- Insights Panel: AI-generated recommendations and next actions.
- Holographic Focus Panel: animated radar, orbit map, neural core, or mission visualization.

## UX rules
- Keep the most important status visible above the fold.
- Make every metric actionable or explain why it exists.
- Use plain labels despite futuristic visuals.
- Make alert severity obvious through label, icon, and position, not color alone.
- Use consistent spacing, icons, labels, and interaction states.
- Keep chart legends and axes readable.
- Ensure text contrast meets WCAG AA where possible.
- Prefer cinematic polish around the shell, not inside dense data areas.

## React + Tailwind implementation guidance
When asked to build UI code:

- Prefer React with Tailwind CSS.
- Use CSS grid for the dashboard shell.
- Use reusable components: `CommandBar`, `MetricCard`, `TelemetryRing`, `AgentStatusCard`, `LiveLog`, `AlertPanel`, `RadarPanel`, `HologramCore`, `AnimatedHudFrame`.
- Use `framer-motion` for page entry, staggered cards, hover states, and active command animations.
- Use CSS keyframes for lightweight continuous effects such as scanlines, radar sweeps, pulse rings, glow breathing, and waveform loops.
- Use `recharts` for charts when charting is needed.
- Use `lucide-react` icons.
- Avoid hard dependency on external images.
- Keep code in one file only for new prototypes. For existing apps, edit the existing files in place and preserve structure.

Use utility patterns like:
- `bg-slate-950 text-slate-100`
- `border border-cyan-400/20`
- `bg-white/[0.03] backdrop-blur-xl`
- `shadow-[0_0_40px_rgba(56,189,248,0.12)]`
- `rounded-2xl`
- `font-mono tracking-wider uppercase text-xs`
- `before:absolute before:inset-0 before:bg-[linear-gradient(...)]`
- `motion-safe:animate-pulse`

## Existing frontend update workflow
When the user provides code or a repository/app structure:

1. Inspect the existing files and identify the framework, styling system, routing pattern, and installed library versions.
2. Locate the smallest set of files required for the dashboard update.
3. Preserve existing structure and logic.
4. Apply the Jarvis visual system through classes, component styling, animation wrappers, and small supporting components.
5. Fix only compatibility issues caused by current library APIs.
6. Verify imports, component exports, props, and build-sensitive syntax.
7. Summarize exactly which files changed and why.

Do not introduce unnecessary dependencies. If animation can be done with existing CSS/Tailwind, prefer that. Add Framer Motion only when the project already has it or when the user asked for richer animation.

## Prompt template for image/design generation
When the user asks for a visual concept, use or adapt this prompt:

“Design a premium animated Jarvis-inspired sci-fi AI command dashboard, dark cinematic interface, modular bento grid, selective liquid-glass panels, cyan and violet neon accents, holographic HUD lines, realtime telemetry cards, agent fleet monitoring, command input bar, live event stream, animated radar visualization, pulsing AI core, waveform command state, scanner sweep, orbit rings, clean readable typography, high contrast, production SaaS dashboard, subtle glow, no clutter, no illegible microtext.”

## Output format
For design specs, return:

1. Concept direction
2. Layout structure
3. Color palette
4. Component list
5. Animation and interaction notes
6. Existing-code alignment notes, if modifying an app
7. Accessibility notes
8. Optional implementation prompt or React/Tailwind code

For code updates, return production-ready changes directly with concise notes. Mention preserved structure and library compatibility fixes when relevant.
