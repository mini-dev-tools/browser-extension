<template>
  <div class="color-selector relative">
    <!-- Color Preview Button -->
    <button
      @click="togglePopover"
      class="w-full h-10 rounded-md border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-between px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :style="{ borderLeftColor: modelValue, borderLeftWidth: '6px' }"
    >
      <span class="font-mono text-sm">{{ modelValue.toUpperCase() }}</span>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </button>

    <!-- Popover Content -->
    <div
      v-if="showPopover"
      class="absolute top-full left-0 right-0 z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
      @click.stop
    >
      <div class="space-y-4">
        <!-- Manual Color Input -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">Manual Color</Label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Input
                v-model="tempColor"
                placeholder="#FF5722"
                class="font-mono pr-10"
                @input="updateFromInput"
              />
              <button
                @click="openColorPicker"
                class="absolute right-1 top-1 w-8 h-8 rounded border-2 border-border"
                :style="{ backgroundColor: isValidHex(tempColor) ? tempColor : '#ccc' }"
              >
                <input
                  ref="colorInput"
                  type="color"
                  v-model="tempColor"
                  class="sr-only"
                  @input="updateFromInput"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Colors -->
        <ColorHistoryPreview
          v-if="showRecents && recentColors.length > 0"
          :colors="recentColors"
          title="Recent Colors"
          size="md"
          :columns="8"
          :show-clear-button="false"
          :show-remove-buttons="false"
          :show-source-badges="false"
          @select="handleColorSelect"
        />

        <!-- Palette Colors -->
        <div v-if="showPalettes && paletteStore.palettes.length > 0" class="space-y-4 max-h-64 overflow-y-auto">
          <div
            v-for="palette in paletteStore.palettes"
            :key="palette.id"
            class="space-y-2"
          >
            <div class="flex items-center justify-between">
              <Label class="text-sm font-medium">{{ palette.name }}</Label>
              <span class="text-xs text-muted-foreground">{{ palette.colors.length }} colors</span>
            </div>
            <ColorPalettePreview
              :colors="palette.colors.map((c: any) => c.hex)"
              :colors-per-row="0"
              height="auto"
              row-height="2.5rem"
              :show-hex="false"
              @color-copied="selectColor"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end pt-2 border-t">
          <Button
            @click="togglePopover"
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showPopover"
      class="fixed inset-0 z-40"
      @click="togglePopover"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useColorsStore } from '@/stores/colors';
import ColorPalettePreview from './ColorPalettePreview.vue';
import ColorHistoryPreview from './ColorHistoryPreview.vue';

export default defineComponent({
  name: 'ColorSelector',
  components: {
    Button,
    Input,
    Label,
    ChevronDown,
    ColorPalettePreview,
    ColorHistoryPreview
  },
  props: {
    modelValue: {
      type: String,
      required: true,
      default: '#3B82F6'
    },
    placeholder: {
      type: String,
      default: 'Select a color...'
    },
    showRecents: {
      type: Boolean,
      default: true
    },
    showPalettes: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const paletteStore = useColorsStore();
    return { paletteStore };
  },
  data() {
    return {
      showPopover: false,
      tempColor: this.modelValue
    };
  },
  computed: {
    recentColors() {
      return this.paletteStore.getRecentColors(20);
    }
  },
  watch: {
    modelValue(newValue) {
      this.tempColor = newValue;
    },
    showPopover(newValue) {
      if (newValue) {
        this.tempColor = this.modelValue;
      }
    }
  },
  methods: {
    togglePopover() {
      this.showPopover = !this.showPopover;
    },
    
    openColorPicker() {
      const input = this.$refs.colorInput as HTMLInputElement;
      if (input) {
        input.click();
      }
    },
    
    isValidHex(color: string): boolean {
      return /^#[0-9A-F]{6}$/i.test(color);
    },
    
    updateFromInput() {
      if (this.isValidHex(this.tempColor)) {
        // Auto-apply valid colors for immediate feedback
        this.$emit('update:modelValue', this.tempColor);
      }
    },
    
    selectColor(hex: string) {
      this.tempColor = hex;
      this.$emit('update:modelValue', hex);
      this.paletteStore.addToHistory(hex, 'generator');
      this.togglePopover();
    },
    
    handleColorSelect(historyItem: any) {
      this.selectColor(historyItem.hex);
    }
  },
  mounted() {
    // Close popover when clicking outside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.showPopover) {
        this.showPopover = false;
      }
    });
  }
});
</script>

<style scoped>
.color-selector {
  position: relative;
}

input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 0.25rem;
}

/* Custom scrollbar for palette colors */
.max-h-64::-webkit-scrollbar {
  width: 4px;
}

.max-h-64::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-64::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 2px;
}
</style>