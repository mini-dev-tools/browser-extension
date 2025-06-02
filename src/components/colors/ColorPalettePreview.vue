<template>
  <div class="color-palette-preview" :style="{ height: height }">
    <div class="space-y-1 h-full overflow-auto">
      <div
        class="flex w-full overflow-hidden rounded-md border"
        v-for="(row, rowIndex) in colorRows"
        :key="rowIndex"
        :style="{ minHeight: rowHeight }"
      >
        <ColorContextProvider
          :color="color"
          :color-name="getColorName(color, rowIndex, colorIndex)"
          :source="contextSource"
          :source-name="contextSourceName"
          v-for="(color, colorIndex) in row"
          :key="colorIndex"
        >
          <div
            class="group flex-1 flex items-center justify-center text-xs font-mono cursor-pointer relative overflow-hidden transition-all duration-300 max-md:hover:flex-[2] hover:z-10 max-md:hover:text-sm"
            :style="{ height: rowHeight, ...boxStyle(color) }"
            :title="getTooltipText(color)"
            @click="copyColor(color)"
          >
            <!-- Copy animation overlay -->
            <div 
              v-if="copiedColor === color"
              class="absolute inset-0 bg-white/30 flex items-center justify-center animate-pulse z-20"
            >
              <span class="text-xs font-bold text-current">
                ✓ COPIED
              </span>
            </div>
            
            <!-- Hex text -->
            <span 
              v-else
              class="font-semibold select-all opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              {{ showHex ? color.toUpperCase() : '' }}
            </span>
          </div>
        </ColorContextProvider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { getLuma } from '../../helpers/ColorShades';
import ColorContextProvider from '@/components/colors/ColorContextProvider.vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useColorsStore } from '@/stores/colors';
import { ColorConverter } from '@/helpers/colorConversions';
import { toast } from 'vue-sonner';

export default defineComponent({
  name: 'ColorPalettePreview',
  components: {
    ColorContextProvider
  },
  setup() {
    const settingsStore = useSettingsStore();
    const paletteStore = useColorsStore();
    return {
      settingsStore,
      paletteStore
    };
  },
  props: {
    colors: {
      type: Array as PropType<string[]>,
      required: true,
      default: () => []
    },
    colorsPerRow: {
      type: Number,
      default: 0 // 0 means all colors in one row
    },
    height: {
      type: String,
      default: 'auto'
    },
    rowHeight: {
      type: String,
      default: '3rem' // 48px
    },
    showHex: {
      type: Boolean,
      default: true
    },
    enableCopy: {
      type: Boolean,
      default: true
    },
    contextSource: {
      type: String,
      default: 'palette'
    },
    contextSourceName: {
      type: String,
      default: ''
    },
    paletteColorNames: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  
  data() {
    return {
      copiedColor: null as string | null
    };
  },

  computed: {
    colorRows() {
      if (this.colorsPerRow === 0) {
        // All colors in one row
        return [this.colors];
      }
      
      // Split colors into rows
      const rows = [];
      for (let i = 0; i < this.colors.length; i += this.colorsPerRow) {
        rows.push(this.colors.slice(i, i + this.colorsPerRow));
      }
      return rows;
    }
  },

  methods: {
    boxStyle(hex: string) {
      return {
        color: this.guessForegroundColor(hex),
        background: hex,
        padding: '0px',
        margin: '0px'
      };
    },

    guessForegroundColor(bgHex: string) {
      return getLuma(bgHex) > 164 ? '#000' : '#fff';
    },

    getColorName(color: string, rowIndex: number, colorIndex: number): string {
      // If specific color names are provided, use them
      if (this.paletteColorNames.length > 0) {
        const flatIndex = this.colorsPerRow === 0 
          ? colorIndex 
          : rowIndex * this.colorsPerRow + colorIndex;
        return this.paletteColorNames[flatIndex] || color.toUpperCase();
      }
      
      // Default to hex value
      return color.toUpperCase();
    },

    async copyColor(hex: string) {
      if (!this.enableCopy) return;
      
      try {
        // Get the preferred format from settings
        const preferredFormat = this.settingsStore.getPreferredCopyFormat;
        const formats = ColorConverter.hexToAllFormats(hex);
        
        // Map format keys to actual values
        let copyValue: string;
        switch (preferredFormat) {
          case 'hex': copyValue = formats.hexString; break;
          case 'rgb': copyValue = formats.rgbString; break;
          case 'rgba': copyValue = formats.rgbaString; break;
          case 'hsl': copyValue = formats.hslString; break;
          case 'hsla': copyValue = formats.hslaString; break;
          case 'hsv': copyValue = formats.hsvString; break;
          case 'css': copyValue = formats.cssVar; break;
          case 'tailwind': copyValue = formats.tailwindRgb; break;
          case 'rgb-values': copyValue = formats.rgbValues; break;
          case 'hsl-values': copyValue = formats.hslValues; break;
          default: copyValue = hex; // fallback to hex
        }
        
        await navigator.clipboard.writeText(copyValue);
        this.copiedColor = hex;
        this.$emit('colorCopied', hex);
        
        // Auto-add to history if enabled in settings
        if (this.settingsStore.shouldAutoAddToHistory) {
          const colorIndex = this.colors.indexOf(hex);
          const colorName = this.paletteColorNames.length > 0 ? 
            this.paletteColorNames[colorIndex] : hex.toUpperCase();
          
          this.paletteStore.addToHistory(
            hex,
            this.contextSource as any,
            this.contextSourceName || colorName,
            colorName
          );
        }
        
        // Show toast notification if enabled
        if (this.settingsStore.shouldShowCopyToasts) {
          const formatLabel = this.getFormatLabel(preferredFormat);
          toast(`${formatLabel} copied`, {
            description: copyValue,
            duration: 2000,
            style: {
              borderLeft: `4px solid ${hex}`
            }
          });
        }
        
        // Reset after animation
        setTimeout(() => {
          this.copiedColor = null;
        }, 1000);
      } catch (err) {
        console.error('Failed to copy color: ', err);
        this.$emit('copyError', err);
      }
    },
    
    getFormatLabel(formatKey: string): string {
      const formatLabels: Record<string, string> = {
        'hex': 'HEX',
        'rgb': 'RGB',
        'rgba': 'RGBA', 
        'hsl': 'HSL',
        'hsla': 'HSLA',
        'hsv': 'HSV',
        'css': 'CSS Variable',
        'tailwind': 'Tailwind RGB',
        'rgb-values': 'RGB Values',
        'hsl-values': 'HSL Values'
      };
      return formatLabels[formatKey] || 'Color';
    },
    
    getTooltipText(color: string): string {
      const preferredFormat = this.settingsStore.getPreferredCopyFormat;
      const formatLabel = this.getFormatLabel(preferredFormat);
      
      if (preferredFormat === 'hex') {
        return `Click to copy ${color.toUpperCase()}`;
      } else {
        return `${color.toUpperCase()} • Click to copy as ${formatLabel}`;
      }
    }
  },

  emits: ['colorCopied', 'copyError']
});
</script>

<style scoped>
.color-palette-preview {
  width: 100%;
}
</style>