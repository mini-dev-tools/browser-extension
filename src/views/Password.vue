<template>
  <div class="page-container space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="hidden md:block text-center md:text-left space-y-2">
      <div class="flex items-center justify-center md:justify-start space-x-3">
        <Shield class="w-8 h-8 md:w-10 md:h-10 text-primary" />
        <h1>Password Generator</h1>
      </div>
      <p class="text-muted-foreground hidden md:block">Generate secure passwords with advanced customization</p>
    </div>

    <!-- Main Content -->
    <div class="grid gap-3 md:gap-4 sm:grid-cols-2">
      <!-- Configuration Panel -->
      <div class="md:col-span-1">
        <Card>
          <CardContent class="p-3 md:p-4 space-y-3 md:space-y-4">
            <div class="heading-group">
              <h2 class="hidden md:flex items-center space-x-2 ">
                <Settings class="w-4 h-4 md:w-5 md:h-5" />
                <span>Configuration</span>
              </h2>
            </div>

            <!-- Password Length -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Password Length</label>
                <span class="px-2 py-1 bg-muted rounded text-xs font-medium">
                  {{ passwordConfig.length }} characters
                </span>
              </div>
              <input
                  type="range"
                  v-model.number="passwordConfig.length"
                  min="4"
                  max="128"
                  class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            <!-- Character Types -->
            <div class="space-y-3">
              <h3 class="flex items-center space-x-2">
                <Type class="w-4 h-4" />
                <span>Character Types</span>
              </h3>

              <div class="space-y-2">
                <div v-for="option in characterOptions" :key="option.key"
                     class="flex items-center justify-between p-2 rounded-lg transition-colors"
                     :class="passwordConfig.charTypes[option.key as keyof CharTypes]
                       ? 'bg-accent hover:bg-accent/80'
                       : 'bg-muted hover:bg-muted/80'">
                  <div class="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        :id="option.key"
                        v-model="passwordConfig.charTypes[option.key as keyof CharTypes]"
                        class="w-4 h-4 text-primary rounded"
                    />
                    <label :for="option.key" class="text-sm cursor-pointer select-none">
                      {{ option.label }}
                    </label>
                  </div>
                  <code class="text-xs font-mono text-muted-foreground">
                    {{ option.display }}
                  </code>
                </div>
              </div>
            </div>

            <!-- Advanced Options -->
            <div class="space-y-3">
              <button
                  @click="showAdvanced = !showAdvanced"
                  class="flex items-center justify-between w-full p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <span class="text-sm font-medium">Advanced Options</span>
                <ChevronDown class="w-4 h-4 transition-transform"
                             :class="{ 'rotate-180': showAdvanced }" />
              </button>

              <Transition name="slide">
                <div v-if="showAdvanced" class="space-y-3">
                  <div class="flex items-center justify-between p-2 rounded-lg"
                       :class="passwordConfig.excludeAmbiguous
                         ? 'bg-accent'
                         : 'bg-muted'">
                    <div class="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          id="exclude-ambiguous"
                          v-model="passwordConfig.excludeAmbiguous"
                          class="w-4 h-4 text-primary rounded"
                      />
                      <label for="exclude-ambiguous" class="text-sm cursor-pointer">
                        Exclude ambiguous
                      </label>
                    </div>
                    <div class="group relative">
                      <Info class="w-4 h-4 text-muted-foreground" />
                      <div class="absolute right-0 bottom-6 hidden group-hover:block bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap z-10 border">
                        Excludes: 0, O, l, I
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label for="custom-chars" class="text-sm font-medium">Custom Characters</label>
                    <input
                        id="custom-chars"
                        v-model="passwordConfig.customChars"
                        type="text"
                        placeholder="Add custom characters..."
                        class="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    />
                  </div>

                  <!-- Active Character Set Preview -->
                  <div v-if="characterSet" class="space-y-2">
                    <label class="text-xs text-muted-foreground">Active character set</label>
                    <div class="p-2 rounded-lg bg-muted border">
                      <code class="text-xs font-mono break-all">{{ characterSet }}</code>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Generation Mode Tabs -->
            <div class="space-y-3">
              <div class="flex bg-muted rounded-lg p-1">
                <button
                    @click="passwordConfig.mode = 'single'"
                    class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors"
                    :class="passwordConfig.mode === 'single' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'"
                >
                  Single
                </button>
                <button
                    @click="passwordConfig.mode = 'batch'"
                    class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors"
                    :class="passwordConfig.mode === 'batch' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'"
                >
                  Batch
                </button>
              </div>
            </div>

            <!-- Batch Count -->
            <Transition name="slide">
              <div v-if="passwordConfig.mode === 'batch'" class="space-y-2 p-2 rounded-lg bg-accent border">
                <label class="font-medium text-sm">Number of Passwords</label>
                <div class="flex items-center space-x-2">
                  <input
                      type="number"
                      v-model.number="passwordConfig.batchCount"
                      min="1"
                      max="1000"
                      class="flex-1 px-3 py-2 border rounded-lg font-mono text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                      @keyup.enter="generatePasswords"
                  />
                  <span class="text-sm text-muted-foreground whitespace-nowrap">Max: 1000</span>
                </div>
              </div>
            </Transition>

            <!-- Generate Button -->
            <div class="pt-3">
              <button
                  @click="generatePasswords"
                  :disabled="!hasValidConfig"
                  class="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg shadow hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Zap class="w-4 h-4" />
                <span>Generate {{ passwordConfig.mode === 'batch' ? passwordConfig.batchCount + ' Passwords' : 'Password' }}</span>
              </button>

              <div v-if="!hasValidConfig" class="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2">
                <AlertCircle class="w-4 h-4 text-destructive" />
                <span class="text-sm text-destructive">Select at least one character type</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Results Panel -->
      <div class="md:col-span-1">
        <Card>
          <CardContent class="p-3 md:p-4 space-y-3 md:space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="flex items-center space-x-2">
                <Key class="w-4 h-4 md:w-5 md:h-5" />
                <span>Generated Password{{ passwordConfig.mode === 'batch' ? 's' : '' }}</span>
              </h2>
              <button v-if="state.history.length > 0 && passwordConfig.mode === 'single'"
                      @click="state.showHistory = !state.showHistory"
                      class="px-3 py-1 text-sm hover:bg-muted rounded transition-colors flex items-center space-x-1">
                <History class="w-4 h-4" />
                <span class="hidden md:inline">History ({{ state.history.length }})</span>
              </button>
            </div>

            <!-- Single Password Result -->
            <div v-if="passwordConfig.mode === 'single' && state.currentPassword" class="space-y-3 animate-slide-in">
              <div class="p-3 rounded-xl bg-accent">
                <div class="flex items-center space-x-2">
                  <input
                      :value="state.currentPassword"
                      readonly
                      class="flex-1 px-3 py-2 bg-background/70 rounded-lg font-mono text-sm focus:outline-none"
                  />
                  <button
                      @click="copyToClipboard(state.currentPassword)"
                      class="p-2 hover:bg-background/50 rounded-lg transition-colors"
                      title="Copy password"
                  >
                    <Copy class="w-4 h-4" />
                  </button>
                  <button
                      @click="generatePasswords"
                      class="p-2 hover:bg-background/50 rounded-lg transition-colors"
                      title="Regenerate password"
                  >
                    <RefreshCw class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Password Strength -->
              <PasswordStrengthIndicator v-if="passwordStrength" :strength="passwordStrength" />
            </div>

            <!-- Batch Password Results -->
            <div v-if="passwordConfig.mode === 'batch'" class="space-y-4">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div class="flex items-center space-x-3">
                  <span class="px-2 md:px-3 py-1 bg-muted rounded-full text-xs md:text-sm font-medium flex items-center space-x-2">
                    <ListChecks class="w-3 h-3 md:w-4 md:h-4" />
                    <span>{{ state.passwords.length || passwordConfig.batchCount }} passwords</span>
                  </span>
                  <span class="px-2 md:px-3 py-1 bg-muted rounded-full text-xs md:text-sm">
                    {{ passwordConfig.length }} chars each
                  </span>
                </div>
                <div v-if="state.passwords.length > 0" class="flex space-x-2">
                  <button
                      @click="copyAllPasswords"
                      class="px-2 md:px-3 py-1 md:py-1.5 border rounded-lg hover:bg-muted transition-colors flex items-center space-x-2 text-xs md:text-sm"
                  >
                    <Copy class="w-3 h-3 md:w-4 md:h-4" />
                    <span class="hidden md:inline">Copy All</span>
                  </button>
                  <button
                      @click="downloadPasswords"
                      class="px-2 md:px-3 py-1 md:py-1.5 border rounded-lg hover:bg-muted transition-colors flex items-center space-x-2 text-xs md:text-sm"
                  >
                    <Download class="w-3 h-3 md:w-4 md:h-4" />
                    <span class="hidden md:inline">Download</span>
                  </button>
                  <button
                      @click="clearPasswords"
                      class="p-1 md:p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Trash2 class="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              <!-- Password List -->
              <div class="rounded-lg border bg-muted/50 p-3"
                   :class="state.passwords.length === 0 ? 'border-dashed' : ''">
                <div v-if="state.passwords.length > 0" class="max-h-80 overflow-y-auto space-y-1">
                  <div v-for="(pwd, index) in state.passwords"
                       :key="index"
                       class="group flex items-center space-x-2 p-2 rounded-lg bg-background hover:bg-muted transition-all">
                    <span class="text-xs text-muted-foreground w-8 text-right font-mono">{{ index + 1 }}</span>
                    <code class="flex-1 text-xs font-mono break-all select-all">{{ pwd }}</code>
                    <button
                        @click="copyToClipboard(pwd, index)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-6 text-center">
                  <ListChecks class="w-8 h-8 text-muted-foreground mb-3" />
                  <p class="text-muted-foreground text-sm">
                    Click "Generate {{ passwordConfig.batchCount }} Passwords" to create your password list
                  </p>
                </div>
              </div>
            </div>

            <!-- Password History -->
            <Transition name="slide">
              <div v-if="state.showHistory && state.history.length > 0 && passwordConfig.mode === 'single'"
                   class="space-y-3 pt-6 border-t">
                <div class="flex items-center justify-between">
                  <h3 class="text-muted-foreground">Recent Passwords</h3>
                  <button
                      @click="clearHistory"
                      class="text-xs px-2 py-1 hover:bg-muted rounded transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  <div v-for="(item, index) in state.history.slice(0, 5)"
                       :key="index"
                       class="group flex items-center space-x-2 md:space-x-3 p-2 rounded-lg bg-muted hover:bg-accent transition-colors">
                    <code class="flex-1 text-xs font-mono">{{ item }}</code>
                    <button
                        @click="copyToClipboard(item)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                    >
                      <Copy class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Empty State -->
            <div v-if="passwordConfig.mode === 'single' && !state.currentPassword"
                 class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Key class="w-8 h-8 text-muted-foreground" />
              </div>
              <p class="text-foreground text-lg mb-2">No password generated yet</p>
              <p class="text-sm text-muted-foreground">
                Configure your settings and click generate to create a secure password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Transition name="slide">
      <div v-if="toast.show"
           class="fixed bottom-4 md:bottom-8 right-4 md:right-8 bg-background rounded-lg shadow-lg border p-3 md:p-4 min-w-[250px] md:min-w-[300px] max-w-md"
           :class="{
             'border-l-4 border-green-500': toast.type === 'success',
             'border-l-4 border-red-500': toast.type === 'error',
             'border-l-4 border-blue-500': toast.type === 'info'
           }">
        <h4 v-if="toast.title" class="font-semibold mb-1">{{ toast.title }}</h4>
        <p class="text-sm text-muted-foreground">{{ toast.message }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Shield, Settings, Type, Zap, Copy, Download, Trash2,
  RefreshCw, Key, History, AlertCircle, CheckCircle2,
  XCircle, Info, ChevronDown, ListChecks
} from 'lucide-vue-next'

// Component for password strength indicator
const PasswordStrengthIndicator = {
  props: ['strength'],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium">Password Strength</span>
        <div class="flex items-center space-x-2">
          <Shield
            class="w-4 h-4 md:w-5 md:h-5"
            :class="{
              'text-red-500': strength.color === 'red',
              'text-orange-500': strength.color === 'orange',
              'text-yellow-500': strength.color === 'yellow',
              'text-blue-500': strength.color === 'blue',
              'text-green-500': strength.color === 'green'
            }"
          />
          <span class="font-medium text-sm"
                :class="{
                  'text-red-600': strength.color === 'red',
                  'text-orange-600': strength.color === 'orange',
                  'text-yellow-600': strength.color === 'yellow',
                  'text-blue-600': strength.color === 'blue',
                  'text-green-600': strength.color === 'green'
                }">
            {{ strength.text }}
          </span>
        </div>
      </div>

      <div class="w-full bg-muted rounded-full h-2 md:h-3 overflow-hidden">
        <div class="h-full transition-all duration-500 ease-out"
             :class="{
               'bg-red-500': strength.color === 'red',
               'bg-orange-500': strength.color === 'orange',
               'bg-yellow-500': strength.color === 'yellow',
               'bg-blue-500': strength.color === 'blue',
               'bg-green-500': strength.color === 'green'
             }"
             :style="{ width: strength.percentage + '%' }">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-2">
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.length >= 12" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': strength.length < 12 }">12+ characters</span>
        </div>
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.patterns.uppercase" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': !strength.patterns.uppercase }">Uppercase</span>
        </div>
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.patterns.lowercase" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': !strength.patterns.lowercase }">Lowercase</span>
        </div>
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.patterns.numbers" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': !strength.patterns.numbers }">Numbers</span>
        </div>
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.patterns.symbols" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': !strength.patterns.symbols }">Symbols</span>
        </div>
        <div class="flex items-center space-x-2 text-xs md:text-sm">
          <CheckCircle2 v-if="strength.entropy > 50" class="w-3 h-3 md:w-4 md:h-4 text-green-500" />
          <XCircle v-else class="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
          <span :class="{ 'text-muted-foreground': strength.entropy <= 50 }">High entropy ({{ strength.entropy }} bits)</span>
        </div>
      </div>
    </div>
  `,
  components: { Shield, CheckCircle2, XCircle }
}

// Password Service Class
class PasswordService {
  static CHAR_SETS = {
    numbers: '0123456789',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }

  static AMBIGUOUS_CHARS = '0OIl'

  static buildCharacterSet(config: any) {
    let chars = ''

    Object.entries(config.charTypes).forEach(([type, enabled]) => {
      if (enabled && this.CHAR_SETS[type as keyof typeof this.CHAR_SETS]) {
        chars += this.CHAR_SETS[type as keyof typeof this.CHAR_SETS]
      }
    })

    if (config.customChars) {
      chars += config.customChars
    }

    if (config.excludeAmbiguous) {
      chars = chars.split('').filter(char => !this.AMBIGUOUS_CHARS.includes(char)).join('')
    }

    return [...new Set(chars)].join('')
  }

  static generate(config: any, charset: string) {
    if (!charset) throw new Error('No character set available')

    const array = new Uint32Array(config.length)
    crypto.getRandomValues(array)

    let password = ''
    for (let i = 0; i < config.length; i++) {
      password += charset[array[i] % charset.length]
    }

    return password
  }

  static generateBatch(config: any, charset: string, count: number) {
    const passwords = []
    for (let i = 0; i < count; i++) {
      passwords.push(this.generate(config, charset))
    }
    return passwords
  }

  static analyzeStrength(password: string) {
    if (!password) return null

    let score = 0
    const length = password.length

    if (length >= 8) score += 1
    if (length >= 12) score += 2
    if (length >= 16) score += 2

    const patterns = {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    }

    if (patterns.lowercase) score += 1
    if (patterns.uppercase) score += 1
    if (patterns.numbers) score += 1
    if (patterns.symbols) score += 2

    let charsetSize = 0
    if (patterns.lowercase) charsetSize += 26
    if (patterns.uppercase) charsetSize += 26
    if (patterns.numbers) charsetSize += 10
    if (patterns.symbols) charsetSize += 32

    const entropy = Math.log2(Math.pow(charsetSize, length))
    if (entropy > 50) score += 1
    if (entropy > 75) score += 1

    score = Math.min(score, 10)

    let level, color, text
    if (score <= 3) { level = 1; color = 'red'; text = 'Weak' }
    else if (score <= 5) { level = 2; color = 'orange'; text = 'Fair' }
    else if (score <= 7) { level = 3; color = 'yellow'; text = 'Good' }
    else if (score <= 8) { level = 4; color = 'blue'; text = 'Strong' }
    else { level = 5; color = 'green'; text = 'Very Strong' }

    return {
      score,
      level,
      percentage: (score / 10) * 100,
      text,
      color,
      entropy: Math.round(entropy),
      patterns,
      length: password.length
    }
  }
}

// Component state
const showAdvanced = ref(false)

const passwordConfig = reactive({
  length: 16,
  charTypes: {
    numbers: true,
    lowercase: true,
    uppercase: true,
    symbols: true
  },
  excludeAmbiguous: false,
  customChars: '',
  mode: 'single',
  batchCount: 10
})

// Type definitions
interface CharTypes {
  numbers: boolean;
  lowercase: boolean;
  uppercase: boolean;
  symbols: boolean;
}

const state = reactive<{
  currentPassword: string;
  passwords: string[];
  history: string[];
  showHistory: boolean;
}>({
  currentPassword: '',
  passwords: [],
  history: [],
  showHistory: false
})

const toast = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

const characterOptions: Array<{
  key: string;
  label: string;
  display: string;
}> = [
  { key: 'numbers', label: 'Numbers', display: '0-9' },
  { key: 'lowercase', label: 'Lowercase', display: 'a-z' },
  { key: 'uppercase', label: 'Uppercase', display: 'A-Z' },
  { key: 'symbols', label: 'Symbols', display: '!@#$%^&*' }
]

// Computed properties
const characterSet = computed(() => PasswordService.buildCharacterSet(passwordConfig))
const hasValidConfig = computed(() => characterSet.value.length > 0)
const passwordStrength = computed(() => PasswordService.analyzeStrength(state.currentPassword))

// Methods
const showToast = (title: string, message: string, type: string = 'info') => {
  toast.title = title
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const generatePasswords = () => {
  try {
    if (!characterSet.value) {
      showToast('Error', 'Please select at least one character type', 'error')
      return
    }

    if (passwordConfig.mode === 'single') {
      const password = PasswordService.generate(passwordConfig, characterSet.value)
      state.currentPassword = password
      addToHistory(password)
      showToast('Success', 'Password generated successfully', 'success')
    } else {
      const count = Math.min(Math.max(1, passwordConfig.batchCount), 1000)
      state.passwords = PasswordService.generateBatch(passwordConfig, characterSet.value, count)
      showToast('Success', `Generated ${count} passwords`, 'success')
    }
  } catch (error) {
    showToast('Error', (error as Error).message, 'error')
  }
}

const addToHistory = (password: string) => {
  if (!state.history.includes(password)) {
    state.history.unshift(password)
    if (state.history.length > 10) {
      state.history = state.history.slice(0, 10)
    }
  }
}

const copyToClipboard = async (text: string, index: number | null = null) => {
  try {
    await navigator.clipboard.writeText(text)
    const message = index !== null
        ? `Password #${index + 1} copied`
        : 'Password copied to clipboard'
    showToast('', message, 'success')
  } catch (error) {
    showToast('Error', 'Failed to copy to clipboard', 'error')
  }
}

const copyAllPasswords = async () => {
  try {
    await navigator.clipboard.writeText(state.passwords.join('\n'))
    showToast('Success', `Copied ${state.passwords.length} passwords`, 'success')
  } catch (error) {
    showToast('Error', 'Failed to copy passwords', 'error')
  }
}

const downloadPasswords = () => {
  const content = state.passwords.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `passwords_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showToast('Success', 'Download started', 'success')
}

const clearPasswords = () => {
  state.passwords = []
  showToast('', 'Password list cleared', 'info')
}

const clearHistory = () => {
  state.history = []
  state.showHistory = false
  showToast('', 'History cleared', 'info')
}

// Watchers
watch(() => [passwordConfig.charTypes, passwordConfig.excludeAmbiguous, passwordConfig.customChars], () => {
  if (state.currentPassword && passwordConfig.mode === 'single') {
    showToast('', 'Configuration updated. Click regenerate to apply changes.', 'info')
  }
}, { deep: true })
</script>

<style scoped>
/* Animations */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom range slider */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: hsl(var(--primary));
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: hsl(var(--primary));
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

@media (min-width: 768px) {
  input[type="range"]::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
  }
}
</style>