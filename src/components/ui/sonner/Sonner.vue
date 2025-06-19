<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg group-[.toaster]:max-w-xs group-[.toaster]:w-auto group-[.toaster]:backdrop-blur-sm',
        description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-sm',
        actionButton:
          'group-[.toast]:bg-transparent group-[.toast]:text-gray-500 group-[.toast]:border-none group-[.toast]:p-0 group-[.toast]:text-sm group-[.toast]:underline group-[.toast]:hover:text-gray-700 group-[.toast]:transition-colors group-[.toast]:font-normal',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs',
      },
    }"
    position="bottom-right"
    :theme="'system'"
    :rich-colors="true"
    :close-button="false"
    :visible-toasts="3"
    :expand="false"
    :gap="6"
    style="position: fixed; bottom: 16px; right: 16px; z-index: 9999; pointer-events: none;"
  />
</template>
