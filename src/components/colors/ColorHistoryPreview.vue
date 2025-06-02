<template>
  <div v-if="colors.length > 0" class="space-y-4">
    <div class="flex items-center justify-between">
      <Label class="text-sm font-medium">{{ title }}</Label>
      <div class="flex items-center gap-2">
        <Badge v-if="showCount" variant="secondary" class="text-xs">
          {{ colors.length }}
        </Badge>
        <button 
          v-if="showClearButton" 
          @click="$emit('clear')" 
          class="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          Clear History
        </button>
      </div>
    </div>
    
    <div :class="gridClasses">
      <div
        v-for="historyItem in colors"
        :key="historyItem.id"
        class="group relative"
      >
        <ColorContextProvider
          :color="historyItem.hex"
          :color-name="historyItem.sourceName || historyItem.source"
          :source="historyItem.source || 'history'"
          :source-name="historyItem.sourceName"
        >
          <div
            :class="colorItemClasses"
            :style="{ backgroundColor: historyItem.hex }"
            :title="getTooltipText(historyItem)"
            @click="$emit('select', historyItem)"
          ></div>
        </ColorContextProvider>
        
        <!-- Remove button -->
        <button
          v-if="showRemoveButtons"
          @click="$emit('remove', historyItem.id)"
          class="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
          title="Remove from history"
        >
          ×
        </button>
        
        <!-- Source badge -->
        <Badge 
          v-if="showSourceBadges && historyItem.source && (!hideDefaultSource || historyItem.source !== 'picker')" 
          class="absolute -bottom-1 -right-1 p-0.5 h-4 w-4 flex items-center justify-center"
          :variant="getBadgeVariant(historyItem.source || 'picker')"
        >
          <component :is="getSourceIcon(historyItem.source || 'picker')" class="w-2.5 h-2.5" />
        </Badge>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ColorContextProvider from '@/components/colors/ColorContextProvider.vue';
import {
  Pipette,
  Palette,
  Blend,
  Layers,
  Contrast,
  Upload,
  Edit
} from 'lucide-vue-next';

interface ColorHistoryItem {
  id: string;
  hex: string;
  source?: string;
  sourceName?: string;
  context?: string;
  timestamp: number;
}

export default defineComponent({
  name: 'ColorHistoryPreview',
  components: {
    Button,
    Label,
    Badge,
    ColorContextProvider,
    Pipette,
    Palette,
    Blend,
    Layers,
    Contrast,
    Upload,
    Edit
  },
  props: {
    colors: {
      type: Array as PropType<ColorHistoryItem[]>,
      required: true
    },
    title: {
      type: String,
      default: 'Recent Colors'
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'md'
    },
    columns: {
      type: Number,
      default: 8
    },
    showClearButton: {
      type: Boolean,
      default: true
    },
    showRemoveButtons: {
      type: Boolean,
      default: true
    },
    showSourceBadges: {
      type: Boolean,
      default: true
    },
    showCount: {
      type: Boolean,
      default: false
    },
    hideDefaultSource: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select', 'remove', 'clear'],
  computed: {
    gridClasses() {
      const baseClasses = 'grid gap-2';
      switch (this.columns) {
        case 6: return `${baseClasses} grid-cols-6`;
        case 8: return `${baseClasses} grid-cols-8 md:grid-cols-10`;
        case 10: return `${baseClasses} grid-cols-10 md:grid-cols-12`;
        case 12: return `${baseClasses} grid-cols-12 md:grid-cols-16`;
        default: return `${baseClasses} grid-cols-8 md:grid-cols-10`;
      }
    },
    colorItemClasses() {
      const baseClasses = 'rounded-md border-2 border-border cursor-pointer hover:scale-110 transition-transform';
      switch (this.size) {
        case 'sm': return `${baseClasses} w-6 h-6`;
        case 'md': return `${baseClasses} w-8 h-8`;
        case 'lg': return `${baseClasses} w-10 h-10`;
        default: return `${baseClasses} w-8 h-8`;
      }
    }
  },
  methods: {
    getTooltipText(item: ColorHistoryItem): string {
      const color = item.hex.toUpperCase();
      const sourceName = item.sourceName || this.getSourceDisplayName(item.source || 'picker');
      const time = new Date(item.timestamp).toLocaleString();
      
      let tooltip = `${color} - ${sourceName}`;
      if (item.context) {
        tooltip += ` (${item.context})`;
      }
      tooltip += ` - ${time}`;
      
      return tooltip;
    },
    
    getSourceDisplayName(source: string): string {
      const sourceNames: Record<string, string> = {
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
      return sourceNames[source] || source.charAt(0).toUpperCase() + source.slice(1);
    },
    
    getSourceIcon(source: string) {
      const iconMap: Record<string, any> = {
        'picker': Pipette,
        'palette': Palette,
        'generator': Blend,
        'shades': Layers,
        'material': Palette,
        'eye_drop': Pipette,
        'contrast': Contrast,
        'import': Upload,
        'manual': Edit
      };
      return iconMap[source] || Pipette;
    },
    
    getBadgeVariant(source: string): 'default' | 'secondary' | 'outline' | 'destructive' {
      const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        'palette': 'secondary',
        'material': 'secondary',
        'generator': 'outline',
        'shades': 'outline',
        'eye_drop': 'default',
        'contrast': 'outline',
        'import': 'secondary',
        'manual': 'outline'
      };
      return variants[source] || 'outline';
    }
  }
});
</script>