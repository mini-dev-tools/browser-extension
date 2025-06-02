<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
}

export default defineComponent({
  name: 'PaletteStrip',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
  },
  props: {
    colors: {
      type: Array as PropType<PaletteColor[]>,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    showCard: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: 'h-32'
    }
  },
  emits: ['update:colors'],
  data() {
    return {
      draggedIndex: -1,
      showColorPicker: false,
      editingColorIndex: -1,
      tempColor: '#FF0000',
      tempColorName: '',
      hoveredColorIndex: -1,
      editingNameIndex: -1
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
    
    shouldExpandOnHover() {
      if (this.localColors.length === 0) return false;
      const estimatedContainerWidth = 600;
      const addButtonsWidth = 32;
      const availableWidth = estimatedContainerWidth - addButtonsWidth;
      const widthPerColor = availableWidth / this.localColors.length;
      return widthPerColor < 120;
    },
    
    getColorFlexClass() {
      return (index: number) => {
        if (!this.shouldExpandOnHover) {
          return 'flex-1';
        }
        
        if (this.hoveredColorIndex === -1) {
          return 'flex-1';
        } else if (this.hoveredColorIndex === index) {
          return 'flex-[2]';
        } else {
          return 'flex-[0.7]';
        }
      };
    },
    
    getContentOpacity() {
      return (index: number) => {
        if (!this.shouldExpandOnHover) {
          return 'opacity-100';
        }
        
        if (this.hoveredColorIndex === -1) {
          return 'opacity-0';
        } else if (this.hoveredColorIndex === index) {
          return 'opacity-100';
        } else {
          return 'opacity-0';
        }
      };
    }
  },
  methods: {
    hexToRgb(hex: string) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    },
    
    getLuminance(hex: string) {
      const rgb = this.hexToRgb(hex);
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;
      
      const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    },
    
    rgbToHex(r: number, g: number, b: number) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    mixColors(color1: string, color2: string, ratio = 0.5) {
      const rgb1 = this.hexToRgb(color1);
      const rgb2 = this.hexToRgb(color2);
      
      const mixedR = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
      const mixedG = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
      const mixedB = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
      
      return this.rgbToHex(mixedR, mixedG, mixedB);
    },
    
    startDrag(event: DragEvent, index: number) {
      if (this.readonly) return;
      this.draggedIndex = index;
      event.dataTransfer!.effectAllowed = 'move';
      event.dataTransfer!.setData('text/html', index.toString());
    },
    
    onDragOver(event: DragEvent, index: number) {
      if (this.readonly) return;
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
    },
    
    onDrop(event: DragEvent, targetIndex: number) {
      if (this.readonly) return;
      event.preventDefault();
      
      if (this.draggedIndex !== -1 && this.draggedIndex !== targetIndex) {
        const draggedColor = this.localColors[this.draggedIndex];
        const newColors = [...this.localColors];
        
        newColors.splice(this.draggedIndex, 1);
        const insertIndex = this.draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        newColors.splice(insertIndex, 0, draggedColor);
        
        this.localColors = newColors;
      }
      
      this.draggedIndex = -1;
    },
    
    addColor(hex?: string, name?: string) {
      if (this.readonly) return;
      const newColor: PaletteColor = {
        id: Date.now().toString(),
        hex: hex || '#' + Math.floor(Math.random()*16777215).toString(16),
        name: name || `Color ${this.localColors.length + 1}`
      };
      
      this.localColors = [...this.localColors, newColor];
    },
    
    insertColorBetween(index: number) {
      if (this.readonly || index >= this.localColors.length - 1) return;
      
      const color1 = this.localColors[index].hex;
      const color2 = this.localColors[index + 1].hex;
      const mixedColor = this.mixColors(color1, color2);
      
      const newColor: PaletteColor = {
        id: Date.now().toString(),
        hex: mixedColor,
        name: `Mixed ${index + 1}-${index + 2}`
      };
      
      const newColors = [...this.localColors];
      newColors.splice(index + 1, 0, newColor);
      this.localColors = newColors;
    },
    
    removeColor(index: number) {
      if (this.readonly) return;
      const newColors = [...this.localColors];
      newColors.splice(index, 1);
      this.localColors = newColors;
    },
    
    editColor(index: number) {
      if (this.readonly) return;
      this.editingColorIndex = index;
      this.tempColor = this.localColors[index].hex;
      this.tempColorName = this.localColors[index].name || '';
      this.showColorPicker = true;
    },
    
    startEditingName(index: number) {
      if (this.readonly) return;
      this.editingNameIndex = index;
      this.tempColorName = this.localColors[index].name || '';
    },
    
    saveNameEdit(index: number) {
      if (this.tempColorName.trim()) {
        const newColors = [...this.localColors];
        newColors[index].name = this.tempColorName.trim();
        this.localColors = newColors;
      }
      this.editingNameIndex = -1;
      this.tempColorName = '';
    },
    
    cancelNameEdit() {
      this.editingNameIndex = -1;
      this.tempColorName = '';
    },
    
    handleMouseEnter(index: number) {
      if (this.shouldExpandOnHover) {
        this.hoveredColorIndex = index;
      }
    },
    
    handleMouseLeave() {
      if (this.shouldExpandOnHover) {
        this.hoveredColorIndex = -1;
      }
    },
    
    saveColorEdit() {
      if (this.editingColorIndex >= 0) {
        const newColors = [...this.localColors];
        newColors[this.editingColorIndex].hex = this.tempColor;
        newColors[this.editingColorIndex].name = this.tempColorName;
        this.localColors = newColors;
      }
      this.closeColorPicker();
    },
    
    closeColorPicker() {
      this.showColorPicker = false;
      this.editingColorIndex = -1;
      this.tempColor = '#FF0000';
      this.tempColorName = '';
    }
  }
});
</script>

<template>
  <div>
    <!-- Main Palette Strip -->
    <Card v-if="showCard">
      <CardHeader>
        <CardTitle>Palette Strip ({{ localColors.length }})</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="localColors.length === 0" class="text-center py-12">
          <p class="text-muted-foreground mb-4">No colors in your palette yet</p>
          <Button v-if="!readonly" @click="addColor()">
            Add First Color
          </Button>
        </div>
        
        <div v-else class="space-y-4">
          <!-- Palette Strip -->
          <div class="relative flex rounded-lg overflow-hidden border-2 border-border">
            <!-- Add Color Button (Start) -->
            <div v-if="!readonly" class="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-[-50%] z-20">
              <Button
                @click="addColor()"
                size="sm"
                variant="secondary"
                class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
              >
                +
              </Button>
            </div>
            
            <div
              v-for="(color, index) in localColors"
              :key="color.id"
              class="relative transition-all duration-300 hover:brightness-110"
              :class="[getColorFlexClass(index), height]"
              :style="{ backgroundColor: color.hex }"
              :draggable="!readonly"
              @dragstart="startDrag($event, index)"
              @dragover="onDragOver($event, index)"
              @drop="onDrop($event, index)"
              @mouseenter="handleMouseEnter(index)"
              @mouseleave="handleMouseLeave()"
            >
              <!-- Color info column -->
              <div 
                class="absolute inset-0 flex flex-col items-center justify-center text-sm space-y-2 transition-opacity duration-300"
                :class="getContentOpacity(index)"
              >
                <!-- Remove button (top right) -->
                <button
                  v-if="!readonly"
                  @click.stop="removeColor(index)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  :class="getLuminance(color.hex) > 0.5 ? 'text-red-600 hover:bg-white/90' : 'text-red-400 hover:bg-black/90'"
                  title="Remove color"
                >
                  ×
                </button>
                
                <!-- Hex color text -->
                <div 
                  class="font-mono font-bold px-2 py-1 rounded text-center transition-all duration-300"
                  :class="[
                    getLuminance(color.hex) > 0.5 ? 'text-gray-900 bg-white/90' : 'text-white bg-black/90',
                    shouldExpandOnHover && hoveredColorIndex === index ? 'text-base' : 'text-sm'
                  ]"
                >
                  {{ color.hex.toUpperCase() }}
                </div>
                
                <!-- Color name (editable) -->
                <div 
                  v-if="editingNameIndex !== index"
                  @click.stop="readonly ? null : startEditingName(index)"
                  class="px-2 py-0.5 rounded text-center max-w-full truncate transition-all duration-300"
                  :class="[
                    getLuminance(color.hex) > 0.5 ? 'text-gray-700 bg-white/80' : 'text-white/90 bg-black/80',
                    !readonly ? 'cursor-pointer hover:scale-105 hover:bg-white/90' : '',
                    shouldExpandOnHover && hoveredColorIndex === index ? 'text-sm' : 'text-xs'
                  ]"
                  :title="readonly ? color.name : 'Click to edit name'"
                >
                  {{ color.name }}
                </div>
                
                <!-- Inline name editor -->
                <input
                  v-else
                  v-model="tempColorName"
                  @keyup.enter="saveNameEdit(index)"
                  @keyup.escape="cancelNameEdit()"
                  @blur="saveNameEdit(index)"
                  @click.stop
                  class="text-xs px-2 py-0.5 rounded text-center max-w-full bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style="width: 80px;"
                />
                
                <!-- Action buttons row -->
                <div 
                  v-if="!readonly"
                  class="flex gap-2 mt-2 transition-all duration-300"
                  :class="{
                    'scale-110': shouldExpandOnHover && hoveredColorIndex === index,
                    'scale-100': !shouldExpandOnHover || hoveredColorIndex !== index
                  }"
                >
                  <!-- Color picker button -->
                  <button
                    @click.stop="editColor(index)"
                    class="p-2 rounded hover:scale-110 transition-transform"
                    :class="getLuminance(color.hex) > 0.5 ? 'text-gray-700 hover:bg-white/90' : 'text-white hover:bg-black/90'"
                    title="Edit color"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 18.5L7.5 14l4.5-4.5L16.5 14L12 18.5zM12 1l3 3L9 10l-3-3L12 1z"/>
                    </svg>
                  </button>
                  
                  <!-- Move icon -->
                  <div
                    class="p-2 cursor-move"
                    :class="getLuminance(color.hex) > 0.5 ? 'text-gray-600' : 'text-white/80'"
                    title="Drag to reorder"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Add button between colors -->
              <div 
                v-if="!readonly && index < localColors.length - 1"
                class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[50%] z-20"
              >
                <Button
                  @click="insertColorBetween(index)"
                  size="sm"
                  variant="secondary"
                  class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
                >
                  +
                </Button>
              </div>
            </div>
            
            <!-- Add Color Button (End) -->
            <div v-if="!readonly" class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[50%] z-20">
              <Button
                @click="addColor()"
                size="sm"
                variant="secondary"
                class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Simplified version without card wrapper -->
    <div v-else>
      <div v-if="localColors.length === 0" class="text-center py-12">
        <p class="text-muted-foreground mb-4">No colors in your palette yet</p>
        <Button v-if="!readonly" @click="addColor()">
          Add First Color
        </Button>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Palette Strip -->
        <div class="relative flex rounded-lg overflow-hidden border-2 border-border">
          <!-- Add Color Button (Start) -->
          <div v-if="!readonly" class="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-[-50%] z-20">
            <Button
              @click="addColor()"
              size="sm"
              variant="secondary"
              class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
            >
              +
            </Button>
          </div>
          
          <div
            v-for="(color, index) in localColors"
            :key="color.id"
            class="relative transition-all duration-300 hover:brightness-110"
            :class="[getColorFlexClass(index), height]"
            :style="{ backgroundColor: color.hex }"
            :draggable="!readonly"
            @dragstart="startDrag($event, index)"
            @dragover="onDragOver($event, index)"
            @drop="onDrop($event, index)"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave()"
          >
            <!-- Color info column -->
            <div 
              class="absolute inset-0 flex flex-col items-center justify-center text-sm space-y-2 transition-opacity duration-300"
              :class="getContentOpacity(index)"
            >
              <!-- Remove button (top right) -->
              <button
                v-if="!readonly"
                @click.stop="removeColor(index)"
                class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                :class="getLuminance(color.hex) > 0.5 ? 'text-red-600 hover:bg-white/90' : 'text-red-400 hover:bg-black/90'"
                title="Remove color"
              >
                ×
              </button>
              
              <!-- Hex color text -->
              <div 
                class="font-mono font-bold px-2 py-1 rounded text-center transition-all duration-300"
                :class="[
                  getLuminance(color.hex) > 0.5 ? 'text-gray-900 bg-white/90' : 'text-white bg-black/90',
                  shouldExpandOnHover && hoveredColorIndex === index ? 'text-base' : 'text-sm'
                ]"
              >
                {{ color.hex.toUpperCase() }}
              </div>
              
              <!-- Color name (editable) -->
              <div 
                v-if="editingNameIndex !== index"
                @click.stop="readonly ? null : startEditingName(index)"
                class="px-2 py-0.5 rounded text-center max-w-full truncate transition-all duration-300"
                :class="[
                  getLuminance(color.hex) > 0.5 ? 'text-gray-700 bg-white/80' : 'text-white/90 bg-black/80',
                  !readonly ? 'cursor-pointer hover:scale-105 hover:bg-white/90' : '',
                  shouldExpandOnHover && hoveredColorIndex === index ? 'text-sm' : 'text-xs'
                ]"
                :title="readonly ? color.name : 'Click to edit name'"
              >
                {{ color.name }}
              </div>
              
              <!-- Inline name editor -->
              <input
                v-else
                v-model="tempColorName"
                @keyup.enter="saveNameEdit(index)"
                @keyup.escape="cancelNameEdit()"
                @blur="saveNameEdit(index)"
                @click.stop
                class="text-xs px-2 py-0.5 rounded text-center max-w-full bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style="width: 80px;"
              />
              
              <!-- Action buttons row -->
              <div 
                v-if="!readonly"
                class="flex gap-2 mt-2 transition-all duration-300"
                :class="{
                  'scale-110': shouldExpandOnHover && hoveredColorIndex === index,
                  'scale-100': !shouldExpandOnHover || hoveredColorIndex !== index
                }"
              >
                <!-- Color picker button -->
                <button
                  @click.stop="editColor(index)"
                  class="p-2 rounded hover:scale-110 transition-transform"
                  :class="getLuminance(color.hex) > 0.5 ? 'text-gray-700 hover:bg-white/90' : 'text-white hover:bg-black/90'"
                  title="Edit color"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 18.5L7.5 14l4.5-4.5L16.5 14L12 18.5zM12 1l3 3L9 10l-3-3L12 1z"/>
                  </svg>
                </button>
                
                <!-- Move icon -->
                <div
                  class="p-2 cursor-move"
                  :class="getLuminance(color.hex) > 0.5 ? 'text-gray-600' : 'text-white/80'"
                  title="Drag to reorder"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Add button between colors -->
            <div 
              v-if="!readonly && index < localColors.length - 1"
              class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[50%] z-20"
            >
              <Button
                @click="insertColorBetween(index)"
                size="sm"
                variant="secondary"
                class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
              >
                +
              </Button>
            </div>
          </div>
          
          <!-- Add Color Button (End) -->
          <div v-if="!readonly" class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[50%] z-20">
            <Button
              @click="addColor()"
              size="sm"
              variant="secondary"
              class="w-6 h-6 p-0 rounded-full border-2 border-background shadow-md hover:scale-110 transition-transform bg-white"
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Picker Dialog -->
    <Dialog v-model:open="showColorPicker">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Color</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="color-input">Color</Label>
            <input
              id="color-input"
              type="color"
              v-model="tempColor"
              class="w-full h-20 rounded-lg border cursor-pointer"
            />
          </div>
          <div class="space-y-2">
            <Label for="color-name">Name</Label>
            <Input
              id="color-name"
              v-model="tempColorName"
              placeholder="Color name"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button @click="closeColorPicker" variant="outline">
              Cancel
            </Button>
            <Button @click="saveColorEdit">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

[draggable="true"] {
  cursor: move;
}

[draggable="true"]:hover {
  opacity: 0.8;
}
</style>