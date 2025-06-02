<template>
  <div class="angle-selector">
    <div 
      ref="selectorRef"
      class="relative w-24 h-24 mx-auto"
      @mousedown="startDragging"
      @touchstart="startDragging"
    >
      <!-- Outer Ring -->
      <div class="absolute inset-0 rounded-full border-4 border-primary/20 bg-muted/10"></div>
      
      <!-- Active Arc -->
      <svg class="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          :stroke="primaryColor"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="`${arcLength} ${circumference - arcLength}`"
          class="transition-all duration-200"
        />
      </svg>
      
      <!-- Degree Markers -->
      <div class="absolute inset-2">
        <div
          v-for="degree in [0, 45, 90, 135, 180, 225, 270, 315]"
          :key="degree"
          class="absolute w-1 h-1 bg-muted-foreground/40 rounded-full"
          :style="getMarkerStyle(degree)"
        ></div>
      </div>
      
      <!-- Handle -->
      <div
        class="absolute w-4 h-4 bg-primary border-2 border-background rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110"
        :style="handleStyle"
        :class="{ 'scale-110': isDragging }"
      >
        <div class="absolute inset-0.5 bg-background rounded-full"></div>
      </div>
      
      <!-- Center Value Display -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div class="text-sm font-bold font-mono text-primary">{{ modelValue }}°</div>
      </div>
    </div>
    
    <!-- Direction Label -->
    <div class="text-center mt-2">
      <div class="text-xs text-muted-foreground">{{ directionLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: number
  size?: number
  primaryColor?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 96,
  primaryColor: 'hsl(var(--primary))'
})

const emit = defineEmits<Emits>()

const selectorRef = ref<HTMLElement>()
const isDragging = ref(false)

// Constants
const radius = 44
const circumference = 2 * Math.PI * radius

// Computed properties
const normalizedAngle = computed(() => {
  return ((props.modelValue % 360) + 360) % 360
})

const arcLength = computed(() => {
  return (normalizedAngle.value / 360) * circumference
})

const handleStyle = computed(() => {
  const angle = (normalizedAngle.value - 90) * (Math.PI / 180)
  const centerX = 48
  const centerY = 48
  const handleRadius = 44
  
  const x = centerX + handleRadius * Math.cos(angle)
  const y = centerY + handleRadius * Math.sin(angle)
  
  return {
    left: `${x - 8}px`,
    top: `${y - 8}px`
  }
})

const directionLabel = computed(() => {
  const angle = normalizedAngle.value
  if (angle === 0) return 'Right'
  if (angle === 45) return 'Bottom Right'
  if (angle === 90) return 'Bottom'
  if (angle === 135) return 'Bottom Left'
  if (angle === 180) return 'Left'
  if (angle === 225) return 'Top Left'
  if (angle === 270) return 'Top'
  if (angle === 315) return 'Top Right'
  return `${angle}°`
})

// Helper functions
const getMarkerStyle = (degree: number) => {
  const angle = (degree - 90) * (Math.PI / 180)
  const markerRadius = 40
  const centerX = 40
  const centerY = 40
  
  const x = centerX + markerRadius * Math.cos(angle)
  const y = centerY + markerRadius * Math.sin(angle)
  
  return {
    left: `${x - 2}px`,
    top: `${y - 2}px`
  }
}

const getAngleFromPoint = (x: number, y: number) => {
  if (!selectorRef.value) return 0
  
  const rect = selectorRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  const deltaX = x - centerX
  const deltaY = y - centerY
  
  let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
  
  // Normalize to 0-360
  angle = ((angle % 360) + 360) % 360
  
  return Math.round(angle)
}

const updateAngle = (event: MouseEvent | TouchEvent) => {
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const newAngle = getAngleFromPoint(clientX, clientY)
  emit('update:modelValue', newAngle)
}

const startDragging = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  isDragging.value = true
  
  updateAngle(event)
  
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging.value) {
      updateAngle(e)
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

// Keyboard support
const handleKeydown = (event: KeyboardEvent) => {
  if (!selectorRef.value?.contains(event.target as Node)) return
  
  let newAngle = props.modelValue
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      newAngle = (props.modelValue + (event.shiftKey ? 15 : 1)) % 360
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      newAngle = (props.modelValue - (event.shiftKey ? 15 : 1) + 360) % 360
      break
    case 'Home':
      newAngle = 0
      break
    case 'End':
      newAngle = 180
      break
    default:
      return
  }
  
  event.preventDefault()
  emit('update:modelValue', newAngle)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.angle-selector {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.angle-selector * {
  touch-action: none;
}
</style>