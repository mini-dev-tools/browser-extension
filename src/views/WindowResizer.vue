<script lang="ts">
import { defineComponent } from 'vue';
import { Input } from '@/components/ui/input';

declare const chrome: any;

export default defineComponent({
  name: 'WindowResizer',
  components: {
    Input
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
  computed: {},
  mounted() {
    this.custom.width = window.outerWidth;
    this.custom.height = window.outerHeight;
  }
});
</script>

<template>
  <div class="page-container">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="md:text-blue-300 lg:text-indigo-300">Window Resizer</h1>
        <p class="text-sm">Resize your window to the specific resolution</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm">Custom</span>
        <Input
          class="w-20"
          type="number"
          v-model="custom.width"
          placeholder="width"
        />
        <span class="text-sm">×</span>
        <Input
          class="w-20"
          type="number"
          v-model="custom.height"
          placeholder="height"
        />
        <button class="btn-secondary" @click="customResize()">Resize</button>
      </div>
    </div>

    <div>
      <ul class="w-full rounded-lg mt-2 mb-3 text-indigo-900">
        <li
          class="w-full p-2 my-2 bg-gray-50 pl-6 hover:bg-gray-100 rounded-xl text-small shadow-md hover:shadow-none flex items-center"
          v-for="(preset, index) in presets"
          @click="ResizeWindowByPresetIndex(index)"
        >
          <div class="text-2xl pr-5">
            <i :class="[preset.icon, 'hover:rotate-90']"></i>
          </div>
          <div>
            <strong>{{ preset.width }} * {{ preset.height }} </strong
            ><br /><small class="text-gray-800">
              {{ preset.description }}</small
            >
          </div>
        </li>
        <li
          class="w-full p-4 my-2 bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm flex items-center gap-3"
        >
          <span class="text-sm">Custom (pixels)</span>
          <Input
            class="w-20"
            type="number"
            v-model="custom.width"
            placeholder="width"
          />
          <span class="text-sm">×</span>
          <Input
            class="w-20"
            type="number"
            v-model="custom.height"
            placeholder="height"
          />
          <button class="btn-secondary" @click="customResize()">Resize</button>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="scss"></style>
