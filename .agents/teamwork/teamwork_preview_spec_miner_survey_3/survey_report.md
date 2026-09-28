# TRUESHEL V2 - Specification Survey Report
# Subsystem: Procedural 3D Thermal Digital Twin (R5 & Cross-Cutting)

**Author:** Spec Miner 3 (Procedural 3D Thermal Digital Twin Subsystem)  
**Date:** 2026-09-27  
**Status:** Completed  
**Reference Document:** `/home/dev/Desktop/projects/trueShel/.agents/teamwork/ORIGINAL_REQUEST.md` (R5, R1, R2, R3, R4, R6)

---

## 1. Executive Summary & Non-Negotiable Constraints

TRUESHEL V2 incorporates a physics-linked 3D Thermal Digital Twin built strictly with **React Three Fiber (R3F) and pure Three.js primitives**. The digital twin provides interactive 3D spatial visualization of passive shelter geometry, transient thermal gradients, heat fluxes, solar irradiance, and thermal storage/PCM states across a 24-hour simulation cycle.

### Strict Architectural Boundaries
1. **Zero External 3D Assets:** Absolutely NO GLTF, GLB, OBJ, FBX, USDZ, or Blender model loading anywhere in the codebase. No 3D asset pipeline or external meshes.
2. **Pure Procedural Generation:** All shelter envelopes (walls, roof, floor, window, door) are procedurally constructed in code using Three.js geometric primitives (`BoxGeometry`, `PlaneGeometry`, `BufferGeometry`, extruded shapes).
3. **No External Physics Engines:** Zero reliance on `cannon-es`, `rapier`, `ammo.js`, or physical dynamics inside Three.js.
4. **No Extended Reality (XR):** Zero AR, VR, or WebXR dependencies in `package.json` or source code.
5. **Strict Separation of Physics and Graphics:**
   $$\text{SimulationResult} \longrightarrow \text{ThermalTwinState} \longrightarrow \text{Visualization Mapping} \longrightarrow \text{Three.js/R3F} \longrightarrow \text{GPU/WebGL}$$
   The 3D subsystem **never computes or fabricates thermal numbers**. It acts purely as a deterministic graphical renderer consuming `SimulationResult` from `simulation-store`.
6. **Token-Compliant Color Mapping:** Materials use Shop design tokens (`warm-fog` `#f2f4f5`, `slate-ink` `#1e293b`). Thermal shader ramps use semantic engineering values:
   - Cold: `#3b82f6` ($\le 12^\circ\text{C}$)
   - Comfort: `#22c55e` ($18^\circ\text{C} - 26^\circ\text{C}$)
   - Hot: `#ef4444` ($\ge 35^\circ\text{C}$)
   - Thermal Storage / PCM: Shop Violet `#5433eb`

---

## 2. Procedural Geometry Creation Algorithms & Mathematics

The procedural shelter is constructed relative to a world-space origin centered at the foundation slab.

### Coordinate System & Orientation Convention
- **Origin $(0, 0, 0)$:** Ground center of the shelter.
- **X-Axis:** East $(+X)$ / West $(-X)$ dimension (Length $L$).
- **Y-Axis:** Elevation / Height $(+Y)$ (Height $H$). Ground plane at $Y = 0$.
- **Z-Axis:** North $(+Z)$ / South $(-Z)$ dimension (Width $W$).
- **Azimuth Rotation ($\theta_{azimuth}$):** The root 3D shelter group is rotated around the Y-axis by $\theta_{azimuth}$ radians (where $0^\circ$ South points along $-Z$, $90^\circ$ East points along $+X$, $180^\circ$ North points along $+Z$, and $270^\circ$ West points along $-X$).

```
                    +Z (North)
                        ▲
                        │
        West (-X) ◄─────┼─────► East (+X)
                        │
                        ▼
                    -Z (South) [Solar Glazing]
```

### Component Breakdown & Algorithms

#### 1. Wall Component (`Wall.tsx`)
Constructed using `BoxGeometry` scaled to shelter dimensions:
- **South Wall (Solar Facade):**
  - Dimensions: $\text{Width} = L$, $\text{Height} = H$, $\text{Thickness} = t_w$
  - Position: $(X = 0, Y = H/2, Z = -W/2)$
  - Facing Normal: $(0, 0, -1)$
- **North Wall:**
  - Dimensions: $\text{Width} = L$, $\text{Height} = H$, $\text{Thickness} = t_w$
  - Position: $(X = 0, Y = H/2, Z = +W/2)$
  - Facing Normal: $(0, 0, 1)$
- **West Wall:**
  - Dimensions: $\text{Width} = t_w$, $\text{Height} = H$, $\text{Depth} = W$
  - Position: $(X = -L/2, Y = H/2, Z = 0)$
  - Facing Normal: $(-1, 0, 0)$
- **East Wall:**
  - Dimensions: $\text{Width} = t_w$, $\text{Height} = H$, $\text{Depth} = W$
  - Position: $(X = +L/2, Y = H/2, Z = 0)$
  - Facing Normal: $(1, 0, 0)$

*Corner Intersection Note:* To avoid z-fighting and overlapping mesh volumes at corners, West and East walls span the interior dimension $(W - 2t_w)$, or North and South walls cap the ends.

#### 2. Roof Component (`Roof.tsx`)
Configurable between **Flat** and **Gabled** configurations:

- **Flat Roof:**
  - Constructed as an extruded slab or `BoxGeometry`:
    $$\text{Width}_X = L + 2 \cdot e_{\text{overhang}}, \quad \text{Height}_Y = t_{\text{roof}}, \quad \text{Depth}_Z = W + 2 \cdot e_{\text{overhang}}$$
  - Position: $(X = 0, Y = H + t_{\text{roof}} / 2, Z = 0)$
  - Overhang $e_{\text{overhang}}$ default: $0.4\,\text{m}$ (provides summer solar shading to south glazing).

- **Gabled Roof:**
  - Ridge line runs along the X-axis at $Z = 0$ with ridge height:
    $$H_{\text{ridge}} = H + \left(\frac{W}{2}\right) \cdot \tan(\alpha_{\text{pitch}})$$
  - Constructed using custom `BufferGeometry` or two angled rectangular slabs (`BoxGeometry`):
    - **South Pitch:** Rotated around X-axis by $+\alpha_{\text{pitch}}$, spanning from ridge $(0, H_{\text{ridge}}, 0)$ down to eave $(-W/2 - e_{\text{overhang}})$.
    - **North Pitch:** Rotated around X-axis by $-\alpha_{\text{pitch}}$, spanning from ridge down to eave $(+W/2 + e_{\text{overhang}})$.
    - **Gable End Walls:** Procedural triangular geometry sealing the East and West gable ends between eaves and ridge apex using custom `BufferGeometry` with vertices:
      $$V_0 = \left(\pm L/2, H, -W/2\right), \quad V_1 = \left(\pm L/2, H, +W/2\right), \quad V_2 = \left(\pm L/2, H_{\text{ridge}}, 0\right)$$

#### 3. Floor Component (`Floor.tsx`)
- Constructed via `PlaneGeometry(L, W)` rotated $-90^\circ$ on X-axis, or a thin `BoxGeometry(L, t_{\text{floor}}, W)`.
- Position: $(X = 0, Y = 0.001, Z = 0)$ to prevent z-fighting with the infinite ground grid.
- Ground foundation pad representation: `PlaneGeometry(L \cdot 1.8, W \cdot 1.8)` at $Y = 0$ with muted ground tone `#e2e8f0`.

#### 4. Window Component (`Window.tsx`)
- Passive solar architecture prioritizes south-facing solar glazing.
- Parameterized from `shelter.openings.windowArea` ($A_w$) and `windowCount`:
  $$\text{Width}_w = \sqrt{\frac{A_w}{1.3 \cdot \text{count}}}, \quad \text{Height}_w = 1.3 \cdot \text{Width}_w$$
- Position: Recessed cutout on South wall ($Z = -W/2 - t_w/2 - 0.005\,\text{m}$).
- Geometry:
  - Exterior Frame: Thin hollow `BoxGeometry` or extruded frame with Shop slate finish (`#334155`).
  - Glazing Pane: `PlaneGeometry` with transparent physical material (`transmission: 0.85`, `roughness: 0.1`, `transparent: true`, `opacity: 0.6`, `color: #93c5fd`).

#### 5. Door Component (`Door.tsx`)
- Standard entrance door dimensions: $\text{Width} = 0.9\,\text{m}$, $\text{Height} = 2.1\,\text{m}$, $\text{Thickness} = 0.05\,\text{m}$.
- Position: South wall, offset horizontally to $(X = L/3, Y = 1.05\,\text{m}, Z = -W/2 - t_w/2 - 0.005\,\text{m})$.
- Geometry: Architectural timber/insulated door panel with frame and handle primitive.

---

## 3. Reactive Parameter Binding & State Synchronization

The 3D model maintains bi-directional synchronization with Zustand stores:

```
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│      useShelterStore()          │       │     useSimulationStore()         │
│  - length, width, height        │       │  - SimulationResult              │
│  - roofType, roofPitch          │       │  - activeTimestep (0..24)        │
│  - windowArea, doorCount        │       │  - timeline, temperatures        │
│  - wall/roof assemblies         │       │  - solarIrradiance, heatLoss     │
└────────────────┬────────────────┘       └────────────────┬─────────────────┘
                 │                                         │
                 ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       useThermalTwinStore()                                │
│  - mode: 'normal' | 'thermal' | 'heat-flow' | 'solar' | 'storage'          │
│  - activeTimestep: number (0..24)                                          │
│  - isPlaying: boolean                                                      │
│  - playbackSpeed: 1 | 2 | 4                                                │
│  - selectedComponentId: string | null                                      │
│  - cameraResetTrigger: number                                              │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    Procedural 3D Scene (R3F Canvas)                        │
│  - Reactively re-computes geometry meshes (<200ms) on L/W/H change         │
│  - Updates custom ShaderMaterial uniforms dynamically on activeTimestep    │
│  - Animates particle flux / vector arrows in requestAnimationFrame loop    │
└────────────────────────────────────────────────────────────────────────────┘
```

### Real-Time Parameter Update Performance
- Geometry rebuilds use memoized procedural parameters (`useMemo`) to instantiate Three.js buffers only when geometry parameters change.
- Shader uniforms (`uTemperature`, `uSolarIntensity`, `uStorageCharge`, `uTime`) are mutated in-place via direct Three.js uniform references (`materialRef.current.uniforms.uTemperature.value = temp`) rather than triggering full React re-renders, guaranteeing 60 FPS playback during timeline scrubbing.

---

## 4. Materials and Visualization Modes

Switching modes swaps materials or alters shader uniform states without rebuilding the geometry meshes.

### Mode 1: Normal Mode (Architectural Baseline)
- **Shader:** `MeshStandardMaterial`
- **Palette (Shop Tokens):**
  - Walls: Warm fog plaster `#f2f4f5` (roughness: 0.8, metalness: 0.05)
  - Roof: Slate ink metal/tile `#334155` (roughness: 0.5, metalness: 0.2)
  - Floor: Architectural concrete `#cbd5e1`
  - Window: Translucent blue tinted glass `#93c5fd`
  - Door: Timber warm oak `#78350f`
- **Lighting:** Soft ambient light (intensity 0.6) + directional sun light (intensity 1.2, position `[15, 25, 10]`, shadows enabled).

### Mode 2: Thermal Mode (Surface Temperature Ramps)
Each surface mesh (North Wall, South Wall, East Wall, West Wall, Roof, Floor, Window) receives its specific surface temperature from `SimulationResult[activeTimestep]`.

- **GLSL Thermal Fragment Shader:**
```glsl
uniform float uTemperature;  // Degrees Celsius
uniform float uMinTemp;      // 12.0 C
uniform float uComfortMin;   // 18.0 C
uniform float uComfortMax;   // 26.0 C
uniform float uMaxTemp;      // 35.0 C
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;

// Semantic engineering color ramp:
// Cold:    #3b82f6 (vec3(0.231, 0.510, 0.965))
// Comfort: #22c55e (vec3(0.133, 0.773, 0.369))
// Hot:     #ef4444 (vec3(0.937, 0.267, 0.267))

vec3 getThermalRamp(float t) {
  vec3 cCold = vec3(0.231, 0.510, 0.965);
  vec3 cComfort = vec3(0.133, 0.773, 0.369);
  vec3 cHot = vec3(0.937, 0.267, 0.267);

  if (t <= uComfortMin) {
    float factor = clamp((t - uMinTemp) / (uComfortMin - uMinTemp), 0.0, 1.0);
    return mix(cCold, cComfort, factor);
  } else if (t <= uComfortMax) {
    return cComfort;
  } else {
    float factor = clamp((t - uComfortMax) / (uMaxTemp - uComfortMax), 0.0, 1.0);
    return mix(cComfort, cHot, factor);
  }
}

void main() {
  vec3 rampColor = getThermalRamp(uTemperature);
  vec3 lightDir = normalize(vec3(0.4, 0.9, 0.6));
  float diffuse = max(dot(vNormal, lightDir), 0.25);
  vec3 shaded = rampColor * (0.75 + 0.25 * diffuse);
  gl_FragColor = vec4(shaded, uOpacity);
}
```

### Mode 3: Heat Flow Mode (Transient Flux Vectors & Particles)
Visualizes conductive and convective heat transmission across envelope boundaries.
- **Direction:** Determined by temperature differential $\Delta T = T_{\text{interior}} - T_{\text{exterior}}$.
  - If $T_{\text{in}} > T_{\text{out}}$: Heat loss (vectors point outward through wall normals $\hat{n}$).
  - If $T_{\text{out}} > T_{\text{in}}$: Heat gain (vectors point inward $-\hat{n}$).
- **Visualization Strategy:**
  - Dual implementation: Instanced arrow glyphs (`InstancedMesh` of cone + cylinder) or dynamic `Points` particle system.
  - Particle velocity and spawn rate are scaled to heat flux magnitude $|q| = U \cdot A \cdot \Delta T$ ($W/m^2$).
  - Particle color: Semantic Red (`#ef4444`) for heat entering, Blue (`#3b82f6`) for heat escaping.

### Mode 4: Solar Irradiance Mode (Incident Flux Distribution)
- Direct uniform binding: `uSolarIntensity` ($0$ to $1000+\,W/m^2$) derived from `SimulationResult.solarIrradiance[activeTimestep]`.
- **Application:** Overlaid on Roof and South Wall.
- **Color Gradient:** Ambient neutral fog `#94a3b8` $\rightarrow$ Amber `#f59e0b` $\rightarrow$ Incandescent solar white-yellow `#fef08a`.
- **Dynamic Procedural Sun:** An orbital light sphere positioned in 3D space according to calculated solar azimuth $\phi_s(t)$ and solar altitude $\alpha_s(t)$ across the 24h timeline.

### Mode 5: Thermal Storage / PCM State Mode
- Displays thermal mass charge and Phase Change Material (PCM) latent enthalpy state.
- **Uniforms:** `uPcmCharge` ($0.0 - 1.0$) and `uPhaseState` ($0 = \text{Solid}, 1 = \text{Mushy/Latent}, 2 = \text{Liquid}$).
- **Color Mapping:**
  - Discharged: Architectural slate `#64748b`.
  - Charged: Shop Violet `#5433eb`.
  - Latent phase transition: Dynamic pulse effect animated with `sin(uTime * 4.0)` across the surface to indicate active latent heat absorption.

---

## 5. Timeline Synchronization Engine (`TwinTimeline.tsx`)

The timeline scrubber governs transient state across the 24-hour simulation period ($00:00$ to $24:00$, corresponding to indices $0 \le i \le 24$).

### Playback Architecture
- **Time Representation:** Integer index `activeTimestep` $\in [0, 24]$.
- **Auto-Advance Rate:** 1 simulated hour per 1 real second ($1000\,\text{ms}/\text{step}$ at 1x speed, $500\,\text{ms}$ at 2x, $250\,\text{ms}$ at 4x).
- **Controls:**
  - Play / Pause toggle button.
  - Step Forward ($+1\,\text{h}$) and Step Backward ($-1\,\text{h}$) buttons.
  - Draggable range scrubber with smooth tooltip.
  - Playback speed multiplier pill (1x, 2x, 4x).
- **Synchronized Telemetry Display:**
  - Clock readout: `13:00`
  - Outdoor Temperature: `-3.2 °C`
  - Solar Irradiance: `670 W/m²`
  - Indoor Air Temperature: `21.4 °C`
  - Semantic Status Pill: `COMFORT` (green), `UNDER-COMFORT` (blue), or `OVERHEATING` (red).

---

## 6. Interaction, Raycasting & Inspector Subsystem

### Camera Controls & View Navigation
- Built using `OrbitControls` from `@react-three/drei`.
- **Constraints:**
  - `enableDamping: true`, `dampingFactor: 0.05` for smooth inertia.
  - `maxPolarAngle = Math.PI / 2 - 0.02` to prevent clipping beneath the floor plane.
  - `minDistance = 3.0`, `maxDistance = 50.0`.
- **Reset View Functionality:** Smoothly repositions camera to canonical isometric coordinates `[12, 10, 14]` targeting shelter centroid `[0, H/2, 0]`.

### Raycasting & Component Inspection
- Meshes register pointer events (`onClick`, `onPointerOver`, `onPointerOut`).
- Hover state: subtle emissive edge or cursor change.
- Click state: selects component ID (e.g. `'wall-south'`, `'roof'`, `'window'`, `'wall-north'`).
- Selected mesh receives an emissive accent highlight (`#5433eb` outline).
- **Inspector Panel Content:**
  - Component Identifier (e.g. "South Glazing Aperture", "Rammed Earth South Wall")
  - Cardinal Orientation & Tilt Angle
  - Surface Area ($m^2$)
  - Material Assembly Stack (e.g., "Rammed Earth 300mm + Expanded Cork 100mm + Interior Lime Plaster 20mm")
  - Thermal Conductivity $k$, Overall U-value ($W/m^2K$), and R-value ($m^2K/W$)
  - Active Surface Temperature ($^\circ\text{C}$) at the currently scrubbed timestep
  - Conductive Heat Flux ($W/m^2$ and total instantaneous Watts)

---

## 7. Dual Embedding Architecture

The 3D Thermal Twin is deployed in three distinct contexts across TRUESHEL V2:

| Embedding Context | Route | Aspect Ratio / Size | Default Mode | Feature Set |
|-------------------|-------|---------------------|--------------|-------------|
| **Dashboard Card Embed** | `/dashboard` | Fixed 16:9, min-height 320px | Thermal | Compact timeline, mode toggle, reset view button, expand CTA |
| **Simulation Results Embed** | `/simulation/results` | Card panel, min-height 350px | Thermal | Synced with results chart hover or final 24h timestep |
| **Full-Screen Thermal Twin** | `/thermal-twin` | Full Viewport ($100\text{vw} \times 100\text{vh}$) | Thermal / Heat Flow | Full timeline dock, telemetry overlay, docked Inspector panel, speed controls |
| **Shelter Designer Preview** | `/shelter` | Left 40% split viewport | Normal (Geometry-Only) | Reactive dimensional guides, orientation compass, no thermal overlay |

---

## 8. Directory & File Inventory

The subsystem files are organized strictly within `features/thermal-twin/`:

```
features/thermal-twin/
├── index.ts                              # Public feature barrel export
├── components/
│   ├── ThermalTwinCanvas.tsx             # Canvas wrapper with SSR safety & responsive sizing
│   ├── ThermalTwinScene.tsx              # Scene root: lights, camera, controls, shelter group
│   ├── ProceduralShelter.tsx             # Assembles walls, roof, floor, window, door
│   ├── Wall.tsx                          # Procedural BoxGeometry wall with shader binding
│   ├── Roof.tsx                          # BufferGeometry / Box flat or gabled roof
│   ├── Floor.tsx                         # PlaneGeometry / Box slab
│   ├── Window.tsx                        # Solar glazing pane with frame
│   ├── Door.tsx                          # Architectural door mesh
│   ├── HeatFlowOverlay.tsx               # Instanced flux vectors / particle system
│   ├── SolarOverlay.tsx                  # Incident solar shader overlay & orbital sun sphere
│   ├── SunIndicator.tsx                  # Orbital sun position indicator
│   ├── TwinTimeline.tsx                  # 24h scrubber, play/pause, time telemetry
│   ├── ModeSelector.tsx                  # Pill-shaped 5-mode toggle bar
│   ├── InspectorPanel.tsx                # Card displaying selected component physics
│   ├── ThermalTwinCard.tsx               # 16:9 Dashboard embed card
│   └── ThermalTwinView.tsx               # Full-screen standalone page view
├── shaders/
│   ├── thermalShader.ts                  # GLSL temperature ramp ShaderMaterial
│   ├── solarShader.ts                    # GLSL solar irradiance ShaderMaterial
│   └── storageShader.ts                  # GLSL PCM latent/sensible charge ShaderMaterial
├── hooks/
│   ├── useThermalTwinSync.ts             # Syncs simulation store with active timestep
│   └── useSunPosition.ts                 # Computes solar azimuth & elevation across 24h
└── types/
    └── thermal-twin.ts                   # TwinMode, ComponentId, InspectorData, Uniforms
```

---

## 9. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Geometry | Procedural Box Walls (`Wall.tsx`) | 4 cardinal walls generated procedurally via `BoxGeometry` | Length $L$, Width $W$, Height $H$, thickness $t_w$, wall ID | 4 distinct Three.js meshes positioned around origin | Clamps dimensions to minimum $1.0\,\text{m}$ if $\le 0$ | R5 & Acceptance Criteria |
| 2 | Geometry | Parametric Gabled Roof (`Roof.tsx`) | Dual-pitch gabled roof created procedurally via `BufferGeometry` or angled slabs | Roof pitch $\alpha_{\text{pitch}}$, overhang $e_{\text{overhang}}$, shelter $L, W, H$ | Procedural sloped roof geometry with gable ends | Falls back to flat roof if pitch is 0 or negative | R5 & Acceptance Criteria |
| 3 | Geometry | Parametric Flat Roof (`Roof.tsx`) | Single slab flat roof with perimeter overhang | Overhang $e$, thickness $t_{\text{roof}}$, shelter $L, W, H$ | BoxGeometry slab positioned at $Y = H + t/2$ | Handles extreme overhang by clamping to $W/2$ | R5 & Acceptance Criteria |
| 4 | Geometry | Foundation Floor Slab (`Floor.tsx`) | Ground plane slab at $Y = 0$ with foundation pad | Shelter $L$, $W$, floor thickness | Plane/Box mesh positioned at $Y = 0.001$ | Prevents z-fighting with foundation pad | R5 & Acceptance Criteria |
| 5 | Geometry | South Glazing Aperture (`Window.tsx`) | Passive solar window positioned on south wall face | Window area $A_w$, window count, wall $L, H$ | Recessed glass plane with frame geometry | Clamps window area to max $80\%$ of south wall area | R5 & Acceptance Criteria |
| 6 | Geometry | Architectural Door (`Door.tsx`) | Standard access door placed on south or east wall | Door count, width $0.9\,\text{m}$, height $2.1\,\text{m}$ | Door frame and panel mesh at floor level | Auto-offsets from window to avoid intersection | R5 |
| 7 | Geometry | Real-time Reactive Dimension Binding | Changing $L, W, H$ in shelter store updates 3D mesh in real time | `shelterStore.geometry` ($L, W, H$) | Instantaneous scene re-mesh (<200ms) | Re-instantiates buffer geometry without memory leak | R4, R5, Acceptance Criteria |
| 8 | Materials | Normal Mode Architectural Rendering | Neutral architectural rendering using Shop design tokens | Shop token palette (`warm-fog`, `slate-ink`) | `MeshStandardMaterial` with soft shadow lighting | Fallback to standard gray if tokens fail to resolve | R5 & Design Tokens |
| 9 | Materials | Thermal Mode Shader Ramp | Custom GLSL shader mapping surface temp to 3-color gradient | `uTemperature` per mesh from `SimulationResult` | Color ramp: Blue ($\le 12^\circ\text{C}$), Green ($18-26^\circ\text{C}$), Red ($\ge 35^\circ\text{C}$) | Clamps extreme temps ($<-50^\circ\text{C}$ or $>70^\circ\text{C}$) | R5 & Acceptance Criteria |
| 10 | Materials | Heat Flow Flux Vectors / Particles | Particle system or instanced arrows showing flux direction and rate | Heat flux $q$ ($W/m^2$), interior/exterior $\Delta T$ | Outward (blue/red) or inward (red) flowing vectors | Zero velocity if $|q| \approx 0$ | R5 & Acceptance Criteria |
| 11 | Materials | Solar Irradiance Overlay | Incident solar radiation overlay on roof & south wall | `uSolarIntensity` ($W/m^2$) at active timestep | Amber-to-white solar radiant shader gradient | Clamps intensity to $0$ if night ($I_{\text{solar}} \le 0$) | R5 |
| 12 | Materials | Orbital Sun Indicator | 3D solar sphere orbiting shelter based on hour of day | Timestep $t$ ($0..24$), solar azimuth & elevation | Directional light position & glowing sphere mesh | Position placed below horizon during nighttime | R5 |
| 13 | Materials | Thermal Storage / PCM Charge Shader | Visualizes thermal mass & PCM phase change state | Storage charge $\%$ ($0..1$), latent phase status | Shop Violet (`#5433eb`) charge ramp with phase pulse | Default to slate discharged state if PCM disabled | R5 |
| 14 | Timeline | 24-Hour Timeline Scrubber (`TwinTimeline`) | Interactive slider scrubbing 00:00 to 24:00 simulation data | `SimulationResult.timeline`, user drag input | Updates `thermalTwinStore.activeTimestep` | Clamps index within $[0, 24]$ | R5 & Acceptance Criteria |
| 15 | Timeline | Play/Pause Auto-Advance Engine | Advances simulation timestep at 1 hour per second | Play/Pause state, speed factor ($1\times, 2\times, 4\times$) | Automated tick incrementing `activeTimestep` | Loops smoothly from 24 back to 0 or pauses | R5 & Acceptance Criteria |
| 16 | Timeline | Live Synchronized Telemetry Header | Displays outdoor temp, solar flux, indoor temp, and state pill | Active timestep data from `SimulationResult` | Formatted engineering readouts with semantic badge | Shows "MOCK DATA" or "--" if data unavailable | R5 & Standalone layout |
| 17 | Interaction | OrbitControls Navigation | Rotate, pan, and zoom camera with damping | Mouse/touch pointer events | Camera position & orientation transforms | Constrained polar angle prevents going underground | R5 & Drei specs |
| 18 | Interaction | Reset View Camera Action | Returns camera to canonical isometric perspective | Click on "Reset View" button | Smooth or instant transition to `[12, 10, 14]` | Gracefully cancels ongoing user rotation | R5 & Acceptance Criteria |
| 19 | Interaction | Raycasting Component Selection | Pointer click selects wall, roof, window, or door | Raycaster pointer-up / click on meshes | Highlighting mesh + opening Inspector panel | Deselects when clicking empty background | R5 & Acceptance Criteria |
| 20 | Interaction | Component Thermal Inspector Panel | Floating card displaying detailed component physics | Selected component ID, assembly data, timestep | Inspector panel displaying U, R, Area, Temp, Flux | Hides panel if no component selected | R5 & Acceptance Criteria |
| 21 | Layout | Dashboard 16:9 Card Embed | Embedded 3D twin panel in main dashboard | Parent card container (16:9, min 320px height) | Responsive embedded R3F Canvas | Uses ResizeObserver to prevent aspect distortion | R3, R5, Acceptance Criteria |
| 22 | Layout | Full-Screen Thermal Twin Page | Standalone `/thermal-twin` route with full viewport | Viewport window ($100\text{vw} \times 100\text{vh}$) | Fullscreen interactive digital twin command center | Responsive overlay placement on tablet/mobile | R5 |
| 23 | Layout | Simulation Results Embed | Embedded view on `/simulation/results` page | Simulation completion state | Thermal mode twin showing final timestep state | Syncs with hovering over 24h results chart | R5, R6 |
| 24 | Layout | Shelter Designer 3D Preview | Real-time geometry preview in `/shelter` left 40% panel | `shelterStore.geometry` | Real-time updating geometry with dimension guides | Stripped of thermal shaders for edit speed | R4, Acceptance Criteria |
| 25 | System | SSR-Safe Canvas Mount Pipeline | Guarantees WebGL renders only on client, preventing Node SSR crash | Next.js App Router render lifecycle | Client-only Canvas mount via dynamic import or flag | Prevents "window is not defined" during build | Next.js 15 & Acceptance Criteria |
| 26 | System | Strict Dependency Enforcement | Eliminates all GLTF loaders, physics engines, and XR tools | Project dependency tree & source imports | Zero invalid packages in `package.json` | Build fails if forbidden packages detected | R5 Constraints |

---

## 10. Edge Cases & Behavioral Matrix

| # | Feature | Input / Condition | Observed & Specified Behavior |
|---|---------|-------------------|-------------------------------|
| 1 | Procedural Geometry | Degenerate dimensions ($L \le 0, W \le 0, H \le 0$) | Automatically clamps dimensions to safe minimum $L=2.0\,\text{m}, W=2.0\,\text{m}, H=2.0\,\text{m}$; displays inline validation warning in shelter store. |
| 2 | Procedural Geometry | Extreme aspect ratio ($L/W > 10$ or $H/W > 5$) | Geometry renders correctly; OrbitControls target centroid dynamically updates to $[0, H/2, 0]$ and camera distance scales with bounding sphere radius to prevent clipping. |
| 3 | Window Placement | Window Area $A_w \ge \text{South Wall Area } (L \times H)$ | Clamps window area to $0.8 \times (L \times H)$ and maintains minimum $0.3\,\text{m}$ border from wall edges to prevent non-physical geometry overlap. |
| 4 | Door & Window Placement | Window and Door collide on South Wall | Window X-position is procedurally offset to the left half $(X < 0)$ and door to the right half $(X > 0)$, maintaining minimum $0.4\,\text{m}$ clearance. |
| 5 | Gabled Roof Geometry | Gabled roof pitch set to $0^\circ$ or negative | Roof component falls back to flat roof slab geometry without throwing vertex normal errors. |
| 6 | Thermal Shader | Surface temperature out of range ($T < -40^\circ\text{C}$ or $T > +60^\circ\text{C}$) | Shader `clamp()` prevents color overflow or NaNs; $T < 12^\circ\text{C}$ clamps to solid Cold Blue `#3b82f6`; $T > 35^\circ\text{C}$ clamps to solid Hot Red `#ef4444`. |
| 7 | Solar Shader | Nighttime hours ($I_{\text{solar}} \le 0\,\text{W/m}^2$, azimuth below horizon) | `uSolarIntensity` set to $0.0$; shader renders neutral unilluminated surface; sun indicator sphere drops below horizon ($Y < 0$) and light intensity is set to $0.0$. |
| 8 | Heat Flow Particles | Negligible temperature difference ($|T_{\text{in}} - T_{\text{out}}| < 0.1^\circ\text{C}$) | Particle system sets particle opacity to $0.0$ and speed to $0$, avoiding confusing visual artifacts when thermal equilibrium is reached. |
| 9 | Timeline Scrubber | Scrubbing past index 24 or rapid drag past boundary | Value is clamped strictly to integer range $[0, 24]$; intermediate float values from mouse events are floored to prevent array index out-of-bounds in `SimulationResult`. |
| 10 | Playback Auto-Advance | Play reaches timestep 24 | Seamlessly loops back to timestep 0 ($00:00$) and continues playing, or pauses if loop mode is toggled off. |
| 11 | Component Selection | User clicks empty background space | Raycaster detects zero intersections; clears `selectedComponentId` to `null` and gracefully closes the Inspector panel. |
| 12 | State Availability | `SimulationResult` is null/empty on initial load | Automatically loads the Ladakh mock simulation dataset from `MockRepository`; displays realistic winter thermal data with a visible "MOCK DATA" badge. |
| 13 | WebGL Context Loss | Browser runs out of GPU memory or triggers `webglcontextlost` | R3F handles context loss cleanly; component shows a fallback placeholder card with "WebGL Context Restoring..." and reconnects when `webglcontextrestored` fires. |
| 14 | Responsive Resizing | Container resized rapidly (e.g. browser resize or split pane toggle) | `ResizeObserver` updates R3F viewport; camera aspect ratio updates and calls `camera.updateProjectionMatrix()` to prevent scene stretching or squishing. |
| 15 | Wall Layer Inspection | Wall selected with zero layers configured | Inspector panel displays "Default Rammed Earth Assembly (Single Layer, 300mm)" fallback with nominal $U=1.8\,\text{W/m}^2\text{K}$. |

---

## 11. Verification & Testing Requirements

To satisfy all acceptance criteria:
1. **Zero External 3D File Check:** Run search across codebase to ensure no `.gltf`, `.glb`, `.obj`, `.fbx`, or `.blend` files exist, and no `useGLTF` / `GLTFLoader` imports appear in TypeScript files.
2. **Zero Physics Engine Check:** Verify `package.json` contains no `@react-three/cannon`, `cannon-es`, `@react-three/rapier`, `rapier3d`, or `three-stdlib` VR modules.
3. **Geometry Reactive Update Test:** Verify that updating `shelterStore.setState({ geometry: { length: 8, width: 6, height: 3.5 } })` triggers immediate geometry rebuild within one render frame without memory leaks.
4. **Shader Color Ramp Fidelity Test:** Test shader output at $5^\circ\text{C}$ (returns `#3b82f6`), $22^\circ\text{C}$ (returns `#22c55e`), and $40^\circ\text{C}$ (returns `#ef4444`).
5. **Timeline Scrubbing Test:** Test auto-advance across all 24 timesteps; verify that uniforms update without dropping frame rate below 50 FPS.
6. **Interaction Test:** Verify raycaster selection on all 4 walls, roof, window, and door; verify Inspector panel populates with accurate thickness, U-value, and temperature.
7. **Embed Layout Test:** Verify rendering in Dashboard 16:9 card, Simulation Results card, and Fullscreen `/thermal-twin` page without console errors.
