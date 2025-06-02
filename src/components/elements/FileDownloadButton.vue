<template>
  <div class="flex items-center gap-2">
    <Button
      :variant="buttonVariant"
      :size="buttonSize"
      @click="downloadFile"
      class="flex items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 512 512"
      >
        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zM432 456c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z"/>
      </svg>
      {{ label }}
    </Button>
    
    <div class="relative flex-1" v-if="showInput">
      <input
        type="text"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <Button
        variant="ghost"
        size="icon"
        :class="copyButtonClasses"
        @click="copy"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 512 512"
        >
          <path d="M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"/>
        </svg>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, type ButtonVariants } from '@/components/ui/button'

interface Props {
  label?: string
  modelValue?: string | number
  buttonVariant?: ButtonVariants['variant']
  buttonSize?: ButtonVariants['size']
  showInput?: boolean
  filename?: string
  fileExtension?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Download',
  modelValue: '',
  buttonVariant: 'default',
  buttonSize: 'default',
  showInput: true,
  filename: 'download',
  fileExtension: 'txt'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showCopy = ref(false)

const copyButtonClasses = computed(() => {
  const classes = ['absolute right-1 top-1 h-8 w-8 hover:bg-accent']
  if (showCopy.value) {
    classes.push('after:content-["copied"] after:absolute after:-top-10 after:left-1/2 after:-translate-x-1/2 after:bg-primary after:text-primary-foreground after:px-2 after:py-1 after:rounded after:text-xs')
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

const downloadFile = () => {
  const content = String(props.modelValue)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.filename}.${props.fileExtension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

