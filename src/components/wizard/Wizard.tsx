import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Tent,
  Users,
  Music,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { Button, Select } from '../ui';
import type { ItemType, ChairType } from '../../types';
import { ITEM_DEFINITIONS } from '../../types';

interface WizardStepProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({
  children,
  title,
  description,
  icon,
}) => (
  <div className="animate-slide-in">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center text-brand-green">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-brand-green">{title}</h3>
        <p className="text-sm text-brand-green/70">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

export const Wizard: React.FC = () => {
  const {
    wizardEnabled,
    currentWizardStep,
    nextWizardStep,
    prevWizardStep,
    skipWizard,
    addItem,
    addTableWithChairs,
    addDanceFloor,
    addCeremonySeating,
    newLayout,
  } = useAppStore();

  // Wizard form state
  const [eventType, setEventType] = useState<'reception' | 'ceremony' | 'both'>('reception');
  const [selectedTents, setSelectedTents] = useState<ItemType[]>([]);
  const [guestCount, setGuestCount] = useState(50);
  const [tableType, setTableType] = useState<ItemType>('table-round-5ft');
  const [chairType, setChairType] = useState<ChairType>('chair-chiavari');
  const [wantsDanceFloor, setWantsDanceFloor] = useState(false);
  const [danceFloorSize, setDanceFloorSize] = useState<'4x4' | '8x8' | '12x12' | '16x16'>('8x8');
  const [danceFloorColor, setDanceFloorColor] = useState<'white' | 'black' | 'mixed'>('white');
  const [wantsBar, setWantsBar] = useState(false);
  const [wantsBuffet, setWantsBuffet] = useState(false);
  const [wantsDJ, setWantsDJ] = useState(false);
  const [ceremonyRows, setCeremonyRows] = useState(10);
  const [ceremonyChairsPerRow, setCeremonyChairsPerRow] = useState(10);

  if (!wizardEnabled) return null;

  const TENT_OPTIONS: { value: ItemType; label: string }[] = [
    { value: 'tent-20x20', label: '20x20 Tent' },
    { value: 'tent-20x30', label: '20x30 Tent' },
    { value: 'tent-20x60', label: '20x60 Tent (2x 20x30)' },
    { value: 'tent-30x40', label: '30x40 Marquee Tent' },
    { value: 'tent-10x10', label: '10x10 Popup' },
    { value: 'tent-10x20', label: '10x20 Popup' },
  ];

  const TABLE_OPTIONS: { value: ItemType; label: string }[] = [
    { value: 'table-round-5ft', label: '5ft Round (8-10 seats)' },
    { value: 'table-rect-6ft', label: '6ft Rectangular (6-8 seats)' },
    { value: 'table-rect-8ft', label: '8ft Banquet (8-10 seats)' },
  ];

  const CHAIR_OPTIONS: { value: ChairType; label: string }[] = [
    { value: 'chair-fanback', label: 'White Fanback' },
    { value: 'chair-resin', label: 'White Resin' },
    { value: 'chair-folding', label: 'Black Folding' },
    { value: 'chair-chiavari', label: 'White Chiavari' },
  ];

  const toggleTent = (tent: ItemType) => {
    setSelectedTents((prev) =>
      prev.includes(tent) ? prev.filter((t) => t !== tent) : [...prev, tent]
    );
  };

  const calculateTables = () => {
    const def = ITEM_DEFINITIONS[tableType];
    const seatsPerTable = def.seatingCapacity || 8;
    return Math.ceil(guestCount / seatsPerTable);
  };

  const handleComplete = () => {
    // Create new layout
    newLayout('My Event Layout');

    // Add tents
    let offsetX = 500;
    selectedTents.forEach((tent, i) => {
      addItem(tent, { x: offsetX + i * 300, y: 500 });
    });

    // Add tables based on guest count
    if (eventType !== 'ceremony') {
      const numTables = calculateTables();
      const tablesPerRow = Math.ceil(Math.sqrt(numTables));
      const tableSpacing = 120;

      for (let i = 0; i < numTables; i++) {
        const row = Math.floor(i / tablesPerRow);
        const col = i % tablesPerRow;
        addTableWithChairs(tableType, chairType, {
          x: 600 + col * tableSpacing,
          y: 600 + row * tableSpacing,
        });
      }
    }

    // Add dance floor
    if (wantsDanceFloor) {
      const sizes: Record<string, [number, number]> = {
        '4x4': [1, 1],
        '8x8': [2, 2],
        '12x12': [3, 3],
        '16x16': [4, 4],
      };
      const [w, h] = sizes[danceFloorSize];
      addDanceFloor(danceFloorColor, w, h, { x: 1000, y: 600 });
    }

    // Add equipment
    if (wantsDJ) {
      addItem('dj-booth', { x: 1000, y: 400 });
    }
    if (wantsBar) {
      addItem('bar', { x: 300, y: 500 });
    }
    if (wantsBuffet) {
      addItem('buffet', { x: 300, y: 700 });
    }

    // Add ceremony seating
    if (eventType === 'ceremony' || eventType === 'both') {
      addCeremonySeating(chairType, ceremonyRows, ceremonyChairsPerRow, 4, {
        x: 1500,
        y: 500,
      });
    }

    skipWizard();
  };

  const steps = [
    // Step 0: Welcome
    <WizardStep
      key="welcome"
      title="Welcome to Tent Mapper!"
      description="Let's help you plan your perfect event layout"
      icon={<Sparkles size={24} />}
    >
      <div className="space-y-4">
        <p className="text-brand-green/80">
          This wizard will guide you through setting up your event space. We'll ask you
          a few questions about your event, and then automatically create a starting
          layout for you to customize.
        </p>
        <div className="bg-brand-green/5 rounded-lg p-4">
          <p className="text-sm text-brand-green/70">
            <strong>Tip:</strong> You can skip this wizard at any time and start from
            scratch by dragging items from the sidebar.
          </p>
        </div>
      </div>
    </WizardStep>,

    // Step 1: Event Type
    <WizardStep
      key="event-type"
      title="What type of event?"
      description="Select the type of event you're planning"
      icon={<Users size={24} />}
    >
      <div className="grid grid-cols-1 gap-3">
        {[
          { value: 'reception', label: 'Reception Only', desc: 'Tables, chairs, and entertainment' },
          { value: 'ceremony', label: 'Ceremony Only', desc: 'Rows of chairs for a ceremony' },
          { value: 'both', label: 'Ceremony & Reception', desc: 'Both ceremony seating and reception tables' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setEventType(option.value as typeof eventType)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              eventType === option.value
                ? 'border-brand-green bg-brand-green/10'
                : 'border-brand-green/20 hover:border-brand-pink'
            }`}
          >
            <span className="font-medium text-brand-green">{option.label}</span>
            <p className="text-sm text-brand-green/60 mt-1">{option.desc}</p>
          </button>
        ))}
      </div>
    </WizardStep>,

    // Step 2: Tents
    <WizardStep
      key="tents"
      title="Select Your Tents"
      description="Choose the tents you need (you can add more later)"
      icon={<Tent size={24} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {TENT_OPTIONS.map((tent) => {
            const def = ITEM_DEFINITIONS[tent.value];
            return (
              <button
                key={tent.value}
                onClick={() => toggleTent(tent.value)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  selectedTents.includes(tent.value)
                    ? 'border-brand-green bg-brand-green/10'
                    : 'border-brand-green/20 hover:border-brand-pink'
                }`}
              >
                <Tent
                  size={32}
                  className={`mx-auto mb-2 ${
                    selectedTents.includes(tent.value)
                      ? 'text-brand-green'
                      : 'text-brand-green/50'
                  }`}
                />
                <span className="font-medium text-brand-green block">{tent.label}</span>
                <span className="text-xs text-brand-green/60">
                  {def.widthFt}ft x {def.heightFt}ft
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-brand-green/60">
          Selected: {selectedTents.length === 0 ? 'None' : selectedTents.map(t => ITEM_DEFINITIONS[t].name).join(', ')}
        </p>
      </div>
    </WizardStep>,

    // Step 3: Guest Count & Tables (if reception)
    ...(eventType !== 'ceremony'
      ? [
          <WizardStep
            key="guests"
            title="Guest Count & Tables"
            description="How many guests are you expecting?"
            icon={<Users size={24} />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-green mb-2">
                  Number of Guests
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-brand-green/60 mt-1">
                  <span>10</span>
                  <span className="font-bold text-brand-green">{guestCount} guests</span>
                  <span>300</span>
                </div>
              </div>

              <Select
                label="Table Style"
                options={TABLE_OPTIONS}
                value={tableType}
                onChange={(e) => setTableType(e.target.value as ItemType)}
              />

              <Select
                label="Chair Style"
                options={CHAIR_OPTIONS}
                value={chairType}
                onChange={(e) => setChairType(e.target.value as ChairType)}
              />

              <div className="bg-brand-pink/20 rounded-lg p-4">
                <p className="text-sm text-brand-green">
                  Based on your selections, you'll need approximately{' '}
                  <strong>{calculateTables()} tables</strong> to seat {guestCount} guests.
                </p>
              </div>
            </div>
          </WizardStep>,
        ]
      : []),

    // Step 4: Ceremony seating (if ceremony)
    ...(eventType === 'ceremony' || eventType === 'both'
      ? [
          <WizardStep
            key="ceremony"
            title="Ceremony Seating"
            description="Set up your ceremony chair arrangement"
            icon={<Users size={24} />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-green mb-2">
                  Number of Rows: {ceremonyRows}
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={ceremonyRows}
                  onChange={(e) => setCeremonyRows(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-green mb-2">
                  Chairs Per Row: {ceremonyChairsPerRow}
                </label>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="2"
                  value={ceremonyChairsPerRow}
                  onChange={(e) => setCeremonyChairsPerRow(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Select
                label="Chair Style"
                options={CHAIR_OPTIONS}
                value={chairType}
                onChange={(e) => setChairType(e.target.value as ChairType)}
              />

              <div className="bg-brand-pink/20 rounded-lg p-4">
                <p className="text-sm text-brand-green">
                  Total ceremony seating: <strong>{ceremonyRows * ceremonyChairsPerRow} chairs</strong>
                  <br />
                  <span className="text-brand-green/60">(with center aisle)</span>
                </p>
              </div>
            </div>
          </WizardStep>,
        ]
      : []),

    // Step 5: Extras
    <WizardStep
      key="extras"
      title="Additional Items"
      description="Add entertainment and service areas"
      icon={<Music size={24} />}
    >
      <div className="space-y-4">
        {/* Dance Floor */}
        <div className="p-4 rounded-lg border-2 border-brand-green/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wantsDanceFloor}
              onChange={(e) => setWantsDanceFloor(e.target.checked)}
              className="w-5 h-5 rounded border-brand-green text-brand-green focus:ring-brand-green"
            />
            <span className="font-medium text-brand-green">Dance Floor</span>
          </label>
          {wantsDanceFloor && (
            <div className="mt-3 pl-8 space-y-3">
              <Select
                label="Size"
                options={[
                  { value: '4x4', label: '4x4 ft (1 tile)' },
                  { value: '8x8', label: '8x8 ft (4 tiles)' },
                  { value: '12x12', label: '12x12 ft (9 tiles)' },
                  { value: '16x16', label: '16x16 ft (16 tiles)' },
                ]}
                value={danceFloorSize}
                onChange={(e) => setDanceFloorSize(e.target.value as typeof danceFloorSize)}
              />
              <Select
                label="Color"
                options={[
                  { value: 'white', label: 'White' },
                  { value: 'black', label: 'Black' },
                  { value: 'mixed', label: 'Mixed (Checkerboard)' },
                ]}
                value={danceFloorColor}
                onChange={(e) => setDanceFloorColor(e.target.value as typeof danceFloorColor)}
              />
            </div>
          )}
        </div>

        {/* DJ Booth */}
        <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-brand-green/20 cursor-pointer">
          <input
            type="checkbox"
            checked={wantsDJ}
            onChange={(e) => setWantsDJ(e.target.checked)}
            className="w-5 h-5 rounded border-brand-green text-brand-green focus:ring-brand-green"
          />
          <span className="font-medium text-brand-green">DJ Booth</span>
        </label>

        {/* Bar */}
        <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-brand-green/20 cursor-pointer">
          <input
            type="checkbox"
            checked={wantsBar}
            onChange={(e) => setWantsBar(e.target.checked)}
            className="w-5 h-5 rounded border-brand-green text-brand-green focus:ring-brand-green"
          />
          <span className="font-medium text-brand-green">Bar</span>
        </label>

        {/* Buffet */}
        <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-brand-green/20 cursor-pointer">
          <input
            type="checkbox"
            checked={wantsBuffet}
            onChange={(e) => setWantsBuffet(e.target.checked)}
            className="w-5 h-5 rounded border-brand-green text-brand-green focus:ring-brand-green"
          />
          <span className="font-medium text-brand-green">Buffet Table</span>
        </label>
      </div>
    </WizardStep>,

    // Step 6: Summary
    <WizardStep
      key="summary"
      title="Ready to Create!"
      description="Review your selections"
      icon={<CheckCircle size={24} />}
    >
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-brand-green/20">
          <h4 className="font-medium text-brand-green mb-2">Your Event Setup:</h4>
          <ul className="space-y-1 text-sm text-brand-green/80">
            <li>• Event Type: {eventType === 'both' ? 'Ceremony & Reception' : eventType}</li>
            <li>• Tents: {selectedTents.length > 0 ? selectedTents.map(t => ITEM_DEFINITIONS[t].name).join(', ') : 'None'}</li>
            {eventType !== 'ceremony' && (
              <>
                <li>• Guests: {guestCount}</li>
                <li>• Tables: {calculateTables()} x {ITEM_DEFINITIONS[tableType].name}</li>
                <li>• Chairs: {ITEM_DEFINITIONS[chairType].name}</li>
              </>
            )}
            {(eventType === 'ceremony' || eventType === 'both') && (
              <li>• Ceremony: {ceremonyRows} rows x {ceremonyChairsPerRow} chairs</li>
            )}
            {wantsDanceFloor && <li>• Dance Floor: {danceFloorSize} {danceFloorColor}</li>}
            {wantsDJ && <li>• DJ Booth</li>}
            {wantsBar && <li>• Bar</li>}
            {wantsBuffet && <li>• Buffet Table</li>}
          </ul>
        </div>
        <p className="text-sm text-brand-green/60">
          Click "Create Layout" to generate your starting layout. You can then drag items
          to reposition them, add more items, or remove items you don't need.
        </p>
      </div>
    </WizardStep>,
  ];

  const totalSteps = steps.length;
  const isLastStep = currentWizardStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-brand-cream rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-green/10">
          <div className="flex items-center gap-2">
            {/* Progress dots */}
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentWizardStep
                    ? 'w-6 bg-brand-green'
                    : i < currentWizardStep
                    ? 'bg-brand-green'
                    : 'bg-brand-green/20'
                }`}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={skipWizard}>
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{steps[currentWizardStep]}</div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-brand-green/10 bg-white/50">
          <Button
            variant="ghost"
            onClick={skipWizard}
            className="text-brand-green/60"
          >
            Skip wizard
          </Button>
          <div className="flex gap-2">
            {currentWizardStep > 0 && (
              <Button variant="outline" onClick={prevWizardStep}>
                <ChevronLeft size={18} />
                Back
              </Button>
            )}
            {isLastStep ? (
              <Button variant="primary" onClick={handleComplete}>
                <Sparkles size={18} className="mr-1" />
                Create Layout
              </Button>
            ) : (
              <Button variant="primary" onClick={nextWizardStep}>
                Next
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
