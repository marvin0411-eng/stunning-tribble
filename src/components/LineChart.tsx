import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/theme';

interface Point {
  x: number;
  y: number;
  label?: string;
}

export function LineChart({
  data,
  width,
  height = 180,
  goalY,
}: {
  data: number[];
  width: number;
  height?: number;
  goalY?: number;
}) {
  const padding = 24;
  if (data.length === 0) {
    return <View style={{ width, height }} />;
  }

  const values = goalY !== undefined ? [...data, goalY] : data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points: Point[] = data.map((v, i) => {
    const x = data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW;
    const y = chartH - ((v - min) / range) * chartH;
    return { x: x + padding, y: y + padding };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const goalPixelY =
    goalY !== undefined ? chartH - ((goalY - min) / range) * chartH + padding : undefined;

  return (
    <Svg width={width} height={height}>
      {goalPixelY !== undefined && (
        <>
          <Line
            x1={padding}
            x2={width - padding}
            y1={goalPixelY}
            y2={goalPixelY}
            stroke={colors.accent}
            strokeDasharray="4,4"
            strokeWidth={1.5}
          />
          <SvgText x={padding} y={goalPixelY - 6} fontSize={10} fill={colors.accent}>
            goal
          </SvgText>
        </>
      )}
      <Path d={path} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.primary} />
      ))}
    </Svg>
  );
}
