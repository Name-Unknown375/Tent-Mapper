import React, { useRef } from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';
import type { CanvasItem as CanvasItemType } from '../../types';
import { ITEM_DEFINITIONS, PIXELS_PER_FOOT, CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX } from '../../types';
import { useAppStore } from '../../stores/useAppStore';

interface CanvasItemProps {
  item: CanvasItemType;
  isSelected: boolean;
}

export const CanvasItemComponent: React.FC<CanvasItemProps> = ({
  item,
  isSelected,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const { updateItem, selectItem, autoArrangeChairs } = useAppStore();
  const definition = ITEM_DEFINITIONS[item.type];

  const widthPx = definition.widthFt * PIXELS_PER_FOOT;
  const heightPx = definition.heightFt * PIXELS_PER_FOOT;

  // For dance floors, calculate actual size based on tiles
  const actualWidthPx =
    item.tilesWide !== undefined
      ? item.tilesWide * 4 * PIXELS_PER_FOOT
      : widthPx;
  const actualHeightPx =
    item.tilesDeep !== undefined
      ? item.tilesDeep * 4 * PIXELS_PER_FOOT
      : heightPx;

  // Calculate the item's half-size for boundary calculations
  const getItemHalfSize = () => {
    if (definition.isRound) {
      const radius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
      return { halfWidth: radius, halfHeight: radius };
    }
    if (definition.category === 'dancefloor') {
      return { halfWidth: actualWidthPx / 2, halfHeight: actualHeightPx / 2 };
    }
    return { halfWidth: widthPx / 2, halfHeight: heightPx / 2 };
  };

  // Constrain dragging to canvas bounds
  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const { halfWidth, halfHeight } = getItemHalfSize();

    // Clamp position to keep item fully within canvas
    const newX = Math.max(halfWidth, Math.min(CANVAS_WIDTH_PX - halfWidth, pos.x));
    const newY = Math.max(halfHeight, Math.min(CANVAS_HEIGHT_PX - halfHeight, pos.y));

    return { x: newX, y: newY };
  };

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Stop the event from bubbling to the stage (prevents stage panning)
    e.cancelBubble = true;
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateItem(item.id, {
      position: { x: e.target.x(), y: e.target.y() },
    });
    // Re-arrange chairs if this is a table
    if (item.chairType && item.chairCount) {
      autoArrangeChairs(item.id);
    }
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (node) {
      updateItem(item.id, {
        position: { x: node.x(), y: node.y() },
        rotation: node.rotation(),
      });
    }
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    selectItem(item.id);
  };

  // Render different shapes based on item type
  const renderShape = () => {
    if (definition.isRound) {
      const radius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
      return (
        <Circle
          radius={radius}
          fill={definition.fillColor}
          stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
          strokeWidth={isSelected ? 3 : 2}
        />
      );
    }

    // Special rendering for dance floors (show tile pattern)
    if (definition.category === 'dancefloor') {
      const tiles: React.ReactNode[] = [];
      const tilesWide = item.tilesWide || 1;
      const tilesDeep = item.tilesDeep || 1;
      const tileSize = 4 * PIXELS_PER_FOOT;

      for (let tx = 0; tx < tilesWide; tx++) {
        for (let ty = 0; ty < tilesDeep; ty++) {
          const isAlternate = (tx + ty) % 2 === 0;
          tiles.push(
            <Rect
              key={`tile-${tx}-${ty}`}
              x={-actualWidthPx / 2 + tx * tileSize}
              y={-actualHeightPx / 2 + ty * tileSize}
              width={tileSize}
              height={tileSize}
              fill={
                item.type === 'dancefloor-black'
                  ? isAlternate
                    ? '#1a1a1a'
                    : '#333'
                  : isAlternate
                  ? '#FFFFFF'
                  : '#F5F5F5'
              }
              stroke={definition.strokeColor}
              strokeWidth={1}
            />
          );
        }
      }

      return (
        <Group>
          {tiles}
          <Rect
            x={-actualWidthPx / 2}
            y={-actualHeightPx / 2}
            width={actualWidthPx}
            height={actualHeightPx}
            stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
            strokeWidth={isSelected ? 3 : 2}
            fill="transparent"
          />
        </Group>
      );
    }

    // Special rendering for tents (show tent outline with poles)
    if (definition.category === 'tent') {
      return (
        <Group>
          <Rect
            x={-widthPx / 2}
            y={-heightPx / 2}
            width={widthPx}
            height={heightPx}
            fill={definition.fillColor}
            stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
            strokeWidth={isSelected ? 3 : 2}
            dash={[10, 5]}
          />
          {/* Corner markers */}
          {[
            [-widthPx / 2 + 5, -heightPx / 2 + 5],
            [widthPx / 2 - 5, -heightPx / 2 + 5],
            [-widthPx / 2 + 5, heightPx / 2 - 5],
            [widthPx / 2 - 5, heightPx / 2 - 5],
          ].map(([x, y], i) => (
            <Circle
              key={i}
              x={x}
              y={y}
              radius={4}
              fill={definition.strokeColor}
            />
          ))}
          {/* Label */}
          <Text
            x={-widthPx / 2 + 5}
            y={-heightPx / 2 + 10}
            text={definition.name}
            fontSize={12}
            fill={definition.strokeColor}
            fontStyle="bold"
          />
        </Group>
      );
    }

    // Default rectangle rendering
    return (
      <Rect
        x={-widthPx / 2}
        y={-heightPx / 2}
        width={widthPx}
        height={heightPx}
        fill={definition.fillColor}
        stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={definition.category === 'equipment' ? 4 : 0}
      />
    );
  };

  // Render label for equipment
  const renderLabel = () => {
    if (definition.category !== 'equipment') return null;

    return (
      <Text
        x={-widthPx / 2 + 5}
        y={-heightPx / 2 + 5}
        text={definition.name}
        fontSize={10}
        fill={
          item.type === 'dj-booth' ? '#FEFAF6' : definition.strokeColor
        }
        fontStyle="bold"
        width={widthPx - 10}
      />
    );
  };

  // Show chair count for tables
  const renderChairCount = () => {
    if (!item.chairCount) return null;

    return (
      <Group>
        <Circle
          x={widthPx / 2 - 5}
          y={-heightPx / 2 + 5}
          radius={12}
          fill="#284F3F"
        />
        <Text
          x={widthPx / 2 - 5 - 6}
          y={-heightPx / 2 + 5 - 5}
          text={String(item.chairCount)}
          fontSize={10}
          fill="#FEFAF6"
          fontStyle="bold"
        />
      </Group>
    );
  };

  return (
    <Group
      ref={groupRef}
      x={item.position.x}
      y={item.position.y}
      rotation={item.rotation}
      draggable={!item.locked}
      dragBoundFunc={dragBoundFunc}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {renderShape()}
      {renderLabel()}
      {renderChairCount()}
      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={definition.isRound ? -(definition.diameterFt! / 2) * PIXELS_PER_FOOT - 5 : -widthPx / 2 - 5}
          y={definition.isRound ? -(definition.diameterFt! / 2) * PIXELS_PER_FOOT - 5 : -heightPx / 2 - 5}
          width={definition.isRound ? definition.diameterFt! * PIXELS_PER_FOOT + 10 : widthPx + 10}
          height={definition.isRound ? definition.diameterFt! * PIXELS_PER_FOOT + 10 : heightPx + 10}
          stroke="#EBC0CF"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
          listening={false}
        />
      )}
    </Group>
  );
};
