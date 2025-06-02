<template>
  <div class="palette-dropdown">
    <Label v-if="label" class="text-sm font-medium mb-2 block">{{ label }}</Label>
    
    <Select @update:model-value="selectPalette">
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="placeholder">
          <div v-if="selectedPalette" class="flex items-center gap-3">
            <!-- Mini color preview -->
            <div class="flex gap-0.5">
              <div
                v-for="(color, index) in selectedPalette.colors.slice(0, 5)"
                :key="index"
                class="w-3 h-3 rounded-sm border border-border/50"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <div
                v-if="selectedPalette.colors.length > 5"
                class="w-3 h-3 rounded-sm bg-muted border border-border/50 flex items-center justify-center text-xs"
              >
                +
              </div>
            </div>
            <!-- Palette name and count -->
            <div class="flex items-center gap-2">
              <span>{{ selectedPalette.name }}</span>
              <Badge variant="secondary" class="text-xs">
                {{ selectedPalette.colors.length }}
              </Badge>
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="palette in filteredPalettes"
          :key="palette.id"
          :value="palette.id"
        >
          <div class="flex items-center gap-3 w-full">
            <!-- Mini color preview -->
            <div class="flex gap-0.5">
              <div
                v-for="(color, index) in palette.colors.slice(0, 5)"
                :key="index"
                class="w-3 h-3 rounded-sm border border-border/50"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <div
                v-if="palette.colors.length > 5"
                class="w-3 h-3 rounded-sm bg-muted border border-border/50 flex items-center justify-center text-xs"
              >
                +
              </div>
            </div>
            <!-- Palette info -->
            <div class="flex items-center justify-between flex-1">
              <div class="flex flex-col">
                <span class="font-medium">{{ palette.name }}</span>
                <span v-if="palette.description" class="text-xs text-muted-foreground">
                  {{ palette.description }}
                </span>
              </div>
              <Badge variant="outline" class="text-xs ml-2">
                {{ palette.colors.length }}
              </Badge>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <!-- Selected Palette Preview (optional) -->
    <div v-if="selectedPalette && showPreview" class="mt-3">
      <ColorPalettePreview
        :colors="selectedPalette.colors.map((c: any) => c.hex)"
        :colors-per-row="previewColorsPerRow"
        height="auto"
        :row-height="previewRowHeight"
        :show-hex="showPreviewHex"
        :enable-copy="enablePreviewCopy"
        @color-copied="$emit('colorSelected', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useColorsStore, type ColorPalette } from '@/stores/colors';
import ColorPalettePreview from './ColorPalettePreview.vue';

export default defineComponent({
  name: 'PaletteDropdown',
  components: {
    Label,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    ColorPalettePreview
  },
  props: {
    modelValue: {
      type: Object as () => ColorPalette | null,
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select a palette...'
    },
    showPreview: {
      type: Boolean,
      default: false
    },
    showPreviewHex: {
      type: Boolean,
      default: false
    },
    enablePreviewCopy: {
      type: Boolean,
      default: true
    },
    previewColorsPerRow: {
      type: Number,
      default: 0
    },
    previewRowHeight: {
      type: String,
      default: '2rem'
    },
    filterTags: {
      type: Array as () => string[],
      default: () => []
    }
  },
  emits: ['update:modelValue', 'paletteSelected', 'colorSelected'],
  setup() {
    const paletteStore = useColorsStore();
    return { paletteStore };
  },
  computed: {
    selectedPalette(): ColorPalette | null {
      return this.modelValue;
    },
    filteredPalettes() {
      let palettes = [...this.paletteStore.palettes];
      
      // Filter by tags if specified
      if (this.filterTags.length > 0) {
        palettes = palettes.filter(palette =>
          palette.tags?.some(tag => this.filterTags.includes(tag))
        );
      }
      
      return palettes.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
    }
  },
  methods: {
    selectPalette(paletteId: any) {
      if (!paletteId || typeof paletteId !== 'string') return;
      const palette = this.paletteStore.getPaletteById(paletteId);
      this.$emit('update:modelValue', palette);
      this.$emit('paletteSelected', palette);
    }
  }
});
</script>

<style scoped>
.palette-dropdown {
  width: 100%;
}
</style>