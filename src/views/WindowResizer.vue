<script lang="ts">
import { defineComponent } from 'vue';
import { Input } from '@/components/ui/input';
import ExtensionRequired from '@/components/ExtensionRequired.vue';

declare const chrome: any;

export default defineComponent({
  name: 'WindowResizer',
  components: {
    Input,
    ExtensionRequired
  },
  // type inference enabled
  data() {
    return {
      custom: {
        width: 0,
        height: 0
      },
      presets: [
        {
          resizeTarget: 'window',
          width: 320,
          height: 568,
          icon: 'fa fa-mobile',
          description: 'Iphone 5',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },
        {
          resizeTarget: 'window',
          width: 375,
          height: 667,
          icon: 'fa fa-mobile',
          description: 'Iphone 6',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },
        {
          resizeTarget: 'window',
          width: 1024,
          height: 768,
          icon: 'fa fa-tablet',
          description: 'Ipad',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },
        {
          resizeTarget: 'window',
          width: 1440,
          height: 900,
          icon: 'fa fa-laptop',
          description: 'Laptop',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },
        {
          resizeTarget: 'window',
          width: 1680,
          height: 1050,
          icon: 'fa fa-desktop',
          description: 'Desktop small',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },

        {
          resizeTarget: 'window',
          width: 1920,
          height: 1080,
          icon: 'fa fa-tv',
          description: 'Desktop 2',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        },
        {
          resizeTarget: 'window',
          width: 2560,
          height: 1440,
          icon: 'fa fa-tv',
          description: 'Desktop 3',
          position: {
            options: 'unchanged', /// Options: unchanged + center + custom
            top: 0,
            right: 0
          }
        }
      ]
    };
  },
  methods: {
    customResize() {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const actions = ['resizeWindow', this.custom.width, this.custom.height];
        chrome.runtime.sendMessage({ action: actions }, (response: any) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            return;
          }
          
          if (response?.status) {
            console.log('Window resized successfully');
          } else {
            console.error('Window resize failed:', response?.error);
          }
        });
      } else {
        console.warn('Chrome extension API not available');
      }
    },

    ResizeWindowByPresetIndex(index: number) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const actions = [
          'resizeWindow',
          this.presets[index].width,
          this.presets[index].height
        ];
        chrome.runtime.sendMessage({ action: actions }, (response: any) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            return;
          }
          
          if (response?.status) {
            console.log('Window resized successfully to:', this.presets[index].description);
          } else {
            console.error('Window resize failed:', response?.error);
          }
        });
      } else {
        console.warn('Chrome extension API not available');
      }
    }
  },
  computed: {
    isAvailable() {
      return (this.$refs.extensionAlert as any)?.isAvailable || false;
    }
  },
  mounted() {
    this.custom.width = window.outerWidth;
    this.custom.height = window.outerHeight;
  }
});
</script>

<template>
  <div class="page-container space-y-3">
    <!-- Compact Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Window Resizer</h2>
      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{{ custom.width }}×{{ custom.height }}</span>
      </div>
    </div>

    <!-- Custom Resize Row -->
    <div class="bg-card border border-border rounded-md p-2">
      <div class="flex items-center gap-2">
        <Input
          class="w-20 h-7 text-xs"
          type="number"
          v-model="custom.width"
          placeholder="Width"
        />
        <span class="text-xs text-muted-foreground">×</span>
        <Input
          class="w-20 h-7 text-xs"
          type="number"
          v-model="custom.height"
          placeholder="Height"
        />
        <button 
          class="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ml-auto"
          :disabled="!isAvailable"
          @click="customResize()"
        >
          Resize
        </button>
      </div>
    </div>

    <!-- Extension Alert -->
    <ExtensionRequired 
      ref="extensionAlert"
      message="Window resizer functionality is not available." 
    />

    <!-- Compact Preset Grid -->
    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="(preset, index) in presets"
        :key="index"
        class="group bg-card hover:bg-accent border border-border hover:border-primary/20 rounded-md p-2 cursor-pointer transition-all duration-200"
        :class="{ 'opacity-50 cursor-not-allowed': !isAvailable }"
        @click="isAvailable && ResizeWindowByPresetIndex(index)"
      >
        <div class="flex items-center gap-2">
          <!-- Compact Device Icon -->
          <div class="w-6 h-6 bg-primary/10 rounded flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200 flex-shrink-0">
            <i :class="[preset.icon, 'text-primary text-xs group-hover:scale-110 transition-transform duration-200']"></i>
          </div>
          
          <!-- Compact Device Info -->
          <div class="flex-1 min-w-0">
            <div class="text-xs font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
              {{ preset.width }}×{{ preset.height }}
            </div>
            <div class="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-200 truncate">
              {{ preset.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss"></style>
