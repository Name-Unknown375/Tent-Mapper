import React, { useState } from 'react';
import {
  Menu,
  Save,
  FolderOpen,
  FileDown,
  Image,
  FileText,
  Users,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize,
  LogOut,
  Wand2,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { Button, Modal, Tooltip } from '../ui';

interface HeaderProps {
  onExportPDF: () => void;
  onExportImage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportPDF, onExportImage }) => {
  const {
    currentLayout,
    isAuthenticated,
    isEmbedMode,
    showGrid,
    canvasScale,
    toggleSidebar,
    toggleGrid,
    zoomIn,
    zoomOut,
    resetZoom,
    saveLayout,
    getSavedLayouts,
    loadLayout,
    deleteLayout,
    newLayout,
    logout,
    getTotalGuestCount,
    resetWizard,
  } = useAppStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [layoutName, setLayoutName] = useState(currentLayout?.name || '');

  const savedLayouts = getSavedLayouts();
  const guestCount = getTotalGuestCount();

  const handleSave = () => {
    if (layoutName) {
      useAppStore.setState((state) => ({
        currentLayout: state.currentLayout
          ? { ...state.currentLayout, name: layoutName }
          : null,
      }));
    }
    const saved = saveLayout();
    setShowSaveModal(false);
    alert(`Layout "${saved.name}" saved successfully!`);
  };

  const handleLoad = (layout: ReturnType<typeof getSavedLayouts>[0]) => {
    loadLayout(layout);
    setShowLoadModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this layout?')) {
      deleteLayout(id);
    }
  };

  return (
    <>
      <header className="h-16 bg-brand-green text-brand-cream flex items-center px-4 shadow-lg z-20">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {!isEmbedMode && (
            <Tooltip content="Toggle sidebar">
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <Menu size={20} className="text-brand-cream" />
              </Button>
            </Tooltip>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Forever Party Rentals" className="h-10 w-auto" />
            <span className="font-semibold text-lg hidden sm:block">Tent Mapper</span>
          </div>
        </div>

        {/* Center section - Layout name */}
        <div className="flex-1 flex justify-center">
          <span className="text-sm bg-brand-green-light/50 px-3 py-1 rounded-full">
            {currentLayout?.name || 'Untitled Layout'}
          </span>
        </div>

        {/* Right section - Tools */}
        <div className="flex items-center gap-2">
          {/* Guest count badge */}
          <div className="hidden sm:flex items-center gap-1 bg-brand-pink text-brand-green px-3 py-1 rounded-full text-sm font-medium">
            <Users size={16} />
            <span>{guestCount} guests</span>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 border-l border-brand-cream/20 pl-2 ml-2">
            <Tooltip content="Zoom out">
              <Button variant="ghost" size="sm" onClick={zoomOut}>
                <ZoomOut size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
            <span className="text-xs w-12 text-center">{Math.round(canvasScale * 100)}%</span>
            <Tooltip content="Zoom in">
              <Button variant="ghost" size="sm" onClick={zoomIn}>
                <ZoomIn size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
            <Tooltip content="Reset zoom">
              <Button variant="ghost" size="sm" onClick={resetZoom}>
                <Maximize size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
          </div>

          {/* Grid toggle */}
          <Tooltip content={showGrid ? 'Hide grid' : 'Show grid'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleGrid}
              className={showGrid ? 'bg-brand-cream/20' : ''}
            >
              <Grid3X3 size={18} className="text-brand-cream" />
            </Button>
          </Tooltip>

          {/* File actions */}
          <div className="flex items-center gap-1 border-l border-brand-cream/20 pl-2 ml-2">
            <Tooltip content="New layout">
              <Button variant="ghost" size="sm" onClick={() => newLayout()}>
                <FileText size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>

            <Tooltip content="Save layout">
              <Button variant="ghost" size="sm" onClick={() => setShowSaveModal(true)}>
                <Save size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>

            <Tooltip content="Load layout">
              <Button variant="ghost" size="sm" onClick={() => setShowLoadModal(true)}>
                <FolderOpen size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
          </div>

          {/* Export actions */}
          <div className="flex items-center gap-1 border-l border-brand-cream/20 pl-2 ml-2">
            <Tooltip content="Export as image">
              <Button variant="ghost" size="sm" onClick={onExportImage}>
                <Image size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>

            <Tooltip content="Export as PDF">
              <Button variant="ghost" size="sm" onClick={onExportPDF}>
                <FileDown size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
          </div>

          {/* Wizard restart */}
          <Tooltip content="Restart setup wizard">
            <Button variant="ghost" size="sm" onClick={resetWizard}>
              <Wand2 size={18} className="text-brand-cream" />
            </Button>
          </Tooltip>

          {/* Auth */}
          {isAuthenticated && !isEmbedMode && (
            <Tooltip content="Logout">
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={18} className="text-brand-cream" />
              </Button>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Save Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Layout"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-green mb-1">
              Layout Name
            </label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Enter layout name"
              className="w-full px-4 py-2 rounded-lg border-2 border-brand-green/30 focus:border-brand-green focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Load Modal */}
      <Modal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title="Load Layout"
        size="lg"
      >
        <div className="space-y-4">
          {savedLayouts.length === 0 ? (
            <p className="text-center text-brand-green/60 py-8">
              No saved layouts yet. Create and save a layout first!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-brand-green/20 hover:border-brand-pink transition-all"
                >
                  <div className="cursor-pointer flex-1" onClick={() => handleLoad(layout)}>
                    <p className="font-medium text-brand-green">{layout.name}</p>
                    <p className="text-xs text-brand-green/60">
                      {layout.items.length} items • Updated{' '}
                      {new Date(layout.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(layout.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowLoadModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
