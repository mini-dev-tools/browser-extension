<script lang="ts">
import { defineComponent } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPalettePreview from '@/components/colors/ColorPalettePreview.vue';
import { useColorsStore } from '@/stores/colors';
import { 
  MATERIAL_DESIGN_COLORS, 
  TAILWIND_CSS_COLORS, 
  MATERIAL_DESIGN_WEIGHTS, 
  TAILWIND_CSS_WEIGHTS 
} from '@/stores/colors/constants';

export default defineComponent({
  name: 'MaterialColors',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ColorPalettePreview
  },
  setup() {
    const paletteStore = useColorsStore();
    
    return {
      paletteStore
    };
  },
  data() {
    return {
      activeTab: 'material',
      materialWeights: MATERIAL_DESIGN_WEIGHTS,
      tailwindWeights: TAILWIND_CSS_WEIGHTS,
      materialColors: MATERIAL_DESIGN_COLORS,
      tailwindColors: TAILWIND_CSS_COLORS
    };
  },
  computed: {
    getHexArray() {
      return (materialColor: any) => materialColor.variations.map((v: any) => v.hex);
    },
    getCurrentColors() {
      return this.activeTab === 'material' ? this.materialColors : this.tailwindColors;
    },
    getCurrentWeights() {
      return this.activeTab === 'material' ? this.materialWeights : this.tailwindWeights;
    }
  },
  methods: {
    getColorNames(colorGroup: any): string[] {
      return colorGroup.variations.map((variation: any) => 
        `${colorGroup.color} ${variation.weight}`
      );
    },
    
    onColorCopied(hex: string) {
      const colorSet = this.getCurrentColors;
      
      for (const colorGroup of colorSet) {
        const variation = colorGroup.variations.find(v => v.hex === hex);
        if (variation) {
          const colorType = this.activeTab === 'material' ? 'Material Design' : 'Tailwind CSS';
          const sourceName = `${colorType} ${colorGroup.color} ${variation.weight}`;
          
          // Add to history with detailed metadata
          this.paletteStore.addToHistory(
            hex, 
            'material', 
            sourceName, 
            `${colorGroup.color} ${variation.weight}`
          );
          
          console.log(`${colorType} color copied: ${colorGroup.color} ${variation.weight} - ${hex}`);
          break;
        }
      }
    }
  }
});
</script>
<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Design System Colors</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="material">Material Design</TabsTrigger>
            <TabsTrigger value="tailwind">Tailwind CSS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="material" class="mt-6">
            <div class="space-y-4">
              <div v-for="materialColor in materialColors" :key="materialColor.color">
                <div class="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{{ materialColor.color }}</Badge>
                  <span class="text-sm text-muted-foreground">{{ materialColor.variations.length }} variations</span>
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
                  rowHeight="2.5rem"
                  :colorsPerRow="0"
                  :showHex="true"
                  :enableCopy="true"
                  :context-source="'material'"
                  :context-source-name="`Material Design ${materialColor.color}`"
                  :palette-color-names="getColorNames(materialColor)"
                  @colorCopied="onColorCopied"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tailwind" class="mt-6">
            <div class="space-y-4">
              <div v-for="tailwindColor in tailwindColors" :key="tailwindColor.color">
                <div class="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{{ tailwindColor.color }}</Badge>
                  <span class="text-sm text-muted-foreground">{{ tailwindColor.variations.length }} variations</span>
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
                  rowHeight="2.5rem"
                  :colorsPerRow="0"
                  :showHex="true"
                  :enableCopy="true"
                  :context-source="'material'"
                  :context-source-name="`Tailwind CSS ${tailwindColor.color}`"
                  :palette-color-names="getColorNames(tailwindColor)"
                  @colorCopied="onColorCopied"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</template>
<style></style>
