<template>
  <div class="page-container">
    <div class="heading-group">
      <h1>Block URLs</h1>
      <p class="text-muted-foreground">Block access to distracting websites to improve your focus and productivity.</p>
    </div>

    <!-- Extension Alert -->
    <ExtensionRequired 
      ref="extensionAlert"
      message="URL blocking functionality is not available." 
    />

    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Shield class="h-5 w-5" />
          <span>Website Blocker</span>
        </CardTitle>
        <CardDescription>
          Enable or disable the website blocker and manage your blocked sites list.
        </CardDescription>
      </CardHeader>
      
      <CardContent class="space-y-6">
        <!-- Toggle Section -->
        <div class="space-y-2">
          <Label class="text-base font-medium">Blocker Status</Label>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <Switch 
                v-model="blockSettings.enabled"
                id="blocker-toggle"
              />
              <Label for="blocker-toggle" class="text-sm">
                {{ blockSettings.enabled ? 'Enabled' : 'Disabled' }}
              </Label>
            </div>
            <Badge :variant="blockSettings.enabled ? 'destructive' : 'secondary'" class="ml-auto">
              {{ blockSettings.enabled ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
        </div>

        <template v-if="blockSettings.enabled">
          <Separator />

          <!-- Sites List Section -->
          <div class="space-y-3">
            <div class="space-y-1">
              <Label for="sites-list" class="text-base font-medium">Blocked Sites</Label>
              <p class="text-sm text-muted-foreground">
                Enter one website URL per line (e.g., example.com, facebook.com)
              </p>
            </div>
            
            <Textarea
              id="sites-list"
              v-model="blockSettings.blockedurls"
              placeholder="example.com&#10;facebook.com&#10;twitter.com"
              rows="8"
              class="font-mono text-sm"
            />
            
            <p class="text-xs text-muted-foreground">
              {{ siteCount }} site(s) in blocklist
            </p>
          </div>

          <div class="flex justify-end">
            <Button 
              variant="outline" 
              @click="clearList"
              :disabled="!blockSettings.blockedurls.trim()"
            >
              Clear All
            </Button>
          </div>
        </template>
      </CardContent>
    </Card>

    <!-- Info Card -->
    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <Info class="h-5 w-5" />
          <span>How it works</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start space-x-2">
            <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0"></div>
            <span>Add websites to block by entering their domain names (without http:// or https://)</span>
          </li>
          <li class="flex items-start space-x-2">
            <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0"></div>
            <span>Toggle the blocker on/off using the switch above</span>
          </li>
          <li class="flex items-start space-x-2">
            <div class="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 shrink-0"></div>
            <span>Changes are automatically saved as you type</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Info } from 'lucide-vue-next';
import ExtensionRequired from '@/components/ExtensionRequired.vue';

const blockSettings = ref({
  enabled: false,
  blockedurls: ''
});

const siteCount = computed(() => {
  return blockSettings.value.blockedurls.trim() 
    ? blockSettings.value.blockedurls.trim().split('\n').filter(site => site.trim()).length 
    : 0;
});

// Load settings from Chrome storage on mount
onMounted(async () => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_BLOCKING_STATUS'
        }, resolve);
      });
      
      if (response?.success) {
        blockSettings.value.enabled = response.enabled;
        blockSettings.value.blockedurls = response.sites.join('\n');
      }
    } else {
      // Fallback for web version
      const stored = localStorage.getItem('blockSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        blockSettings.value = parsed;
      }
    }
  } catch (error) {
    console.error('Error loading block settings:', error);
  }
});

// Watch for changes and sync to background script
watch(blockSettings, async (newSettings) => {
  try {
    const sites = newSettings.blockedurls
      .split('\n')
      .map(site => site.trim())
      .filter(site => site.length > 0);

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'UPDATE_BLOCKING',
          enabled: newSettings.enabled,
          sites: sites
        }, () => resolve());
      });
    } else {
      // Fallback for web version
      localStorage.setItem('blockSettings', JSON.stringify(newSettings));
    }
  } catch (error) {
    console.error('Error updating block settings:', error);
  }
}, { deep: true });

const clearList = () => {
  blockSettings.value.blockedurls = '';
};
</script>

