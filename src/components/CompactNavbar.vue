<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '../stores/mainStore';
import { useColorsStore } from '../stores/colors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  Home, 
  Sun, 
  Moon, 
  Camera,
  Monitor,
  ChevronDown,
  Video,
  Square,
  ExternalLink,
  Droplet
} from 'lucide-vue-next';
import { ScreenshotService } from '@/services/screenshotService';
import { 
  getFilteredNavigationSections, 
  getFilteredMoreItems, 
  isChromeExtension as checkIsChromeExtension 
} from '@/data/navigation';

const mainStore = useMainStore();
const colorsStore = useColorsStore();
const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const navigationItems = computed(() => 
  getFilteredNavigationSections(isChromeExtension())
);

const moreItems = computed(() => 
  getFilteredMoreItems(isChromeExtension())
);

const isChromeExtension = checkIsChromeExtension;

const toggleTheme = () => {
  mainStore.toggleTheme();
  let ht = document.getElementsByTagName('html')[0];
  ht.classList.toggle('dark');
};

const showCaptureMenu = ref(false);
const isRecording = ref(false);
const recordingType = ref<'screen' | 'tab' | null>(null);

const takeScreenshot = async () => {
  if (isChromeExtension()) {
    console.log('CompactNavbar: Taking page screenshot...');
    try {
      const result = await ScreenshotService.capturePageScreenshot();
      console.log('CompactNavbar: Screenshot result:', result);
      if (result.success) {
        console.log('CompactNavbar: Screenshot captured successfully!');
      } else {
        console.error('CompactNavbar: Screenshot failed:', result.error);
        router.push('/screenshot');
      }
    } catch (error) {
      console.error('CompactNavbar: Screenshot error:', error);
      router.push('/screenshot');
    }
  }
};

const startScreenRecording = async () => {
  if (isChromeExtension() && !isRecording.value) {
    console.log('CompactNavbar: Starting screen recording...');
    try {
      const result = await ScreenshotService.captureScreen();
      console.log('CompactNavbar: Screen recording result:', result);
      if (result.success) {
        isRecording.value = true;
        recordingType.value = 'screen';
        console.log('CompactNavbar: Screen recording started!');
        
        // Listen for recording completion
        listenForRecordingEnd();
      } else {
        console.error('CompactNavbar: Screen recording failed:', result.error);
      }
    } catch (error) {
      console.error('CompactNavbar: Screen recording error:', error);
    }
  }
};

const startTabRecording = async () => {
  if (isChromeExtension() && !isRecording.value) {
    console.log('CompactNavbar: Starting tab recording...');
    try {
      const result = await ScreenshotService.captureTab();
      console.log('CompactNavbar: Tab recording result:', result);
      if (result.success) {
        isRecording.value = true;
        recordingType.value = 'tab';
        console.log('CompactNavbar: Tab recording started!');
        
        // Listen for recording completion
        listenForRecordingEnd();
      } else {
        console.error('CompactNavbar: Tab recording failed:', result.error);
      }
    } catch (error) {
      console.error('CompactNavbar: Tab recording error:', error);
    }
  }
};

const stopRecording = async () => {
  if (isChromeExtension() && isRecording.value) {
    console.log('CompactNavbar: Stopping recording...');
    try {
      // Send stop message to background script
      await chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
      resetRecordingState();
    } catch (error) {
      console.error('CompactNavbar: Stop recording error:', error);
      resetRecordingState();
    }
  }
};

const resetRecordingState = () => {
  isRecording.value = false;
  recordingType.value = null;
  console.log('CompactNavbar: Recording state reset');
};

const listenForRecordingEnd = () => {
  // Listen for messages from background script about recording completion
  const messageListener = (message: any) => {
    if (message.type === 'RECORDING_COMPLETED' || message.type === 'RECORDING_STOPPED') {
      console.log('CompactNavbar: Recording ended:', message);
      resetRecordingState();
      
      // Show completion message
      if (message.filename) {
        console.log(`CompactNavbar: Recording saved as ${message.filename}`);
        // You could add a toast notification here
      }
      
      // Remove listener after handling
      (chrome.runtime as any).onMessage.removeListener(messageListener);
    }
  };
  
  if ((chrome as any)?.runtime?.onMessage) {
    (chrome.runtime as any).onMessage.addListener(messageListener);
  }
};

// Check recording state from background script on mount
const checkRecordingState = async () => {
  if (isChromeExtension()) {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' }) as { isRecording?: boolean; recordingType?: string } | undefined;
      if (response && response.isRecording) {
        isRecording.value = true;
        recordingType.value = (response.recordingType === 'screen' || response.recordingType === 'tab') ? response.recordingType : null;
        console.log('CompactNavbar: Found ongoing recording:', response);
        // Listen for recording completion
        listenForRecordingEnd();
      }
    } catch (error) {
      console.log('CompactNavbar: No ongoing recording or error checking state:', error);
    }
  }
};

// EyeDropper functionality
const isEyeDropperActive = ref(false);

const startEyeDropper = async () => {
  console.log('CompactNavbar: startEyeDropper called');
  console.log('CompactNavbar: Context details:');
  console.log('  - URL:', window.location.href);
  console.log('  - Is extension:', isChromeExtension());
  console.log('  - Document title:', document.title);
  console.log('  - Window focus:', document.hasFocus());
  console.log('  - EyeDropper available:', 'EyeDropper' in window);
  
  if (!('EyeDropper' in window)) {
    console.warn('CompactNavbar: EyeDropper API not supported in this browser');
    // Fallback: redirect to color picker page
    router.push('/color-picker');
    return;
  }

  if (isEyeDropperActive.value) {
    console.log('CompactNavbar: EyeDropper already active, ignoring');
    return;
  }

  // Resize popup to maximum size if in Chrome extension
  if (isChromeExtension()) {
    try {
      // Set popup size to maximum allowed dimensions
      document.body.style.width = '800px';
      document.body.style.height = '600px';
      document.body.style.minWidth = '800px';
      document.body.style.minHeight = '600px';
      
      // Also resize the root element
      const rootElement = document.documentElement;
      rootElement.style.width = '800px';
      rootElement.style.height = '600px';
      
      console.log('CompactNavbar: Popup resized for color picker');
    } catch (error) {
      console.warn('CompactNavbar: Could not resize popup:', error);
    }
  }

  try {
    console.log('CompactNavbar: Starting EyeDropper...');
    isEyeDropperActive.value = true;
    const eyeDropper = new (window as any).EyeDropper();
    console.log('CompactNavbar: EyeDropper instance created:', eyeDropper);
    
    const result = await eyeDropper.open();
    
    console.log('CompactNavbar: EyeDropper result:', result);
    
    if (result && result.sRGBHex) {
      console.log('CompactNavbar: Adding color to history:', result.sRGBHex);
      // Add color to history with eye_drop source
      try {
        await colorsStore.addToHistory(result.sRGBHex, 'eye_drop', 'Browser EyeDropper');
        console.log('CompactNavbar: Color successfully added to history');
        
        // Set the picked color as the selected color in the color picker
        localStorage.setItem('picker-selected-color', result.sRGBHex);
        
        // Navigate to color picker to show the picked color
        router.push('/color-picker');
      } catch (storeError) {
        console.error('CompactNavbar: Error adding color to history:', storeError);
      }
    } else {
      console.log('CompactNavbar: No color result from EyeDropper');
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('CompactNavbar: EyeDropper error:', error);
    } else {
      console.log('CompactNavbar: EyeDropper cancelled by user');
    }
    // User cancelled or error occurred
  } finally {
    console.log('CompactNavbar: EyeDropper operation finished');
    isEyeDropperActive.value = false;
  }
};

// Keyboard shortcut handler
const handleKeydown = (event: KeyboardEvent) => {
  // Alt + P for eyedropper
  if (event.altKey && event.key.toLowerCase() === 'p') {
    console.log('CompactNavbar: Alt+P keyboard shortcut triggered');
    event.preventDefault();
    startEyeDropper();
  }
};

// Set up component lifecycle
onMounted(() => {
  checkRecordingState();
  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  // Remove keyboard shortcut listener
  document.removeEventListener('keydown', handleKeydown);
});

const currentSection = computed(() => {
  const path = route.path;
  for (const section of navigationItems.value) {
    if (section.items.some(item => item.path === path)) {
      return section.label;
    }
  }
  return 'Tools';
});

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <!-- Container-constrained on desktop, full-width on extension/mobile -->
    <div class="nav-container flex h-12 md:h-14 items-center">
      <!-- Logo/Home -->
      <router-link 
        to="/" 
        class="flex items-center space-x-2 mr-2 md:mr-4"
        @click="closeMobileMenu"
      >
        <Home class="h-4 w-4 md:h-5 md:w-5 text-primary" />
        <span class="hidden sm:block text-sm font-semibold">Tools</span>
      </router-link>

      <!-- Tablet/Desktop Navigation (sm+) -->
      <div class="hidden sm:flex items-center space-x-1 flex-1">
        <!-- Main Navigation Dropdowns -->
        <DropdownMenu v-for="section in navigationItems" :key="section.label">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 text-xs">
              <component :is="section.icon" class="h-3 w-3 mr-1" />
              <span class="hidden lg:inline">{{ section.label }}</span>
              <ChevronDown class="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-64 p-2">
            <DropdownMenuLabel class="px-2 pb-2">
              <div class="flex items-center space-x-2">
                <component :is="section.icon" class="h-4 w-4 text-primary" />
                <span>{{ section.label }}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator class="mb-2" />
            <DropdownMenuItem 
              v-for="item in section.items" 
              :key="item.path"
              class="rounded-lg p-0 focus:bg-accent hover:bg-accent/60 transition-colors"
            >
              <router-link 
                :to="item.path" 
                class="flex items-start space-x-3 w-full p-3 rounded-lg group"
              >
                <component 
                  :is="item.icon" 
                  class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" 
                />
                <div class="flex flex-col space-y-1">
                  <span class="font-medium text-sm group-hover:text-foreground">{{ item.label }}</span>
                  <span class="text-xs text-muted-foreground leading-tight">{{ item.description }}</span>
                </div>
              </router-link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- More Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 text-xs">
              <span class="hidden lg:inline">More</span>
              <span class="lg:hidden">•••</span>
              <ChevronDown class="h-3 w-3 ml-1 hidden lg:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-64 p-2">
            <DropdownMenuLabel class="px-2 pb-2">
              <div class="flex items-center space-x-2">
                <Menu class="h-4 w-4 text-primary" />
                <span>More Tools</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator class="mb-2" />
            <DropdownMenuItem 
              v-for="item in moreItems" 
              :key="item.path"
              class="rounded-lg p-0 focus:bg-accent hover:bg-accent/60 transition-colors"
            >
              <router-link 
                :to="item.path" 
                class="flex items-start space-x-3 w-full p-3 rounded-lg group"
              >
                <component 
                  :is="item.icon" 
                  class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" 
                />
                <div class="flex flex-col space-y-1">
                  <span class="font-medium text-sm group-hover:text-foreground">{{ item.label }}</span>
                  <span class="text-xs text-muted-foreground leading-tight">{{ item.description }}</span>
                </div>
                <ExternalLink 
                  v-if="item.path === '/'"
                  class="h-3 w-3 ml-auto mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                />
              </router-link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center space-x-0 ml-auto">
        <!-- EyeDropper Tool -->
        <Button 
          variant="ghost" 
          size="sm" 
          class="h-8 w-8 md:h-9 md:w-9 p-0"
          :class="{ 'text-primary': isEyeDropperActive }"
          @click="startEyeDropper"
          :disabled="isEyeDropperActive"
          title="Pick color from screen (Alt+P)"
        >
          <Droplet class="h-3 w-3 md:h-4 md:w-4" :class="{ 'animate-pulse': isEyeDropperActive }" />
        </Button>

        <!-- Window Resizer (Chrome Extension Only) -->
        <Button 
          v-if="isChromeExtension()"
          variant="ghost" 
          size="sm" 
          class="h-8 w-8 md:h-9 md:w-9 p-0"
          @click="router.push('/window-resizer')"
        >
          <Monitor class="h-3 w-3 md:h-4 md:w-4" />
        </Button>

        <!-- Capture Button/Stop Button (Chrome Extension Only) -->
        <div v-if="isChromeExtension()">
          <!-- Stop Recording Button (when recording) -->
          <Button 
            v-if="isRecording"
            variant="ghost" 
            size="sm" 
            class="h-8 w-8 md:h-9 md:w-9 p-0 text-red-500 hover:text-red-600"
            @click="stopRecording"
          >
            <Square class="h-3 w-3 md:h-4 md:w-4 fill-current" />
          </Button>
          
          <!-- Capture Menu (when not recording) -->
          <DropdownMenu v-else>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="h-8 w-8 md:h-9 md:w-9 p-0">
                <Camera class="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-64 p-2">
              <DropdownMenuLabel class="px-2 pb-2">
                <div class="flex items-center space-x-2">
                  <Camera class="h-4 w-4 text-primary" />
                  <span>Screen Capture</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator class="mb-2" />
              <DropdownMenuItem 
                @click="takeScreenshot" 
                class="cursor-pointer rounded-lg p-0 focus:bg-accent hover:bg-accent/60 transition-colors"
              >
                <div class="flex items-start space-x-3 w-full p-3 rounded-lg group">
                  <Camera class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div class="flex flex-col space-y-1">
                    <span class="font-medium text-sm group-hover:text-foreground">Page Screenshot</span>
                    <span class="text-xs text-muted-foreground leading-tight">Capture current page</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                @click="startScreenRecording" 
                class="cursor-pointer rounded-lg p-0 focus:bg-accent hover:bg-accent/60 transition-colors"
              >
                <div class="flex items-start space-x-3 w-full p-3 rounded-lg group">
                  <Video class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div class="flex flex-col space-y-1">
                    <span class="font-medium text-sm group-hover:text-foreground">Screen Recording</span>
                    <span class="text-xs text-muted-foreground leading-tight">Record entire screen</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                @click="startTabRecording" 
                class="cursor-pointer rounded-lg p-0 focus:bg-accent hover:bg-accent/60 transition-colors"
              >
                <div class="flex items-start space-x-3 w-full p-3 rounded-lg group">
                  <Monitor class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <div class="flex flex-col space-y-1">
                    <span class="font-medium text-sm group-hover:text-foreground">Tab Recording</span>
                    <span class="text-xs text-muted-foreground leading-tight">Record current tab</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Theme Toggle -->
        <Button 
          variant="ghost" 
          size="sm" 
          class="h-8 w-8 md:h-9 md:w-9 p-0"
          @click="toggleTheme"
        >
          <Sun class="h-3 w-3 md:h-4 md:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon class="absolute h-3 w-3 md:h-4 md:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <!-- Mobile Menu Trigger (< sm) -->
        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 w-8 md:h-9 md:w-9 p-0 sm:hidden">
              <Menu class="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-72 md:w-80 p-0">
            <div class="px-4 py-6 h-full overflow-y-auto">
              <div class="flex items-center space-x-2 mb-6">
                <Home class="h-5 w-5 text-primary" />
                <span class="font-bold">Mini Dev Tools</span>
              </div>

              <!-- Mobile Navigation -->
              <div class="space-y-4">
                <div v-for="section in navigationItems" :key="section.label" class="space-y-2">
                  <div class="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <component :is="section.icon" class="h-4 w-4" />
                    <span>{{ section.label }}</span>
                  </div>
                  <div class="space-y-1 ml-6">
                    <router-link
                      v-for="item in section.items"
                      :key="item.path"
                      :to="item.path"
                      @click="closeMobileMenu"
                      class="flex items-start space-x-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground group"
                    >
                      <component 
                        :is="item.icon" 
                        class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" 
                      />
                      <div class="flex flex-col">
                        <div class="font-medium">{{ item.label }}</div>
                        <div class="text-xs text-muted-foreground">{{ item.description }}</div>
                      </div>
                    </router-link>
                  </div>
                </div>

                <div class="space-y-2 pt-4 border-t">
                  <div class="text-sm font-medium text-muted-foreground">More Tools</div>
                  <div class="space-y-1">
                    <router-link
                      v-for="item in moreItems"
                      :key="item.path"
                      :to="item.path"
                      @click="closeMobileMenu"
                      class="flex items-start space-x-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground group"
                    >
                      <component 
                        :is="item.icon" 
                        class="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" 
                      />
                      <div class="flex flex-col">
                        <div class="font-medium">{{ item.label }}</div>
                        <div class="text-xs text-muted-foreground">{{ item.description }}</div>
                      </div>
                    </router-link>
                  </div>
                </div>

                <!-- Color & Extension Tools (Mobile) -->
                <div class="space-y-2 pt-4 border-t">
                  <div class="text-sm font-medium text-muted-foreground">Tools</div>
                  <div class="space-y-1">
                    <button
                      @click="startEyeDropper(); closeMobileMenu();"
                      :disabled="isEyeDropperActive"
                      class="w-full text-left block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    >
                      <div class="font-medium">EyeDropper Tool</div>
                      <div class="text-xs text-muted-foreground">Pick color from screen (Alt+P)</div>
                    </button>
                    <router-link
                      v-if="isChromeExtension()"
                      to="/window-resizer"
                      @click="closeMobileMenu"
                      class="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <div class="font-medium">Window Resizer</div>
                      <div class="text-xs text-muted-foreground">Resize browser window</div>
                    </router-link>
                    <router-link
                      v-if="isChromeExtension()"
                      to="/screenshot"
                      @click="closeMobileMenu"
                      class="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <div class="font-medium">Screenshot</div>
                      <div class="text-xs text-muted-foreground">Capture full page screenshot</div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>

    <!-- Mobile Breadcrumb (< sm) -->
    <div class="border-t bg-muted/30 px-2 md:px-4 py-1 md:py-2 sm:hidden">
      <div class="text-xs text-muted-foreground">
        <span>{{ currentSection }}</span>
        <span v-if="route.meta?.title"> • {{ route.meta.title }}</span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  @apply bg-accent text-accent-foreground;
}
</style>