// Core types for Tent Mapper

export type ItemType =
  | 'tent-20x20'
  | 'tent-20x30'
  | 'tent-10x10'
  | 'tent-10x20'
  | 'table-round-5ft'
  | 'table-rect-6ft'
  | 'table-rect-8ft'
  | 'chair-fanback'
  | 'chair-resin'
  | 'chair-folding'
  | 'chair-chiavari'
  | 'dancefloor-white'
  | 'dancefloor-black'
  | 'dj-booth'
  | 'bar'
  | 'buffet';

export type ChairType = 'chair-fanback' | 'chair-resin' | 'chair-folding' | 'chair-chiavari';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasItem {
  id: string;
  type: ItemType;
  position: Position;
  rotation: number;
  // For tables with chairs
  chairType?: ChairType;
  chairCount?: number;
  // For dance floors
  tilesWide?: number;
  tilesDeep?: number;
  // For ceremony seating rows
  ceremonyRowWidth?: number;
  // For grouping (e.g., tent with items inside)
  parentId?: string;
  // Is this item locked
  locked?: boolean;
}

export interface ItemDefinition {
  type: ItemType;
  name: string;
  category: 'tent' | 'table' | 'chair' | 'dancefloor' | 'equipment';
  // Size in feet
  widthFt: number;
  heightFt: number;
  // For round items, use diameter
  isRound?: boolean;
  diameterFt?: number;
  // Seating capacity (for tables)
  seatingCapacity?: number;
  // Color for rendering
  fillColor: string;
  strokeColor: string;
  // Icon for the sidebar
  icon?: string;
  // Description for tooltips
  description: string;
}

export interface Layout {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: CanvasItem[];
  canvasSize: Size;
  // For vendor multi-tenancy
  vendorId?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isOptional?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  layouts: string[]; // Layout IDs
}

export interface AppState {
  // Current layout
  currentLayout: Layout | null;
  items: CanvasItem[];
  selectedItemId: string | null;

  // Canvas state
  canvasScale: number;
  canvasOffset: Position;
  showGrid: boolean;

  // Wizard state
  wizardEnabled: boolean;
  currentWizardStep: number;

  // UI state
  sidebarOpen: boolean;
  activeCategory: ItemDefinition['category'] | 'all';

  // Auth state
  isAuthenticated: boolean;
  isEmbedMode: boolean;
  currentVendor: Vendor | null;

  // Guest count
  totalGuestCount: number;
}

// Pixels per foot for canvas rendering
export const PIXELS_PER_FOOT = 10;

// Canvas dimensions (300ft x 300ft)
export const CANVAS_WIDTH_FT = 300;
export const CANVAS_HEIGHT_FT = 300;
export const CANVAS_WIDTH_PX = CANVAS_WIDTH_FT * PIXELS_PER_FOOT;
export const CANVAS_HEIGHT_PX = CANVAS_HEIGHT_FT * PIXELS_PER_FOOT;

// Item definitions
export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  // Tents
  'tent-20x20': {
    type: 'tent-20x20',
    name: '20x20 Tent',
    category: 'tent',
    widthFt: 20,
    heightFt: 20,
    fillColor: 'rgba(235, 192, 207, 0.3)',
    strokeColor: '#284F3F',
    description: '20ft x 20ft frame tent - fits up to 40 guests seated',
  },
  'tent-20x30': {
    type: 'tent-20x30',
    name: '20x30 Tent',
    category: 'tent',
    widthFt: 20,
    heightFt: 30,
    fillColor: 'rgba(235, 192, 207, 0.3)',
    strokeColor: '#284F3F',
    description: '20ft x 30ft frame tent - fits up to 60 guests seated',
  },
  'tent-10x10': {
    type: 'tent-10x10',
    name: '10x10 Popup',
    category: 'tent',
    widthFt: 10,
    heightFt: 10,
    fillColor: 'rgba(235, 192, 207, 0.3)',
    strokeColor: '#284F3F',
    description: '10ft x 10ft popup tent - great for small gatherings',
  },
  'tent-10x20': {
    type: 'tent-10x20',
    name: '10x20 Popup',
    category: 'tent',
    widthFt: 10,
    heightFt: 20,
    fillColor: 'rgba(235, 192, 207, 0.3)',
    strokeColor: '#284F3F',
    description: '10ft x 10ft popup tent - great for buffet or bar area',
  },

  // Tables
  'table-round-5ft': {
    type: 'table-round-5ft',
    name: '5ft Round Table',
    category: 'table',
    widthFt: 5,
    heightFt: 5,
    isRound: true,
    diameterFt: 5,
    seatingCapacity: 8,
    fillColor: '#FEFAF6',
    strokeColor: '#284F3F',
    description: '5ft round table - seats up to 8 guests',
  },
  'table-rect-6ft': {
    type: 'table-rect-6ft',
    name: '6ft Rectangular Table',
    category: 'table',
    widthFt: 6,
    heightFt: 2.5,
    seatingCapacity: 6,
    fillColor: '#FEFAF6',
    strokeColor: '#284F3F',
    description: '6ft plastic rectangular table - seats up to 6 guests',
  },
  'table-rect-8ft': {
    type: 'table-rect-8ft',
    name: '8ft Banquet Table',
    category: 'table',
    widthFt: 8,
    heightFt: 2.5,
    seatingCapacity: 8,
    fillColor: '#8B4513',
    strokeColor: '#284F3F',
    description: '8ft wooden banquet table - seats up to 8 guests',
  },

  // Chairs
  'chair-fanback': {
    type: 'chair-fanback',
    name: 'White Fanback Chair',
    category: 'chair',
    widthFt: 1.5,
    heightFt: 1.5,
    fillColor: '#FFFFFF',
    strokeColor: '#284F3F',
    description: 'White fanback folding chair',
  },
  'chair-resin': {
    type: 'chair-resin',
    name: 'White Resin Chair',
    category: 'chair',
    widthFt: 1.5,
    heightFt: 1.5,
    fillColor: '#F8F8F8',
    strokeColor: '#284F3F',
    description: 'White resin folding chair',
  },
  'chair-folding': {
    type: 'chair-folding',
    name: 'Black Folding Chair',
    category: 'chair',
    widthFt: 1.5,
    heightFt: 1.5,
    fillColor: '#1a1a1a',
    strokeColor: '#333333',
    description: 'Black plastic folding chair',
  },
  'chair-chiavari': {
    type: 'chair-chiavari',
    name: 'White Chiavari Chair',
    category: 'chair',
    widthFt: 1.5,
    heightFt: 1.5,
    fillColor: '#FFFFF0',
    strokeColor: '#D4AF37',
    description: 'Elegant white chiavari chair',
  },

  // Dance Floors
  'dancefloor-white': {
    type: 'dancefloor-white',
    name: 'White Dance Floor',
    category: 'dancefloor',
    widthFt: 4,
    heightFt: 4,
    fillColor: '#FFFFFF',
    strokeColor: '#CCCCCC',
    description: '4x4ft white dance floor tile - combine up to 8x8ft',
  },
  'dancefloor-black': {
    type: 'dancefloor-black',
    name: 'Black Dance Floor',
    category: 'dancefloor',
    widthFt: 4,
    heightFt: 4,
    fillColor: '#1a1a1a',
    strokeColor: '#333333',
    description: '4x4ft black dance floor tile - combine up to 8x8ft',
  },

  // Equipment
  'dj-booth': {
    type: 'dj-booth',
    name: 'DJ Booth',
    category: 'equipment',
    widthFt: 6,
    heightFt: 3,
    fillColor: '#284F3F',
    strokeColor: '#1A352A',
    description: 'DJ booth/table setup',
  },
  'bar': {
    type: 'bar',
    name: 'Bar',
    category: 'equipment',
    widthFt: 8,
    heightFt: 2,
    fillColor: '#8B4513',
    strokeColor: '#5C3317',
    description: 'Bar service area',
  },
  'buffet': {
    type: 'buffet',
    name: 'Buffet Table',
    category: 'equipment',
    widthFt: 8,
    heightFt: 2.5,
    fillColor: '#FEFAF6',
    strokeColor: '#284F3F',
    description: 'Buffet serving table',
  },
};

// Category labels for UI
export const CATEGORY_LABELS: Record<ItemDefinition['category'] | 'all', string> = {
  all: 'All Items',
  tent: 'Tents',
  table: 'Tables',
  chair: 'Chairs',
  dancefloor: 'Dance Floors',
  equipment: 'Equipment',
};
