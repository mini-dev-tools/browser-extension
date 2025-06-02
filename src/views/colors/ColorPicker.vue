<template>
  <div class="page-container">
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold">Color Picker</h1>
        <p class="text-muted-foreground">Pick, explore, and manage colors with precision</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Color Picker -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Hero Color Display and Advanced Picker -->
          <Card class="overflow-hidden p-0">
            <div class="flex">
              <!-- Advanced Color Picker with Eye Dropper -->
              <div class="flex flex-col justify-center items-center bg-white">
                <Chrome
                  v-model="selectedColor"
                  @update:modelValue="updateFromAdvanced"
                  :disable-alpha="false"
                  :disable-fields="true"
                  :width="240"
                />
                <!-- Eye Dropper Button -->
                <div class="p-3 w-full bg-white">
                  <button
                    @click="startEyeDropper"
                    :disabled="isEyeDropperActive"
                    class="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 rounded text-sm text-gray-700 transition-colors border-0 shadow-none"
                    :class="{ 'text-blue-600': isEyeDropperActive }"
                  >
                    <svg 
                      class="w-4 h-4" 
                      :class="{ 'animate-pulse': isEyeDropperActive }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a3 3 0 016 0v2m-2 14a2 2 0 002-2V7h8a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2 2z"></path>
                    </svg>
                    {{ isEyeDropperActive ? 'Picking Color...' : 'Eye Dropper' }}
                  </button>
                </div>
              </div>

              <!-- Color Display with Context Menu -->
              <ColorContextProvider
                :color="selectedColor"
                :colorName="`Color Picker Selection`"
                :source="'color_picker'"
                :sourceName="'Color Picker'"
                @color-action="handleColorAction"
              >
                <div 
                  class="flex-1 relative cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                  :style="{ backgroundColor: selectedColor }"
                  @click="triggerColorPicker"
                >
                  <!-- Overlay with color info -->
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="text-white text-center">
                      <div class="text-lg font-bold">{{ selectedColor.toUpperCase() }}</div>
                      <div class="text-sm opacity-90">Click to change • Right-click for options</div>
                    </div>
                  </div>
                  <!-- Hidden color input for native picker -->
                  <input
                    ref="colorInput"
                    type="color"
                    v-model="selectedColor"
                    @input="updateFromNativePicker"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </ColorContextProvider>
            </div>
          </Card>

          <!-- Quick Color Display -->
<!--          <Card>-->
<!--            <CardHeader>-->
<!--              <CardTitle class="text-lg flex items-center gap-2">-->
<!--                <div -->
<!--                  class="w-5 h-5 rounded border-2 border-border"-->
<!--                  :style="{ backgroundColor: selectedColor }"-->
<!--                ></div>-->
<!--                Current Color-->
<!--              </CardTitle>-->
<!--            </CardHeader>-->
<!--            <CardContent>-->
<!--              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">-->
<!--                <div class="text-center p-3 bg-muted/30 rounded-lg">-->
<!--                  <div class="text-xs text-muted-foreground mb-1">HEX</div>-->
<!--                  <div class="font-mono text-sm font-semibold">{{ selectedColor.toUpperCase() }}</div>-->
<!--                </div>-->
<!--                <div class="text-center p-3 bg-muted/30 rounded-lg">-->
<!--                  <div class="text-xs text-muted-foreground mb-1">RGB</div>-->
<!--                  <div class="font-mono text-sm">{{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }}</div>-->
<!--                </div>-->
<!--                <div class="text-center p-3 bg-muted/30 rounded-lg">-->
<!--                  <div class="text-xs text-muted-foreground mb-1">HSL</div>-->
<!--                  <div class="font-mono text-sm">{{ hsl.h }}°, {{ hsl.s }}%, {{ hsl.l }}%</div>-->
<!--                </div>-->
<!--                <div class="text-center p-3 bg-muted/30 rounded-lg">-->
<!--                  <div class="text-xs text-muted-foreground mb-1">Luminance</div>-->
<!--                  <div class="font-mono text-sm">{{ luminance.toFixed(3) }}</div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </CardContent>-->
<!--          </Card>-->


          <!-- Color History with Tabs -->
          <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
              <Tabs v-model="historyTab" class="w-full">
                <TabsList class="grid w-full grid-cols-4">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="palettes">Palettes</TabsTrigger>
                  <TabsTrigger value="material">Material</TabsTrigger>
                  <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recent" class="mt-4">
                  <ColorHistoryPreview
                    :colors="recentColors"
                    title=""
                    :columns="8"
                    @select="selectHistoryColor"
                    @remove="removeFromHistory"
                    @clear="clearHistory"
                  />
                </TabsContent>
                
                <TabsContent value="palettes" class="mt-4">
                  <div v-if="paletteStore.palettes.length === 0" class="text-center text-muted-foreground py-8">
                    <p>No palettes available</p>
                    <p class="text-sm mt-2">Create palettes in the Palettes section</p>
                  </div>
                  <div v-else class="space-y-4">
                    <div class="max-h-80 overflow-y-auto space-y-4">
                      <div v-for="palette in visiblePalettes" :key="palette.id">
                        <div class="flex items-center justify-between mb-2">
                          <p class="text-sm font-medium">{{ palette.name }}</p>
                          <span class="text-xs text-muted-foreground">{{ palette.colors.length }} colors</span>
                        </div>
                        <ColorPalettePreview
                          :colors="palette.colors.map(c => c.hex)"
                          :colorsPerRow="0"
                          rowHeight="2rem"
                          :showHex="false"
                          :contextSource="'palette'"
                          :contextSourceName="palette.name"
                          :paletteColorNames="palette.colors.map(c => c.name)"
                          @colorCopied="onPaletteColorSelected"
                        />
                      </div>
                    </div>
                    <div v-if="hasMorePalettes" class="text-center pt-2">
                      <Button @click="showAllPalettes" variant="outline" size="sm" class="w-full">
                        Show All ({{ remainingPalettesCount }} remaining)
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="material" class="mt-4">
                  <div class="space-y-4 max-h-96 overflow-y-auto">
                    <div v-for="materialColor in materialColors" :key="materialColor.color">
                      <div class="flex items-center gap-2 mb-2">
                        <Badge variant="outline" class="text-xs">{{ materialColor.color }}</Badge>
                        <span class="text-xs text-muted-foreground">{{ materialColor.variations.length }} variations</span>
                      </div>
                      <!-- Weight labels -->
                      <div class="flex mb-1">
                        <div class="w-0 flex-shrink-0"></div>
                        <div 
                          v-for="weight in materialWeights" 
                          :key="weight"
                          class="flex-1 text-center text-xs text-muted-foreground font-mono"
                        >
                          {{ weight }}
                        </div>
                      </div>
                      
                      <!-- Color palette -->
                      <ColorPalettePreview
                        :colors="getHexArray(materialColor)"
                        rowHeight="1.5rem"
                        :colorsPerRow="0"
                        :showHex="false"
                        :enableCopy="true"
                        :contextSource="'material'"
                        :contextSourceName="`Material Design ${materialColor.color}`"
                        :paletteColorNames="getColorNames(materialColor)"
                        @colorCopied="onSystemColorSelected"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tailwind" class="mt-4">
                  <div class="space-y-4 max-h-96 overflow-y-auto">
                    <div v-for="tailwindColor in tailwindColors" :key="tailwindColor.color">
                      <div class="flex items-center gap-2 mb-2">
                        <Badge variant="outline" class="text-xs">{{ tailwindColor.color }}</Badge>
                        <span class="text-xs text-muted-foreground">{{ tailwindColor.variations.length }} variations</span>
                      </div>
                      <!-- Weight labels -->
                      <div class="flex mb-1">
                        <div class="w-0 flex-shrink-0"></div>
                        <div 
                          v-for="weight in tailwindWeights" 
                          :key="weight"
                          class="flex-1 text-center text-xs text-muted-foreground font-mono"
                        >
                          {{ weight }}
                        </div>
                      </div>
                      
                      <!-- Color palette -->
                      <ColorPalettePreview
                        :colors="getHexArray(tailwindColor)"
                        rowHeight="1.5rem"
                        :colorsPerRow="0"
                        :showHex="false"
                        :enableCopy="true"
                        :contextSource="'tailwind'"
                        :contextSourceName="`Tailwind CSS ${tailwindColor.color}`"
                        :paletteColorNames="getColorNames(tailwindColor)"
                        @colorCopied="onSystemColorSelected"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <!-- Right Sidebar: Color Information -->
        <div class="lg:col-span-1">
          <Card class="bg-muted/30 sticky top-4">
            <CardHeader>
              <CardTitle class="text-lg flex items-center gap-2">
                <div 
                  class="w-4 h-4 rounded border border-border"
                  :style="{ backgroundColor: selectedColor }"
                ></div>
                Color Details
              </CardTitle>
            </CardHeader>
              <CardContent class="space-y-4">
                <!-- HEX -->
                <div class="flex items-center justify-between group">
                  <div class="flex-1">
                    <div class="text-sm text-muted-foreground">HEX:</div>
                    <input
                      v-if="editingField === 'hex'"
                      v-model="tempHex"
                      @blur="saveHexEdit"
                      @keyup.enter="saveHexEdit"
                      @keyup.escape="cancelEdit"
                      @input="updateHexLive"
                      class="font-mono font-semibold bg-transparent border-none outline-none p-0 w-full focus:ring-0"
                      ref="hexInput"
                    />
                    <div 
                      v-else
                      class="font-mono font-semibold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                      @click="startEdit('hex')"
                      :title="'Click to edit'"
                    >
                      {{ selectedColor.toUpperCase() }}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="copyToClipboard(selectedColor, 'hex')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :title="copiedField === 'hex' ? 'Copied!' : 'Copy HEX'"
                  >
                    <svg v-if="copiedField !== 'hex'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </Button>
                </div>

                <!-- RGB -->
                <div class="flex items-center justify-between group">
                  <div class="flex-1">
                    <div class="text-sm text-muted-foreground">RGB:</div>
                    <div v-if="editingField === 'rgb'" class="flex items-center space-x-1 font-mono font-semibold">
                      <span>rgb(</span>
                      <input
                        v-model.number="tempRgb.r"
                        @blur="handleRgbBlur"
                        @keyup.enter="saveRgbEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateRgbLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="255"
                        ref="rgbRInput"
                        data-field="rgb"
                      />
                      <span>,</span>
                      <input
                        v-model.number="tempRgb.g"
                        @blur="handleRgbBlur"
                        @keyup.enter="saveRgbEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateRgbLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="255"
                        data-field="rgb"
                      />
                      <span>,</span>
                      <input
                        v-model.number="tempRgb.b"
                        @blur="handleRgbBlur"
                        @keyup.enter="saveRgbEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateRgbLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="255"
                        data-field="rgb"
                      />
                      <span>)</span>
                    </div>
                    <div 
                      v-else
                      class="font-mono font-semibold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                      @click="startEdit('rgb')"
                      :title="'Click to edit'"
                    >
                      rgb({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :title="copiedField === 'rgb' ? 'Copied!' : 'Copy RGB'"
                  >
                    <svg v-if="copiedField !== 'rgb'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </Button>
                </div>

                <!-- HSL -->
                <div class="flex items-center justify-between group">
                  <div class="flex-1">
                    <div class="text-sm text-muted-foreground">HSL:</div>
                    <div v-if="editingField === 'hsl'" class="flex items-center space-x-1 font-mono font-semibold">
                      <span>hsl(</span>
                      <input
                        v-model.number="tempHsl.h"
                        @blur="handleHslBlur"
                        @keyup.enter="saveHslEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateHslLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="360"
                        ref="hslHInput"
                        data-field="hsl"
                      />
                      <span>,</span>
                      <input
                        v-model.number="tempHsl.s"
                        @blur="handleHslBlur"
                        @keyup.enter="saveHslEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateHslLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="100"
                        data-field="hsl"
                      />
                      <span>%,</span>
                      <input
                        v-model.number="tempHsl.l"
                        @blur="handleHslBlur"
                        @keyup.enter="saveHslEdit"
                        @keyup.escape="cancelEdit"
                        @input="updateHslLive"
                        class="bg-transparent border-none outline-none p-0 w-8 text-center focus:ring-0"
                        type="number"
                        min="0"
                        max="100"
                        data-field="hsl"
                      />
                      <span>%)</span>
                    </div>
                    <div 
                      v-else
                      class="font-mono font-semibold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                      @click="startEdit('hsl')"
                      :title="'Click to edit'"
                    >
                      hsl({{ hsl.h }}, {{ hsl.s }}%, {{ hsl.l }}%)
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :title="copiedField === 'hsl' ? 'Copied!' : 'Copy HSL'"
                  >
                    <svg v-if="copiedField !== 'hsl'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </Button>
                </div>

                <div class="border-t pt-4">
                  <!-- Luminance -->
                  <div class="flex items-center justify-between group">
                    <div>
                      <div class="text-sm text-muted-foreground">Luminance:</div>
                      <div class="font-mono font-semibold">{{ luminance.toFixed(3) }}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="copyToClipboard(luminance.toFixed(3), 'luminance')"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      :title="copiedField === 'luminance' ? 'Copied!' : 'Copy Luminance'"
                    >
                      <svg v-if="copiedField !== 'luminance'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </Button>
                  </div>

                  <!-- Contrast vs White -->
                  <div class="flex items-center justify-between group mt-3">
                    <div>
                      <div class="text-sm text-muted-foreground">Contrast (vs white):</div>
                      <div class="font-mono font-semibold">{{ contrastWhite.toFixed(2) }}:1</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="copyToClipboard(`${contrastWhite.toFixed(2)}:1`, 'contrast-white')"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      :title="copiedField === 'contrast-white' ? 'Copied!' : 'Copy Contrast Ratio'"
                    >
                      <svg v-if="copiedField !== 'contrast-white'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </Button>
                  </div>

                  <!-- Contrast vs Black -->
                  <div class="flex items-center justify-between group mt-3">
                    <div>
                      <div class="text-sm text-muted-foreground">Contrast (vs black):</div>
                      <div class="font-mono font-semibold">{{ contrastBlack.toFixed(2) }}:1</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="copyToClipboard(`${contrastBlack.toFixed(2)}:1`, 'contrast-black')"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      :title="copiedField === 'contrast-black' ? 'Copied!' : 'Copy Contrast Ratio'"
                    >
                      <svg v-if="copiedField !== 'contrast-black'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </Button>
                  </div>
                </div>

                <!-- Add to History Button -->
                <div class="pt-4 border-t space-y-2">
                  <Button @click="addToHistory" variant="outline" class="w-full">
                    Add to History
                  </Button>
                  <Button @click="triggerColorPicker" variant="default" class="w-full">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a3 3 0 016 0v2m-2 14a2 2 0 002-2V7h8a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2 2z"></path>
                    </svg>
                    Pick New Color
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chrome } from '@ckpack/vue-color';
import { getLuma } from '../../helpers/ColorShades';
import { useColorsStore } from '@/stores/colors';
import { ColorConverter } from '@/stores/colors/utils';
import { 
  MATERIAL_DESIGN_COLORS, 
  TAILWIND_CSS_COLORS, 
  MATERIAL_DESIGN_WEIGHTS, 
  TAILWIND_CSS_WEIGHTS 
} from '@/stores/colors/constants';
import ColorHistoryPreview from '@/components/colors/ColorHistoryPreview.vue';
import ColorPalettePreview from '@/components/colors/ColorPalettePreview.vue';
import ColorContextProvider from '@/components/colors/ColorContextProvider.vue';

export default defineComponent({
  name: 'ColorPicker',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Slider,
    Badge,
    Chrome,
    ColorHistoryPreview,
    ColorPalettePreview,
    ColorContextProvider,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
  },
  setup() {
    const paletteStore = useColorsStore();
    const selectedColor = useLocalStorage('picker-selected-color', '#236C80');
    // Remove activeTab as we don't need tabs anymore
    
    return {
      paletteStore,
      selectedColor
    };
  },
  data() {
    return {
      hexInput: '#236C80',
      copied: false,
      copiedField: '',
      editingField: '',
      tempHex: '',
      tempRgb: { r: 0, g: 0, b: 0 },
      tempHsl: { h: 0, s: 0, l: 0 },
      blurTimeout: null as number | null,
      rgb: { r: 35, g: 108, b: 128 },
      hsl: { h: 193, s: 57, l: 32 },
      historyTab: 'recent',
      systemTab: 'material',
      visiblePalettesCount: 3,
      materialWeights: MATERIAL_DESIGN_WEIGHTS,
      tailwindWeights: TAILWIND_CSS_WEIGHTS,
      materialColors: MATERIAL_DESIGN_COLORS,
      tailwindColors: TAILWIND_CSS_COLORS,
      isEyeDropperActive: false
    };
  },
  computed: {
    luminance() {
      return getLuma(this.selectedColor) / 255;
    },
    contrastWhite() {
      const l1 = Math.max(this.luminance, 1);
      const l2 = Math.min(this.luminance, 1);
      return (l1 + 0.05) / (l2 + 0.05);
    },
    contrastBlack() {
      const l1 = Math.max(this.luminance, 0);
      const l2 = Math.min(this.luminance, 0);
      return (l1 + 0.05) / (l2 + 0.05);
    },
    recentColors() {
      return this.paletteStore.getRecentColors(20);
    },
    getHexArray() {
      return (materialColor: any) => materialColor.variations.map((v: any) => v.hex);
    },
    visiblePalettes() {
      return this.paletteStore.palettes.slice(0, this.visiblePalettesCount);
    },
    hasMorePalettes() {
      return this.paletteStore.palettes.length > this.visiblePalettesCount;
    },
    remainingPalettesCount() {
      return Math.max(0, this.paletteStore.palettes.length - this.visiblePalettesCount);
    }
  },
  methods: {
    updateColor() {
      this.rgb = ColorConverter.hexToRgb(this.selectedColor);
      this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
      this.hexInput = this.selectedColor;
    },
    
    updateFromRGB() {
      this.selectedColor = ColorConverter.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
      this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
      this.hexInput = this.selectedColor;
    },
    
    updateFromHex() {
      if (this.hexInput.match(/^#[0-9A-F]{6}$/i)) {
        this.selectedColor = this.hexInput;
        this.rgb = ColorConverter.hexToRgb(this.selectedColor);
        this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
      }
    },
    
    updateHSL(component: 'h' | 's' | 'l', value: number) {
      this.hsl[component] = value;
      this.rgb = ColorConverter.hslToRgb(this.hsl.h, this.hsl.s, this.hsl.l);
      this.selectedColor = ColorConverter.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
      this.hexInput = this.selectedColor;
    },
    
    async copyToClipboard(text: string, field?: string) {
      try {
        await navigator.clipboard.writeText(text);
        this.copied = true;
        this.copiedField = field || '';
        setTimeout(() => {
          this.copied = false;
          this.copiedField = '';
        }, 1000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    },
    
    addToHistory() {
      this.paletteStore.addToHistory(this.selectedColor, 'picker');
    },
    
    selectHistoryColor(historyItem: any) {
      this.selectedColor = historyItem.hex;
      this.updateColor();
    },
    
    removeFromHistory(id: string) {
      this.paletteStore.removeFromHistory(id);
    },
    
    clearHistory() {
      this.paletteStore.clearHistory();
    },
    
    updateFromAdvanced(colorValue: any) {
      // Handle color value from vue-color (can be string or object)
      let hexColor: string;
      
      if (typeof colorValue === 'string') {
        hexColor = colorValue;
      } else if (colorValue && colorValue.hex) {
        hexColor = colorValue.hex;
      } else {
        return;
      }
      
      // Ensure hex format
      if (!hexColor.startsWith('#')) {
        hexColor = '#' + hexColor;
      }
      
      this.selectedColor = hexColor;
      this.rgb = ColorConverter.hexToRgb(hexColor);
      this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
      this.hexInput = hexColor;
    },

    // HTML5 Color Picker trigger
    triggerColorPicker() {
      (this.$refs.colorInput as HTMLInputElement)?.click();
    },

    // Handle native color picker changes
    updateFromNativePicker(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target && target.value) {
        this.selectedColor = target.value;
        this.updateColor();
        this.addToHistory();
      }
    },

    // Live update methods for sidebar editing
    updateHexLive() {
      if (this.tempHex.match(/^#[0-9A-F]{6}$/i)) {
        this.selectedColor = this.tempHex;
        this.rgb = ColorConverter.hexToRgb(this.selectedColor);
        this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
        this.hexInput = this.selectedColor;
      }
    },

    updateRgbLive() {
      if (this.tempRgb.r >= 0 && this.tempRgb.r <= 255 &&
          this.tempRgb.g >= 0 && this.tempRgb.g <= 255 &&
          this.tempRgb.b >= 0 && this.tempRgb.b <= 255) {
        this.rgb = { ...this.tempRgb };
        this.selectedColor = ColorConverter.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
        this.hsl = ColorConverter.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
        this.hexInput = this.selectedColor;
      }
    },

    updateHslLive() {
      if (this.tempHsl.h >= 0 && this.tempHsl.h <= 360 &&
          this.tempHsl.s >= 0 && this.tempHsl.s <= 100 &&
          this.tempHsl.l >= 0 && this.tempHsl.l <= 100) {
        this.hsl = { ...this.tempHsl };
        this.rgb = ColorConverter.hslToRgb(this.hsl.h, this.hsl.s, this.hsl.l);
        this.selectedColor = ColorConverter.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
        this.hexInput = this.selectedColor;
      }
    },

    // Inline editing methods
    startEdit(field: 'hex' | 'rgb' | 'hsl') {
      this.editingField = field;
      
      if (field === 'hex') {
        this.tempHex = this.selectedColor;
        this.$nextTick(() => {
          (this.$refs.hexInput as HTMLInputElement)?.focus();
          (this.$refs.hexInput as HTMLInputElement)?.select();
        });
      } else if (field === 'rgb') {
        this.tempRgb = { ...this.rgb };
        this.$nextTick(() => {
          (this.$refs.rgbRInput as HTMLInputElement)?.focus();
          (this.$refs.rgbRInput as HTMLInputElement)?.select();
        });
      } else if (field === 'hsl') {
        this.tempHsl = { ...this.hsl };
        this.$nextTick(() => {
          (this.$refs.hslHInput as HTMLInputElement)?.focus();
          (this.$refs.hslHInput as HTMLInputElement)?.select();
        });
      }
    },

    cancelEdit() {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
      this.editingField = '';
      this.tempHex = '';
      this.tempRgb = { r: 0, g: 0, b: 0 };
      this.tempHsl = { h: 0, s: 0, l: 0 };
    },

    handleRgbBlur(event: FocusEvent) {
      // Clear any existing timeout
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
      }
      
      // Set a timeout to save, but cancel it if focus moves to another RGB input
      this.blurTimeout = setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        const isRgbInput = activeElement?.getAttribute('data-field') === 'rgb';
        
        if (!isRgbInput) {
          this.saveRgbEdit();
        }
      }, 10);
    },

    handleHslBlur(event: FocusEvent) {
      // Clear any existing timeout
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
      }
      
      // Set a timeout to save, but cancel it if focus moves to another HSL input
      this.blurTimeout = setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        const isHslInput = activeElement?.getAttribute('data-field') === 'hsl';
        
        if (!isHslInput) {
          this.saveHslEdit();
        }
      }, 10);
    },

    saveHexEdit() {
      if (this.tempHex.match(/^#[0-9A-F]{6}$/i)) {
        this.selectedColor = this.tempHex;
        this.updateColor();
      }
      this.cancelEdit();
    },

    saveRgbEdit() {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
      
      // Validate and save RGB values
      if (this.tempRgb.r >= 0 && this.tempRgb.r <= 255 &&
          this.tempRgb.g >= 0 && this.tempRgb.g <= 255 &&
          this.tempRgb.b >= 0 && this.tempRgb.b <= 255) {
        this.rgb = { ...this.tempRgb };
        this.updateFromRGB();
      }
      
      // Clear editing state
      this.editingField = '';
      this.tempHex = '';
      this.tempRgb = { r: 0, g: 0, b: 0 };
      this.tempHsl = { h: 0, s: 0, l: 0 };
    },

    saveHslEdit() {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout);
        this.blurTimeout = null;
      }
      
      // Validate and save HSL values
      if (this.tempHsl.h >= 0 && this.tempHsl.h <= 360 &&
          this.tempHsl.s >= 0 && this.tempHsl.s <= 100 &&
          this.tempHsl.l >= 0 && this.tempHsl.l <= 100) {
        this.hsl = { ...this.tempHsl };
        this.rgb = ColorConverter.hslToRgb(this.hsl.h, this.hsl.s, this.hsl.l);
        this.selectedColor = ColorConverter.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
        this.hexInput = this.selectedColor;
      }
      
      // Clear editing state
      this.editingField = '';
      this.tempHex = '';
      this.tempRgb = { r: 0, g: 0, b: 0 };
      this.tempHsl = { h: 0, s: 0, l: 0 };
    },

    onSystemColorSelected(hex: string) {
      this.selectedColor = hex;
      this.updateColor();
      this.addToHistory();
    },

    onPaletteColorSelected(hex: string) {
      this.selectedColor = hex;
      this.updateColor();
      this.addToHistory();
    },

    getColorNames(colorGroup: any): string[] {
      return colorGroup.variations.map((variation: any) => 
        `${colorGroup.color} ${variation.weight}`
      );
    },

    loadMorePalettes() {
      this.visiblePalettesCount += 3;
    },

    showAllPalettes() {
      this.visiblePalettesCount = this.paletteStore.palettes.length;
    },

    checkForNewEyeDropperColor() {
      // Check if there's a recent eye dropper color in history
      const recentColors = this.paletteStore.getRecentColors(1);
      if (recentColors.length > 0) {
        const mostRecent = recentColors[0];
        // If the most recent color is from eye dropper and different from current
        if (mostRecent.source === 'eye_drop' && mostRecent.hex !== this.selectedColor) {
          // Check if it was picked in the last 10 seconds (likely from current session)
          const timeDiff = Date.now() - mostRecent.timestamp;
          if (timeDiff < 10000) {
            console.log('ColorPicker: Setting color from recent eye dropper pick:', mostRecent.hex);
            this.selectedColor = mostRecent.hex;
            this.updateColor();
          }
        }
      }
    },

    // Eye Dropper functionality
    async startEyeDropper() {
      console.log('ColorPicker: startEyeDropper called');
      
      if (!('EyeDropper' in window)) {
        console.warn('ColorPicker: EyeDropper API not supported in this browser');
        return;
      }

      if (this.isEyeDropperActive) {
        console.log('ColorPicker: EyeDropper already active, ignoring');
        return;
      }

      try {
        console.log('ColorPicker: Starting EyeDropper...');
        this.isEyeDropperActive = true;
        const eyeDropper = new (window as any).EyeDropper();
        
        const result = await eyeDropper.open();
        
        console.log('ColorPicker: EyeDropper result:', result);
        
        if (result && result.sRGBHex) {
          console.log('ColorPicker: Setting picked color:', result.sRGBHex);
          this.selectedColor = result.sRGBHex;
          this.updateColor();
          this.addToHistory();
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('ColorPicker: EyeDropper error:', error);
        } else {
          console.log('ColorPicker: EyeDropper cancelled by user');
        }
      } finally {
        console.log('ColorPicker: EyeDropper operation finished');
        this.isEyeDropperActive = false;
      }
    },

    // Handle color context menu actions
    handleColorAction(actionData: any) {
      console.log('ColorPicker: Color action:', actionData);
      // The ColorContextProvider already handles copy and history actions
      // This is just for additional logging or custom behavior if needed
    }
  },
  mounted() {
    this.updateColor();
    this.checkForNewEyeDropperColor();
  },
  
  watch: {
    // Watch the store's color history for new eye dropper colors
    'paletteStore.colorHistory': {
      handler(newHistory) {
        // Only update if we're currently on the color picker route
        if (this.$route.path === '/color-picker' && newHistory && newHistory.length > 0) {
          const mostRecent = newHistory[0];
          if (mostRecent.source === 'eye_drop' && mostRecent.hex !== this.selectedColor) {
            // Check if it was picked in the last 5 seconds
            const timeDiff = Date.now() - mostRecent.timestamp;
            if (timeDiff < 5000) {
              console.log('ColorPicker: Setting color from new eye dropper pick:', mostRecent.hex);
              this.selectedColor = mostRecent.hex;
              this.updateColor();
            }
          }
        }
      },
      deep: true,
      immediate: false
    },
    
    // Watch for route changes to update with new eye dropper colors
    '$route'() {
      if (this.$route.path === '/color-picker') {
        this.checkForNewEyeDropperColor();
      }
    },
    
    // Watch for changes to the selected color from other sources
    selectedColor: {
      handler(newColor) {
        if (newColor !== this.hexInput) {
          this.updateColor();
        }
      },
      immediate: false
    }
  }
});
</script>

<style scoped>
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 0.5rem;
}
</style>