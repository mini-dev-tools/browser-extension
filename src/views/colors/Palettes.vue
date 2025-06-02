<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Color Palettes</CardTitle>
          <div class="flex gap-2">
            <Button @click="showCreateModal = true" size="sm">
              Create Palette
            </Button>
            <Button @click="showImportModal = true" variant="outline" size="sm">
              Import
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Search and Filter -->
        <div class="flex flex-col gap-4">
          <div class="w-full">
            <Input
              v-model="searchQuery"
              placeholder="Search palettes..."
              class="w-full"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              :variant="selectedTags.includes(tag) ? 'default' : 'outline'"
              size="sm"
            >
              {{ tag }}
            </Button>
            <Button
              v-if="selectedTags.length > 0"
              @click="selectedTags = []"
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </div>

        <!-- Palettes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="palette in filteredPalettes"
            :key="palette.id"
            class="group hover:shadow-lg transition-shadow"
          >
            <CardHeader class="pb-3">
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <CardTitle class="text-lg">{{ palette.name }}</CardTitle>
                  <p v-if="palette.description" class="text-sm text-muted-foreground">
                    {{ palette.description }}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="sm">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="editPalette(palette)">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="duplicatePalette(palette.id)">
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="exportPalette(palette.id)">
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click="deletePalette(palette.id)"
                      class="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Color Preview -->
              <div class="grid grid-cols-4 gap-1 rounded-lg overflow-hidden h-16">
                <div
                  v-for="(color, index) in palette.colors.slice(0, 8)"
                  :key="color.id"
                  class="group/color relative cursor-pointer transition-all hover:scale-105"
                  :style="{ backgroundColor: color.hex }"
                  :title="`${color.name}: ${color.hex}`"
                  @click="copyColor(color.hex)"
                >
                  <div
                    v-if="copiedColor === color.hex"
                    class="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-xs font-medium"
                  >
                    ✓
                  </div>
                </div>
                <div
                  v-if="palette.colors.length > 8"
                  class="bg-muted flex items-center justify-center text-xs text-muted-foreground"
                >
                  +{{ palette.colors.length - 8 }}
                </div>
              </div>

              <!-- Tags -->
              <div v-if="palette.tags && palette.tags.length > 0" class="flex flex-wrap gap-1">
                <Badge
                  v-for="tag in palette.tags"
                  :key="tag"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ tag }}
                </Badge>
              </div>

              <!-- Info -->
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>{{ palette.colors.length }} colors</span>
                <span>{{ formatDate(palette.updatedAt) }}</span>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  @click="usePaletteInGradient(palette.id)" 
                  variant="outline" 
                  size="sm"
                  class="flex-1"
                >
                  Use in Gradient
                </Button>
                <Button 
                  @click="viewPalette(palette)" 
                  variant="outline" 
                  size="sm"
                  class="flex-1"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPalettes.length === 0" class="text-center py-12">
          <div class="text-muted-foreground mb-4">
            <template v-if="searchQuery || selectedTags.length > 0">
              No palettes match your filters
            </template>
            <template v-else>
              No palettes created yet
            </template>
          </div>
          <Button @click="showCreateModal = true" v-if="!searchQuery && selectedTags.length === 0">
            Create Your First Palette
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Palette Modal -->
    <Dialog v-model:open="showCreateModal">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ editingPalette ? 'Edit Palette' : 'Create New Palette' }}
          </DialogTitle>
        </DialogHeader>
        <!-- Enhanced Palette Editor -->
        <PaletteEditor
          v-model:colors="newPalette.colors"
          v-model:name="newPalette.name"
          v-model:tags="newPaletteTags"
          v-model:description="newPalette.description"
          :show-header="true"
          :show-save-button="false"
          :show-export-buttons="false"
          :show-recent-colors="false"
        />
        <DialogFooter>
          <Button @click="showCreateModal = false" variant="outline">
            Cancel
          </Button>
          <Button @click="savePalette">
            {{ editingPalette ? 'Update' : 'Create' }} Palette
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Import Modal -->
    <Dialog v-model:open="showImportModal">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Palette</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="import-data">Paste palette JSON data</Label>
            <Textarea
              id="import-data"
              v-model="importData"
              placeholder="Paste exported palette JSON here..."
              rows="10"
              class="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button @click="showImportModal = false" variant="outline">
            Cancel
          </Button>
          <Button @click="importPalette">
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- View Palette Modal -->
    <Dialog v-model:open="showViewModal">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{ viewingPalette?.name }}</DialogTitle>
        </DialogHeader>
        <div v-if="viewingPalette" class="space-y-6">
          <div v-if="viewingPalette.description" class="text-muted-foreground">
            {{ viewingPalette.description }}
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card
              v-for="color in viewingPalette.colors"
              :key="color.id"
              class="group cursor-pointer hover:shadow-md transition-shadow"
              @click="copyColor(color.hex)"
            >
              <div
                class="h-24 rounded-t-lg"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <CardContent class="p-3">
                <div class="font-medium text-sm">{{ color.name }}</div>
                <div class="font-mono text-xs text-muted-foreground">
                  {{ color.hex.toUpperCase() }}
                </div>
                <div
                  v-if="copiedColor === color.hex"
                  class="text-xs text-green-600 mt-1"
                >
                  ✓ Copied!
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MoreVertical } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useColorsStore, type ColorPalette, type PaletteColor } from '@/stores/colors';
import PaletteEditor, { type PaletteColor as EditorPaletteColor } from '@/components/colors/PaletteEditor.vue';

export default defineComponent({
  name: 'Palettes',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Badge,
    Textarea,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    MoreVertical,
    PaletteEditor
  },
  setup() {
    const paletteStore = useColorsStore();
    return { paletteStore };
  },
  data() {
    return {
      searchQuery: '',
      selectedTags: [] as string[],
      showCreateModal: false,
      showImportModal: false,
      showViewModal: false,
      editingPalette: null as ColorPalette | null,
      viewingPalette: null as ColorPalette | null,
      copiedColor: '',
      importData: '',
      newPalette: {
        name: '',
        description: '',
        colors: [
          { id: '1', name: 'Primary', hex: '#3B82F6' },
          { id: '2', name: 'Secondary', hex: '#8B5CF6' }
        ] as EditorPaletteColor[]
      },
      newPaletteTags: [] as string[]
    };
  },
  computed: {
    availableTags() {
      return this.paletteStore.getAllUniqueTags;
    },
    filteredPalettes() {
      let palettes = [...this.paletteStore.palettes];
      
      // Search filter
      if (this.searchQuery) {
        palettes = this.paletteStore.searchPalettes(this.searchQuery);
      }
      
      // Tag filter
      if (this.selectedTags.length > 0) {
        palettes = palettes.filter(palette =>
          this.selectedTags.some(tag => palette.tags?.includes(tag))
        );
      }
      
      return palettes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
  },
  methods: {
    toggleTag(tag: string) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },
    
    
    resetForm() {
      this.newPalette = {
        name: '',
        description: '',
        colors: [
          { id: '1', name: 'Primary', hex: '#3B82F6' },
          { id: '2', name: 'Secondary', hex: '#8B5CF6' }
        ]
      };
      this.newPaletteTags = [];
      this.editingPalette = null;
    },
    
    editPalette(palette: ColorPalette) {
      this.editingPalette = palette;
      this.newPalette = {
        name: palette.name,
        description: palette.description || '',
        colors: palette.colors.map(color => ({
          id: color.id,
          name: color.name,
          hex: color.hex
        }))
      };
      this.newPaletteTags = palette.tags || [];
      this.showCreateModal = true;
    },
    
    savePalette() {
      const tags = this.newPaletteTags;
      
      if (this.editingPalette) {
        this.paletteStore.updatePalette(this.editingPalette.id, {
          name: this.newPalette.name,
          description: this.newPalette.description,
          colors: this.newPalette.colors.map(color => ({
            id: color.id,
            name: color.name,
            hex: color.hex
          })),
          tags
        });
      } else {
        this.paletteStore.createPalette(
          this.newPalette.name,
          this.newPalette.colors.map(({ id, ...color }) => color),
          this.newPalette.description,
          tags
        );
      }
      
      this.showCreateModal = false;
      this.resetForm();
    },
    
    deletePalette(id: string) {
      if (confirm('Are you sure you want to delete this palette?')) {
        this.paletteStore.deletePalette(id);
      }
    },
    
    duplicatePalette(id: string) {
      this.paletteStore.duplicatePalette(id);
    },
    
    exportPalette(id: string) {
      const data = this.paletteStore.exportPalette(id);
      if (data) {
        this.copyToClipboard(data);
        this.showSuccess('Palette data copied to clipboard!');
      }
    },
    
    importPalette() {
      const result = this.paletteStore.importPalette(this.importData);
      if (result) {
        this.showImportModal = false;
        this.importData = '';
        this.showSuccess('Palette imported successfully!');
      } else {
        this.showError('Failed to import palette. Please check the format.');
      }
    },
    
    viewPalette(palette: ColorPalette) {
      this.viewingPalette = palette;
      this.showViewModal = true;
    },
    
    usePaletteInGradient(paletteId: string) {
      this.paletteStore.selectPalette(paletteId);
      this.$router.push('/gradient-generator');
    },
    
    async copyColor(hex: string) {
      try {
        await navigator.clipboard.writeText(hex);
        this.copiedColor = hex;
        this.paletteStore.addToHistory(hex, 'palette');
        setTimeout(() => {
          this.copiedColor = '';
        }, 1000);
      } catch (err) {
        console.error('Failed to copy color:', err);
      }
    },
    
    async copyToClipboard(text: string) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
    
    formatDate(dateString: string) {
      return new Date(dateString).toLocaleDateString();
    },
    
    showSuccess(message: string) {
      // You can integrate with a toast notification system here
      console.log('Success:', message);
    },
    
    showError(message: string) {
      // You can integrate with a toast notification system here
      console.error('Error:', message);
    }
  },
  mounted() {
    this.resetForm();
    // Initialize new palettes for existing users
    this.paletteStore.initializeNewPalettes();
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
  border-radius: 0.25rem;
}
</style>