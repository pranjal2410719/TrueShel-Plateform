/*
 * components/visualization/ShelterModel.tsx – Procedural 3‑D shelter model.
 * Renders floor, walls, roof, windows and door based on a ShelterDesign.
 * Supports "normal" (neutral colour) and "thermal" (colour coded by evaluated indoor temperature).
 */

"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";
import type { ShelterDesign, ThermalTwinMode } from "@/types";
import { evaluateShelterDesign } from "@/lib/calculations/evaluateDesign";
import { getTemperatureHex } from "@/lib/calculations/thermal";

/**
 * Procedural shelter visualisation component.
 * @param design  The ShelterDesign to render.
 * @param mode    "normal" – plain colours; "thermal" – colour by indoor temperature.
 * @param timestep Index of the simulation hour to visualise when mode="thermal".
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
    if (mode === "thermal") {
      const result = evaluateShelterDesign(design);
      const temp = result.indoorTemperature[timestep] ?? 20;
      return getTemperatureHex(temp);
    }
    return 0xdddddd; // neutral token colour
  }, [design, mode, timestep]);

  // ----- Roof -------------------------------------------------------------
  const Roof = useMemo(() => {
    switch (roofType) {
      case "flat":
        return (
          <Plane
            args={[length, width]}
            position={[0, height, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material-color={0xcccccc}
          />
        );
      case "gabled":
        // Approximate with two pitched planes.
        return (
          <group>
            <Plane
              args={[length, width / 2]}
              position={[0, height, -width / 4]}
              rotation={[-Math.PI / 2, 0, Math.PI / 6]}
              material-color={0xcccccc}
            />
            <Plane
              args={[length, width / 2]}
              position={[0, height, width / 4]}
              rotation={[-Math.PI / 2, 0, -Math.PI / 6]}
              material-color={0xcccccc}
            />
          </group>
        );
      case "shed":
        return (
          <Plane
            args={[length, width]}
            position={[0, height, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI / 12]}
            material-color={0xcccccc}
          />
        );
      default:
        return null;
    }
  }, [roofType, length, width, height]);

  // ----- Door -------------------------------------------------------------
  const door = useMemo(() => {
    const doorWidth = 0.9;
    const doorHeight = 2.0;
    return (
      <Box
        args={[doorWidth, doorHeight, 0.1]}
        position={[0, doorHeight / 2, halfWid + 0.01]}
        material-color={0x777777}
      />
    );
  }, [halfWid]);

  // ----- Windows ----------------------------------------------------------
  const windows = useMemo(() => {
    const count = design.openings.windowCount;
    if (count <= 0) return null;
    const areaPer = design.openings.windowArea / count;
    const size = Math.sqrt(areaPer); // approximate square window
    const spacing = (width - count * size) / (count + 1);
    const elems = [];
    for (let i = 0; i < count; i++) {
      const x = -halfWid + spacing * (i + 1) + size * i + size / 2;
      elems.push(
        <Box
          key={i}
          args={[size, size, 0.05]}
          position={[x, height / 2, halfWid + 0.01]}
          material-color={0xadd8e6}
          material-transparent
          material-opacity={0.5}
        />
      );
    }
    return elems;
  }, [design.openings.windowCount, design.openings.windowArea, halfWid, width, height]);

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
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}
