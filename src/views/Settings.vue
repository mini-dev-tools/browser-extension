<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Color Settings</CardTitle>
        <CardDescription>Configure how colors are copied and managed</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Preferred Copy Format -->
        <div class="space-y-3">
          <Label class="text-base font-medium">Preferred Copy Format</Label>
          <p class="text-sm text-muted-foreground">
            Choose the default format when double-clicking colors
          </p>
          <Select v-model="settings.preferredCopyFormat">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="format in copyFormats" 
                :key="format.key" 
                :value="format.key"
              >
                <div class="flex items-center justify-between w-full">
                  <span class="font-medium">{{ format.label }}</span>
                  <span class="text-xs text-muted-foreground ml-2">{{ format.example }}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Double Click Copy -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label class="text-base font-medium">Double-Click Copy</Label>
            <p class="text-sm text-muted-foreground">
              Enable double-clicking colors to copy in preferred format
            </p>
          </div>
          <Switch 
            v-model:checked="settings.enableDoubleClickCopy"
            @update:checked="updateSetting('enableDoubleClickCopy', $event)"
          />
        </div>

        <!-- Show Copy Toasts -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label class="text-base font-medium">Copy Notifications</Label>
            <p class="text-sm text-muted-foreground">
              Show toast notifications when colors are copied
            </p>
          </div>
          <Switch 
            v-model:checked="settings.showCopyToasts"
            @update:checked="updateSetting('showCopyToasts', $event)"
          />
        </div>

        <!-- Auto Add to History -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label class="text-base font-medium">Auto Add to History</Label>
            <p class="text-sm text-muted-foreground">
              Automatically add copied colors to history
            </p>
          </div>
          <Switch 
            v-model:checked="settings.autoAddToHistory"
            @update:checked="updateSetting('autoAddToHistory', $event)"
          />
        </div>

        <!-- Max History Items -->
        <div class="space-y-3">
          <Label class="text-base font-medium">Max History Items</Label>
          <p class="text-sm text-muted-foreground">
            Maximum number of colors to keep in history (10-200)
          </p>
          <div class="flex items-center space-x-4">
            <Slider
              v-model="historySlider"
              :min="10"
              :max="200"
              :step="10"
              class="flex-1"
              @update:model-value="updateHistoryLimit"
            />
            <Badge variant="outline" class="min-w-[4rem] justify-center">
              {{ settings.maxHistoryItems }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Preview Section -->
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>Test your settings with this sample color</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4">
          <ColorContextProvider
            color="#3B82F6"
            color-name="Sample Blue"
            source="settings"
            source-name="Settings Preview"
          >
            <div 
              class="w-16 h-16 rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform"
              style="backgroundColor: #3B82F6"
              title="Double-click to test preferred copy format"
            ></div>
          </ColorContextProvider>
          <div class="space-y-1">
            <p class="font-medium">#3B82F6</p>
            <p class="text-sm text-muted-foreground">
              {{ settings.enableDoubleClickCopy ? 'Double-click' : 'Right-click' }} to copy as {{ getCurrentFormatLabel() }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Import/Export -->
    <Card>
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>Export or import your settings</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <Button @click="exportSettings" variant="outline">
            Export Settings
          </Button>
          <Button @click="importSettings" variant="outline">
            Import Settings
          </Button>
          <Button @click="resetSettings" variant="destructive">
            Reset to Defaults
          </Button>
        </div>
        
        <div v-if="showImportTextarea" class="space-y-2">
          <Label>Paste Settings JSON</Label>
          <Textarea
            v-model="importData"
            placeholder="Paste exported settings here..."
            rows="6"
          />
          <div class="flex gap-2">
            <Button @click="applyImport" size="sm">Apply</Button>
            <Button @click="cancelImport" variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'vue-sonner';
import ColorContextProvider from '@/components/colors/ColorContextProvider.vue';

export default defineComponent({
  name: 'Settings',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Label,
    Switch,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Slider,
    Badge,
    Textarea,
    ColorContextProvider
  },
  setup() {
    const settingsStore = useSettingsStore();
    const showImportTextarea = ref(false);
    const importData = ref('');
    
    const historySlider = ref([settingsStore.settings.maxHistoryItems]);
    
    const copyFormats = computed(() => settingsStore.getCopyFormatDetails());
    
    const updateSetting = (key: string, value: any) => {
      settingsStore.updateSetting(key as any, value);
    };
    
    const updateHistoryLimit = (value: number[] | undefined) => {
      if (value && value[0]) {
        settingsStore.updateSetting('maxHistoryItems', value[0]);
        historySlider.value = value;
      }
    };
    
    const getCurrentFormatLabel = () => {
      const format = copyFormats.value.find(f => f.key === settingsStore.getPreferredCopyFormat);
      return format?.label || 'HEX';
    };
    
    const exportSettings = async () => {
      const exported = settingsStore.exportSettings();
      try {
        await navigator.clipboard.writeText(exported);
        toast('Settings exported to clipboard', {
          description: 'You can now save this JSON or import it later',
          duration: 3000
        });
      } catch (err) {
        console.error('Failed to copy settings:', err);
        toast('Export failed', {
          description: 'Could not copy settings to clipboard',
          duration: 3000
        });
      }
    };
    
    const importSettings = () => {
      showImportTextarea.value = true;
      importData.value = '';
    };
    
    const applyImport = () => {
      const success = settingsStore.importSettings(importData.value);
      if (success) {
        toast('Settings imported successfully', {
          description: 'Your settings have been updated',
          duration: 3000
        });
        showImportTextarea.value = false;
        importData.value = '';
        // Update local refs
        historySlider.value = [settingsStore.settings.maxHistoryItems];
      } else {
        toast('Import failed', {
          description: 'Invalid settings format',
          duration: 3000
        });
      }
    };
    
    const cancelImport = () => {
      showImportTextarea.value = false;
      importData.value = '';
    };
    
    const resetSettings = () => {
      settingsStore.resetSettings();
      historySlider.value = [settingsStore.settings.maxHistoryItems];
      toast('Settings reset', {
        description: 'All settings have been reset to defaults',
        duration: 3000
      });
    };
    
    return {
      settings: settingsStore.settings,
      copyFormats,
      historySlider,
      showImportTextarea,
      importData,
      updateSetting,
      updateHistoryLimit,
      getCurrentFormatLabel,
      exportSettings,
      importSettings,
      applyImport,
      cancelImport,
      resetSettings
    };
  }
});
</script>
