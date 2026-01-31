import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import { useAppStore } from '../../stores/useAppStore';
import { CanvasGrid } from './CanvasGrid';
import { CanvasItemComponent } from './CanvasItem';
import type { ItemType } from '../../types';
import { CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX } from '../../types';

interface MainCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({ containerRef }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = useState(false);

  const {
    items,
    selectedItemId,
    canvasScale,
    canvasOffset,
    showGrid,
    clearSelection,
    setCanvasScale,
    setCanvasOffset,
    addItem,
  } = useAppStore();

  // Update stage size on container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  // Handle mouse wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = canvasScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - canvasOffset.x) / oldScale,
      y: (pointer.y - canvasOffset.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(Math.max(oldScale + direction * 0.1, 0.25), 3);

    setCanvasScale(newScale);
    setCanvasOffset({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Handle stage click (deselect)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Only deselect if clicking on the stage background
    if (e.target === e.target.getStage() || e.target.name() === 'background' || e.target.name() === 'grass-texture') {
      clearSelection();
    }
  };

  // Handle drag and drop from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFromSidebar(false);

    const itemType = e.dataTransfer.getData('itemType') as ItemType;
    if (!itemType) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Calculate position relative to stage
    const stageRect = stage.container().getBoundingClientRect();
    const position = {
      x: (e.clientX - stageRect.left - canvasOffset.x) / canvasScale,
      y: (e.clientY - stageRect.top - canvasOffset.y) / canvasScale,
    };

    addItem(itemType, position);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFromSidebar(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set false if leaving the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingFromSidebar(false);
    }
  };

  // Only allow stage dragging when not dragging from sidebar
  const handleStageDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Prevent stage drag if we're dragging from sidebar
    if (isDraggingFromSidebar) {
      e.target.stopDrag();
      return;
    }
    // Only allow dragging if clicking on background
    const target = e.target;
    if (target !== stageRef.current && target.name() !== 'background' && target.name() !== 'grass-texture') {
      e.target.stopDrag();
    }
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Only update offset if this was a valid stage drag
    if (e.target === stageRef.current) {
      setCanvasOffset({
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  return (
    <div
      className="w-full h-full overflow-hidden bg-brand-cream canvas-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={canvasScale}
        scaleY={canvasScale}
        x={canvasOffset.x}
        y={canvasOffset.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        draggable={!isDraggingFromSidebar}
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
      >
        <Layer>
          {/* Grass Background */}
          <Rect
            name="background"
            x={0}
            y={0}
            width={CANVAS_WIDTH_PX}
            height={CANVAS_HEIGHT_PX}
            fill="#4a7c59"
            stroke="#284F3F"
            strokeWidth={4}
          />
          {/* Grass texture overlay - subtle pattern */}
          <Rect
            name="grass-texture"
            x={0}
            y={0}
            width={CANVAS_WIDTH_PX}
            height={CANVAS_HEIGHT_PX}
            fill="transparent"
            listening={false}
          />

          {/* Grid */}
          <CanvasGrid showGrid={showGrid} />

          {/* Items */}
          {items.map((item) => (
            <CanvasItemComponent
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
