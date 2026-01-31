import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import type { CanvasItem, Layout, Position, ItemType, ChairType } from '../types';
import {
  ITEM_DEFINITIONS,
  CANVAS_WIDTH_FT,
  CANVAS_HEIGHT_FT,
  PIXELS_PER_FOOT,
} from '../types';

interface AppStore {
  // Layout state
  currentLayout: Layout | null;
  items: CanvasItem[];
  selectedItemId: string | null;
  selectedItemIds: string[];

  // Canvas state
  canvasScale: number;
  canvasOffset: Position;
  showGrid: boolean;

  // Wizard state
  wizardEnabled: boolean;
  currentWizardStep: number;
  wizardCompleted: boolean;

  // UI state
  sidebarOpen: boolean;
  activeCategory: 'all' | 'tent' | 'table' | 'chair' | 'dancefloor' | 'equipment';

  // Auth state
  isAuthenticated: boolean;
  isEmbedMode: boolean;
  vendorId: string | null;

  // Actions
  // Item actions
  addItem: (type: ItemType, position?: Position) => string;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  selectMultipleItems: (ids: string[]) => void;
  clearSelection: () => void;

  // Table with chairs
  addTableWithChairs: (
    tableType: ItemType,
    chairType: ChairType,
    position?: Position
  ) => string;
  updateChairCount: (tableId: string, count: number) => void;
  updateChairType: (tableId: string, chairType: ChairType) => void;

  // Dance floor
  addDanceFloor: (
    color: 'white' | 'black' | 'mixed',
    tilesWide: number,
    tilesDeep: number,
    position?: Position
  ) => string;

  // Ceremony seating
  addCeremonySeating: (
    chairType: ChairType,
    rows: number,
    chairsPerRow: number,
    aisleWidth: number,
    position?: Position
  ) => string[];

  // Auto arrangement
  autoArrangeChairs: (tableId: string) => void;

  // Canvas actions
  setCanvasScale: (scale: number) => void;
  setCanvasOffset: (offset: Position) => void;
  toggleGrid: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Layout actions
  newLayout: (name?: string) => void;
  saveLayout: () => Layout;
  loadLayout: (layout: Layout) => void;
  getSavedLayouts: () => Layout[];
  deleteLayout: (id: string) => void;

  // Wizard actions
  setWizardEnabled: (enabled: boolean) => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  skipWizard: () => void;
  resetWizard: () => void;

  // UI actions
  toggleSidebar: () => void;
  setActiveCategory: (category: 'all' | 'tent' | 'table' | 'chair' | 'dancefloor' | 'equipment') => void;

  // Auth actions
  login: (password: string) => boolean;
  logout: () => void;
  setEmbedMode: (isEmbed: boolean) => void;

  // Guest count
  getTotalGuestCount: () => number;
  getItemGuestCount: (item: CanvasItem) => number;
}

const STAFF_PASSWORD = 'forever2024'; // Simple password for now

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLayout: null,
      items: [],
      selectedItemId: null,
      selectedItemIds: [],
      canvasScale: 1,
      canvasOffset: { x: 0, y: 0 },
      showGrid: true,
      wizardEnabled: Cookies.get('wizardDisabled') !== 'true',
      currentWizardStep: 0,
      wizardCompleted: false,
      sidebarOpen: true,
      activeCategory: 'all',
      isAuthenticated: false,
      isEmbedMode: false,
      vendorId: null,

      // Item actions
      addItem: (type, position) => {
        const id = uuidv4();
        const newItem: CanvasItem = {
          id,
          type,
          position: position || {
            x: (CANVAS_WIDTH_FT / 2) * PIXELS_PER_FOOT,
            y: (CANVAS_HEIGHT_FT / 2) * PIXELS_PER_FOOT,
          },
          rotation: 0,
        };
        set((state) => ({ items: [...state.items, newItem] }));
        return id;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id && item.parentId !== id
          ),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        }));
      },

      duplicateItem: (id) => {
        const state = get();
        const item = state.items.find((i) => i.id === id);
        if (item) {
          const newId = uuidv4();
          const newItem: CanvasItem = {
            ...item,
            id: newId,
            position: {
              x: item.position.x + 30,
              y: item.position.y + 30,
            },
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },

      selectItem: (id) => {
        set({ selectedItemId: id, selectedItemIds: id ? [id] : [] });
      },

      selectMultipleItems: (ids) => {
        set({ selectedItemIds: ids, selectedItemId: ids[0] || null });
      },

      clearSelection: () => {
        set({ selectedItemId: null, selectedItemIds: [] });
      },

      // Table with chairs
      addTableWithChairs: (tableType, chairType, position) => {
        const id = uuidv4();
        const def = ITEM_DEFINITIONS[tableType];
        const newItem: CanvasItem = {
          id,
          type: tableType,
          position: position || {
            x: (CANVAS_WIDTH_FT / 2) * PIXELS_PER_FOOT,
            y: (CANVAS_HEIGHT_FT / 2) * PIXELS_PER_FOOT,
          },
          rotation: 0,
          chairType,
          chairCount: def.seatingCapacity || 0,
        };
        set((state) => ({ items: [...state.items, newItem] }));
        return id;
      },

      updateChairCount: (tableId, count) => {
        const item = get().items.find((i) => i.id === tableId);
        if (item) {
          const def = ITEM_DEFINITIONS[item.type];
          const maxChairs = def.seatingCapacity || 0;
          get().updateItem(tableId, {
            chairCount: Math.min(Math.max(0, count), maxChairs),
          });
        }
      },

      updateChairType: (tableId, chairType) => {
        get().updateItem(tableId, { chairType });
      },

      // Dance floor
      addDanceFloor: (color, tilesWide, tilesDeep, position) => {
        const id = uuidv4();
        const type = color === 'black' ? 'dancefloor-black' : 'dancefloor-white';
        const newItem: CanvasItem = {
          id,
          type,
          position: position || {
            x: (CANVAS_WIDTH_FT / 2) * PIXELS_PER_FOOT,
            y: (CANVAS_HEIGHT_FT / 2) * PIXELS_PER_FOOT,
          },
          rotation: 0,
          tilesWide,
          tilesDeep,
        };
        set((state) => ({ items: [...state.items, newItem] }));
        return id;
      },

      // Ceremony seating
      addCeremonySeating: (chairType, rows, chairsPerRow, aisleWidth, position) => {
        const chairDef = ITEM_DEFINITIONS[chairType];
        const chairWidthPx = chairDef.widthFt * PIXELS_PER_FOOT;
        const chairHeightPx = chairDef.heightFt * PIXELS_PER_FOOT;
        const aisleWidthPx = aisleWidth * PIXELS_PER_FOOT;
        const rowSpacing = chairHeightPx + 5;
        const chairSpacing = chairWidthPx + 2;

        const basePos = position || {
          x: (CANVAS_WIDTH_FT / 4) * PIXELS_PER_FOOT,
          y: (CANVAS_HEIGHT_FT / 4) * PIXELS_PER_FOOT,
        };

        const chairIds: string[] = [];
        const halfChairs = Math.floor(chairsPerRow / 2);

        for (let row = 0; row < rows; row++) {
          // Left side
          for (let col = 0; col < halfChairs; col++) {
            const id = uuidv4();
            const newChair: CanvasItem = {
              id,
              type: chairType,
              position: {
                x: basePos.x + col * chairSpacing,
                y: basePos.y + row * rowSpacing,
              },
              rotation: 0,
            };
            chairIds.push(id);
            set((state) => ({ items: [...state.items, newChair] }));
          }
          // Right side
          for (let col = 0; col < halfChairs; col++) {
            const id = uuidv4();
            const newChair: CanvasItem = {
              id,
              type: chairType,
              position: {
                x: basePos.x + halfChairs * chairSpacing + aisleWidthPx + col * chairSpacing,
                y: basePos.y + row * rowSpacing,
              },
              rotation: 0,
            };
            chairIds.push(id);
            set((state) => ({ items: [...state.items, newChair] }));
          }
        }
        return chairIds;
      },

      // Auto arrangement
      autoArrangeChairs: (tableId) => {
        const state = get();
        const table = state.items.find((i) => i.id === tableId);
        if (!table || !table.chairType || !table.chairCount) return;

        const tableDef = ITEM_DEFINITIONS[table.type];
        const chairDef = ITEM_DEFINITIONS[table.chairType];

        // Remove existing auto-arranged chairs for this table
        set((s) => ({
          items: s.items.filter((i) => i.parentId !== tableId),
        }));

        const chairCount = table.chairCount;

        if (tableDef.isRound) {
          // Arrange chairs in a circle around round table
          const radius = (tableDef.diameterFt! / 2 + chairDef.widthFt / 2 + 0.5) * PIXELS_PER_FOOT;
          for (let i = 0; i < chairCount; i++) {
            const angle = (2 * Math.PI * i) / chairCount - Math.PI / 2;
            const id = uuidv4();
            const newChair: CanvasItem = {
              id,
              type: table.chairType,
              position: {
                x: table.position.x + radius * Math.cos(angle),
                y: table.position.y + radius * Math.sin(angle),
              },
              rotation: (angle * 180) / Math.PI + 90,
              parentId: tableId,
            };
            set((s) => ({ items: [...s.items, newChair] }));
          }
        } else {
          // Arrange chairs around rectangular table
          const tableWidthPx = tableDef.widthFt * PIXELS_PER_FOOT;
          const tableHeightPx = tableDef.heightFt * PIXELS_PER_FOOT;
          const offset = (chairDef.widthFt / 2 + 0.3) * PIXELS_PER_FOOT;

          // Distribute chairs: prioritize long sides
          const longSideChairs = Math.ceil(chairCount / 2);
          const perSide = Math.ceil(longSideChairs / 2);

          let placed = 0;
          // Top side
          for (let i = 0; i < perSide && placed < chairCount; i++) {
            const id = uuidv4();
            const spacing = tableWidthPx / (perSide + 1);
            set((s) => ({
              items: [
                ...s.items,
                {
                  id,
                  type: table.chairType!,
                  position: {
                    x: table.position.x - tableWidthPx / 2 + spacing * (i + 1),
                    y: table.position.y - tableHeightPx / 2 - offset,
                  },
                  rotation: 180,
                  parentId: tableId,
                },
              ],
            }));
            placed++;
          }
          // Bottom side
          for (let i = 0; i < perSide && placed < chairCount; i++) {
            const id = uuidv4();
            const spacing = tableWidthPx / (perSide + 1);
            set((s) => ({
              items: [
                ...s.items,
                {
                  id,
                  type: table.chairType!,
                  position: {
                    x: table.position.x - tableWidthPx / 2 + spacing * (i + 1),
                    y: table.position.y + tableHeightPx / 2 + offset,
                  },
                  rotation: 0,
                  parentId: tableId,
                },
              ],
            }));
            placed++;
          }
          // End chairs if any remaining
          if (placed < chairCount) {
            set((s) => ({
              items: [
                ...s.items,
                {
                  id: uuidv4(),
                  type: table.chairType!,
                  position: {
                    x: table.position.x - tableWidthPx / 2 - offset,
                    y: table.position.y,
                  },
                  rotation: 90,
                  parentId: tableId,
                },
              ],
            }));
            placed++;
          }
          if (placed < chairCount) {
            set((s) => ({
              items: [
                ...s.items,
                {
                  id: uuidv4(),
                  type: table.chairType!,
                  position: {
                    x: table.position.x + tableWidthPx / 2 + offset,
                    y: table.position.y,
                  },
                  rotation: -90,
                  parentId: tableId,
                },
              ],
            }));
          }
        }
      },

      // Canvas actions
      setCanvasScale: (scale) => {
        set({ canvasScale: Math.min(Math.max(0.25, scale), 3) });
      },

      setCanvasOffset: (offset) => {
        set({ canvasOffset: offset });
      },

      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },

      zoomIn: () => {
        set((state) => ({
          canvasScale: Math.min(state.canvasScale + 0.1, 3),
        }));
      },

      zoomOut: () => {
        set((state) => ({
          canvasScale: Math.max(state.canvasScale - 0.1, 0.25),
        }));
      },

      resetZoom: () => {
        set({ canvasScale: 1, canvasOffset: { x: 0, y: 0 } });
      },

      // Layout actions
      newLayout: (name) => {
        const id = uuidv4();
        const layout: Layout = {
          id,
          name: name || `Layout ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [],
          canvasSize: {
            width: CANVAS_WIDTH_FT * PIXELS_PER_FOOT,
            height: CANVAS_HEIGHT_FT * PIXELS_PER_FOOT,
          },
        };
        set({
          currentLayout: layout,
          items: [],
          selectedItemId: null,
          selectedItemIds: [],
        });
      },

      saveLayout: () => {
        const state = get();
        const layout: Layout = {
          id: state.currentLayout?.id || uuidv4(),
          name: state.currentLayout?.name || `Layout ${new Date().toLocaleDateString()}`,
          createdAt: state.currentLayout?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: state.items,
          canvasSize: {
            width: CANVAS_WIDTH_FT * PIXELS_PER_FOOT,
            height: CANVAS_HEIGHT_FT * PIXELS_PER_FOOT,
          },
          vendorId: state.vendorId || undefined,
        };

        // Save to localStorage
        const savedLayouts = JSON.parse(
          localStorage.getItem('tentMapper_layouts') || '[]'
        ) as Layout[];
        const existingIndex = savedLayouts.findIndex((l) => l.id === layout.id);
        if (existingIndex >= 0) {
          savedLayouts[existingIndex] = layout;
        } else {
          savedLayouts.push(layout);
        }
        localStorage.setItem('tentMapper_layouts', JSON.stringify(savedLayouts));

        set({ currentLayout: layout });
        return layout;
      },

      loadLayout: (layout) => {
        set({
          currentLayout: layout,
          items: layout.items,
          selectedItemId: null,
          selectedItemIds: [],
        });
      },

      getSavedLayouts: () => {
        return JSON.parse(
          localStorage.getItem('tentMapper_layouts') || '[]'
        ) as Layout[];
      },

      deleteLayout: (id) => {
        const savedLayouts = JSON.parse(
          localStorage.getItem('tentMapper_layouts') || '[]'
        ) as Layout[];
        const filtered = savedLayouts.filter((l) => l.id !== id);
        localStorage.setItem('tentMapper_layouts', JSON.stringify(filtered));
        const state = get();
        if (state.currentLayout?.id === id) {
          set({ currentLayout: null, items: [] });
        }
      },

      // Wizard actions
      setWizardEnabled: (enabled) => {
        Cookies.set('wizardDisabled', enabled ? 'false' : 'true', { expires: 365 });
        set({ wizardEnabled: enabled });
      },

      nextWizardStep: () => {
        set((state) => ({ currentWizardStep: state.currentWizardStep + 1 }));
      },

      prevWizardStep: () => {
        set((state) => ({
          currentWizardStep: Math.max(0, state.currentWizardStep - 1),
        }));
      },

      skipWizard: () => {
        Cookies.set('wizardDisabled', 'true', { expires: 365 });
        set({ wizardEnabled: false, wizardCompleted: true });
      },

      resetWizard: () => {
        Cookies.remove('wizardDisabled');
        set({ wizardEnabled: true, currentWizardStep: 0, wizardCompleted: false });
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setActiveCategory: (category) => {
        set({ activeCategory: category });
      },

      // Auth actions
      login: (password) => {
        if (password === STAFF_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      setEmbedMode: (isEmbed) => {
        set({ isEmbedMode: isEmbed });
      },

      // Guest count
      getTotalGuestCount: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          return total + get().getItemGuestCount(item);
        }, 0);
      },

      getItemGuestCount: (item) => {
        const def = ITEM_DEFINITIONS[item.type];
        if (def.category === 'table') {
          return item.chairCount || def.seatingCapacity || 0;
        }
        if (def.category === 'chair' && !item.parentId) {
          return 1;
        }
        return 0;
      },
    }),
    {
      name: 'tent-mapper-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        showGrid: state.showGrid,
      }),
    }
  )
);
