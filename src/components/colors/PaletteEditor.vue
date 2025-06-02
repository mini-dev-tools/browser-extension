<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import PaletteStrip, { type PaletteColor } from './PaletteStrip.vue';
import ColorHistoryPreview from './ColorHistoryPreview.vue';
import type { ColorHistory } from '@/stores/colors';

export { type PaletteColor } from './PaletteStrip.vue';

export interface PaletteEditorEvents {
  'update:colors': [colors: PaletteColor[]];
  'update:name': [name: string];
  'update:tags': [tags: string[]];
  'update:description': [description: string];
  'save': [palette: { name: string; colors: PaletteColor[]; tags?: string[]; description?: string }];
  'export-css': [css: string];
  'export-json': [json: string];
}

export default defineComponent({
  name: 'PaletteEditor',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    PaletteStrip,
    ColorHistoryPreview,
    Textarea
  },
  props: {
    colors: {
      type: Array as PropType<PaletteColor[]>,
      default: () => []
    },
    name: {
      type: String,
      default: 'My Palette'
    },
    tags: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    description: {
      type: String,
      default: ''
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showExportButtons: {
      type: Boolean,
      default: true
    },
    showSaveButton: {
      type: Boolean,
      default: true
    },
    showRandomButton: {
      type: Boolean,
      default: true
    },
    showClearButton: {
      type: Boolean,
      default: true
    },
    showRecentColors: {
      type: Boolean,
      default: true
    },
    showTags: {
      type: Boolean,
      default: true
    },
    showDescription: {
      type: Boolean,
      default: true
    },
    recentColors: {
      type: Array as PropType<ColorHistory[]>,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:colors', 'update:name', 'update:tags', 'update:description', 'save', 'export-css', 'export-json'],
  data() {
    return {
      showClearConfirm: false,
      showRandomConfirm: false,
      localName: this.name,
      localTags: [...this.tags],
      localDescription: this.description
    };
  },
  computed: {
    localColors: {
      get(): PaletteColor[] {
        return this.colors;
      },
      set(value: PaletteColor[]) {
        this.$emit('update:colors', value);
      }
    },
    
    canSave() {
      return this.localName.trim().length > 0 && this.localColors.length > 0;
    },
    
    tagsString: {
      get(): string {
        return this.localTags.join(', ');
      },
      set(value: string) {
        this.localTags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        this.$emit('update:tags', this.localTags);
      }
    }
  },
  watch: {
    name(newVal) {
      this.localName = newVal;
    },
    localName(newVal) {
      this.$emit('update:name', newVal);
    },
    tags(newVal) {
      this.localTags = [...newVal];
    },
    description(newVal) {
      this.localDescription = newVal;
    },
    localDescription(newVal) {
      this.$emit('update:description', newVal);
    }
  },
  methods: {
    addFromHistory(historyItem: any) {
      const newColor: PaletteColor = {
        id: Date.now().toString(),
        hex: historyItem.hex,
        name: 'From History'
      };
      this.localColors = [...this.localColors, newColor];
    },
    
    async copyPaletteAsCSS() {
      const cssVars = this.localColors
        .map((color, index) => `  --color-${index + 1}: ${color.hex};`)
        .join('\n');
      
      const css = `:root {\n${cssVars}\n}`;
      
      try {
        await navigator.clipboard.writeText(css);
        this.$emit('export-css', css);
      } catch (err) {
        console.error('Failed to copy CSS:', err);
      }
    },
    
    async copyPaletteAsJSON() {
      const json = JSON.stringify(this.localColors, null, 2);
      
      try {
        await navigator.clipboard.writeText(json);
        this.$emit('export-json', json);
      } catch (err) {
        console.error('Failed to copy JSON:', err);
      }
    },
    
    clearPalette() {
      this.localColors = [];
      this.showClearConfirm = false;
    },
    
    generateRandomPalette() {
      const colors: PaletteColor[] = [];
      for (let i = 0; i < 5; i++) {
        colors.push({
          id: Date.now().toString() + i,
          hex: '#' + Math.floor(Math.random()*16777215).toString(16),
          name: `Random ${i + 1}`
        });
      }
      this.localColors = colors;
      this.showRandomConfirm = false;
    },
    
    savePalette() {
      if (!this.canSave) return;
      
      this.$emit('save', {
        name: this.localName.trim(),
        colors: this.localColors,
        tags: this.localTags.length > 0 ? this.localTags : undefined,
        description: this.localDescription.trim() || undefined
      });
    }
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card v-if="showHeader">
      <CardHeader>
        <div class="space-y-4">
          <!-- Name and Actions Row -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1 space-y-2">
              <Label for="palette-name-input">Palette Name</Label>
              <Input
                id="palette-name-input"
                v-model="localName"
                placeholder="My Palette"
                class="max-w-sm"
                :readonly="readonly"
              />
            </div>
            <div class="flex gap-2 mt-6">
            <Button 
              v-if="showSaveButton"
              @click="savePalette" 
              variant="default" 
              size="sm" 
              :disabled="!canSave || readonly"
            >
              Save Palette
            </Button>
            
            <AlertDialog v-if="showRandomButton && !readonly" v-model:open="showRandomConfirm">
              <AlertDialogTrigger as-child>
                <Button variant="outline" size="sm">
                  Random
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Random Palette?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace your current palette with 5 random colors. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="generateRandomPalette">Generate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog v-if="showClearButton && !readonly" v-model:open="showClearConfirm">
              <AlertDialogTrigger as-child>
                <Button variant="outline" size="sm">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Colors?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all colors from your palette. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction @click="clearPalette">Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </div>
          </div>
          
          <!-- Tags and Description Row -->
          <div v-if="(showTags || showDescription) && !readonly" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="showTags">
              <Label for="palette-tags">Tags (comma separated)</Label>
              <Input
                id="palette-tags"
                v-model="tagsString"
                placeholder="warm, sunset, primary"
              />
            </div>
            <div v-if="showDescription">
              <Label for="palette-description">Description</Label>
              <Input
                id="palette-description"
                v-model="localDescription"
                placeholder="Optional description"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent v-if="showExportButtons">
        <div class="flex flex-wrap gap-2">
          <Button @click="copyPaletteAsCSS" variant="outline" size="sm">
            Copy CSS
          </Button>
          <Button @click="copyPaletteAsJSON" variant="outline" size="sm">
            Copy JSON
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Main Palette Strip -->
    <PaletteStrip
      v-model:colors="localColors"
      :readonly="readonly"
      :show-card="true"
    />

    <!-- Recent Colors -->
    <Card v-if="showRecentColors && recentColors && recentColors.length > 0">
      <CardContent class="pt-6">
        <ColorHistoryPreview
          :colors="recentColors"
          title="Recent Colors"
          :columns="12"
          @select="addFromHistory"
        />
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 0.5rem;
}
</style>