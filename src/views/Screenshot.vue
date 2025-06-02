<template>
  <div class="p-6 max-w-md mx-auto">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Screenshot Tools</h2>
      <p class="text-gray-600 mb-6">
        Capture screenshots of the current tab - visible area only or entire page.
      </p>

      <div class="space-y-4">
        <!-- Tab Screenshot (Visible Area) -->
        <Button
          @click="captureTabScreenshot"
          :disabled="isCapturing || !isAvailable"
          class="w-full"
          size="lg"
          variant="outline"
        >
          <svg
            v-if="!isCapturing"
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <svg
            v-else
            class="animate-spin w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isCapturing ? 'Capturing...' : 'Tab Screenshot (Visible Area)' }}
        </Button>

        <!-- Full Page Screenshot -->
        <Button
          @click="captureFullPageScreenshot"
          :disabled="isCapturing || !isAvailable"
          class="w-full"
          size="lg"
        >
          <svg
            v-if="!isCapturing"
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <svg
            v-else
            class="animate-spin w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ isCapturing ? 'Capturing...' : 'Full Page Screenshot' }}
        </Button>

        <div v-if="!isAvailable" class="text-red-600 text-sm">
          Screenshot functionality is not available. Make sure you're running this as a Chrome extension.
        </div>

        <div v-if="lastResult" class="text-sm" :class="lastResult.success ? 'text-green-600' : 'text-red-600'">
          {{ lastResult.message || lastResult.error }}
        </div>
      </div>

      <div class="mt-8 text-left space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-3">Tab Screenshot (Visible Area):</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Captures only what's currently visible in the browser viewport
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Fast and reliable for quick screenshots
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              Downloads automatically as PNG file
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-3">Full Page Screenshot:</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              Captures the entire page including content below the fold
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              Automatically detects the full height of the page
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              Uses advanced techniques to capture scrolling content
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              Downloads automatically as PNG file
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { ScreenshotService, type ScreenshotResponse } from '@/services/screenshotService';

const isCapturing = ref(false);
const isAvailable = ref(false);
const lastResult = ref<ScreenshotResponse | null>(null);

onMounted(() => {
  isAvailable.value = ScreenshotService.isAvailable();
});

const captureTabScreenshot = async () => {
  console.log('Screenshot component: Tab screenshot button clicked');
  
  if (isCapturing.value || !isAvailable.value) {
    console.log('Screenshot component: Returning early - already capturing or not available');
    return;
  }

  isCapturing.value = true;
  lastResult.value = null;
  console.log('Screenshot component: Starting tab screenshot...');

  try {
    const result = await ScreenshotService.captureTabScreenshot();
    console.log('Screenshot component: Tab screenshot result:', result);
    lastResult.value = result;
  } catch (error) {
    console.error('Screenshot component: Tab screenshot error:', error);
    lastResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    isCapturing.value = false;
    console.log('Screenshot component: Tab screenshot finished');
  }
};

const captureFullPageScreenshot = async () => {
  console.log('Screenshot component: Full page screenshot button clicked');
  
  if (isCapturing.value || !isAvailable.value) {
    console.log('Screenshot component: Returning early - already capturing or not available');
    return;
  }

  isCapturing.value = true;
  lastResult.value = null;
  console.log('Screenshot component: Starting full page screenshot...');

  try {
    const result = await ScreenshotService.captureFullPageScreenshot();
    console.log('Screenshot component: Full page screenshot result:', result);
    lastResult.value = result;
  } catch (error) {
    console.error('Screenshot component: Full page screenshot error:', error);
    lastResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    isCapturing.value = false;
    console.log('Screenshot component: Full page screenshot finished');
  }
};
</script>