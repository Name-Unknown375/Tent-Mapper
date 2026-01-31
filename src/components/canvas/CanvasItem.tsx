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
  const { updateItem, selectItem } = useAppStore();
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
      // Add space for chairs around the table
      const chairOffset = item.chairCount ? 25 : 0;
      return { halfWidth: radius + chairOffset, halfHeight: radius + chairOffset };
    }
    if (definition.category === 'dancefloor') {
      return { halfWidth: actualWidthPx / 2, halfHeight: actualHeightPx / 2 };
    }
    // Add space for chairs around rectangular tables
    const chairOffset = item.chairCount && definition.category === 'table' ? 25 : 0;
    return { halfWidth: widthPx / 2 + chairOffset, halfHeight: heightPx / 2 + chairOffset };
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

  // Render chairs around a round table
  const renderRoundTableChairs = () => {
    if (!item.chairCount || item.chairCount === 0) return null;

    const chairs: React.ReactNode[] = [];
    const tableRadius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
    const chairRadius = 8; // Small circles for chairs
    const chairDistance = tableRadius + 18; // Distance from center to chair

    for (let i = 0; i < item.chairCount; i++) {
      const angle = (2 * Math.PI * i) / item.chairCount - Math.PI / 2;
      const x = chairDistance * Math.cos(angle);
      const y = chairDistance * Math.sin(angle);

      chairs.push(
        <Group key={`chair-${i}`}>
          {/* Chair circle */}
          <Circle
            x={x}
            y={y}
            radius={chairRadius}
            fill="#FFFFFF"
            stroke="#284F3F"
            strokeWidth={1.5}
          />
          {/* Chair number */}
          <Text
            x={x - 4}
            y={y - 4}
            text={String(i + 1)}
            fontSize={8}
            fill="#284F3F"
            fontStyle="bold"
          />
        </Group>
      );
    }

    return <Group>{chairs}</Group>;
  };

  // Render chairs around a rectangular table
  const renderRectTableChairs = () => {
    if (!item.chairCount || item.chairCount === 0) return null;

    const chairs: React.ReactNode[] = [];
    const chairRadius = 8;
    const chairOffset = 15; // Distance from table edge

    const tableW = widthPx;
    const tableH = heightPx;

    // Distribute chairs: prioritize long sides (top and bottom)
    // For 6ft table (6-8 chairs): 3 on each long side
    // For 8ft table (8-10 chairs): 3-4 on each long side, optionally 1 on each end

    const totalChairs = item.chairCount;
    let chairIndex = 0;

    // Calculate how many chairs on each side
    // Long sides get more chairs
    const chairsPerLongSide = Math.ceil(totalChairs / 2 / 2) + 1; // e.g., 3 for 6 chairs total
    const remainingAfterLongSides = totalChairs - (chairsPerLongSide * 2);
    const chairsOnEnds = Math.max(0, remainingAfterLongSides);

    // Top side (3 chairs for 6ft, up to 4 for 8ft)
    const topChairs = Math.min(chairsPerLongSide, Math.ceil((totalChairs - chairsOnEnds) / 2));
    const spacing = tableW / (topChairs + 1);

    for (let i = 0; i < topChairs && chairIndex < totalChairs; i++) {
      const x = -tableW / 2 + spacing * (i + 1);
      const y = -tableH / 2 - chairOffset;
      chairs.push(
        <Group key={`chair-${chairIndex}`}>
          <Circle x={x} y={y} radius={chairRadius} fill="#FFFFFF" stroke="#284F3F" strokeWidth={1.5} />
          <Text x={x - 4} y={y - 4} text={String(chairIndex + 1)} fontSize={8} fill="#284F3F" fontStyle="bold" />
        </Group>
      );
      chairIndex++;
    }

    // Bottom side
    const bottomChairs = Math.min(chairsPerLongSide, totalChairs - chairIndex - Math.floor(chairsOnEnds));
    for (let i = 0; i < bottomChairs && chairIndex < totalChairs; i++) {
      const x = -tableW / 2 + spacing * (i + 1);
      const y = tableH / 2 + chairOffset;
      chairs.push(
        <Group key={`chair-${chairIndex}`}>
          <Circle x={x} y={y} radius={chairRadius} fill="#FFFFFF" stroke="#284F3F" strokeWidth={1.5} />
          <Text x={x - 4} y={y - 4} text={String(chairIndex + 1)} fontSize={8} fill="#284F3F" fontStyle="bold" />
        </Group>
      );
      chairIndex++;
    }

    // Left end (if needed)
    if (chairIndex < totalChairs) {
      const x = -tableW / 2 - chairOffset;
      const y = 0;
      chairs.push(
        <Group key={`chair-${chairIndex}`}>
          <Circle x={x} y={y} radius={chairRadius} fill="#FFFFFF" stroke="#284F3F" strokeWidth={1.5} />
          <Text x={x - 4} y={y - 4} text={String(chairIndex + 1)} fontSize={8} fill="#284F3F" fontStyle="bold" />
        </Group>
      );
      chairIndex++;
    }

    // Right end (if needed)
    if (chairIndex < totalChairs) {
      const x = tableW / 2 + chairOffset;
      const y = 0;
      chairs.push(
        <Group key={`chair-${chairIndex}`}>
          <Circle x={x} y={y} radius={chairRadius} fill="#FFFFFF" stroke="#284F3F" strokeWidth={1.5} />
          <Text x={x - 4} y={y - 4} text={String(chairIndex + 1)} fontSize={8} fill="#284F3F" fontStyle="bold" />
        </Group>
      );
      chairIndex++;
    }

    return <Group>{chairs}</Group>;
  };

  // Render different shapes based on item type
  const renderShape = () => {
    // Round tables
    if (definition.isRound && definition.category === 'table') {
      const radius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
      return (
        <Group>
          {/* Chairs around the table */}
          {renderRoundTableChairs()}
          {/* Table */}
          <Circle
            radius={radius}
            fill={definition.fillColor}
            stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
            strokeWidth={isSelected ? 3 : 2}
          />
          {/* Table number in center */}
          {item.chairCount && item.chairCount > 0 && (
            <Text
              x={-8}
              y={-6}
              text={String(item.chairCount)}
              fontSize={14}
              fill={definition.strokeColor}
              fontStyle="bold"
            />
          )}
        </Group>
      );
    }

    // Rectangular tables
    if (definition.category === 'table') {
      return (
        <Group>
          {/* Chairs around the table */}
          {renderRectTableChairs()}
          {/* Table */}
          <Rect
            x={-widthPx / 2}
            y={-heightPx / 2}
            width={widthPx}
            height={heightPx}
            fill={definition.fillColor}
            stroke={isSelected ? '#EBC0CF' : definition.strokeColor}
            strokeWidth={isSelected ? 3 : 2}
          />
          {/* Table number in center */}
          {item.chairCount && item.chairCount > 0 && (
            <Text
              x={-8}
              y={-6}
              text={String(item.chairCount)}
              fontSize={14}
              fill={definition.strokeColor}
              fontStyle="bold"
            />
          )}
        </Group>
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
      // For 20x60 tent, show the dividing line
      const is20x60 = item.type === 'tent-20x60';

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
          {/* Dividing line for 20x60 (shows it's made of 2x 20x30) */}
          {is20x60 && (
            <Rect
              x={-widthPx / 2}
              y={0}
              width={widthPx}
              height={1}
              fill={definition.strokeColor}
              opacity={0.5}
            />
          )}
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
              fill="#FFFFFF"
              stroke={definition.strokeColor}
              strokeWidth={1}
            />
          ))}
          {/* Middle poles for 20x60 */}
          {is20x60 && [
            [-widthPx / 2 + 5, 0],
            [widthPx / 2 - 5, 0],
          ].map(([x, y], i) => (
            <Circle
              key={`mid-${i}`}
              x={x}
              y={y}
              radius={4}
              fill="#FFFFFF"
              stroke={definition.strokeColor}
              strokeWidth={1}
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

    // Default rectangle rendering (equipment, chairs)
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

  // Calculate selection box size including chairs
  const getSelectionBoxSize = () => {
    if (definition.category === 'table' && item.chairCount) {
      const chairOffset = 30;
      if (definition.isRound) {
        const radius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
        return {
          x: -(radius + chairOffset),
          y: -(radius + chairOffset),
          width: (radius + chairOffset) * 2,
          height: (radius + chairOffset) * 2,
        };
      }
      return {
        x: -widthPx / 2 - chairOffset,
        y: -heightPx / 2 - chairOffset,
        width: widthPx + chairOffset * 2,
        height: heightPx + chairOffset * 2,
      };
    }

    if (definition.isRound) {
      const radius = (definition.diameterFt! / 2) * PIXELS_PER_FOOT;
      return {
        x: -radius - 5,
        y: -radius - 5,
        width: radius * 2 + 10,
        height: radius * 2 + 10,
      };
    }

    return {
      x: -widthPx / 2 - 5,
      y: -heightPx / 2 - 5,
      width: widthPx + 10,
      height: heightPx + 10,
    };
  };

  const selectionBox = getSelectionBoxSize();

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
      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={selectionBox.x}
          y={selectionBox.y}
          width={selectionBox.width}
          height={selectionBox.height}
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
