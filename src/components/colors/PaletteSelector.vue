<template>
  <div class="palette-selector space-y-4">
    <!-- Search and Filter -->
    <div v-if="showSearch" class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search palettes..."
          class="w-full"
        />
      </div>
      <div v-if="availableTags.length > 0" class="flex gap-2 flex-wrap">
        <Button
          v-for="tag in availableTags"
          :key="tag"
          @click="toggleTag(tag)"
          :variant="selectedTags.includes(tag) ? 'default' : 'outline'"
          size="sm"
        >
          {{ tag }}
        </Button>
        <Button
          v-if="selectedTags.length > 0"
          @click="selectedTags = []"
          variant="ghost"
          size="sm"
        >
          Clear
        </Button>
      </div>
    </div>

    <!-- Palette Selection Grid -->
    <div class="space-y-4">
      <Label v-if="label" class="text-sm font-medium">{{ label }}</Label>
      
      <!-- Display Mode Selection -->
      <div v-if="allowDisplayModeToggle" class="flex gap-2">
        <Button
          @click="displayMode = 'grid'"
          :variant="displayMode === 'grid' ? 'default' : 'outline'"
          size="sm"
        >
          Grid View
        </Button>
        <Button
          @click="displayMode = 'list'"
          :variant="displayMode === 'list' ? 'default' : 'outline'"
          size="sm"
        >
          List View
        </Button>
      </div>

      <!-- Grid Display Mode -->
      <div v-if="displayMode === 'grid'" class="flex flex-wrap gap-2">
        <Button
          v-for="palette in filteredPalettes"
          :key="palette.id"
          @click="selectPalette(palette)"
          variant="outline"
          size="sm"
          :class="{
            'border-primary bg-primary/10': selectedPalette && selectedPalette.id === palette.id
          }"
        >
          {{ palette.name }}
          <Badge v-if="palette.colors.length" variant="secondary" class="ml-2">
            {{ palette.colors.length }}
          </Badge>
        </Button>
      </div>

      <!-- List Display Mode -->
      <div v-else class="space-y-3">
        <Card
          v-for="palette in filteredPalettes"
          :key="palette.id"
          class="cursor-pointer transition-all hover:shadow-md"
          :class="{
            'ring-2 ring-primary': selectedPalette && selectedPalette.id === palette.id
          }"
          @click="selectPalette(palette)"
        >
          <CardContent class="p-4">
            <div class="space-y-3">
              <!-- Palette Info -->
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <h4 class="font-medium">{{ palette.name }}</h4>
                  <p v-if="palette.description" class="text-sm text-muted-foreground">
                    {{ palette.description }}
                  </p>
                </div>
                <Badge variant="secondary">
                  {{ palette.colors.length }} colors
                </Badge>
              </div>
              
              <!-- Color Preview -->
              <ColorPalettePreview
                :colors="palette.colors.map((c: any) => c.hex)"
                :colors-per-row="0"
                height="auto"
                row-height="2rem"
                :show-hex="false"
                :enable-copy="false"
              />
              
              <!-- Tags -->
              <div v-if="palette.tags && palette.tags.length > 0" class="flex flex-wrap gap-1">
                <Badge
                  v-for="tag in palette.tags"
                  :key="tag"
                  variant="outline"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-if="filteredPalettes.length === 0" class="text-center py-8">
        <div class="text-muted-foreground mb-4">
          <template v-if="searchQuery || selectedTags.length > 0">
            No palettes match your filters
          </template>
          <template v-else>
            No palettes available
          </template>
        </div>
      </div>
    </div>

    <!-- Selected Palette Preview -->
    <div v-if="selectedPalette && showSelectedPreview" class="space-y-2">
      <Label class="text-sm font-medium">
        Selected: {{ selectedPalette.name }}
        <Badge variant="secondary" class="ml-2">
          {{ selectedPalette.colors.length }} colors
        </Badge>
      </Label>
      <ColorPalettePreview
        :colors="selectedPalette.colors.map((c: any) => c.hex)"
        :colors-per-row="previewColorsPerRow"
        height="auto"
        :row-height="previewRowHeight"
        :show-hex="showSelectedPreviewHex"
        :enable-copy="enableSelectedPreviewCopy"
        @color-copied="$emit('colorSelected', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useColorsStore, type ColorPalette } from '@/stores/colors';
import ColorPalettePreview from './ColorPalettePreview.vue';

export default defineComponent({
  name: 'PaletteSelector',
  components: {
    Button,
    Input,
    Label,
    Badge,
    Card,
    CardContent,
    ColorPalettePreview
  },
  props: {
    modelValue: {
      type: Object as () => ColorPalette | null,
      default: null
    },
    label: {
      type: String,
      default: 'Choose a Palette'
    },
    displayMode: {
      type: String as () => 'grid' | 'list',
      default: 'grid'
    },
    allowDisplayModeToggle: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showSelectedPreview: {
      type: Boolean,
      default: true
    },
    showSelectedPreviewHex: {
      type: Boolean,
      default: false
    },
    enableSelectedPreviewCopy: {
      type: Boolean,
      default: true
    },
    previewColorsPerRow: {
      type: Number,
      default: 0
    },
    previewRowHeight: {
      type: String,
      default: '2.5rem'
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
  data() {
    return {
      searchQuery: '',
      selectedTags: [] as string[],
      displayMode: this.displayMode as 'grid' | 'list'
    };
  },
  computed: {
    selectedPalette(): ColorPalette | null {
      return this.modelValue;
    },
    availableTags() {
      const allTags = this.paletteStore.getAllUniqueTags;
      return this.filterTags.length > 0 
        ? allTags.filter(tag => this.filterTags.includes(tag))
        : allTags;
    },
    filteredPalettes() {
      let palettes = [...this.paletteStore.palettes];
      
      // Search filter
      if (this.searchQuery) {
        palettes = this.paletteStore.searchPalettes(this.searchQuery);
      }
      
      // Tag filter
      if (this.selectedTags.length > 0) {
        palettes = palettes.filter(palette =>
          this.selectedTags.some(tag => palette.tags?.includes(tag))
        );
      }
      
      // Additional tag filter from props
      if (this.filterTags.length > 0) {
        palettes = palettes.filter(palette =>
          palette.tags?.some(tag => this.filterTags.includes(tag))
        );
      }
      
      return palettes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
  },
  methods: {
    selectPalette(palette: ColorPalette) {
      this.$emit('update:modelValue', palette);
      this.$emit('paletteSelected', palette);
    },
    
    toggleTag(tag: string) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tag);
      }
    }
  }
});
</script>

<style scoped>
.palette-selector {
  width: 100%;
}
</style>