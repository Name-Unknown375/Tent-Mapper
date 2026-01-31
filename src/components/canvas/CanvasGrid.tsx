import React from 'react';
import { Line, Text } from 'react-konva';
import { CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX, PIXELS_PER_FOOT } from '../../types';

interface CanvasGridProps {
  showGrid: boolean;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ showGrid }) => {
  if (!showGrid) return null;

  const lines: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  // Grid spacing: 10 feet = 100px
  const gridSpacing = 10 * PIXELS_PER_FOOT;

  // Vertical lines
  for (let x = 0; x <= CANVAS_WIDTH_PX; x += gridSpacing) {
    const isMajor = x % (50 * PIXELS_PER_FOOT) === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, CANVAS_HEIGHT_PX]}
        stroke={isMajor ? 'rgba(40, 79, 63, 0.3)' : 'rgba(40, 79, 63, 0.1)'}
        strokeWidth={isMajor ? 1 : 0.5}
      />
    );
    // Labels every 50 feet
    if (isMajor && x > 0) {
      labels.push(
        <Text
          key={`vl-${x}`}
          x={x - 15}
          y={5}
          text={`${x / PIXELS_PER_FOOT}ft`}
          fontSize={10}
          fill="rgba(40, 79, 63, 0.5)"
        />
      );
    }
  }

  // Horizontal lines
  for (let y = 0; y <= CANVAS_HEIGHT_PX; y += gridSpacing) {
    const isMajor = y % (50 * PIXELS_PER_FOOT) === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, CANVAS_WIDTH_PX, y]}
        stroke={isMajor ? 'rgba(40, 79, 63, 0.3)' : 'rgba(40, 79, 63, 0.1)'}
        strokeWidth={isMajor ? 1 : 0.5}
      />
    );
    // Labels every 50 feet
    if (isMajor && y > 0) {
      labels.push(
        <Text
          key={`hl-${y}`}
          x={5}
          y={y - 15}
          text={`${y / PIXELS_PER_FOOT}ft`}
          fontSize={10}
          fill="rgba(40, 79, 63, 0.5)"
        />
      );
    }
  }

  return (
    <>
      {lines}
      {labels}
    </>
  );
};
