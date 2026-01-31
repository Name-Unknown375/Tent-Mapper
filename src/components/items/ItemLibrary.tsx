import React from 'react';
import {
  Tent,
  Circle,
  Square,
  Armchair,
  Music,
  Wine,
  UtensilsCrossed,
  Grid3X3,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { ItemType, ItemDefinition } from '../../types';
import { ITEM_DEFINITIONS, CATEGORY_LABELS } from '../../types';
import { Tooltip } from '../ui';

const getCategoryIcon = (category: ItemDefinition['category']) => {
  switch (category) {
    case 'tent':
      return <Tent size={18} />;
    case 'table':
      return <Square size={18} />;
    case 'chair':
      return <Armchair size={18} />;
    case 'dancefloor':
      return <Grid3X3 size={18} />;
    case 'equipment':
      return <Music size={18} />;
  }
};

const getItemIcon = (type: ItemType) => {
  const def = ITEM_DEFINITIONS[type];
  switch (def.category) {
    case 'tent':
      return <Tent size={24} />;
    case 'table':
      return def.isRound ? <Circle size={24} /> : <Square size={24} />;
    case 'chair':
      return <Armchair size={24} />;
    case 'dancefloor':
      return <Grid3X3 size={24} />;
    case 'equipment':
      if (type === 'dj-booth') return <Music size={24} />;
      if (type === 'bar') return <Wine size={24} />;
      return <UtensilsCrossed size={24} />;
  }
};

interface ItemCardProps {
  type: ItemType;
}

const ItemCard: React.FC<ItemCardProps> = ({ type }) => {
  const def = ITEM_DEFINITIONS[type];
  const { addItem, addTableWithChairs } = useAppStore();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('itemType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = () => {
    if (def.category === 'table') {
      // Add table with default chair type
      addTableWithChairs(type, 'chair-chiavari');
    } else {
      addItem(type);
    }
  };

  return (
    <Tooltip content={def.description} position="right">
      <div
        className="flex flex-col items-center p-3 bg-white rounded-lg border-2 border-brand-green/20 cursor-grab hover:border-brand-pink hover:shadow-md transition-all drag-handle"
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
      >
        <div
          className="w-12 h-12 flex items-center justify-center rounded-lg mb-2"
          style={{ backgroundColor: def.fillColor, border: `2px solid ${def.strokeColor}` }}
        >
          {getItemIcon(type)}
        </div>
        <span className="text-xs font-medium text-brand-green text-center leading-tight">
          {def.name}
        </span>
        {def.seatingCapacity && (
          <span className="text-xs text-brand-green/60 mt-1">
            Seats {def.seatingCapacity}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export const ItemLibrary: React.FC = () => {
  const { activeCategory, setActiveCategory } = useAppStore();

  const categories: Array<ItemDefinition['category'] | 'all'> = [
    'all',
    'tent',
    'table',
    'chair',
    'dancefloor',
    'equipment',
  ];

  const filteredItems = Object.entries(ITEM_DEFINITIONS).filter(([_, def]) => {
    if (activeCategory === 'all') return true;
    return def.category === activeCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 p-2 bg-brand-cream border-b border-brand-green/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
              activeCategory === cat
                ? 'bg-brand-green text-brand-cream'
                : 'text-brand-green hover:bg-brand-green/10'
            }`}
          >
            {cat !== 'all' && getCategoryIcon(cat as ItemDefinition['category'])}
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs text-brand-green/60 mb-3">
          Drag items onto the canvas or click to add
        </p>
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map(([type]) => (
            <ItemCard key={type} type={type as ItemType} />
          ))}
        </div>
      </div>
    </div>
  );
};
