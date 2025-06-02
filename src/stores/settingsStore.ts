import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

export type ColorCopyFormat = 
  | 'hex' 
  | 'rgb' 
  | 'rgba' 
  | 'hsl' 
  | 'hsla' 
  | 'hsv' 
  | 'css' 
  | 'tailwind' 
  | 'rgb-values' 
  | 'hsl-values';

export interface DashboardLayoutSettings {
  isCustomLayoutEnabled: boolean;
  toolOrder: string[];
  hiddenTools: string[];
  gridCols: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  groupingEnabled: boolean;
  customGroups: Array<{
    id: string;
    name: string;
    toolIds: string[];
    color?: string;
    collapsed?: boolean;
  }>;
  customToolData: Record<string, {
    customName?: string;
    customDescription?: string;
  }>;
  customCategoryNames: Record<string, string>;
}

export interface AppSettings {
  preferredCopyFormat: ColorCopyFormat;
  enableDoubleClickCopy: boolean;
  showCopyToasts: boolean;
  contextMenuPosition: 'cursor' | 'center';
  autoAddToHistory: boolean;
  maxHistoryItems: number;
  dashboardLayout: DashboardLayoutSettings;
}

const defaultSettings: AppSettings = {
  preferredCopyFormat: 'hex',
  enableDoubleClickCopy: true,
  showCopyToasts: true,
  contextMenuPosition: 'cursor',
  autoAddToHistory: true,
  maxHistoryItems: 50,
  dashboardLayout: {
    isCustomLayoutEnabled: false,
    toolOrder: [],
    hiddenTools: [],
    gridCols: {
      mobile: 4,
      tablet: 4,
      desktop: 6
    },
    groupingEnabled: false,
    customGroups: [],
    customToolData: {},
    customCategoryNames: {}
  }
};

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const settings = useLocalStorage<AppSettings>('app-settings', defaultSettings)
    
    // Ensure dashboardLayout exists for backwards compatibility
    if (!settings.value.dashboardLayout) {
      settings.value.dashboardLayout = { ...defaultSettings.dashboardLayout }
    }
    
    return { settings }
  },

  getters: {
    getPreferredCopyFormat: (state) => state.settings.preferredCopyFormat,
    isDoubleClickCopyEnabled: (state) => state.settings.enableDoubleClickCopy,
    shouldShowCopyToasts: (state) => state.settings.showCopyToasts,
    getContextMenuPosition: (state) => state.settings.contextMenuPosition,
    shouldAutoAddToHistory: (state) => state.settings.autoAddToHistory,
    getMaxHistoryItems: (state) => state.settings.maxHistoryItems,
    
    // Dashboard layout getters
    getDashboardLayout: (state) => state.settings.dashboardLayout || defaultSettings.dashboardLayout,
    isCustomLayoutEnabled: (state) => state.settings.dashboardLayout?.isCustomLayoutEnabled ?? defaultSettings.dashboardLayout.isCustomLayoutEnabled,
    getToolOrder: (state) => state.settings.dashboardLayout?.toolOrder ?? defaultSettings.dashboardLayout.toolOrder,
    getHiddenTools: (state) => state.settings.dashboardLayout?.hiddenTools ?? defaultSettings.dashboardLayout.hiddenTools,
    getGridCols: (state) => state.settings.dashboardLayout?.gridCols ?? defaultSettings.dashboardLayout.gridCols,
    isGroupingEnabled: (state) => state.settings.dashboardLayout?.groupingEnabled ?? defaultSettings.dashboardLayout.groupingEnabled,
    getCustomGroups: (state) => state.settings.dashboardLayout?.customGroups ?? defaultSettings.dashboardLayout.customGroups,
    getCustomToolData: (state) => state.settings.dashboardLayout?.customToolData ?? defaultSettings.dashboardLayout.customToolData,
    getCustomCategoryNames: (state) => state.settings.dashboardLayout?.customCategoryNames ?? defaultSettings.dashboardLayout.customCategoryNames
  },

  actions: {
    updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
      this.settings[key] = value;
    },

    resetSettings() {
      this.settings = { ...defaultSettings };
    },

    exportSettings(): string {
      return JSON.stringify(this.settings, null, 2);
    },

    importSettings(settingsJson: string): boolean {
      try {
        const imported = JSON.parse(settingsJson) as AppSettings;
        
        // Validate the imported settings
        if (this.validateSettings(imported)) {
          this.settings = { ...defaultSettings, ...imported };
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to import settings:', error);
        return false;
      }
    },

    validateSettings(settings: Partial<AppSettings>): boolean {
      const validFormats: ColorCopyFormat[] = [
        'hex', 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 
        'css', 'tailwind', 'rgb-values', 'hsl-values'
      ];
      
      if (settings.preferredCopyFormat && !validFormats.includes(settings.preferredCopyFormat)) {
        return false;
      }
      
      if (settings.maxHistoryItems && (settings.maxHistoryItems < 10 || settings.maxHistoryItems > 200)) {
        return false;
      }
      
      return true;
    },

    getCopyFormatDetails() {
      return [
        { key: 'hex', label: 'HEX', example: '#FF5733' },
        { key: 'rgb', label: 'RGB', example: 'rgb(255, 87, 51)' },
        { key: 'rgba', label: 'RGBA', example: 'rgba(255, 87, 51, 1)' },
        { key: 'hsl', label: 'HSL', example: 'hsl(9, 100%, 60%)' },
        { key: 'hsla', label: 'HSLA', example: 'hsla(9, 100%, 60%, 1)' },
        { key: 'hsv', label: 'HSV', example: 'hsv(9, 80%, 100%)' },
        { key: 'css', label: 'CSS Variable', example: '--color: #ff5733;' },
        { key: 'tailwind', label: 'Tailwind RGB', example: 'rgb(255 87 51)' },
        { key: 'rgb-values', label: 'RGB Values', example: '255, 87, 51' },
        { key: 'hsl-values', label: 'HSL Values', example: '9, 100%, 60%' }
      ] as const;
    },

    // Dashboard layout actions
    toggleCustomLayout() {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      this.settings.dashboardLayout.isCustomLayoutEnabled = !this.settings.dashboardLayout.isCustomLayoutEnabled;
    },

    updateToolOrder(newOrder: string[]) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      this.settings.dashboardLayout.toolOrder = newOrder;
    },

    toggleToolVisibility(toolId: string) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      const hiddenIndex = this.settings.dashboardLayout.hiddenTools.indexOf(toolId);
      if (hiddenIndex > -1) {
        this.settings.dashboardLayout.hiddenTools.splice(hiddenIndex, 1);
      } else {
        this.settings.dashboardLayout.hiddenTools.push(toolId);
      }
    },

    updateGridCols(device: keyof DashboardLayoutSettings['gridCols'], cols: number) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      this.settings.dashboardLayout.gridCols[device] = cols;
    },

    toggleGrouping() {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      this.settings.dashboardLayout.groupingEnabled = !this.settings.dashboardLayout.groupingEnabled;
    },

    addCustomGroup(group: { name: string; toolIds: string[]; color?: string }) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      const newGroup = {
        id: `group_${Date.now()}`,
        ...group,
        collapsed: false
      };
      this.settings.dashboardLayout.customGroups.push(newGroup);
    },

    updateCustomGroup(groupId: string, updates: Partial<DashboardLayoutSettings['customGroups'][0]>) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      const groupIndex = this.settings.dashboardLayout.customGroups.findIndex(g => g.id === groupId);
      if (groupIndex > -1) {
        this.settings.dashboardLayout.customGroups[groupIndex] = {
          ...this.settings.dashboardLayout.customGroups[groupIndex],
          ...updates
        };
      }
    },

    removeCustomGroup(groupId: string) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      const groupIndex = this.settings.dashboardLayout.customGroups.findIndex(g => g.id === groupId);
      if (groupIndex > -1) {
        this.settings.dashboardLayout.customGroups.splice(groupIndex, 1);
      }
    },

    resetDashboardLayout() {
      this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
    },

    // Tool and category customization actions
    updateToolCustomData(toolId: string, data: { customName?: string; customDescription?: string }) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      if (!this.settings.dashboardLayout.customToolData) {
        this.settings.dashboardLayout.customToolData = {};
      }
      
      this.settings.dashboardLayout.customToolData[toolId] = {
        ...this.settings.dashboardLayout.customToolData[toolId],
        ...data
      };
    },

    updateCategoryName(categoryId: string, newName: string) {
      if (!this.settings.dashboardLayout) {
        this.settings.dashboardLayout = { ...defaultSettings.dashboardLayout };
      }
      if (!this.settings.dashboardLayout.customCategoryNames) {
        this.settings.dashboardLayout.customCategoryNames = {};
      }
      
      this.settings.dashboardLayout.customCategoryNames[categoryId] = newName;
    },

    resetToolCustomData(toolId: string) {
      if (this.settings.dashboardLayout?.customToolData?.[toolId]) {
        delete this.settings.dashboardLayout.customToolData[toolId];
      }
    },

    resetCategoryName(categoryId: string) {
      if (this.settings.dashboardLayout?.customCategoryNames?.[categoryId]) {
        delete this.settings.dashboardLayout.customCategoryNames[categoryId];
      }
    }
  }
});