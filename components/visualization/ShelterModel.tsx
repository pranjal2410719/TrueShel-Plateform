"use client";

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Plane } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { evaluateShelterDesign } from '@/lib/calculations/evaluateDesign';
import { useShelterDesign } from '@/stores/shelter-store';
import type { ThermalTwinMode } from '@/types';
import { getTemperatureHex } from '@/lib/calculations/thermal';

/**
 * Procedural 3‑D shelter model.
 * Renders floor, four walls, roof, windows and a door based on a ShelterDesign.
 * When `mode` is "thermal" the surfaces are coloured according to the
 * temperature at the current timestep (default first hour).
 */
export default function ShelterModel({
  design,
  mode = 'normal',
  timestep = 0,
}: {
  design: any; // ShelterDesign – using any to avoid circular import in R3F client component
  mode?: ThermalTwinMode;
  timestep?: number;
}) {
  // Pre‑compute dimensions (meters) – convert to three.js units (same scale).
  const { length, width, height, roofType } = design.geometry;

  // Compute envelope U‑values for colour mapping (optional).
  const wallU = useMemo(() => {
    const r = design.envelope.wall.rValue;
    return 1 / (0.13 + r + 0.04);
  }, [design.envelope.wall.rValue]);

  // Simple material colours based on design.
  const wallColor = useMemo(() => {
    if (mode === 'thermal') {
      // Use evaluated temperature of interior at given timestep.
      const result = evaluateShelterDesign(design);
      const temp = result.indoorTemperature[timestep] ?? 20;
      return getTemperatureHex(temp);
    }
    // Default neutral colour token.
    return 0xdddddd;
  }, [design, mode, timestep]);

  // Window material – semi‑transparent glass.
  const windowMaterial = useMemo(() => ({ color: 0xadd8e6, transparent: true, opacity: 0.5 }), []);

  // Geometry helper functions.
  const halfLen = length / 2;
  const halfWid = width / 2;

  // Roof – simple flat plane for now; can be extended for gabled/shed.
  const roof = useMemo(() => {
    if (roofType === 'flat') {
      return <Plane args={[length, width]} position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]} material-color={0xcccccc} />;
    }
    // Placeholder for other roof types – use a box geometry as approximation.
    return <Box args={[length, 0.2, width]} position={[0, height + 0.1, 0]} material-color={0xcccccc} />;
  }, [length, width, height, roofType]);

  // Doors – single door on the south wall.
  const doorWidth = 0.9;
  const doorHeight = 2.0;
  const door = useMemo(() => (
    <Box args={[doorWidth, doorHeight, 0.1]} position={[0, doorHeight / 2, halfWid + 0.01]} material-color={0x777777} />
  ), [doorWidth, doorHeight, halfWid]);

  // Windows – distribute evenly across south wall based on windowCount.
  const windows = useMemo(() => {
    const count = design.openings.windowCount;
    const areaPer = design.openings.windowArea / count;
    const widthPer = Math.sqrt(areaPer);
    const heightPer = widthPer; // approximate square windows
    const spacing = (width - count * widthPer) / (count + 1);
    const elems = [];
    for (let i = 0; i < count; i++) {
      const x = -halfWid + spacing * (i + 1) + widthPer * i + widthPer / 2;
      elems.push(
        <Box
          key={i}
          args={[widthPer, heightPer, 0.05]}
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
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
      {/* Floor */}
      <Plane args={[length, width]} rotation={[-Math.PI / 2, 0, 0]} material-color={0xffffff} />
      {/* Walls */}
      {/* North wall */}
      <Box args={[length, height, 0.1]} position={[0, height / 2, -halfWid]} material-color={wallColor} />
      {/* South wall – contains windows and door */}
      <Box args={[length, height, 0.1]} position={[0, height / 2, halfWid]} material-color={wallColor} />
      {/* East wall */}
      <Box args={[0.1, height, width]} position={[halfLen, height / 2, 0]} material-color={wallColor} />
      {/* West wall */}
      <Box args={[0.1, height, width]} position={[-halfLen, height / 2, 0]} material-color={wallColor} />
      {roof}
      {door}
      {windows}
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}
