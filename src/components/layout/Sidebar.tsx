import React, { useState } from 'react';
import { Package, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { ItemLibrary } from '../items/ItemLibrary';
import { ItemProperties } from '../items/ItemProperties';
import { Tooltip } from '../ui';

type SidebarTab = 'items' | 'properties';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, selectedItemId, toggleSidebar } = useAppStore();
  const [activeTab, setActiveTab] = useState<SidebarTab>('items');

  // Auto-switch to properties when item is selected
  React.useEffect(() => {
    if (selectedItemId) {
      setActiveTab('properties');
    }
  }, [selectedItemId]);

  if (!sidebarOpen) {
    return (
      <div className="w-12 bg-white border-r border-brand-green/10 flex flex-col items-center py-4">
        <Tooltip content="Expand sidebar" position="right">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-brand-green/10 text-brand-green"
          >
            <ChevronRight size={20} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-brand-green/10 flex flex-col">
      {/* Tab header */}
      <div className="flex border-b border-brand-green/10">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
            activeTab === 'items'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-brand-green/60 hover:text-brand-green'
          }`}
        >
          <Package size={18} />
          Items
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
            activeTab === 'properties'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-brand-green/60 hover:text-brand-green'
          }`}
        >
          <Settings size={18} />
          Properties
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'items' ? <ItemLibrary /> : <ItemProperties />}
      </div>

      {/* Collapse button */}
      <div className="p-2 border-t border-brand-green/10">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-brand-green/60 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all"
        >
          <ChevronLeft size={18} />
          Collapse sidebar
        </button>
      </div>
    </div>
  );
};
