import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Konva from 'konva';
import { useAppStore } from '../stores/useAppStore';
import { MainCanvas } from '../components/canvas';
import { Sidebar } from '../components/layout/Sidebar';
import { Wizard } from '../components/wizard';
import { exportToImage, exportToPDF } from '../utils/export';
import { Button, Tooltip } from '../components/ui';
import {
  Save,
  FileDown,
  Image,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Wand2,
} from 'lucide-react';

export const EmbedPage: React.FC = () => {
  const { layoutId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const {
    currentLayout,
    items,
    newLayout,
    loadLayout,
    saveLayout,
    getSavedLayouts,
    setEmbedMode,
    wizardEnabled,
    showGrid,
    canvasScale,
    toggleGrid,
    zoomIn,
    zoomOut,
    resetZoom,
    getTotalGuestCount,
    selectedItemId,
    removeItem,
    resetWizard,
  } = useAppStore();

  // Set embed mode on mount
  useEffect(() => {
    setEmbedMode(true);
    return () => setEmbedMode(false);
  }, [setEmbedMode]);

  // Load layout if layoutId provided, otherwise start fresh
  useEffect(() => {
    if (layoutId) {
      const layouts = getSavedLayouts();
      const layout = layouts.find((l) => l.id === layoutId);
      if (layout) {
        loadLayout(layout);
      } else {
        newLayout('My Event Layout');
      }
    } else if (!currentLayout && !wizardEnabled) {
      newLayout('My Event Layout');
    }
  }, [layoutId, currentLayout, wizardEnabled, getSavedLayouts, loadLayout, newLayout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        removeItem(selectedItemId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, removeItem]);

  const handleExportPDF = () => {
    exportToPDF(
      stageRef,
      currentLayout?.name || 'Tent Layout',
      getTotalGuestCount()
    );
  };

  const handleExportImage = () => {
    exportToImage(stageRef, `${currentLayout?.name || 'tent-layout'}.png`);
  };

  const handleSave = () => {
    const saved = saveLayout();
    alert(`Layout saved! You can share this link:\n${window.location.origin}/embed/${saved.id}`);
  };

  const guestCount = getTotalGuestCount();

  return (
    <div className="h-screen flex flex-col bg-brand-cream overflow-hidden">
      {/* Wizard overlay */}
      {wizardEnabled && <Wizard />}

      {/* Compact header for embed */}
      <header className="h-14 bg-brand-green text-brand-cream flex items-center px-4 shadow-lg z-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-pink rounded-lg flex items-center justify-center">
            <span className="text-brand-green font-bold text-sm">FP</span>
          </div>
          <span className="font-semibold hidden sm:block">Tent Mapper</span>
        </div>

        {/* Layout name */}
        <div className="flex-1 flex justify-center">
          <span className="text-sm bg-brand-green-light/50 px-3 py-1 rounded-full truncate max-w-48">
            {currentLayout?.name || 'My Layout'}
          </span>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1">
          {/* Guest count */}
          <div className="hidden sm:flex items-center gap-1 bg-brand-pink text-brand-green px-2 py-1 rounded-full text-xs font-medium mr-2">
            <Users size={14} />
            <span>{guestCount}</span>
          </div>

          {/* Zoom controls */}
          <Tooltip content="Zoom out">
            <Button variant="ghost" size="sm" onClick={zoomOut}>
              <ZoomOut size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>
          <span className="text-xs w-10 text-center hidden sm:block">
            {Math.round(canvasScale * 100)}%
          </span>
          <Tooltip content="Zoom in">
            <Button variant="ghost" size="sm" onClick={zoomIn}>
              <ZoomIn size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset zoom">
            <Button variant="ghost" size="sm" onClick={resetZoom}>
              <Maximize size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>

          <div className="w-px h-6 bg-brand-cream/20 mx-1" />

          <Tooltip content={showGrid ? 'Hide grid' : 'Show grid'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleGrid}
              className={showGrid ? 'bg-brand-cream/20' : ''}
            >
              <Grid3X3 size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>

          <Tooltip content="Restart wizard">
            <Button variant="ghost" size="sm" onClick={resetWizard}>
              <Wand2 size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>

          <div className="w-px h-6 bg-brand-cream/20 mx-1" />

          <Tooltip content="Save layout">
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>

          <Tooltip content="Export image">
            <Button variant="ghost" size="sm" onClick={handleExportImage}>
              <Image size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>

          <Tooltip content="Export PDF">
            <Button variant="ghost" size="sm" onClick={handleExportPDF}>
              <FileDown size={16} className="text-brand-cream" />
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative">
          <MainCanvas containerRef={containerRef} />

          {/* Help overlay */}
          {!wizardEnabled && items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg text-center max-w-sm">
                <h3 className="text-lg font-semibold text-brand-green mb-2">
                  Start Planning!
                </h3>
                <p className="text-sm text-brand-green/70">
                  Drag items from the sidebar to create your event layout.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Powered by footer */}
      <div className="h-8 bg-brand-green/10 flex items-center justify-center text-xs text-brand-green/60">
        Powered by Forever Party Rentals
      </div>
    </div>
  );
};
