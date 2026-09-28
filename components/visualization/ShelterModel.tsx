/*
 * components/visualization/ShelterModel.tsx – Procedural shelter model.
 * Renders floor, walls, roof, windows and door based on a ShelterDesign.
 * Supports "normal" (neutral colour) and per-channel modes:
 *   thermal     – colour by indoor temperature at the timestep
 *   heat-flow   – colour by envelope heat loss at the timestep
 *   solar       – colour by solar heat gain at the timestep
 *   storage     – colour by thermal mass / PCM storage at the timestep
 */

"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";
import { DoubleSide } from "three";
import type { ShelterDesign, ThermalTwinMode } from "@/types";
import { evaluateShelterDesign } from "@/lib/calculations/evaluateDesign";
import { getTemperatureHex } from "@/lib/calculations/thermal";

/** Roof pitch used for gabled / shed visualisation (30°). */
const ROOF_TILT = Math.PI / 6;

/**
 * Map an arbitrary scalar channel into the 14–30°C display range so the
 * shared temperature palette can colour heat-flow / solar / storage modes.
 */
function normalizeToDisplayTemp(value: number, values: number[]): number {
  if (values.length === 0) return 20;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max === min) return 20;
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return 14 + t * 16;
}

/**
 * Procedural shelter visualisation component.
 * @param design  The ShelterDesign to render.
 * @param mode    Visualisation mode (see file header).
 * @param timestep Index of the simulation hour to visualise.
 */
export default function ShelterModel({
  design,
  mode = "normal",
  timestep = 0,
}: {
  design: ShelterDesign;
  mode?: ThermalTwinMode;
  timestep?: number;
}) {
  const { length, width, height, roofType } = design.geometry;
  const halfLen = length / 2;
  const halfWid = width / 2;

  // ----- Material colour handling -----------------------------------------
  const wallColor = useMemo(() => {
    if (mode === "normal") return 0xdddddd; // neutral

    const result = evaluateShelterDesign(design);
    const idx = Math.min(Math.max(timestep, 0), result.indoorTemperature.length - 1);

    switch (mode) {
      case "thermal":
        return getTemperatureHex(result.indoorTemperature[idx] ?? 20);
      case "heat-flow":
        return getTemperatureHex(
          normalizeToDisplayTemp(result.heatLoss[idx] ?? 0, result.heatLoss),
        );
      case "solar":
        return getTemperatureHex(
          normalizeToDisplayTemp(result.heatGain[idx] ?? 0, result.heatGain),
        );
      case "storage":
        return getTemperatureHex(
          normalizeToDisplayTemp(result.storage[idx] ?? 0, result.storage),
        );
      default:
        return 0xdddddd;
    }
  }, [design, mode, timestep]);

  // ----- Roof -------------------------------------------------------------
  // Gabled roof: two pitched planes that actually meet at a ridge along the
  // length axis. The previous implementation spun the planes in-plane
  // (rotation.z) which left two flat, non-intersecting rectangles.
  const Roof = useMemo(() => {
    switch (roofType) {
      case "flat":
        return (
          <Plane
            args={[length, width]}
            position={[0, height, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material-color={0xcccccc}
            material-side={DoubleSide}
          />
        );
      case "gabled": {
        const rise = halfWid * Math.tan(ROOF_TILT);
        const slopeLen = halfWid / Math.cos(ROOF_TILT);
        return (
          <group>
            {/* South slope (+Z) — rises from eave to ridge at z = 0 */}
            <Plane
              args={[length, slopeLen]}
              position={[0, height + rise / 2, halfWid / 2]}
              rotation={[-Math.PI / 2 + ROOF_TILT, 0, 0]}
              material-color={0xcccccc}
              material-side={DoubleSide}
            />
            {/* North slope (−Z) — mirrors the south slope */}
            <Plane
              args={[length, slopeLen]}
              position={[0, height + rise / 2, -halfWid / 2]}
              rotation={[-Math.PI / 2 - ROOF_TILT, 0, 0]}
              material-color={0xcccccc}
              material-side={DoubleSide}
            />
          </group>
        );
      }
      case "shed": {
        // High edge at the north eave, sloping down to the south — the
        // conventional orientation for a south-glazed solar shed roof.
        const rise = width * Math.tan(ROOF_TILT);
        const slopeLen = width / Math.cos(ROOF_TILT);
        return (
          <Plane
            args={[length, slopeLen]}
            position={[0, height + rise / 2, 0]}
            rotation={[-Math.PI / 2 + ROOF_TILT, 0, 0]}
            material-color={0xcccccc}
            material-side={DoubleSide}
          />
        );
      }
      default:
        return null;
    }
  }, [roofType, length, width, height, halfWid]);

  // ----- Door -------------------------------------------------------------
  // Mounted proud of the south wall face (wall is 0.1 thick, centred at
  // halfWid) so it is actually visible instead of buried in the wall.
  const door = useMemo(() => {
    const doorWidth = 0.9;
    const doorHeight = Math.min(2.0, height - 0.2);
    return (
      <Box
        args={[doorWidth, doorHeight, 0.1]}
        position={[0, doorHeight / 2, halfWid + 0.102]}
        material-color={0x777777}
      />
    );
  }, [halfWid, height]);

  // ----- Windows ----------------------------------------------------------
  // Distributed along the south wall's LENGTH axis (previously they were
  // spread across the WIDTH axis with negative spacing, so they overlapped
  // each other and the door). Windows are also pushed clear of the door
  // zone and mounted proud of the wall face so they render visibly.
  const windows = useMemo(() => {
    const count = design.openings.windowCount;
    if (count <= 0) return null;

    const areaPer = design.openings.windowArea / count;
    const doorZone = 0.45 + 0.15; // half door width + clearance gap
    const perSide = Math.ceil(count / 2);
    const sideSpan = Math.max(halfLen - 0.3 - doorZone, 0.1);

    // Clamp so windows fit the wall without colliding with each other.
    const size = Math.min(
      Math.sqrt(areaPer),
      (sideSpan / perSide) * 0.8,
      height * 0.6,
    );
    if (size <= 0) return null;

    const windowZ = halfWid + 0.077; // wall face (halfWid + 0.05) + half window depth + gap
    const elems = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const k = Math.floor(i / 2);
      const x = side * (doorZone + (sideSpan / perSide) * (k + 0.5));
      if (Math.abs(x) + size / 2 > halfLen) continue; // never overflow the wall
      elems.push(
        <Box
          key={i}
          args={[size, size, 0.05]}
          position={[x, height / 2, windowZ]}
          material-color={0xadd8e6}
          material-transparent
          material-opacity={0.5}
        />,
      );
    }
    return elems.length > 0 ? elems : null;
  }, [
    design.openings.windowCount,
    design.openings.windowArea,
    halfLen,
    halfWid,
    height,
  ]);

  return (
    <Canvas
      shadows
      camera={{ position: [length * 1.5, height * 1.2, width * 1.5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
      {/* Floor */}
      <Plane args={[length, width]} rotation={[-Math.PI / 2, 0, 0]} material-color={0xffffff} />
      {/* Walls */}
      {/* North wall */}
      <Box args={[length, height, 0.1]} position={[0, height / 2, -halfWid]} material-color={wallColor} />
      {/* South wall (contains windows & door) */}
      <Box args={[length, height, 0.1]} position={[0, height / 2, halfWid]} material-color={wallColor} />
      {/* East wall */}
      <Box args={[0.1, height, width]} position={[halfLen, height / 2, 0]} material-color={wallColor} />
      {/* West wall */}
      <Box args={[0.1, height, width]} position={[-halfLen, height / 2, 0]} material-color={wallColor} />
      {Roof}
      {door}
      {windows}
      <OrbitControls enablePan enableZoom enableRotate makeDefault />
    </Canvas>
  );
}
