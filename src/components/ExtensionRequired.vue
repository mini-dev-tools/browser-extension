<template>
  <div v-if="!isAvailable" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <div class="text-sm">
        <div class="font-medium text-destructive">Chrome Extension Required</div>
        <div class="text-destructive/80">{{ message || defaultMessage }} Make sure you're running this as a Chrome extension.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineExpose } from 'vue'

interface Props {
  message?: string
}

const props = defineProps<Props>()

const isAvailable = ref(false)

const defaultMessage = "This functionality is not available."

const checkAvailability = () => {
  isAvailable.value = !!(window.chrome && chrome.runtime && chrome.runtime.id)
}

onMounted(() => {
  checkAvailability()
})

// Expose the availability state so parent components can use it
defineExpose({
  isAvailable
})
</script>