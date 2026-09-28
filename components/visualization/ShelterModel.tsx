"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";
import { DoubleSide } from "three";
import type { ShelterDesign, ThermalTwinMode, ClimateData } from "@/types";
import { evaluateShelterDesign } from "@/lib/calculations/evaluateDesign";
import { getTemperatureHex } from "@/lib/calculations/thermal";

const ROOF_TILT = Math.PI / 6;

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

function SunPosition({ timestep, solarIrradiance }: { timestep: number; solarIrradiance: number[] }) {
  const intensity = solarIrradiance[timestep] ?? 0;
  const maxIrradiance = Math.max(...solarIrradiance, 1);
  const normalizedIntensity = intensity / maxIrradiance;
  const sunAngle = ((timestep - 6) / 12) * Math.PI;
  const sunX = Math.cos(sunAngle) * 15;
  const sunY = Math.sin(sunAngle) * 10 + 5;
  const sunZ = 5;
  return (
    <directionalLight
      position={[sunX, Math.max(sunY, 2), sunZ]}
      intensity={0.3 + normalizedIntensity * 0.7}
      castShadow
    />
  );
}

function ShadingDevice({ design }: { design: ShelterDesign }) {
  if (!design.shadingEnabled) return null;
  const { length, width, height } = design.geometry;
  const overhangDepth = 0.8;
  return (
    <group>
      <Box
        args={[length + 0.4, 0.05, overhangDepth]}
        position={[0, height - 0.3, width / 2 + overhangDepth / 2]}
        material-color={0x8B4513}
      />
      <Box
        args={[length + 0.4, 0.05, overhangDepth]}
        position={[0, height - 0.6, width / 2 + overhangDepth / 2]}
        material-color={0x8B4513}
      />
    </group>
  );
}

function WindIndicator({ windSpeed, windDirection }: { windSpeed: number; windDirection: number }) {
  const arrowLength = Math.min(windSpeed * 0.3, 3);
  const rad = (windDirection * Math.PI) / 180;
  const x = Math.cos(rad) * arrowLength;
  const z = Math.sin(rad) * arrowLength;
  return (
    <group position={[0, 0.5, 0]}>
      <Box args={[0.1, 0.1, arrowLength]} position={[x / 2, 0, z / 2]} rotation={[0, -rad, 0]} material-color={0x4444ff} />
    </group>
  );
}

function SnowLoad({ roofType, width, height }: { roofType: string; width: number; height: number }) {
  if (roofType === "flat") return null;
  const snowDepth = 0.15;
  return (
    <group>
      <Box
        args={[width * 0.8, snowDepth, 0.3]}
        position={[0, height + 0.1, 0]}
        rotation={[roofType === "gabled" ? ROOF_TILT : 0, 0, 0]}
        material-color={0xffffff}
        material-transparent
        material-opacity={0.9}
      />
    </group>
  );
}

function InsulationCutaway({ design }: { design: ShelterDesign }) {
  const { length, width, height } = design.geometry;
  const wallThickness = 0.35;
  const layers = [
    { thickness: 0.02, color: 0xf5f5dc },
    { thickness: 0.2, color: 0x8B4513 },
    { thickness: 0.1, color: 0xffffff },
    { thickness: 0.03, color: 0xf5f5dc },
  ];
  let currentZ = -width / 2 - wallThickness / 2;
  return (
    <group position={[length / 2 + 0.5, height / 2, 0]}>
      {layers.map((layer, i) => {
        const z = currentZ + layer.thickness / 2;
        currentZ += layer.thickness;
        return (
          <Box
            key={i}
            args={[0.02, height * 0.8, layer.thickness]}
            position={[0, 0, z]}
            material-color={layer.color}
          />
        );
      })}
    </group>
  );
}

export default function ShelterModel({
  design,
  mode = "normal",
  timestep = 0,
  climate,
}: {
  design: ShelterDesign;
  mode?: ThermalTwinMode;
  timestep?: number;
  climate?: ClimateData;
}) {
  const { length, width, height, roofType } = design.geometry;
  const halfLen = length / 2;
  const halfWid = width / 2;

  const wallColor = useMemo(() => {
    if (mode === "normal") return 0xdddddd;
    const result = evaluateShelterDesign(design);
    const idx = Math.min(Math.max(timestep, 0), result.indoorTemperature.length - 1);
    switch (mode) {
      case "thermal":
        return getTemperatureHex(result.indoorTemperature[idx] ?? 20);
      case "heat-flow":
        return getTemperatureHex(normalizeToDisplayTemp(result.heatLoss[idx] ?? 0, result.heatLoss));
      case "solar":
        return getTemperatureHex(normalizeToDisplayTemp(result.heatGain[idx] ?? 0, result.heatGain));
      case "storage":
        return getTemperatureHex(normalizeToDisplayTemp(result.storage[idx] ?? 0, result.storage));
      default:
        return 0xdddddd;
    }
  }, [design, mode, timestep]);

  const wallThickness = 0.1 + (design.thermalMass.level === "high" ? 0.1 : design.thermalMass.level === "medium" ? 0.05 : 0);

  const Roof = useMemo(() => {
    switch (roofType) {
      case "flat":
        return (
          <Plane args={[length, width]} position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]} material-color={0xcccccc} material-side={DoubleSide} />
        );
      case "gabled": {
        const rise = halfWid * Math.tan(ROOF_TILT);
        const slopeLen = halfWid / Math.cos(ROOF_TILT);
        return (
          <group>
            <Plane args={[length, slopeLen]} position={[0, height + rise / 2, halfWid / 2]} rotation={[-Math.PI / 2 + ROOF_TILT, 0, 0]} material-color={0xcccccc} material-side={DoubleSide} />
            <Plane args={[length, slopeLen]} position={[0, height + rise / 2, -halfWid / 2]} rotation={[-Math.PI / 2 - ROOF_TILT, 0, 0]} material-color={0xcccccc} material-side={DoubleSide} />
          </group>
        );
      }
      case "shed": {
        const rise = width * Math.tan(ROOF_TILT);
        const slopeLen = width / Math.cos(ROOF_TILT);
        return (
          <Plane args={[length, slopeLen]} position={[0, height + rise / 2, 0]} rotation={[-Math.PI / 2 + ROOF_TILT, 0, 0]} material-color={0xcccccc} material-side={DoubleSide} />
        );
      }
      default:
        return null;
    }
  }, [roofType, length, width, height, halfWid]);

  const door = useMemo(() => {
    const doorWidth = 0.9;
    const doorHeight = Math.min(2.0, height - 0.2);
    return <Box args={[doorWidth, doorHeight, 0.1]} position={[0, doorHeight / 2, halfWid + 0.102]} material-color={0x777777} />;
  }, [halfWid, height]);

  const windows = useMemo(() => {
    const count = design.openings.windowCount;
    if (count <= 0) return null;
    const areaPer = design.openings.windowArea / count;
    const doorZone = 0.45 + 0.15;
    const perSide = Math.ceil(count / 2);
    const sideSpan = Math.max(halfLen - 0.3 - doorZone, 0.1);
    const size = Math.min(Math.sqrt(areaPer), (sideSpan / perSide) * 0.8, height * 0.6);
    if (size <= 0) return null;
    const windowZ = halfWid + 0.077;
    const elems = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const k = Math.floor(i / 2);
      const x = side * (doorZone + (sideSpan / perSide) * (k + 0.5));
      if (Math.abs(x) + size / 2 > halfLen) continue;
      elems.push(
        <Box key={i} args={[size, size, 0.05]} position={[x, height / 2, windowZ]} material-color={0xadd8e6} material-transparent material-opacity={0.5} />,
      );
    }
    return elems.length > 0 ? elems : null;
  }, [design.openings.windowCount, design.openings.windowArea, halfLen, halfWid, height]);

  const volume = length * width * height;
  const surfaceArea = 2 * (length * width + length * height + width * height);
  const saRatio = surfaceArea / volume;

  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: [length * 1.5, height * 1.2, width * 1.5], fov: 45 }} style={{ width: "100%", height: "100%" }}>
        <ambientLight intensity={0.6} />
        {climate ? (
          <SunPosition timestep={timestep} solarIrradiance={climate.hourlySolarIrradiance} />
        ) : (
          <directionalLight position={[10, 10, 5]} intensity={0.7} castShadow />
        )}
        <Plane args={[length, width]} rotation={[-Math.PI / 2, 0, 0]} material-color={0xffffff} />
        <Box args={[length, height, wallThickness]} position={[0, height / 2, -halfWid]} material-color={wallColor} />
        <Box args={[length, height, wallThickness]} position={[0, height / 2, halfWid]} material-color={wallColor} />
        <Box args={[wallThickness, height, width]} position={[halfLen, height / 2, 0]} material-color={wallColor} />
        <Box args={[wallThickness, height, width]} position={[-halfLen, height / 2, 0]} material-color={wallColor} />
        {Roof}
        {door}
        {windows}
        <ShadingDevice design={design} />
        {climate && climate.windExposure !== "low" && (
          <WindIndicator windSpeed={climate.hourlyWindSpeed[timestep] ?? 5} windDirection={180} />
        )}
        {climate && climate.freezeThawRisk === "high" && (
          <SnowLoad roofType={roofType} width={width} height={height} />
        )}
        <InsulationCutaway design={design} />
        <OrbitControls enablePan enableZoom enableRotate makeDefault />
      </Canvas>
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm rounded-inner p-3 text-xs space-y-1 border border-border-subtle">
        <p className="font-semibold text-slate-ink">Geometry Summary</p>
        <p className="text-slate-muted">Volume: {volume.toFixed(1)} m³</p>
        <p className="text-slate-muted">Surface Area: {surfaceArea.toFixed(1)} m²</p>
        <p className="text-slate-muted">SA/V Ratio: {saRatio.toFixed(2)} m⁻¹</p>
        <p className="text-slate-muted">Wall Thickness: {(wallThickness * 1000).toFixed(0)} mm</p>
      </div>
    </div>
  );
}
