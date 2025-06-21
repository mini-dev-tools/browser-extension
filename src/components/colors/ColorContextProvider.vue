<template>
  <div 
    @contextmenu="handleRightClick"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    class="color-context-wrapper"
  >
    <slot />
    
    <!-- Context Menu -->
    <div
      v-if="showContextMenu"
      ref="contextMenu"
      :style="contextMenuStyle"
      class="color-context-menu"
      @click.stop
    >
      <div class="context-menu-header">
        <div 
          class="color-preview"
          :style="{ backgroundColor: currentColor }"
        ></div>
        <span class="color-label">{{ currentColor?.toUpperCase() }}</span>
      </div>
      
      <div class="context-menu-divider"></div>
      
      <div class="context-menu-section">
        <button 
          v-for="format in colorFormats" 
          :key="format.key"
          @click="copyFormat(format)"
          class="context-menu-item"
          :class="{ 'copied': copiedFormat === format.key }"
        >
          <span class="format-label">{{ format.label }}</span>
          <span class="format-value">{{ format.value }}</span>
          <svg v-if="copiedFormat !== format.key" class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <svg v-else class="copy-icon copied" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>

      <div class="context-menu-divider"></div>
      
      <div class="context-menu-section">
        <button 
          @click="addToHistory"
          class="context-menu-item action-item"
        >
          <span>Add to History</span>
          <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        
        <button 
          @click="openInPicker"
          class="context-menu-item action-item"
        >
          <span>Open in Color Picker</span>
          <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Backdrop -->
    <div 
      v-if="showContextMenu" 
      class="context-menu-backdrop"
      @click="closeContextMenu"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick } from 'vue';
import { ColorConverter } from '@/helpers/colorConversions';
import { useColorsStore } from '@/stores/colors';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ColorContextProvider',
  props: {
    color: {
      type: String,
      required: true
    },
    colorName: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: 'context-menu'
    },
    sourceName: {
      type: String,
      default: ''
    }
  },
  emits: ['color-action'],
  setup(props, { emit }) {
    const paletteStore = useColorsStore();
    const settingsStore = useSettingsStore();
    const router = useRouter();
    
    const showContextMenu = ref(false);
    const contextMenu = ref<HTMLElement>();
    const contextMenuStyle = ref({});
    const copiedFormat = ref('');
    
    const currentColor = computed(() => props.color);
    
    const colorFormats = computed(() => {
      if (!currentColor.value) return [];
      
      const formats = ColorConverter.hexToAllFormats(currentColor.value);
      const allFormats = [
        { key: 'hex', label: 'HEX', value: formats.hexString },
        { key: 'rgb', label: 'RGB', value: formats.rgbString },
        { key: 'rgba', label: 'RGBA', value: formats.rgbaString },
        { key: 'hsl', label: 'HSL', value: formats.hslString },
        { key: 'hsla', label: 'HSLA', value: formats.hslaString },
        { key: 'hsv', label: 'HSV', value: formats.hsvString },
        { key: 'css', label: 'CSS Variable', value: formats.cssVar },
        { key: 'tailwind', label: 'Tailwind RGB', value: formats.tailwindRgb },
        { key: 'rgb-values', label: 'RGB Values', value: formats.rgbValues },
        { key: 'hsl-values', label: 'HSL Values', value: formats.hslValues }
      ];
      
      // Show fewer formats on small screens
      if (window.innerWidth < 768) {
        return allFormats.slice(0, 6); // Show only HEX, RGB, RGBA, HSL, HSLA, HSV
      }
      
      return allFormats;
    });
    
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
      openContextMenu(event);
    };
    
    const handleClick = (event: MouseEvent) => {
      // Allow normal click behavior, emit if needed
      emit('color-action', {
        type: 'click',
        color: currentColor.value,
        event
      });
    };
    
    const handleDoubleClick = async (event: MouseEvent) => {
      event.preventDefault();
      
      if (!settingsStore.isDoubleClickCopyEnabled) return;
      
      // Get preferred format value
      const preferredFormat = settingsStore.getPreferredCopyFormat;
      const formatDetails = colorFormats.value.find(f => f.key === preferredFormat);
      
      if (formatDetails) {
        await copyFormat(formatDetails);
      }
      
      emit('color-action', {
        type: 'double-click',
        color: currentColor.value,
        format: preferredFormat,
        event
      });
    };
    
    const openContextMenu = async (event: MouseEvent) => {
      showContextMenu.value = true;
      
      await nextTick();
      
      if (contextMenu.value) {
        const rect = contextMenu.value.getBoundingClientRect();
        const x = Math.min(event.clientX, window.innerWidth - rect.width - 10);
        const y = Math.min(event.clientY, window.innerHeight - rect.height - 10);
        
        contextMenuStyle.value = {
          position: 'fixed',
          top: `${y}px`,
          left: `${x}px`,
          zIndex: 1000
        };
      }
    };
    
    const closeContextMenu = () => {
      showContextMenu.value = false;
      copiedFormat.value = '';
    };
    
    const copyFormat = async (format: { key: string; label: string; value: string }) => {
      const success = await ColorConverter.copyToClipboard(format.value);
      
      if (success) {
        copiedFormat.value = format.key;
        
        // Show toast only if enabled in settings
        if (settingsStore.shouldShowCopyToasts) {
          toast(`${format.label} copied`, {
            description: format.value,
            duration: 2000,
            style: {
              borderLeft: `4px solid ${currentColor.value}`
            }
          });
        }
        
        setTimeout(() => {
          copiedFormat.value = '';
        }, 2000);
      }
    };
    
    const addToHistory = () => {
      paletteStore.addToHistory(
        currentColor.value,
        props.source as any,
        props.sourceName || props.colorName,
        props.colorName
      );
      closeContextMenu();
    };
    
    const openInPicker = () => {
      // Store the color in localStorage for the picker to pick up
      localStorage.setItem('picker-selected-color', currentColor.value);
      router.push('/color-picker');
      closeContextMenu();
    };
    
    // Close menu when clicking outside
    const handleGlobalClick = (event: MouseEvent) => {
      if (contextMenu.value && !contextMenu.value.contains(event.target as Node)) {
        closeContextMenu();
      }
    };
    
    return {
      showContextMenu,
      contextMenu,
      contextMenuStyle,
      copiedFormat,
      currentColor,
      colorFormats,
      handleRightClick,
      handleClick,
      handleDoubleClick,
      closeContextMenu,
      copyFormat,
      addToHistory,
      openInPicker
    };
  }
});
</script>

<style scoped>
.color-context-wrapper {
  position: relative;
  display: contents;
}

.color-context-menu {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 240px;
  padding: 0;
  font-size: 12px;
  z-index: 1000;
}

@media (max-width: 767px) {
  .color-context-menu {
    min-width: 180px;
    max-width: 200px;
    font-size: 11px;
  }
}

.dark .color-context-menu {
  background: #1f2937;
  border-color: #374151;
  color: #f9fafb;
}

.context-menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
}

@media (max-width: 767px) {
  .context-menu-header {
    gap: 6px;
    padding: 8px;
  }
}

.dark .context-menu-header {
  background: #111827;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .color-preview {
    width: 20px;
    height: 20px;
    border-radius: 3px;
  }
}

.dark .color-preview {
  border-color: #4b5563;
}

.color-label {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  font-size: 13px;
}

@media (max-width: 767px) {
  .color-label {
    font-size: 11px;
  }
}

.context-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0;
}

.dark .context-menu-divider {
  background: #374151;
}

.context-menu-section {
  padding: 6px 0;
}

@media (max-width: 767px) {
  .context-menu-section {
    padding: 4px 0;
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
  gap: 8px;
}

@media (max-width: 767px) {
  .context-menu-item {
    padding: 6px 8px;
    gap: 6px;
  }
}

.context-menu-item:hover {
  background: #f3f4f6;
}

.dark .context-menu-item:hover {
  background: #374151;
}

.context-menu-item.copied {
  background: #ecfdf5;
  color: #065f46;
}

.dark .context-menu-item.copied {
  background: #064e3b;
  color: #10b981;
}

.format-label {
  font-weight: 500;
  min-width: 60px;
}

@media (max-width: 767px) {
  .format-label {
    min-width: 50px;
    font-size: 10px;
  }
}

.format-value {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 10px;
  color: #6b7280;
  flex: 1;
  text-align: right;
  margin-right: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .format-value {
    font-size: 9px;
    margin-right: 4px;
  }
}

.dark .format-value {
  color: #9ca3af;
}

.copy-icon, .action-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .copy-icon, .action-icon {
    width: 12px;
    height: 12px;
  }
}

.copy-icon.copied {
  color: #059669;
}

.action-item {
  font-weight: 500;
}

.context-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>