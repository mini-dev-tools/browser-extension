<script lang="ts">
import { defineComponent } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ColorPalettePreview from '@/components/colors/ColorPalettePreview.vue';
import PaletteDropdown from '@/components/colors/PaletteDropdown.vue';
import { useColorsStore, type ColorPalette } from '@/stores/colors';
import { getColorShades } from '../../helpers/ColorShades';
export default defineComponent({
  name: 'color-shades-generator',
  components: {
    Button,
    Input,
    Label,
    Slider,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    ColorPalettePreview,
    PaletteDropdown
  },
  setup() {
    const paletteStore = useColorsStore();
    return { paletteStore };
  },

  data() {
    return {
      inputColor: '#d226b8',
      showCustomForm: false,
      customPalette: '',
      shades: [''],
      numOfShades: [6],  // Slider expects array
      selectedPalette: null as ColorPalette | null
    };
  },

  computed: {
    selectedPaletteColors() {
      return this.selectedPalette ? this.selectedPalette.colors.map(c => c.hex) : [];
    },
    
    allGeneratedShades() {
      if (!this.selectedPalette) return [];
      
      const allShades: string[] = [];
      this.selectedPaletteColors.forEach(color => {
        const shades = getColorShades(color, this.numOfShades[0]);
        allShades.push(...shades);
      });
      return allShades;
    },
    
    allShadeNames() {
      if (!this.selectedPalette) return [];
      
      const allNames: string[] = [];
      this.selectedPalette.colors.forEach(color => {
        for (let i = 0; i < this.numOfShades[0]; i++) {
          const shadeLevel = Math.round((i / (this.numOfShades[0] - 1)) * 900);
          allNames.push(`${color.name} ${shadeLevel}`);
        }
      });
      return allNames;
    }
  },

  methods: {
    setPalletColors() {
      if (!this.selectedPalette) return;
      
      let cleaned = this.customPalette.replace(/\s/g, '');
      const colorHexes = cleaned.split(',').map(color => 
        color.startsWith('#') ? color : '#' + color
      );
      
      // Create a custom palette
      const customPalette: ColorPalette = {
        id: 'custom-' + Date.now(),
        name: 'Custom Palette',
        description: 'User-defined custom colors',
        colors: colorHexes.map((hex, index) => ({
          id: `custom-${index}`,
          name: `Color ${index + 1}`,
          hex
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        tags: ['custom']
      };
      
      this.selectedPalette = customPalette;
    },

    onShadesChange(value: number[] | undefined) {
      this.numOfShades = value || [6];
    },

    onPaletteSelected(palette: ColorPalette) {
      this.selectedPalette = palette;
      this.showCustomForm = false;
    },

    onColorCopied(hex: string) {
      // Find the shade name for better context
      const shadeIndex = this.allGeneratedShades.indexOf(hex);
      const shadeName = shadeIndex !== -1 ? this.allShadeNames[shadeIndex] : hex;
      
      // Add to history with detailed metadata
      this.paletteStore.addToHistory(
        hex, 
        'shades', 
        `Color Shades: ${shadeName}`,
        this.selectedPalette?.name
      );
    },

    onCopyError(error: any) {
      console.error('Copy error:', error);
    }
  },

  mounted() {
    // Set default palette to Tango Desktop Project
    const defaultPalette = this.paletteStore.palettes.find(p => p.name === 'Tango Desktop Project');
    if (defaultPalette) {
      this.selectedPalette = defaultPalette;
    }
  }
});
</script>
<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Color Shades Generator</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Shades Count Slider -->
        <div class="flex items-center gap-4">
          <Label class="text-sm font-medium whitespace-nowrap">Shades Count:</Label>
          <Slider
            :min="5"
            :max="15"
            :step="1"
            :model-value="numOfShades"
            @update:model-value="onShadesChange"
            class="flex-1"
          />
          <Badge variant="outline" class="min-w-[3rem] justify-center">
            {{ numOfShades[0] }}
          </Badge>
        </div>

        <!-- Palette Selection -->
        <div class="space-y-4">
          <PaletteDropdown
            v-model="selectedPalette"
            label="Choose a Palette"
            placeholder="Select a color palette..."
            :show-preview="true"
            :show-preview-hex="false"
            preview-row-height="2rem"
            @palette-selected="onPaletteSelected"
          />
          
          <!-- Custom Palette Option -->
          <div class="flex gap-2">
            <Button
              @click="showCustomForm = !showCustomForm"
              variant="outline"
              size="sm"
              :class="{
                'border-primary bg-primary/10': showCustomForm
              }"
            >
              Custom Palette
            </Button>
          </div>
          
          <!-- Custom Palette Input - inline with selection -->
          <div v-if="showCustomForm" class="space-y-3 pt-4 border-t">
            <Label for="customPalette">Custom Palette (comma-separated hex colors)</Label>
            <div class="flex gap-2">
              <Input
                id="customPalette"
                v-model="customPalette"
                placeholder="#aabbcc,#112233, ..."
                class="flex-1"
              />
              <Button @click="setPalletColors()" size="sm">
                Apply
              </Button>
              <Button @click="showCustomForm = false" variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Color Shades Display -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          Color Shades Preview
          <Badge v-if="selectedPalette">{{ selectedPalette.name }}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="selectedPalette">
          <ColorPalettePreview
            :colors="allGeneratedShades"
            :colorsPerRow="numOfShades[0]"
            height="400px"
            rowHeight="3rem"
            :showHex="true"
            :enableCopy="true"
            :context-source="'shades'"
            :context-source-name="`Color Shades from ${selectedPalette.name}`"
            :palette-color-names="allShadeNames"
            @colorCopied="onColorCopied"
            @copyError="onCopyError"
          />
        </div>
        <div v-else class="text-center py-8 text-muted-foreground">
          Select a palette to see color shades
        </div>
      </CardContent>
    </Card>
  </div>
</template>
<style lang="scss"></style>
