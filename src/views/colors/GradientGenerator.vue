<template>
  <div class="page-container space-y-6">
    <!-- IE Warning -->
    <div v-if="showIENotification" class="w-full p-4 bg-yellow-400 text-yellow-900 flex items-center rounded-lg">
      <span class="flex-1 text-center">
        This gradient generator works on IE/Edge but for better performance please consider using Chrome or Firefox.
      </span>
      <Button @click="clearIENotification" variant="ghost" size="sm" class="text-yellow-900">×</Button>
    </div>

    <!-- Gradient Preview Card -->
    <Card>
      <CardHeader>
        <CardTitle>Gradient Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <ColorContextProvider
          v-if="currentColor"
          :color="currentColor.value"
          :color-name="`Gradient Stop ${currentColorIndex + 1}`"
          source="gradient-generator"
          :source-name="`Gradient at ${currentColor.stop}%`"
        >
          <div 
            class="w-full h-64 rounded-lg border-2 border-border shadow-sm relative overflow-hidden cursor-context-menu"
            :style="backgroundStyle"
          >
            <div class="absolute inset-0 bg-checkered -z-10"></div>
          </div>
        </ColorContextProvider>
        <div 
          v-else
          class="w-full h-64 rounded-lg border-2 border-border shadow-sm relative overflow-hidden"
          :style="backgroundStyle"
        >
          <div class="absolute inset-0 bg-checkered -z-10"></div>
        </div>
      </CardContent>
    </Card>

    <!-- Full Presets Modal -->
    <div 
      v-if="showPresets"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click="showPresets = false"
    >
      <Card class="w-full max-w-4xl max-h-[80vh] overflow-hidden" @click.stop>
        <CardHeader>
          <CardTitle>All Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-[repeat(auto-fill,90px)] gap-5 h-96 overflow-auto">
            <div
              v-for="(preset, index) in allPresets"
              :key="index"
              class="h-[90px] border-2 border-border shadow-md rounded cursor-pointer hover:scale-105 transition-transform"
              :style="preset.style"
              @click="applyGradient(index); showPresets = false"
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>


    <!-- Main Controls Card -->
    <Card>
      <CardHeader>
        <CardTitle>Gradient Controls</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
          <!-- Color Slider Bar -->
          <div class="space-y-4">
            <div class="relative h-10">
              <div 
                class="w-full h-full rounded-md border-2 border-gray-800 cursor-copy relative overflow-hidden gradient-bar"
                :style="{ backgroundImage: displayBarGradient }"
                @click="addColorStop"
              >
                <div class="absolute inset-0 bg-checkered -z-10"></div>
              </div>
            
            <!-- Color Stops -->
            <div
              v-for="(color, index) in currentGradient?.colors || []"
              :key="`stop-${index}`"
              v-show="color.status !== 'out'"
              class="absolute top-0 h-full w-2.5 -translate-x-1/4 z-10"
              :class="{ 'z-20': currentColorIndex === index }"
              :style="{ left: `${color.stop}%` }"
            >
              <ColorContextProvider
                :color="color.value"
                :color-name="`Gradient Stop ${index + 1}`"
                source="gradient-generator"
                :source-name="`Stop ${index + 1} at ${color.stop}%`"
              >
                <!-- Color Pin -->
                <div
                  class="absolute bottom-full left-0 w-5 h-5 cursor-move border-2 border-white rounded-[40%_60%_100%_0%_/_100%_60%_40%_0%] -rotate-45 -translate-x-1/2 transition-shadow"
                  :class="currentColorIndex === index ? 'shadow-[0_0_0_2px_#2b2b2b,0_0_0_5px_rgba(189,195,199,0.71)]' : 'shadow-[0_0_0_2px_#2b2b2b] hover:shadow-[0_0_0_2px_#2b2b2b,0_0_0_5px_rgba(180,180,180,0.6)]'"
                  :style="{ backgroundColor: getOpaqueColor(color.value) }"
                  @mousedown="startDrag(index)"
                  @click="setCurrentColor(index)"
                ></div>
              </ColorContextProvider>
              
              <!-- Stop Value -->
              <Input
                :model-value="color.stop"
                @update:model-value="updateColorStop(index, $event)"
                @keydown.up="increaseStopValue(index)"
                @keydown.down="decreaseStopValue(index)"
                @focus="setCurrentColor(index)"
                type="number"
                min="0"
                max="100"
                class="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-20 w-12 h-8 text-xs text-center transition-all"
                :class="currentColorIndex === index ? 'opacity-100 shadow-inner' : 'opacity-50'"
              />
            </div>
            
              <div class="absolute -bottom-5 left-0 w-full h-px bg-gray-300"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Gradient Stack -->
            <div>
              <h3 class="text-sm text-gray-500 mb-2">Stack</h3>
              <div class="max-h-[200px] overflow-auto mb-2">
                <div
                  v-for="(gradient, index) in gradients"
                  :key="`gradient-${index}`"
                  class="relative h-[50px] mb-1 cursor-pointer transition-opacity"
                  :class="{ 'opacity-100': currentGradientIndex === index || gradients.length === 1, 'opacity-50': currentGradientIndex !== index && gradients.length > 1 }"
                  @mouseover="isHovering = true"
                  @mouseleave="isHovering = false"
                >
                  <div class="h-full bg-checkered rounded" @click="setGradient(index)">
                    <div class="absolute inset-0 rounded" :style="getGradientPreview(index)"></div>
                  </div>
                  
                  <div v-if="gradients.length > 1" class="absolute inset-y-0 right-0 flex">
                    <Button
                      @click="toggleGradient(index)"
                      size="icon"
                      variant="ghost"
                      class="h-1/2 w-6 bg-teal-500 hover:bg-teal-600 transition-transform"
                      :class="currentGradientIndex === index || isHovering ? 'translate-x-0' : '-translate-x-[110%]'"
                    >
                      <Eye v-if="gradient.status === 'show'" class="w-3 h-3 text-white" />
                      <EyeOff v-else class="w-3 h-3 text-white" />
                    </Button>
                    
                    <Button
                      @click="deleteGradient(index)"
                      size="icon"
                      variant="ghost"
                      class="h-1/2 w-6 bg-red-500 hover:bg-red-600 text-white transition-transform"
                      :class="currentGradientIndex === index || isHovering ? 'translate-x-0' : '-translate-x-[110%]'"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
              <Button @click="addGradient" size="sm" variant="outline" class="w-full">+</Button>
            </div>

            <!-- Options -->
            <div>
              <h3 class="text-sm text-gray-500 mb-2">Options</h3>
              <div class="space-y-4">
                <!-- Repeat Toggle -->
                <Button
                  v-if="currentGradient"
                  @click="currentGradient.repeating.selected = !currentGradient.repeating.selected"
                  size="sm"
                  :variant="currentGradient.repeating.selected ? 'default' : 'outline'"
                  class="w-full"
                >
                  <RefreshCw class="w-4 h-4 mr-2" />
                  {{ currentGradient.repeating.selected ? 'Repeating' : 'No Repeat' }}
                </Button>

                <!-- Gradient Type Button Group -->
                <div v-if="currentGradient" class="space-y-4">
                  <div class="grid grid-cols-3 gap-2">
                    <Button
                      @click="setGradientType('linear')"
                      size="sm"
                      :variant="getGradientType() === 'linear' ? 'default' : 'outline'"
                    >
                      Linear
                    </Button>
                    <Button
                      @click="setGradientType('circle')"
                      size="sm"
                      :variant="getGradientType() === 'circle' ? 'default' : 'outline'"
                    >
                      Circle
                    </Button>
                    <Button
                      @click="setGradientType('ellipse')"
                      size="sm"
                      :variant="getGradientType() === 'ellipse' ? 'default' : 'outline'"
                    >
                      Ellipse
                    </Button>
                  </div>

                  <!-- Linear Controls -->
                  <div v-if="getGradientType() === 'linear'" class="flex justify-center">
                    <AngleSelector
                      v-model="currentGradient.direction.amount"
                      @update:model-value="generateGradients"
                    />
                  </div>

                  <!-- Ellipse Controls -->
                  <div v-if="getGradientType() === 'ellipse'" class="space-y-3">
                    <div>
                      <label class="text-xs text-muted-foreground mb-1 block">
                        Width: {{ currentGradient.size.ellipse.width.amount }}%
                      </label>
                      <Slider
                        :model-value="[currentGradient.size.ellipse.width.amount]"
                        @update:model-value="(val) => { currentGradient.size.ellipse.width.amount = val?.[0] ?? 0; generateGradients(); }"
                        :min="0"
                        :max="100"
                        :step="1"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-muted-foreground mb-1 block">
                        Height: {{ currentGradient.size.ellipse.height.amount }}%
                      </label>
                      <Slider
                        :model-value="[currentGradient.size.ellipse.height.amount]"
                        @update:model-value="(val) => { currentGradient.size.ellipse.height.amount = val?.[0] ?? 0; generateGradients(); }"
                        :min="0"
                        :max="100"
                        :step="1"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colors Editor -->
            <div>
              <h3 class="text-sm text-gray-500 mb-2">Colors</h3>
              <div v-if="currentGradient?.colors?.length" class="space-y-3">
                <div
                  v-for="(color, index) in currentGradient.colors"
                  :key="`color-editor-${index}`"
                  v-show="color.status !== 'out'"
                  class="border rounded-lg p-3 transition-all"
                  :class="currentColorIndex === index ? 'border-primary bg-muted/50' : 'border-border'"
                >
                  <div class="flex items-center gap-2">
                    <div class="text-xs font-medium text-muted-foreground w-3">
                      {{ index + 1 }}.
                    </div>



                    
                    <!-- Color Selector always visible -->
                    <div class="flex-1">

                        <ColorSelector
                          :model-value="color.value"
                          @update:model-value="(newColor) => updateColorAtIndex(index, newColor)"
                        />
                    </div>

                    <div class="flex items-center gap-1 text-xs text-muted-foreground">
                      <Input
                          :model-value="color.stop"
                          @update:model-value="updateColorStop(index, $event)"
                          @focus="setCurrentColor(index)"
                          type="number"
                          min="0"
                          max="100"
                          class="w-12 h-6 text-xs text-center border-0 bg-transparent p-1 font-mono"
                      />
                      <span class="text-xs">%</span>
                    </div>
                    <Button
                      @click="removeColorStop(index)"
                      size="sm"
                      variant="outline"
                      :disabled="currentGradient.colors.length <= 2"
                      class="h-6 w-6 p-0 text-destructive hover:text-destructive disabled:opacity-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                <!-- Add Color Stop Button -->
                <Button @click="addColorStopToEnd" variant="outline" size="sm" class="w-full">
                  Add Color Stop
                </Button>
                
                <!-- Actions under Add Color Stop -->
                <div class="flex gap-2">
                  <Button @click="copyCSS" variant="outline" size="sm" class="flex-1">
                    {{ copyCSSText }}
                  </Button>
                  <Button @click="showPresets = true" variant="outline" size="sm" class="flex-1">
                    Presets
                  </Button>
                </div>
                <Button @click="resetGradient" variant="destructive" size="sm" class="w-full">
                  Reset
                </Button>
              </div>
              <div v-else class="text-sm text-muted-foreground">
                No gradient colors available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <!-- CSS Output Card -->
      <Card>
        <CardHeader>
          <CardTitle>CSS Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="relative">
            <textarea
              :value="cssOutput"
              readonly
              class="w-full h-24 p-3 font-mono text-sm bg-muted border rounded-lg resize-none"
            ></textarea>
            <Button
              @click="copyCSS"
              size="sm"
              variant="outline"
              class="absolute top-2 right-2"
            >
              <span v-if="copyCSSText === 'Copy CSS'">Copy</span>
              <span v-else>{{ copyCSSText }}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  </template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, RefreshCw } from 'lucide-vue-next'
import ColorSelector from '@/components/colors/ColorSelector.vue'
import ColorContextProvider from '@/components/colors/ColorContextProvider.vue'
import { AngleSelector } from '@/components/ui/angle-selector'
import { useColorsStore } from '@/stores/colors'
import { RANDOM_COLOR_PALETTE, GRADIENT_PRESETS } from '@/stores/colors/constants'

interface ColorStop {
  value: string
  stop: number
  status: 'in' | 'out' | 'dragged'
}

interface Gradient {
  type: { selections: string[], selected: string }
  repeating: { selections: boolean[], selected: boolean }
  direction: { amount: number }
  shape: { selections: string[], selected: string }
  size: {
    ellipse: {
      height: { name: string, amount: number, unit: string, min: number, max: number }
      width: { name: string, amount: number, unit: string, min: number, max: number }
    }
    circle: {
      length: { name: string, amount: number, unit: string, min: number, max: number }
    }
  }
  position: {
    vertical: { name: string, amount: number, unit: string, min: number, max: number }
    horizontal: { name: string, amount: number, unit: string, min: number, max: number }
  }
  colors: ColorStop[]
  style: { 'background-image': string }
  status: 'show' | 'hide'
}

// Stores
const paletteStore = useColorsStore()

// State
const showPresets = ref(false)
const showIENotification = ref(false)
const gradients = ref<Gradient[]>([])
const currentGradientIndex = ref(0)
const currentColorIndex = ref(0)
const copyCSSText = ref('Copy CSS')
const selectedUserPreset = ref(-1)
const userPresets = ref<any[]>([])
const isHovering = ref(false)
const dragState = ref({
  isDragging: false,
  index: -1
})

// Random colors for new stops
const randomColors = RANDOM_COLOR_PALETTE

// All presets combined - using imported constants
const allPresets = GRADIENT_PRESETS

// Computed
const currentGradient = computed(() => gradients.value[currentGradientIndex.value])
const currentColor = computed(() => currentGradient.value?.colors[currentColorIndex.value])

const displayBarGradient = computed(() => {
  if (!currentGradient.value) return 'linear-gradient(90deg, #000 0%, #fff 100%)'
  
  const colors = [...currentGradient.value.colors]
    .filter(c => c.status !== 'out')
    .sort((a, b) => a.stop - b.stop)
    .map(c => `${c.value} ${c.stop}%`)
  
  return `linear-gradient(90deg, ${colors.join(', ')})`
})

const backgroundStyle = computed(() => {
  const gradientImages = gradients.value
    .filter(g => g.status === 'show')
    .map(g => g.style['background-image'])
    .filter(Boolean)
  
  return {
    backgroundImage: gradientImages.join(', ')
  }
})

const filteredPresets = computed(() => {
  // Get 15 random presets
  const indices = new Set<number>()
  while (indices.size < Math.min(15, allPresets.length)) {
    indices.add(Math.floor(Math.random() * allPresets.length))
  }
  return Array.from(indices).map(i => ({ index: i, preset: allPresets[i] }))
})

const cssOutput = computed(() => {
  return `background: ${backgroundStyle.value.backgroundImage};`
})

// Methods
const createDefaultGradient = (): Gradient => ({
  type: { selections: ['linear', 'radial'], selected: 'linear' },
  repeating: { selections: [false, true], selected: false },
  direction: { amount: 45 },
  shape: { selections: ['circle', 'ellipse'], selected: 'ellipse' },
  size: {
    ellipse: {
      height: { name: 'Height', amount: 100, unit: '%', min: 0, max: 100 },
      width: { name: 'Width', amount: 100, unit: '%', min: 0, max: 100 }
    },
    circle: {
      length: { name: 'Length', amount: 500, unit: 'px', min: 0, max: 1000 }
    }
  },
  position: {
    vertical: { name: 'Y-Offset', amount: 50, unit: '%', min: 0, max: 100 },
    horizontal: { name: 'X-Offset', amount: 50, unit: '%', min: 0, max: 100 }
  },
  colors: [
    { value: '#2c3e50', stop: 25, status: 'in' },
    { value: '#2980b9', stop: 75, status: 'in' }
  ],
  style: { 'background-image': '' },
  status: 'show'
})

const generateGradients = () => {
  gradients.value.forEach((gradient, index) => {
    const colors = [...gradient.colors]
      .filter(c => c.status !== 'out')
      .sort((a, b) => a.stop - b.stop)
      .map(c => `${c.value} ${c.stop}%`)
    
    let css = gradient.repeating.selected ? 'repeating-' : ''
    
    if (gradient.type.selected === 'linear') {
      css += `linear-gradient(${gradient.direction.amount}deg, ${colors.join(', ')})`
    } else if (gradient.type.selected === 'radial') {
      const shape = gradient.shape.selected
      let size = ''
      
      if (shape === 'ellipse') {
        size = `${gradient.size.ellipse.width.amount}% ${gradient.size.ellipse.height.amount}%`
      } else {
        size = `${gradient.size.circle.length.amount}px`
      }
      
      const position = `${gradient.position.horizontal.amount}% ${gradient.position.vertical.amount}%`
      css += `radial-gradient(${shape} ${size} at ${position}, ${colors.join(', ')})`
    }
    
    gradients.value[index].style['background-image'] = css
  })
}

// Removed toggleControls as we're using cards now

const addGradient = () => {
  gradients.value.push(createDefaultGradient())
  setGradient(gradients.value.length - 1)
}

const deleteGradient = (index: number) => {
  if (gradients.value.length <= 1) return
  gradients.value.splice(index, 1)
  setGradient(Math.min(currentGradientIndex.value, gradients.value.length - 1))
}

const toggleGradient = (index: number) => {
  const gradient = gradients.value[index]
  gradient.status = gradient.status === 'show' ? 'hide' : 'show'
}

const setGradient = (index: number) => {
  currentGradientIndex.value = index
  setCurrentColor(0)
}

const getGradientPreview = (index: number) => {
  const gradient = gradients.value[index]
  let bg = gradient.style['background-image']
  
  // Scale down radial gradients for preview
  if (gradient.type.selected === 'radial' && gradient.shape.selected === 'circle') {
    const size = gradient.size.circle.length.amount
    const newSize = (size * 50) / 1000
    bg = bg.replace(`${size}px`, `${newSize}px`)
  }
  
  return { backgroundImage: bg }
}

const addColorStop = (event: MouseEvent) => {
  if (!currentGradient.value) return
  
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percentage = Math.round(((event.clientX - rect.left) / rect.width) * 100)
  const color = randomColors[Math.floor(Math.random() * randomColors.length)]
  
  currentGradient.value.colors.push({
    value: color,
    stop: Math.max(0, Math.min(100, percentage)),
    status: 'in'
  })
  
  setCurrentColor(currentGradient.value.colors.length - 1)
}

const setCurrentColor = (index: number) => {
  currentColorIndex.value = index
}

const updateCurrentColor = (color: string) => {
  if (currentColor.value) {
    currentColor.value.value = color
    // Add to history
    paletteStore.addToHistory(color, 'generator')
    generateGradients()
  }
}

const updateColorAtIndex = (index: number, color: string) => {
  if (!currentGradient.value) return
  
  currentGradient.value.colors[index].value = color
  // Add to history
  paletteStore.addToHistory(color, 'generator')
  generateGradients()
}

const removeColorStop = (index: number) => {
  if (!currentGradient.value || currentGradient.value.colors.length <= 2) return
  
  currentGradient.value.colors.splice(index, 1)
  
  // Adjust current color index if needed
  if (currentColorIndex.value >= currentGradient.value.colors.length) {
    currentColorIndex.value = currentGradient.value.colors.length - 1
  } else if (currentColorIndex.value > index) {
    currentColorIndex.value = currentColorIndex.value - 1
  }
  
  generateGradients()
}

const addColorStopToEnd = () => {
  if (!currentGradient.value) return
  
  // Find the last stop position and add 20% after it (or 100% max)
  const sortedStops = [...currentGradient.value.colors]
    .filter(c => c.status !== 'out')
    .sort((a, b) => a.stop - b.stop)
  
  const lastStop = sortedStops[sortedStops.length - 1]
  const newPosition = Math.min(100, lastStop.stop + 20)
  
  const color = randomColors[Math.floor(Math.random() * randomColors.length)]
  
  currentGradient.value.colors.push({
    value: color,
    stop: newPosition,
    status: 'in'
  })
  
  setCurrentColor(currentGradient.value.colors.length - 1)
  generateGradients()
}

const updateColorStop = (index: number, value: any) => {
  if (!currentGradient.value) return
  
  const numValue = typeof value === 'string' ? parseInt(value) : value
  currentGradient.value.colors[index].stop = Math.max(0, Math.min(100, numValue))
  generateGradients()
}

const increaseStopValue = (index: number) => {
  if (!currentGradient.value) return
  
  const color = currentGradient.value.colors[index]
  color.stop = Math.min(100, color.stop + 1)
  generateGradients()
}

const decreaseStopValue = (index: number) => {
  if (!currentGradient.value) return
  
  const color = currentGradient.value.colors[index]
  color.stop = Math.max(0, color.stop - 1)
  generateGradients()
}

const getOpaqueColor = (color: string) => {
  if (color.toLowerCase().includes('rgba')) {
    const parts = color.match(/[\d.]+/g)
    if (parts && parts.length >= 3) {
      return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`
    }
  }
  return color
}

// Drag functionality
const startDrag = (index: number) => {
  if (!currentGradient.value) return
  
  dragState.value = { isDragging: true, index }
  currentGradient.value.colors[index].status = 'dragged'
  setCurrentColor(index)
  
  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag)
}

const doDrag = (event: MouseEvent) => {
  if (!dragState.value.isDragging || !currentGradient.value) return
  
  const slider = document.querySelector('.gradient-bar') as HTMLElement
  if (!slider) return
  
  const rect = slider.getBoundingClientRect()
  const percentage = Math.round(((event.clientX - rect.left) / rect.width) * 100)
  const color = currentGradient.value.colors[dragState.value.index]
  
  color.stop = Math.max(0, Math.min(100, percentage))
  
  // Check if dragged outside
  const outsideY = event.clientY < rect.top - 50 || event.clientY > rect.bottom + 50
  if (outsideY && currentGradient.value.colors.length > 2) {
    color.status = 'out'
  } else {
    color.status = 'dragged'
  }
  
  generateGradients()
}

const stopDrag = () => {
  if (!dragState.value.isDragging || !currentGradient.value) return
  
  const color = currentGradient.value.colors[dragState.value.index]
  if (color.status === 'out' && currentGradient.value.colors.length > 2) {
    currentGradient.value.colors.splice(dragState.value.index, 1)
  } else {
    color.status = 'in'
  }
  
  dragState.value = { isDragging: false, index: -1 }
  document.removeEventListener('mousemove', doDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  generateGradients()
}

const getGradientType = () => {
  if (!currentGradient.value) return 'linear'
  
  if (currentGradient.value.type.selected === 'linear') {
    return 'linear'
  } else if (currentGradient.value.type.selected === 'radial') {
    return currentGradient.value.shape.selected === 'circle' ? 'circle' : 'ellipse'
  }
  return 'linear'
}

const setGradientType = (type: 'linear' | 'circle' | 'ellipse') => {
  if (!currentGradient.value) return
  
  if (type === 'linear') {
    currentGradient.value.type.selected = 'linear'
  } else {
    currentGradient.value.type.selected = 'radial'
    currentGradient.value.shape.selected = type === 'circle' ? 'circle' : 'ellipse'
  }
  
  generateGradients()
}

const applyGradient = (index: number) => {
  if (!currentGradient.value) return
  
  const preset = allPresets[index]
  const gradient = currentGradient.value
  
  gradient.type.selected = preset.type || 'linear'
  gradient.colors = JSON.parse(JSON.stringify(preset.colors))
  
  if (preset.type === 'linear') {
    gradient.direction.amount = preset.direction || 0
  }
  
  setCurrentColor(0)
  generateGradients()
}

const resetGradient = () => {
  Object.assign(gradients.value[currentGradientIndex.value], createDefaultGradient())
  generateGradients()
}

const copyCSS = async () => {
  try {
    await navigator.clipboard.writeText(cssOutput.value)
    copyCSSText.value = 'Copied!'
    setTimeout(() => {
      copyCSSText.value = 'Copy CSS'
    }, 2000)
  } catch (err) {
    copyCSSText.value = 'Failed :('
    setTimeout(() => {
      copyCSSText.value = 'Copy CSS'
    }, 2000)
  }
}

const clearIENotification = () => {
  showIENotification.value = false
  localStorage.setItem('ie-notification', Date.now().toString())
}

// User presets
const saveUserPreset = () => {
  if (selectedUserPreset.value === -1) return
  
  const preset = {
    gradient: JSON.parse(JSON.stringify(gradients.value)),
    style: backgroundStyle.value
  }
  
  userPresets.value[selectedUserPreset.value] = preset
  localStorage.setItem(`gradient-preset-${selectedUserPreset.value}`, JSON.stringify(preset))
}

const applyUserPreset = () => {
  if (selectedUserPreset.value === -1) return
  
  const preset = userPresets.value[selectedUserPreset.value]
  if (!preset?.gradient) return
  
  gradients.value = JSON.parse(JSON.stringify(preset.gradient))
  setGradient(0)
  generateGradients()
}

// Lifecycle
onMounted(() => {
  // Load user presets
  for (let i = 0; i < 3; i++) {
    const saved = localStorage.getItem(`gradient-preset-${i}`)
    if (saved) {
      userPresets.value[i] = JSON.parse(saved)
    } else {
      userPresets.value[i] = { style: '', gradient: null }
    }
  }
  
  // Add first gradient
  addGradient()
  
  // Check for IE
  const ua = navigator.userAgent
  if (ua.includes('MSIE') || ua.includes('Trident/')) {
    const lastNotification = localStorage.getItem('ie-notification')
    if (!lastNotification || Date.now() - parseInt(lastNotification) > 7 * 24 * 60 * 60 * 1000) {
      showIENotification.value = true
    }
  }
  
  // Start generating gradients
  const interval = setInterval(generateGradients, 100)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.bg-checkered {
  background-image: 
    linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.1) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.1) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* Hide scrollbar for preset containers */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}
</style>