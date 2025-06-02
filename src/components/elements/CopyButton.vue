<template>
  <div class="relative">
    <Button
      v-bind="$attrs"
      :class="buttonClasses"
      :variant="variant"
      :size="size"
      @click="copy"
    >
      <template v-if="label">
        {{ label }}
        <span v-if="showIcon" class="ml-1" />
      </template>
      <svg
        v-if="showIcon"
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        :class="{ 'ml-1': label }"
        fill="currentColor"
        viewBox="0 0 512 512"
      >
        <path
          d="M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"
        />
      </svg>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, type ButtonVariants } from '@/components/ui/button'

interface Props {
  label?: string
  showIcon?: boolean
  modelValue?: string | number
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showIcon: true,
  modelValue: '',
  variant: 'default',
  size: 'default'
})

const showCopy = ref(false)

const buttonClasses = computed(() => {
  const classes = ['relative']
  if (showCopy.value) {
    classes.push('after:content-["copied"] after:absolute after:-top-12 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:text-primary-foreground after:px-3 after:py-1 after:rounded-md after:text-sm after:whitespace-nowrap')
  }
  return classes
})

const showmsg = () => {
  showCopy.value = true
  setTimeout(() => {
    showCopy.value = false
  }, 1000)
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(String(props.modelValue))
    showmsg()
  } catch (error) {
    alert('Unable to copy to clipboard')
  }
}
</script>

