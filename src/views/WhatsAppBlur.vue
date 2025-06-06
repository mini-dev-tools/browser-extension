<template>
  <div class="page-container">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">WhatsApp Privacy Blur</h1>
        <p class="text-sm text-muted-foreground">
          Protect your privacy by blurring sensitive content on WhatsApp Web
        </p>
      </div>

      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Blur Settings</CardTitle>
          <CardDescription>
            Choose which elements to blur on WhatsApp Web
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label for="all-messages" class="flex flex-col space-y-1">
                <span>All messages in chat</span>
                <span class="text-xs text-muted-foreground">Blur all chat messages</span>
              </Label>
              <Switch
                id="all-messages"
                v-model="settings.allMessages"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="last-messages" class="flex flex-col space-y-1">
                <span>Last messages preview</span>
                <span class="text-xs text-muted-foreground">Blur message previews in chat list</span>
              </Label>
              <Switch
                id="last-messages"
                v-model="settings.lastMessages"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="media-preview" class="flex flex-col space-y-1">
                <span>Media preview</span>
                <span class="text-xs text-muted-foreground">Blur image and video thumbnails</span>
              </Label>
              <Switch
                id="media-preview"
                v-model="settings.mediaPreview"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="media-gallery" class="flex flex-col space-y-1">
                <span>Media gallery</span>
                <span class="text-xs text-muted-foreground">Blur full-size media content</span>
              </Label>
              <Switch
                id="media-gallery"
                v-model="settings.mediaGallery"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="text-input" class="flex flex-col space-y-1">
                <span>Text input</span>
                <span class="text-xs text-muted-foreground">Blur text while typing</span>
              </Label>
              <Switch
                id="text-input"
                v-model="settings.textInput"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="profile-pictures" class="flex flex-col space-y-1">
                <span>Profile pictures</span>
                <span class="text-xs text-muted-foreground">Blur all profile pictures</span>
              </Label>
              <Switch
                id="profile-pictures"
                v-model="settings.profilePictures"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="group-names" class="flex flex-col space-y-1">
                <span>Group/Users names</span>
                <span class="text-xs text-muted-foreground">Blur contact and group names</span>
              </Label>
              <Switch
                id="group-names"
                v-model="settings.groupNames"
                @update:model-value="updateSettings"
              />
            </div>

            <Separator class="my-4" />

            <div class="flex items-center justify-between">
              <Label for="no-transition" class="flex flex-col space-y-1">
                <span>No transition delay</span>
                <span class="text-xs text-muted-foreground">Apply blur instantly without animation</span>
              </Label>
              <Switch
                id="no-transition"
                v-model="settings.noTransition"
                @update:model-value="updateSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <Label for="unblur-hover" class="flex flex-col space-y-1">
                <span>Unblur all on app hover</span>
                <span class="text-xs text-muted-foreground">Temporarily unblur when hovering over WhatsApp</span>
              </Label>
              <Switch
                id="unblur-hover"
                v-model="settings.unblurOnHover"
                @update:model-value="updateSettings"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Blur Active</span>
              <Badge :variant="isActive ? 'default' : 'secondary'">
                {{ isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
            <div class="text-xs text-muted-foreground">
              {{ isActive ? 'Privacy blur is currently active on WhatsApp Web tabs' : 'Open WhatsApp Web to activate blur' }}
            </div>
          </div>
          
          <div class="mt-4 space-y-2">
            <Button @click="toggleBlur" class="w-full" :variant="isActive ? 'destructive' : 'default'">
              {{ isActive ? 'Disable Blur' : 'Enable Blur' }}
            </Button>
            <Button @click="openWhatsApp" variant="outline" class="w-full">
              Open WhatsApp Web
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Quick controls when using WhatsApp Web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-mono bg-muted px-2 py-1 rounded">Alt + X</span>
              <span class="text-muted-foreground">Toggle all blur</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-mono bg-muted px-2 py-1 rounded">Alt + M</span>
              <span class="text-muted-foreground">Toggle messages blur</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-mono bg-muted px-2 py-1 rounded">Alt + I</span>
              <span class="text-muted-foreground">Toggle images blur</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-mono bg-muted px-2 py-1 rounded">Alt + N</span>
              <span class="text-muted-foreground">Toggle names blur</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Label from '@/components/ui/label/Label.vue'
import Switch from '@/components/ui/switch/Switch.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Separator from '@/components/ui/separator/Separator.vue'

interface BlurSettings {
  allMessages: boolean
  lastMessages: boolean
  mediaPreview: boolean
  mediaGallery: boolean
  textInput: boolean
  profilePictures: boolean
  groupNames: boolean
  noTransition: boolean
  unblurOnHover: boolean
}

const isActive = ref(false)
const settings = reactive<BlurSettings>({
  allMessages: true,
  lastMessages: true,
  mediaPreview: true,
  mediaGallery: true,
  textInput: false,
  profilePictures: true,
  groupNames: true,
  noTransition: false,
  unblurOnHover: true
})

onMounted(async () => {
  // Load saved settings
  if (chrome?.storage) {
    const result = await chrome.storage.local.get(['whatsappBlurSettings', 'whatsappBlurActive'])
    if (result.whatsappBlurSettings) {
      Object.assign(settings, result.whatsappBlurSettings)
    }
    isActive.value = result.whatsappBlurActive || false
  }
})

const updateSettings = async () => {
  if (chrome?.storage) {
    await chrome.storage.local.set({ whatsappBlurSettings: settings })
    // Send message to content script to update blur
    if (chrome?.tabs?.query && chrome?.tabs?.sendMessage) {
      try {
        const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' } as any)
        tabs.forEach((tab: any) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'updateBlurSettings', 
              settings: settings 
            })
          }
        })
      } catch (error) {
        console.error('Error updating blur settings:', error)
      }
    }
  }
}

const toggleBlur = async () => {
  isActive.value = !isActive.value
  if (chrome?.storage) {
    await chrome.storage.local.set({ whatsappBlurActive: isActive.value })
    // Send message to content script
    if (chrome?.tabs?.query && chrome?.tabs?.sendMessage) {
      try {
        const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' } as any)
        tabs.forEach((tab: any) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { 
              action: isActive.value ? 'enableBlur' : 'disableBlur',
              settings: settings 
            })
          }
        })
      } catch (error) {
        console.error('Error toggling blur:', error)
      }
    }
  }
}

const openWhatsApp = () => {
  if (chrome?.tabs?.create) {
    chrome.tabs.create({ url: 'https://web.whatsapp.com' } as any)
  } else {
    window.open('https://web.whatsapp.com', '_blank')
  }
}
</script>