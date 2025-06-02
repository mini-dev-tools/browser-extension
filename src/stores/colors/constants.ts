/**
 * Color Store Constants
 * Default palettes, configuration values, and static data
 */

import type { ColorPalette, ColorSource, ColorFamily } from './types';

export const COLOR_HISTORY_LIMIT = 50;
export const PALETTE_VERSION = '1.0';

export const COLOR_SOURCE_DISPLAY_NAMES: Record<ColorSource, string> = {
  'picker': 'Color Picker',
  'palette': 'Palette',
  'generator': 'Gradient Generator',
  'shades': 'Color Shades',
  'material': 'Material Design',
  'eye_drop': 'Eyedropper',
  'contrast': 'Contrast Checker',
  'import': 'Imported',
  'manual': 'Manual Entry'
};

export const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: '1',
    name: 'Windows Phones',
    description: 'Microsoft Windows Phone color palette',
    colors: [
      { id: '1', name: 'Lime', hex: '#a4c400' },
      { id: '2', name: 'Green', hex: '#60a917' },
      { id: '3', name: 'Emerald', hex: '#008a00' },
      { id: '4', name: 'Teal', hex: '#00aba9' },
      { id: '5', name: 'Cyan', hex: '#1ba1e2' },
      { id: '6', name: 'Cobalt', hex: '#0050ef' },
      { id: '7', name: 'Indigo', hex: '#6a00ff' },
      { id: '8', name: 'Violet', hex: '#aa00ff' },
      { id: '9', name: 'Pink', hex: '#f472d0' },
      { id: '10', name: 'Magenta', hex: '#d80073' },
      { id: '11', name: 'Crimson', hex: '#a20025' },
      { id: '12', name: 'Red', hex: '#e51400' },
      { id: '13', name: 'Orange', hex: '#fa6800' },
      { id: '14', name: 'Amber', hex: '#f0a30a' },
      { id: '15', name: 'Yellow', hex: '#d8c100' },
      { id: '16', name: 'Brown', hex: '#825a2c' },
      { id: '17', name: 'Olive', hex: '#6d8764' },
      { id: '18', name: 'Steel', hex: '#647687' },
      { id: '19', name: 'Mauve', hex: '#76608a' },
      { id: '20', name: 'Sienna', hex: '#7a3b3f' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags: ['ui', 'mobile', 'brand', 'count-large', 'style-vibrant']
  },
  {
    id: '2',
    name: 'Tango Desktop Project',
    description: 'Open source desktop icon theme colors',
    colors: [
      { id: '1', name: 'Butter 1', hex: '#fce94f' },
      { id: '2', name: 'Butter 2', hex: '#edd400' },
      { id: '3', name: 'Butter 3', hex: '#c4a000' },
      { id: '4', name: 'Orange 1', hex: '#fcaf3e' },
      { id: '5', name: 'Orange 2', hex: '#f57900' },
      { id: '6', name: 'Orange 3', hex: '#ce5c00' },
      { id: '7', name: 'Chocolate 1', hex: '#e9b96e' },
      { id: '8', name: 'Chocolate 2', hex: '#c17d11' },
      { id: '9', name: 'Chocolate 3', hex: '#8f5902' },
      { id: '10', name: 'Chameleon 1', hex: '#8ae234' },
      { id: '11', name: 'Chameleon 2', hex: '#73d216' },
      { id: '12', name: 'Chameleon 3', hex: '#4e9a06' },
      { id: '13', name: 'Sky Blue 1', hex: '#729fcf' },
      { id: '14', name: 'Sky Blue 2', hex: '#3465a4' },
      { id: '15', name: 'Sky Blue 3', hex: '#204a87' },
      { id: '16', name: 'Plum 1', hex: '#ad7fa8' },
      { id: '17', name: 'Plum 2', hex: '#75507b' },
      { id: '18', name: 'Plum 3', hex: '#5c3566' },
      { id: '19', name: 'Scarlet Red 1', hex: '#ef2929' },
      { id: '20', name: 'Scarlet Red 2', hex: '#cc0000' },
      { id: '21', name: 'Scarlet Red 3', hex: '#a40000' },
      { id: '22', name: 'Aluminium 1', hex: '#eeeeec' },
      { id: '23', name: 'Aluminium 2', hex: '#d3d7cf' },
      { id: '24', name: 'Aluminium 3', hex: '#babdb6' },
      { id: '25', name: 'Aluminium 4', hex: '#888a85' },
      { id: '26', name: 'Aluminium 5', hex: '#555753' },
      { id: '27', name: 'Aluminium 6', hex: '#2e3436' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags: ['ui', 'tech-linux', 'count-large', 'style-flat']
  },
  {
    id: '3',
    name: 'Material Design',
    description: 'Google Material Design primary colors',
    colors: [
      { id: '1', name: 'Red', hex: '#F44336' },
      { id: '2', name: 'Pink', hex: '#E91E63' },
      { id: '3', name: 'Purple', hex: '#9C27B0' },
      { id: '4', name: 'Deep Purple', hex: '#673AB7' },
      { id: '5', name: 'Indigo', hex: '#3F51B5' },
      { id: '6', name: 'Blue', hex: '#2196F3' },
      { id: '7', name: 'Light Blue', hex: '#03A9F4' },
      { id: '8', name: 'Cyan', hex: '#00BCD4' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags: ['ui', 'type-primary', 'count-small', 'style-flat']
  },
  {
    id: '4',
    name: 'Tailwind CSS Colors',
    description: 'Popular Tailwind CSS primary colors (500 weight)',
    colors: [
      { id: '1', name: 'Slate', hex: '#64748b' },
      { id: '2', name: 'Gray', hex: '#6b7280' },
      { id: '3', name: 'Zinc', hex: '#71717a' },
      { id: '4', name: 'Neutral', hex: '#737373' },
      { id: '5', name: 'Stone', hex: '#78716c' },
      { id: '6', name: 'Red', hex: '#ef4444' },
      { id: '7', name: 'Orange', hex: '#f97316' },
      { id: '8', name: 'Amber', hex: '#f59e0b' },
      { id: '9', name: 'Yellow', hex: '#eab308' },
      { id: '10', name: 'Lime', hex: '#84cc16' },
      { id: '11', name: 'Green', hex: '#22c55e' },
      { id: '12', name: 'Emerald', hex: '#10b981' },
      { id: '13', name: 'Teal', hex: '#14b8a6' },
      { id: '14', name: 'Cyan', hex: '#06b6d4' },
      { id: '15', name: 'Sky', hex: '#0ea5e9' },
      { id: '16', name: 'Blue', hex: '#3b82f6' },
      { id: '17', name: 'Indigo', hex: '#6366f1' },
      { id: '18', name: 'Violet', hex: '#8b5cf6' },
      { id: '19', name: 'Purple', hex: '#a855f7' },
      { id: '20', name: 'Fuchsia', hex: '#d946ef' },
      { id: '21', name: 'Pink', hex: '#ec4899' },
      { id: '22', name: 'Rose', hex: '#f43f5e' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags: ['tech-css', 'web', 'count-large', 'type-primary']
  },
  {
    id: '5',
    name: 'Bootstrap Colors',
    description: 'Bootstrap CSS framework default semantic colors',
    colors: [
      { id: '1', name: 'Primary', hex: '#0d6efd' },
      { id: '2', name: 'Secondary', hex: '#6c757d' },
      { id: '3', name: 'Success', hex: '#198754' },
      { id: '4', name: 'Danger', hex: '#dc3545' },
      { id: '5', name: 'Warning', hex: '#ffc107' },
      { id: '6', name: 'Info', hex: '#0dcaf0' },
      { id: '7', name: 'Light', hex: '#f8f9fa' },
      { id: '8', name: 'Dark', hex: '#212529' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags: ['tech-css', 'web', 'count-small', 'type-semantic']
  }
];

export const PALETTE_TAGS = {
  TECHNOLOGY: ['tech-css', 'tech-react', 'tech-vue', 'tech-ios', 'tech-android', 'tech-linux'],
  STYLE: ['style-flat', 'style-modern', 'style-vibrant', 'style-minimal'],
  COUNT: ['count-small', 'count-medium', 'count-large'],
  TYPE: ['type-primary', 'type-semantic', 'type-accent'],
  CONTEXT: ['ui', 'web', 'mobile', 'brand', 'system', 'gaming']
} as const;

/**
 * Color Weight Constants
 */
export const MATERIAL_DESIGN_WEIGHTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export const TAILWIND_CSS_WEIGHTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Complete Material Design Color Families
 * Each color family contains variations from 50 (lightest) to 900 (darkest)
 */
export const MATERIAL_DESIGN_COLORS: ColorFamily[] = [
  {
    color: 'Red',
    variations: [
      { weight: 50, hex: '#FFEBEE' },
      { weight: 100, hex: '#FFCDD2' },
      { weight: 200, hex: '#EF9A9A' },
      { weight: 300, hex: '#E57373' },
      { weight: 400, hex: '#EF5350' },
      { weight: 500, hex: '#F44336' },
      { weight: 600, hex: '#E53935' },
      { weight: 700, hex: '#D32F2F' },
      { weight: 800, hex: '#C62828' },
      { weight: 900, hex: '#B71C1C' }
    ]
  },
  {
    color: 'Pink',
    variations: [
      { weight: 50, hex: '#FCE4EC' },
      { weight: 100, hex: '#F8BBD0' },
      { weight: 200, hex: '#F48FB1' },
      { weight: 300, hex: '#F06292' },
      { weight: 400, hex: '#EC407A' },
      { weight: 500, hex: '#E91E63' },
      { weight: 600, hex: '#D81B60' },
      { weight: 700, hex: '#C2185B' },
      { weight: 800, hex: '#AD1457' },
      { weight: 900, hex: '#880E4F' }
    ]
  },
  {
    color: 'Purple',
    variations: [
      { weight: 50, hex: '#F3E5F5' },
      { weight: 100, hex: '#E1BEE7' },
      { weight: 200, hex: '#CE93D8' },
      { weight: 300, hex: '#BA68C8' },
      { weight: 400, hex: '#AB47BC' },
      { weight: 500, hex: '#9C27B0' },
      { weight: 600, hex: '#8E24AA' },
      { weight: 700, hex: '#7B1FA2' },
      { weight: 800, hex: '#6A1B9A' },
      { weight: 900, hex: '#4A148C' }
    ]
  },
  {
    color: 'Deep Purple',
    variations: [
      { weight: 50, hex: '#EDE7F6' },
      { weight: 100, hex: '#D1C4E9' },
      { weight: 200, hex: '#B39DDB' },
      { weight: 300, hex: '#9575CD' },
      { weight: 400, hex: '#7E57C2' },
      { weight: 500, hex: '#673AB7' },
      { weight: 600, hex: '#5E35B1' },
      { weight: 700, hex: '#512DA8' },
      { weight: 800, hex: '#4527A0' },
      { weight: 900, hex: '#311B92' }
    ]
  },
  {
    color: 'Indigo',
    variations: [
      { weight: 50, hex: '#E8EAF6' },
      { weight: 100, hex: '#C5CAE9' },
      { weight: 200, hex: '#9FA8DA' },
      { weight: 300, hex: '#7986CB' },
      { weight: 400, hex: '#5C6BC0' },
      { weight: 500, hex: '#3F51B5' },
      { weight: 600, hex: '#3949AB' },
      { weight: 700, hex: '#303F9F' },
      { weight: 800, hex: '#283593' },
      { weight: 900, hex: '#1A237E' }
    ]
  },
  {
    color: 'Blue',
    variations: [
      { weight: 50, hex: '#E3F2FD' },
      { weight: 100, hex: '#BBDEFB' },
      { weight: 200, hex: '#90CAF9' },
      { weight: 300, hex: '#64B5F6' },
      { weight: 400, hex: '#42A5F5' },
      { weight: 500, hex: '#2196F3' },
      { weight: 600, hex: '#1E88E5' },
      { weight: 700, hex: '#1976D2' },
      { weight: 800, hex: '#1565C0' },
      { weight: 900, hex: '#0D47A1' }
    ]
  },
  {
    color: 'Light Blue',
    variations: [
      { weight: 50, hex: '#E1F5FE' },
      { weight: 100, hex: '#B3E5FC' },
      { weight: 200, hex: '#81D4FA' },
      { weight: 300, hex: '#4FC3F7' },
      { weight: 400, hex: '#29B6F6' },
      { weight: 500, hex: '#03A9F4' },
      { weight: 600, hex: '#039BE5' },
      { weight: 700, hex: '#0288D1' },
      { weight: 800, hex: '#0277BD' },
      { weight: 900, hex: '#01579B' }
    ]
  },
  {
    color: 'Cyan',
    variations: [
      { weight: 50, hex: '#E0F7FA' },
      { weight: 100, hex: '#B2EBF2' },
      { weight: 200, hex: '#80DEEA' },
      { weight: 300, hex: '#4DD0E1' },
      { weight: 400, hex: '#26C6DA' },
      { weight: 500, hex: '#00BCD4' },
      { weight: 600, hex: '#00ACC1' },
      { weight: 700, hex: '#0097A7' },
      { weight: 800, hex: '#00838F' },
      { weight: 900, hex: '#006064' }
    ]
  },
  {
    color: 'Teal',
    variations: [
      { weight: 50, hex: '#E0F2F1' },
      { weight: 100, hex: '#B2DFDB' },
      { weight: 200, hex: '#80CBC4' },
      { weight: 300, hex: '#4DB6AC' },
      { weight: 400, hex: '#26A69A' },
      { weight: 500, hex: '#009688' },
      { weight: 600, hex: '#00897B' },
      { weight: 700, hex: '#00796B' },
      { weight: 800, hex: '#00695C' },
      { weight: 900, hex: '#004D40' }
    ]
  },
  {
    color: 'Green',
    variations: [
      { weight: 50, hex: '#E8F5E9' },
      { weight: 100, hex: '#C8E6C9' },
      { weight: 200, hex: '#A5D6A7' },
      { weight: 300, hex: '#81C784' },
      { weight: 400, hex: '#66BB6A' },
      { weight: 500, hex: '#4CAF50' },
      { weight: 600, hex: '#43A047' },
      { weight: 700, hex: '#388E3C' },
      { weight: 800, hex: '#2E7D32' },
      { weight: 900, hex: '#1B5E20' }
    ]
  },
  {
    color: 'Light Green',
    variations: [
      { weight: 50, hex: '#F1F8E9' },
      { weight: 100, hex: '#DCEDC8' },
      { weight: 200, hex: '#C5E1A5' },
      { weight: 300, hex: '#AED581' },
      { weight: 400, hex: '#9CCC65' },
      { weight: 500, hex: '#8BC34A' },
      { weight: 600, hex: '#7CB342' },
      { weight: 700, hex: '#689F38' },
      { weight: 800, hex: '#558B2F' },
      { weight: 900, hex: '#33691E' }
    ]
  },
  {
    color: 'Lime',
    variations: [
      { weight: 50, hex: '#F9FBE7' },
      { weight: 100, hex: '#F0F4C3' },
      { weight: 200, hex: '#E6EE9C' },
      { weight: 300, hex: '#DCE775' },
      { weight: 400, hex: '#D4E157' },
      { weight: 500, hex: '#CDDC39' },
      { weight: 600, hex: '#C0CA33' },
      { weight: 700, hex: '#AFB42B' },
      { weight: 800, hex: '#9E9D24' },
      { weight: 900, hex: '#827717' }
    ]
  },
  {
    color: 'Yellow',
    variations: [
      { weight: 50, hex: '#FFFDE7' },
      { weight: 100, hex: '#FFF9C4' },
      { weight: 200, hex: '#FFF59D' },
      { weight: 300, hex: '#FFF176' },
      { weight: 400, hex: '#FFEE58' },
      { weight: 500, hex: '#FFEB3B' },
      { weight: 600, hex: '#FDD835' },
      { weight: 700, hex: '#FBC02D' },
      { weight: 800, hex: '#F9A825' },
      { weight: 900, hex: '#F57F17' }
    ]
  },
  {
    color: 'Amber',
    variations: [
      { weight: 50, hex: '#FFF8E1' },
      { weight: 100, hex: '#FFECB3' },
      { weight: 200, hex: '#FFE082' },
      { weight: 300, hex: '#FFD54F' },
      { weight: 400, hex: '#FFCA28' },
      { weight: 500, hex: '#FFC107' },
      { weight: 600, hex: '#FFB300' },
      { weight: 700, hex: '#FFA000' },
      { weight: 800, hex: '#FF8F00' },
      { weight: 900, hex: '#FF6F00' }
    ]
  },
  {
    color: 'Orange',
    variations: [
      { weight: 50, hex: '#FFF3E0' },
      { weight: 100, hex: '#FFE0B2' },
      { weight: 200, hex: '#FFCC80' },
      { weight: 300, hex: '#FFB74D' },
      { weight: 400, hex: '#FFA726' },
      { weight: 500, hex: '#FF9800' },
      { weight: 600, hex: '#FB8C00' },
      { weight: 700, hex: '#F57C00' },
      { weight: 800, hex: '#EF6C00' },
      { weight: 900, hex: '#E65100' }
    ]
  },
  {
    color: 'Deep Orange',
    variations: [
      { weight: 50, hex: '#FBE9E7' },
      { weight: 100, hex: '#FFCCBC' },
      { weight: 200, hex: '#FFAB91' },
      { weight: 300, hex: '#FF8A65' },
      { weight: 400, hex: '#FF7043' },
      { weight: 500, hex: '#FF5722' },
      { weight: 600, hex: '#F4511E' },
      { weight: 700, hex: '#E64A19' },
      { weight: 800, hex: '#D84315' },
      { weight: 900, hex: '#BF360C' }
    ]
  },
  {
    color: 'Brown',
    variations: [
      { weight: 50, hex: '#EFEBE9' },
      { weight: 100, hex: '#D7CCC8' },
      { weight: 200, hex: '#BCAAA4' },
      { weight: 300, hex: '#A1887F' },
      { weight: 400, hex: '#8D6E63' },
      { weight: 500, hex: '#795548' },
      { weight: 600, hex: '#6D4C41' },
      { weight: 700, hex: '#5D4037' },
      { weight: 800, hex: '#4E342E' },
      { weight: 900, hex: '#3E2723' }
    ]
  },
  {
    color: 'Grey',
    variations: [
      { weight: 50, hex: '#FAFAFA' },
      { weight: 100, hex: '#F5F5F5' },
      { weight: 200, hex: '#EEEEEE' },
      { weight: 300, hex: '#E0E0E0' },
      { weight: 400, hex: '#BDBDBD' },
      { weight: 500, hex: '#9E9E9E' },
      { weight: 600, hex: '#757575' },
      { weight: 700, hex: '#616161' },
      { weight: 800, hex: '#424242' },
      { weight: 900, hex: '#212121' }
    ]
  },
  {
    color: 'Blue Grey',
    variations: [
      { weight: 50, hex: '#ECEFF1' },
      { weight: 100, hex: '#CFD8DC' },
      { weight: 200, hex: '#B0BEC5' },
      { weight: 300, hex: '#90A4AE' },
      { weight: 400, hex: '#78909C' },
      { weight: 500, hex: '#607D8B' },
      { weight: 600, hex: '#546E7A' },
      { weight: 700, hex: '#455A64' },
      { weight: 800, hex: '#37474F' },
      { weight: 900, hex: '#263238' }
    ]
  }
];

/**
 * Complete Tailwind CSS Color Families
 * Each color family contains variations from 50 (lightest) to 950 (darkest)
 */
export const TAILWIND_CSS_COLORS: ColorFamily[] = [
  {
    color: 'Slate',
    variations: [
      { weight: 50, hex: '#f8fafc' },
      { weight: 100, hex: '#f1f5f9' },
      { weight: 200, hex: '#e2e8f0' },
      { weight: 300, hex: '#cbd5e1' },
      { weight: 400, hex: '#94a3b8' },
      { weight: 500, hex: '#64748b' },
      { weight: 600, hex: '#475569' },
      { weight: 700, hex: '#334155' },
      { weight: 800, hex: '#1e293b' },
      { weight: 900, hex: '#0f172a' },
      { weight: 950, hex: '#020617' }
    ]
  },
  {
    color: 'Gray',
    variations: [
      { weight: 50, hex: '#f9fafb' },
      { weight: 100, hex: '#f3f4f6' },
      { weight: 200, hex: '#e5e7eb' },
      { weight: 300, hex: '#d1d5db' },
      { weight: 400, hex: '#9ca3af' },
      { weight: 500, hex: '#6b7280' },
      { weight: 600, hex: '#4b5563' },
      { weight: 700, hex: '#374151' },
      { weight: 800, hex: '#1f2937' },
      { weight: 900, hex: '#111827' },
      { weight: 950, hex: '#030712' }
    ]
  },
  {
    color: 'Zinc',
    variations: [
      { weight: 50, hex: '#fafafa' },
      { weight: 100, hex: '#f4f4f5' },
      { weight: 200, hex: '#e4e4e7' },
      { weight: 300, hex: '#d4d4d8' },
      { weight: 400, hex: '#a1a1aa' },
      { weight: 500, hex: '#71717a' },
      { weight: 600, hex: '#52525b' },
      { weight: 700, hex: '#3f3f46' },
      { weight: 800, hex: '#27272a' },
      { weight: 900, hex: '#18181b' },
      { weight: 950, hex: '#09090b' }
    ]
  },
  {
    color: 'Neutral',
    variations: [
      { weight: 50, hex: '#fafafa' },
      { weight: 100, hex: '#f5f5f5' },
      { weight: 200, hex: '#e5e5e5' },
      { weight: 300, hex: '#d4d4d4' },
      { weight: 400, hex: '#a3a3a3' },
      { weight: 500, hex: '#737373' },
      { weight: 600, hex: '#525252' },
      { weight: 700, hex: '#404040' },
      { weight: 800, hex: '#262626' },
      { weight: 900, hex: '#171717' },
      { weight: 950, hex: '#0a0a0a' }
    ]
  },
  {
    color: 'Stone',
    variations: [
      { weight: 50, hex: '#fafaf9' },
      { weight: 100, hex: '#f5f5f4' },
      { weight: 200, hex: '#e7e5e4' },
      { weight: 300, hex: '#d6d3d1' },
      { weight: 400, hex: '#a8a29e' },
      { weight: 500, hex: '#78716c' },
      { weight: 600, hex: '#57534e' },
      { weight: 700, hex: '#44403c' },
      { weight: 800, hex: '#292524' },
      { weight: 900, hex: '#1c1917' },
      { weight: 950, hex: '#0c0a09' }
    ]
  },
  {
    color: 'Red',
    variations: [
      { weight: 50, hex: '#fef2f2' },
      { weight: 100, hex: '#fee2e2' },
      { weight: 200, hex: '#fecaca' },
      { weight: 300, hex: '#fca5a5' },
      { weight: 400, hex: '#f87171' },
      { weight: 500, hex: '#ef4444' },
      { weight: 600, hex: '#dc2626' },
      { weight: 700, hex: '#b91c1c' },
      { weight: 800, hex: '#991b1b' },
      { weight: 900, hex: '#7f1d1d' },
      { weight: 950, hex: '#450a0a' }
    ]
  },
  {
    color: 'Orange',
    variations: [
      { weight: 50, hex: '#fff7ed' },
      { weight: 100, hex: '#ffedd5' },
      { weight: 200, hex: '#fed7aa' },
      { weight: 300, hex: '#fdba74' },
      { weight: 400, hex: '#fb923c' },
      { weight: 500, hex: '#f97316' },
      { weight: 600, hex: '#ea580c' },
      { weight: 700, hex: '#c2410c' },
      { weight: 800, hex: '#9a3412' },
      { weight: 900, hex: '#7c2d12' },
      { weight: 950, hex: '#431407' }
    ]
  },
  {
    color: 'Amber',
    variations: [
      { weight: 50, hex: '#fffbeb' },
      { weight: 100, hex: '#fef3c7' },
      { weight: 200, hex: '#fde68a' },
      { weight: 300, hex: '#fcd34d' },
      { weight: 400, hex: '#fbbf24' },
      { weight: 500, hex: '#f59e0b' },
      { weight: 600, hex: '#d97706' },
      { weight: 700, hex: '#b45309' },
      { weight: 800, hex: '#92400e' },
      { weight: 900, hex: '#78350f' },
      { weight: 950, hex: '#451a03' }
    ]
  },
  {
    color: 'Yellow',
    variations: [
      { weight: 50, hex: '#fefce8' },
      { weight: 100, hex: '#fef9c3' },
      { weight: 200, hex: '#fef08a' },
      { weight: 300, hex: '#fde047' },
      { weight: 400, hex: '#facc15' },
      { weight: 500, hex: '#eab308' },
      { weight: 600, hex: '#ca8a04' },
      { weight: 700, hex: '#a16207' },
      { weight: 800, hex: '#854d0e' },
      { weight: 900, hex: '#713f12' },
      { weight: 950, hex: '#422006' }
    ]
  },
  {
    color: 'Lime',
    variations: [
      { weight: 50, hex: '#f7fee7' },
      { weight: 100, hex: '#ecfccb' },
      { weight: 200, hex: '#d9f99d' },
      { weight: 300, hex: '#bef264' },
      { weight: 400, hex: '#a3e635' },
      { weight: 500, hex: '#84cc16' },
      { weight: 600, hex: '#65a30d' },
      { weight: 700, hex: '#4d7c0f' },
      { weight: 800, hex: '#3f6212' },
      { weight: 900, hex: '#365314' },
      { weight: 950, hex: '#1a2e05' }
    ]
  },
  {
    color: 'Green',
    variations: [
      { weight: 50, hex: '#f0fdf4' },
      { weight: 100, hex: '#dcfce7' },
      { weight: 200, hex: '#bbf7d0' },
      { weight: 300, hex: '#86efac' },
      { weight: 400, hex: '#4ade80' },
      { weight: 500, hex: '#22c55e' },
      { weight: 600, hex: '#16a34a' },
      { weight: 700, hex: '#15803d' },
      { weight: 800, hex: '#166534' },
      { weight: 900, hex: '#14532d' },
      { weight: 950, hex: '#052e16' }
    ]
  },
  {
    color: 'Emerald',
    variations: [
      { weight: 50, hex: '#ecfdf5' },
      { weight: 100, hex: '#d1fae5' },
      { weight: 200, hex: '#a7f3d0' },
      { weight: 300, hex: '#6ee7b7' },
      { weight: 400, hex: '#34d399' },
      { weight: 500, hex: '#10b981' },
      { weight: 600, hex: '#059669' },
      { weight: 700, hex: '#047857' },
      { weight: 800, hex: '#065f46' },
      { weight: 900, hex: '#064e3b' },
      { weight: 950, hex: '#022c22' }
    ]
  },
  {
    color: 'Teal',
    variations: [
      { weight: 50, hex: '#f0fdfa' },
      { weight: 100, hex: '#ccfbf1' },
      { weight: 200, hex: '#99f6e4' },
      { weight: 300, hex: '#5eead4' },
      { weight: 400, hex: '#2dd4bf' },
      { weight: 500, hex: '#14b8a6' },
      { weight: 600, hex: '#0d9488' },
      { weight: 700, hex: '#0f766e' },
      { weight: 800, hex: '#115e59' },
      { weight: 900, hex: '#134e4a' },
      { weight: 950, hex: '#042f2e' }
    ]
  },
  {
    color: 'Cyan',
    variations: [
      { weight: 50, hex: '#ecfeff' },
      { weight: 100, hex: '#cffafe' },
      { weight: 200, hex: '#a5f3fc' },
      { weight: 300, hex: '#67e8f9' },
      { weight: 400, hex: '#22d3ee' },
      { weight: 500, hex: '#06b6d4' },
      { weight: 600, hex: '#0891b2' },
      { weight: 700, hex: '#0e7490' },
      { weight: 800, hex: '#155e75' },
      { weight: 900, hex: '#164e63' },
      { weight: 950, hex: '#083344' }
    ]
  },
  {
    color: 'Sky',
    variations: [
      { weight: 50, hex: '#f0f9ff' },
      { weight: 100, hex: '#e0f2fe' },
      { weight: 200, hex: '#bae6fd' },
      { weight: 300, hex: '#7dd3fc' },
      { weight: 400, hex: '#38bdf8' },
      { weight: 500, hex: '#0ea5e9' },
      { weight: 600, hex: '#0284c7' },
      { weight: 700, hex: '#0369a1' },
      { weight: 800, hex: '#075985' },
      { weight: 900, hex: '#0c4a6e' },
      { weight: 950, hex: '#082f49' }
    ]
  },
  {
    color: 'Blue',
    variations: [
      { weight: 50, hex: '#eff6ff' },
      { weight: 100, hex: '#dbeafe' },
      { weight: 200, hex: '#bfdbfe' },
      { weight: 300, hex: '#93c5fd' },
      { weight: 400, hex: '#60a5fa' },
      { weight: 500, hex: '#3b82f6' },
      { weight: 600, hex: '#2563eb' },
      { weight: 700, hex: '#1d4ed8' },
      { weight: 800, hex: '#1e40af' },
      { weight: 900, hex: '#1e3a8a' },
      { weight: 950, hex: '#172554' }
    ]
  },
  {
    color: 'Indigo',
    variations: [
      { weight: 50, hex: '#eef2ff' },
      { weight: 100, hex: '#e0e7ff' },
      { weight: 200, hex: '#c7d2fe' },
      { weight: 300, hex: '#a5b4fc' },
      { weight: 400, hex: '#818cf8' },
      { weight: 500, hex: '#6366f1' },
      { weight: 600, hex: '#4f46e5' },
      { weight: 700, hex: '#4338ca' },
      { weight: 800, hex: '#3730a3' },
      { weight: 900, hex: '#312e81' },
      { weight: 950, hex: '#1e1b4b' }
    ]
  },
  {
    color: 'Violet',
    variations: [
      { weight: 50, hex: '#f5f3ff' },
      { weight: 100, hex: '#ede9fe' },
      { weight: 200, hex: '#ddd6fe' },
      { weight: 300, hex: '#c4b5fd' },
      { weight: 400, hex: '#a78bfa' },
      { weight: 500, hex: '#8b5cf6' },
      { weight: 600, hex: '#7c3aed' },
      { weight: 700, hex: '#6d28d9' },
      { weight: 800, hex: '#5b21b6' },
      { weight: 900, hex: '#4c1d95' },
      { weight: 950, hex: '#2e1065' }
    ]
  },
  {
    color: 'Purple',
    variations: [
      { weight: 50, hex: '#faf5ff' },
      { weight: 100, hex: '#f3e8ff' },
      { weight: 200, hex: '#e9d5ff' },
      { weight: 300, hex: '#d8b4fe' },
      { weight: 400, hex: '#c084fc' },
      { weight: 500, hex: '#a855f7' },
      { weight: 600, hex: '#9333ea' },
      { weight: 700, hex: '#7e22ce' },
      { weight: 800, hex: '#6b21a8' },
      { weight: 900, hex: '#581c87' },
      { weight: 950, hex: '#3b0764' }
    ]
  },
  {
    color: 'Fuchsia',
    variations: [
      { weight: 50, hex: '#fdf4ff' },
      { weight: 100, hex: '#fae8ff' },
      { weight: 200, hex: '#f5d0fe' },
      { weight: 300, hex: '#f0abfc' },
      { weight: 400, hex: '#e879f9' },
      { weight: 500, hex: '#d946ef' },
      { weight: 600, hex: '#c026d3' },
      { weight: 700, hex: '#a21caf' },
      { weight: 800, hex: '#86198f' },
      { weight: 900, hex: '#701a75' },
      { weight: 950, hex: '#4a044e' }
    ]
  },
  {
    color: 'Pink',
    variations: [
      { weight: 50, hex: '#fdf2f8' },
      { weight: 100, hex: '#fce7f3' },
      { weight: 200, hex: '#fbcfe8' },
      { weight: 300, hex: '#f9a8d4' },
      { weight: 400, hex: '#f472b6' },
      { weight: 500, hex: '#ec4899' },
      { weight: 600, hex: '#db2777' },
      { weight: 700, hex: '#be185d' },
      { weight: 800, hex: '#9d174d' },
      { weight: 900, hex: '#831843' },
      { weight: 950, hex: '#500724' }
    ]
  },
  {
    color: 'Rose',
    variations: [
      { weight: 50, hex: '#fff1f2' },
      { weight: 100, hex: '#ffe4e6' },
      { weight: 200, hex: '#fecdd3' },
      { weight: 300, hex: '#fda4af' },
      { weight: 400, hex: '#fb7185' },
      { weight: 500, hex: '#f43f5e' },
      { weight: 600, hex: '#e11d48' },
      { weight: 700, hex: '#be123c' },
      { weight: 800, hex: '#9f1239' },
      { weight: 900, hex: '#881337' },
      { weight: 950, hex: '#4c0519' }
    ]
  }
];

/**
 * Gradient Generator Constants
 */
export const RANDOM_COLOR_PALETTE = [
  "#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", 
  "#34495e", "#2c3e50", "#ea4c88", "#ca2c68", "#9b59b6", "#8e44ad", 
  "#f1c40f", "#f39c12", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#7f8c8d"
] as const;

export const GRADIENT_PRESETS = [
  {
    style: { "background-image": "linear-gradient(45deg, #667eea 0%, #764ba2 100%)" },
    type: "linear",
    direction: 45,
    colors: [
      { value: "#667eea", stop: 0, status: "in" },
      { value: "#764ba2", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(to right, #ff7e5f 0%, #feb47b 100%)" },
    type: "linear", 
    direction: 90,
    colors: [
      { value: "#ff7e5f", stop: 0, status: "in" },
      { value: "#feb47b", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)" },
    type: "linear",
    direction: 120,
    colors: [
      { value: "#a8edea", stop: 0, status: "in" },
      { value: "#fed6e3", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)" },
    type: "linear",
    direction: 45,
    colors: [
      { value: "#ff9a9e", stop: 0, status: "in" },
      { value: "#fecfef", stop: 50, status: "in" },
      { value: "#fecfef", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "radial-gradient(circle, #667eea 0%, #764ba2 100%)" },
    type: "radial",
    direction: 0,
    colors: [
      { value: "#667eea", stop: 0, status: "in" },
      { value: "#764ba2", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    type: "linear",
    direction: 135,
    colors: [
      { value: "#667eea", stop: 0, status: "in" },
      { value: "#764ba2", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    type: "linear",
    direction: 135,
    colors: [
      { value: "#f093fb", stop: 0, status: "in" },
      { value: "#f5576c", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    type: "linear",
    direction: 135,
    colors: [
      { value: "#4facfe", stop: 0, status: "in" },
      { value: "#00f2fe", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    type: "linear",
    direction: 135,
    colors: [
      { value: "#43e97b", stop: 0, status: "in" },
      { value: "#38f9d7", stop: 100, status: "in" }
    ]
  },
  {
    style: { "background-image": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    type: "linear",
    direction: 135,
    colors: [
      { value: "#fa709a", stop: 0, status: "in" },
      { value: "#fee140", stop: 100, status: "in" }
    ]
  }
] as const;