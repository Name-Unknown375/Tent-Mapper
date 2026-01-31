import React from 'react';
import {
  Trash2,
  Copy,
  RotateCw,
  Lock,
  Unlock,
  Users,
  Minus,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import type { ChairType } from '../../types';
import { ITEM_DEFINITIONS, PIXELS_PER_FOOT } from '../../types';
import { Button, Select, Tooltip } from '../ui';

const CHAIR_OPTIONS: { value: ChairType; label: string }[] = [
  { value: 'chair-fanback', label: 'White Fanback' },
  { value: 'chair-resin', label: 'White Resin' },
  { value: 'chair-folding', label: 'Black Folding' },
  { value: 'chair-chiavari', label: 'White Chiavari' },
];

export const ItemProperties: React.FC = () => {
  const {
    items,
    selectedItemId,
    updateItem,
    removeItem,
    duplicateItem,
    updateChairCount,
    updateChairType,
    autoArrangeChairs,
    getItemGuestCount,
  } = useAppStore();

  const selectedItem = items.find((i) => i.id === selectedItemId);

  if (!selectedItem) {
    return (
      <div className="p-4 text-center text-brand-green/60">
        <p className="text-sm">Select an item to view its properties</p>
      </div>
    );
  }

  const definition = ITEM_DEFINITIONS[selectedItem.type];
  const guestCount = getItemGuestCount(selectedItem);

  const handleRotate = (degrees: number) => {
    updateItem(selectedItem.id, {
      rotation: (selectedItem.rotation + degrees) % 360,
    });
  };

  const handleToggleLock = () => {
    updateItem(selectedItem.id, { locked: !selectedItem.locked });
  };

  const handleChairCountChange = (delta: number) => {
    if (selectedItem.chairCount !== undefined) {
      updateChairCount(selectedItem.id, selectedItem.chairCount + delta);
      autoArrangeChairs(selectedItem.id);
    }
  };

  const handleChairTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateChairType(selectedItem.id, e.target.value as ChairType);
    autoArrangeChairs(selectedItem.id);
  };

  const positionFtX = Math.round(selectedItem.position.x / PIXELS_PER_FOOT);
  const positionFtY = Math.round(selectedItem.position.y / PIXELS_PER_FOOT);

  return (
    <div className="p-4 space-y-4">
      {/* Item info */}
      <div className="pb-3 border-b border-brand-green/10">
        <h3 className="font-semibold text-brand-green">{definition.name}</h3>
        <p className="text-xs text-brand-green/60 mt-1">{definition.description}</p>
      </div>

      {/* Position and rotation */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-brand-green">Position</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded px-2 py-1 border border-brand-green/20">
            <span className="text-brand-green/60">X:</span> {positionFtX} ft
          </div>
          <div className="bg-white rounded px-2 py-1 border border-brand-green/20">
            <span className="text-brand-green/60">Y:</span> {positionFtY} ft
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-brand-green">Size</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded px-2 py-1 border border-brand-green/20">
            <span className="text-brand-green/60">W:</span> {definition.widthFt} ft
          </div>
          <div className="bg-white rounded px-2 py-1 border border-brand-green/20">
            <span className="text-brand-green/60">H:</span> {definition.heightFt} ft
          </div>
        </div>
      </div>

      {/* Rotation controls */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-brand-green">Rotation</p>
        <div className="flex items-center gap-2">
          <Tooltip content="Rotate 45° counter-clockwise">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate(-45)}
            >
              <RotateCw size={16} className="transform -scale-x-100" />
            </Button>
          </Tooltip>
          <span className="flex-1 text-center text-sm">{selectedItem.rotation}°</span>
          <Tooltip content="Rotate 45° clockwise">
            <Button variant="outline" size="sm" onClick={() => handleRotate(45)}>
              <RotateCw size={16} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Chair settings for tables */}
      {definition.category === 'table' && (
        <div className="space-y-3 pt-3 border-t border-brand-green/10">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-green" />
            <p className="text-xs font-medium text-brand-green">Chair Settings</p>
          </div>

          <Select
            label="Chair Type"
            options={CHAIR_OPTIONS}
            value={selectedItem.chairType || 'chair-chiavari'}
            onChange={handleChairTypeChange}
          />

          <div>
            <label className="block text-sm font-medium text-brand-green mb-1">
              Number of Chairs (max {definition.seatingCapacity})
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChairCountChange(-1)}
                disabled={(selectedItem.chairCount || 0) <= 0}
              >
                <Minus size={16} />
              </Button>
              <span className="flex-1 text-center font-medium">
                {selectedItem.chairCount || 0}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChairCountChange(1)}
                disabled={
                  (selectedItem.chairCount || 0) >= (definition.seatingCapacity || 0)
                }
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Guest count */}
      {guestCount > 0 && (
        <div className="bg-brand-pink/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand-green" />
            <span className="font-medium text-brand-green">
              {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-brand-green/10">
        <Tooltip content={selectedItem.locked ? 'Unlock position' : 'Lock position'}>
          <Button variant="outline" size="sm" onClick={handleToggleLock}>
            {selectedItem.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </Button>
        </Tooltip>

        <Tooltip content="Duplicate item">
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateItem(selectedItem.id)}
          >
            <Copy size={16} />
          </Button>
        </Tooltip>

        <Tooltip content="Delete item">
          <Button
            variant="danger"
            size="sm"
            onClick={() => removeItem(selectedItem.id)}
          >
            <Trash2 size={16} />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
