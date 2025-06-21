<template>
  <div class="page-container space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="text-center md:text-left space-y-2">
      <div class="flex items-center justify-center md:justify-start space-x-3">
        <Hash class="w-8 h-8 md:w-10 md:h-10 text-primary" />
        <h1>UUID Generator</h1>
      </div>
      <p class="text-muted-foreground hidden md:block">Generate and validate universally unique identifiers</p>
    </div>

    <!-- Validator Section -->
    <Card>
      <CardContent class="p-3 md:p-6 space-y-4">
        <div class="heading-group">
          <h2 class="flex items-center space-x-2">
            <CheckCircle class="w-4 h-4 md:w-5 md:h-5" />
            <span>UUID Validator</span>
          </h2>
          <p class="hidden md:block">Validate existing UUIDs and check their version</p>
        </div>

        <!-- Validation Alert -->
        <Transition name="slide">
          <Alert v-if="showMsg" :variant="isValid ? 'default' : 'destructive'">
            <CheckCircle v-if="isValid" class="h-4 w-4" />
            <AlertCircle v-else class="h-4 w-4" />
            <AlertTitle>
              {{ isValid ? 'Valid UUID' : 'Invalid UUID' }}
            </AlertTitle>
            <AlertDescription>
              <span v-if="isValid">This is a valid UUID Version {{ version }}</span>
              <span v-else>The provided string is not a valid UUID</span>
            </AlertDescription>
            <button 
              @click="clearMsg"
              class="absolute top-2 right-2 p-1 hover:bg-background/20 rounded"
            >
              <X class="h-4 w-4" />
            </button>
          </Alert>
        </Transition>

        <!-- Input Section -->
        <div class="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            class="flex-1 px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            placeholder="Enter UUID to validate (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            type="text"
            v-model="toValidate"
            @input="clearMsg"
          />
          <Button @click="validate" :disabled="!toValidate.trim()">
            <CheckCircle class="w-4 h-4 mr-2" />
            Validate
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Generator Section -->
    <div class="grid gap-3 md:gap-6 sm:grid-cols-2">
      <!-- UUID v4 Generator -->
      <Card>
        <CardContent class="p-3 md:p-6 space-y-4">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Zap class="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <h3>UUID Version 4</h3>
            <p class="text-xs md:text-sm text-muted-foreground">Random UUID (recommended)</p>
          </div>

          <div class="space-y-3">
            <Button @click="generateUUIDV4" class="w-full" variant="outline">
              Generate UUID v4
            </Button>
            
            <div v-if="uuidV4" class="space-y-2">
              <div class="p-3 rounded-lg bg-muted border">
                <code class="text-xs md:text-sm font-mono break-all select-all">{{ uuidV4 }}</code>
              </div>
              <div class="flex gap-2">
                <Button @click="copyToClipboard(uuidV4, 'v4')" size="sm" variant="ghost" class="flex-1">
                  <Copy class="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Copy
                </Button>
                <Button @click="generateUUIDV4" size="sm" variant="ghost" class="flex-1">
                  <RefreshCw class="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  New
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- UUID v1 Generator -->
      <Card>
        <CardContent class="p-3 md:p-6 space-y-4">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock class="w-6 h-6 md:w-8 md:h-8 text-secondary-foreground" />
            </div>
            <h3>UUID Version 1</h3>
            <p class="text-xs md:text-sm text-muted-foreground">Time-based UUID</p>
          </div>

          <div class="space-y-3">
            <Button @click="generateUUIDV1" class="w-full" variant="outline">
              Generate UUID v1
            </Button>
            
            <div v-if="uuidV1" class="space-y-2">
              <div class="p-3 rounded-lg bg-muted border">
                <code class="text-xs md:text-sm font-mono break-all select-all">{{ uuidV1 }}</code>
              </div>
              <div class="flex gap-2">
                <Button @click="copyToClipboard(uuidV1, 'v1')" size="sm" variant="ghost" class="flex-1">
                  <Copy class="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Copy
                </Button>
                <Button @click="generateUUIDV1" size="sm" variant="ghost" class="flex-1">
                  <RefreshCw class="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  New
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- History Section -->
    <Card v-if="history.length > 0">
      <CardContent class="p-3 md:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="flex items-center space-x-2">
            <History class="w-4 h-4" />
            <span>Recent UUIDs</span>
          </h3>
          <Button @click="clearHistory" size="sm" variant="ghost">
            <Trash2 class="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="(item, index) in history.slice(0, 10)" 
            :key="index"
            class="group flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
          >
            <span class="text-xs text-muted-foreground w-8 text-center">{{ item.version }}</span>
            <code class="flex-1 text-xs md:text-sm font-mono break-all">{{ item.uuid }}</code>
            <span class="text-xs text-muted-foreground hidden md:block">{{ item.time }}</span>
            <button
              @click="copyToClipboard(item.uuid, `history-${index}`)"
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
            >
              <Copy class="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Info Section -->
    <Card>
      <CardContent class="p-3 md:p-6 space-y-4">
        <h3 class="flex items-center space-x-2">
          <Info class="w-4 h-4" />
          <span>About UUIDs</span>
        </h3>
        
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <h4 class="font-medium text-sm">UUID Version 4</h4>
            <p class="text-xs md:text-sm text-muted-foreground">
              Random or pseudo-random UUIDs. Most commonly used for general purpose unique identifiers.
            </p>
          </div>
          <div class="space-y-2">
            <h4 class="font-medium text-sm">UUID Version 1</h4>
            <p class="text-xs md:text-sm text-muted-foreground">
              Time-based UUIDs that include timestamp and MAC address. Useful when you need chronological ordering.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Toast Notifications -->
    <Transition name="slide">
      <div v-if="toast.show"
           class="fixed bottom-4 md:bottom-8 right-4 md:right-8 bg-background rounded-lg shadow-lg border p-3 md:p-4 min-w-[250px] md:min-w-[300px] max-w-md">
        <div class="flex items-center space-x-2">
          <CheckCircle v-if="toast.type === 'success'" class="h-4 w-4 text-green-500" />
          <AlertCircle v-else class="h-4 w-4 text-red-500" />
          <p class="text-sm">{{ toast.message }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { v1 as uuidv1 } from 'uuid'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Hash, CheckCircle, AlertCircle, Zap, Clock, Copy, RefreshCw,
  History, Trash2, Info, X
} from 'lucide-vue-next'

// State
const toValidate = ref('')
const showMsg = ref(false)
const isValid = ref(false)
const version = ref(0)
const uuidV4 = ref('')
const uuidV1 = ref('')

// History
const history = reactive<Array<{
  uuid: string
  version: string
  time: string
}>>([])

// Toast
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

// Methods
const showToast = (message: string, type: string = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const generateUUIDV4 = () => {
  uuidV4.value = self.crypto.randomUUID()
  addToHistory(uuidV4.value, 'v4')
  showToast('UUID v4 generated successfully')
}

const generateUUIDV1 = () => {
  uuidV1.value = uuidv1()
  addToHistory(uuidV1.value, 'v1')
  showToast('UUID v1 generated successfully')
}

const validate = () => {
  if (!toValidate.value.trim()) return
  
  showMsg.value = true
  isValid.value = uuidValidate(toValidate.value)
  version.value = isValid.value ? uuidVersion(toValidate.value) : 0
}

const clearMsg = () => {
  setTimeout(() => {
    showMsg.value = false
  }, 300)
}

const copyToClipboard = async (text: string, source: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast(`UUID copied to clipboard`)
  } catch (error) {
    showToast('Failed to copy to clipboard', 'error')
  }
}

const addToHistory = (uuid: string, ver: string) => {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  // Don't add duplicates
  if (!history.some(item => item.uuid === uuid)) {
    history.unshift({
      uuid,
      version: ver,
      time
    })
    
    // Keep only last 50 items
    if (history.length > 50) {
      history.splice(50)
    }
  }
}

const clearHistory = () => {
  history.splice(0)
  showToast('History cleared')
}
</script>

<style scoped>
/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>