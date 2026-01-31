import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import { useAppStore } from '../stores/useAppStore';
import { MainCanvas } from '../components/canvas';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Wizard } from '../components/wizard';
import { exportToImage, exportToPDF } from '../utils/export';

export const EditorPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const {
    currentLayout,
    newLayout,
    wizardEnabled,
    getTotalGuestCount,
    selectedItemId,
    removeItem,
  } = useAppStore();

  // Initialize layout if none exists
  useEffect(() => {
    if (!currentLayout && !wizardEnabled) {
      newLayout('My Event Layout');
    }
  }, [currentLayout, wizardEnabled, newLayout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected item
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        // Don't delete if focused on an input
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

  return (
    <div className="h-screen flex flex-col bg-brand-cream overflow-hidden">
      {/* Wizard overlay */}
      {wizardEnabled && <Wizard />}

      {/* Header */}
      <Header onExportPDF={handleExportPDF} onExportImage={handleExportImage} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 relative">
          <MainCanvas containerRef={containerRef} />

          {/* Help overlay for empty canvas */}
          {!wizardEnabled && useAppStore.getState().items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center max-w-md">
                <h3 className="text-xl font-semibold text-brand-green mb-2">
                  Get Started!
                </h3>
                <p className="text-brand-green/70 mb-4">
                  Drag items from the sidebar onto the canvas, or click an item to add
                  it to the center.
                </p>
                <p className="text-sm text-brand-green/50">
                  Use scroll wheel to zoom, drag the canvas to pan.
                </p>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-brand-green/60">
            <kbd className="px-1.5 py-0.5 bg-brand-green/10 rounded">Delete</kbd> to remove
            selected item
          </div>
        </div>
      </div>
    </div>
  );
};
