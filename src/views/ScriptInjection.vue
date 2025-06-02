<template>
  <div class="page-container">
    <div class="heading-group">
      <h1>Script & CSS Injection</h1>
      <p class="text-gray-600">Inject custom JavaScript and CSS into websites with URL pattern support</p>
    </div>

    <!-- Tabs for One-time vs Persistent Scripts -->
    <div class="mb-6">
      <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          @click="activeTab = 'instant'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'instant'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Instant Injection
        </button>
        <button
          @click="activeTab = 'persistent'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'persistent'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Persistent Scripts
        </button>
        <button
          @click="activeTab = 'manage'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'manage'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Manage Scripts
        </button>
      </div>
    </div>

    <!-- Instant Injection Tab -->
    <div v-if="activeTab === 'instant'" class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- JavaScript Injection -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <span class="text-yellow-600">⚡</span>
              JavaScript Injection
            </CardTitle>
            <CardDescription>
              Execute custom JavaScript code on the active tab
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="js-input">JavaScript Code</Label>
              <Textarea
                id="js-input"
                v-model="jsCode"
                placeholder="console.log('Hello from injected script!');"
                class="min-h-32 font-mono text-sm"
              />
            </div>
            <div class="flex gap-2">
              <Button @click="injectJS" :disabled="!jsCode.trim()" class="flex-1">
                <span class="mr-2">🚀</span>
                Inject JavaScript
              </Button>
              <Button variant="outline" @click="clearJS">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- CSS Injection -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <span class="text-blue-600">🎨</span>
              CSS Injection
            </CardTitle>
            <CardDescription>
              Apply custom CSS styles to the active tab
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="css-input">CSS Rules</Label>
              <Textarea
                id="css-input"
                v-model="cssCode"
                placeholder="body { background-color: #f0f0f0; }"
                class="min-h-32 font-mono text-sm"
              />
            </div>
            <div class="flex gap-2">
              <Button @click="injectCSS" :disabled="!cssCode.trim()" class="flex-1">
                <span class="mr-2">🎨</span>
                Inject CSS
              </Button>
              <Button variant="outline" @click="clearCSS">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Presets Section -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="text-purple-600">📋</span>
            Quick Presets
          </CardTitle>
          <CardDescription>
            Common injection examples to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <h3 class="font-medium text-sm">JavaScript Examples</h3>
              <div class="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadJSPreset('console')"
                  class="w-full justify-start text-xs"
                >
                  Console Log Example
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadJSPreset('highlight')"
                  class="w-full justify-start text-xs"
                >
                  Highlight All Links
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadJSPreset('scroll')"
                  class="w-full justify-start text-xs"
                >
                  Smooth Scroll to Top
                </Button>
              </div>
            </div>
            <div class="space-y-2">
              <h3 class="font-medium text-sm">CSS Examples</h3>
              <div class="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadCSSPreset('dark')"
                  class="w-full justify-start text-xs"
                >
                  Dark Mode Override
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadCSSPreset('highlight')"
                  class="w-full justify-start text-xs"
                >
                  Highlight Headings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="loadCSSPreset('hide')"
                  class="w-full justify-start text-xs"
                >
                  Hide Advertisements
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Persistent Scripts Tab -->
    <div v-else-if="activeTab === 'persistent'" class="space-y-6">
      <!-- Create New Script Form -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="text-green-600">➕</span>
            Create Persistent Script
          </CardTitle>
          <CardDescription>
            Create scripts that automatically run on matching websites
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <Label for="script-name">Script Name</Label>
              <Input
                id="script-name"
                v-model="newScript.name"
                placeholder="My Custom Script"
              />
            </div>
            <div>
              <Label for="script-type">Script Type</Label>
              <select
                id="script-type"
                v-model="newScript.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="css">CSS</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label for="url-pattern">URL Pattern</Label>
            <Input
              id="url-pattern"
              v-model="newScript.urlPattern"
              placeholder="*://example.com/* or *://*/* for all sites"
            />
            <p class="text-xs text-gray-500 mt-1">
              Examples: *://github.com/*, *://*.google.com/*, *://*/* (all sites)
            </p>
          </div>

          <div>
            <Label :for="`new-script-code`">{{ newScript.type === 'javascript' ? 'JavaScript' : 'CSS' }} Code</Label>
            <Textarea
              :id="`new-script-code`"
              v-model="newScript.code"
              :placeholder="newScript.type === 'javascript' ? 'console.log(\'Hello from persistent script!\');' : 'body { background-color: #f0f0f0; }'"
              class="min-h-32 font-mono text-sm"
            />
          </div>

          <div class="flex items-center space-x-2">
            <input
              id="auto-enable"
              v-model="newScript.enabled"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label for="auto-enable" class="text-sm">
              Enable automatically
            </Label>
          </div>

          <div class="flex gap-2">
            <Button @click="saveScript" :disabled="!canSaveScript" class="flex-1">
              <span class="mr-2">💾</span>
              Save Script
            </Button>
            <Button variant="outline" @click="clearNewScript">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Manage Scripts Tab -->
    <div v-else-if="activeTab === 'manage'" class="space-y-6">
      <div v-if="savedScripts.length === 0" class="text-center py-8">
        <p class="text-gray-500">No persistent scripts created yet.</p>
        <Button @click="activeTab = 'persistent'" variant="outline" class="mt-4">
          Create Your First Script
        </Button>
      </div>

      <div v-else class="space-y-4">
        <div class="flex justify-between items-center">
          <h2>Your Scripts ({{ savedScripts.length }})</h2>
          <div class="flex gap-2">
            <Button @click="activeTab = 'persistent'" size="sm">
              <span class="mr-1">➕</span>
              Add Script
            </Button>
            <Button @click="checkAndInjectScripts" variant="outline" size="sm">
              <span class="mr-1">🔄</span>
              Check Current Page
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead class="hidden md:table-cell">URL Pattern</TableHead>
                <TableHead class="w-20">Status</TableHead>
                <TableHead class="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="script in savedScripts" :key="script.id">
                <TableCell>
                  <span :class="script.type === 'javascript' ? 'text-yellow-600' : 'text-blue-600'">
                    {{ script.type === 'javascript' ? '⚡' : '🎨' }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="space-y-1">
                    <div class="font-medium">{{ script.name }}</div>
                    <div class="text-xs text-gray-500 md:hidden">
                      {{ script.urlPattern.length > 30 ? script.urlPattern.substring(0, 30) + '...' : script.urlPattern }}
                    </div>
                  </div>
                </TableCell>
                <TableCell class="hidden md:table-cell">
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded">
                    {{ script.urlPattern.length > 50 ? script.urlPattern.substring(0, 50) + '...' : script.urlPattern }}
                  </code>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <Switch
                      :checked="script.enabled"
                      @update:checked="toggleScript(script.id)"
                    />
                    <span class="text-xs text-gray-500">
                      {{ script.enabled ? 'On' : 'Off' }}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="runScriptOnce(script)"
                      title="Run Now"
                    >
                      ▶️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editScript(script)"
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="deleteScript(script.id)"
                      class="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" class="mt-4">
      <Alert :class="statusType === 'error' ? 'border-red-500' : 'border-green-500'">
        <AlertDescription>
          {{ statusMessage }}
        </AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SavedScript {
  id: string
  name: string
  type: 'javascript' | 'css'
  code: string
  urlPattern: string
  enabled: boolean
  createdAt: number
}

const activeTab = ref<'instant' | 'persistent' | 'manage'>('instant')
const jsCode = ref('')
const cssCode = ref('')
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
// Use ref for scripts and manual storage management
const savedScripts = ref<SavedScript[]>([])

const newScript = ref<Omit<SavedScript, 'id' | 'createdAt'>>({
  name: '',
  type: 'javascript',
  code: '',
  urlPattern: '*://*/*',
  enabled: true
})

const canSaveScript = computed(() => {
  return newScript.value.name.trim() && 
         newScript.value.code.trim() && 
         newScript.value.urlPattern.trim()
})

const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Instant Injection Functions
const injectJS = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error('No active tab found')

    // Create a data URL for CSP-compliant injection
    const scriptUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(jsCode.value)}`
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (scriptUrl: string) => {
        try {
          // Create script element with src instead of inline content
          const script = document.createElement('script')
          script.src = scriptUrl
          script.onload = () => script.remove()
          script.onerror = () => script.remove()
          document.head.appendChild(script)
        } catch (error) {
          console.error('Injection error:', error)
        }
      },
      args: [scriptUrl]
    })

    showStatus('JavaScript injected successfully!', 'success')
  } catch (error) {
    showStatus(`Error injecting JavaScript: ${error}`, 'error')
  }
}

const injectCSS = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error('No active tab found')

    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: cssCode.value
    })

    showStatus('CSS injected successfully!', 'success')
  } catch (error) {
    showStatus(`Error injecting CSS: ${error}`, 'error')
  }
}

const clearJS = () => {
  jsCode.value = ''
}

const clearCSS = () => {
  cssCode.value = ''
}

const loadJSPreset = (preset: string) => {
  const presets = {
    console: `console.log('Hello from injected script!');
console.log('Current page:', window.location.href);`,
    highlight: `document.querySelectorAll('a').forEach(link => {
  link.style.backgroundColor = 'yellow';
  link.style.padding = '2px';
});`,
    scroll: `window.scrollTo({
  top: 0,
  behavior: 'smooth'
});`
  }
  jsCode.value = presets[preset as keyof typeof presets] || ''
}

const loadCSSPreset = (preset: string) => {
  const presets = {
    dark: `body {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

div, span, p, h1, h2, h3, h4, h5, h6 {
  background-color: transparent !important;
  color: #ffffff !important;
}`,
    highlight: `h1, h2, h3, h4, h5, h6 {
  background-color: #ffeb3b !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  color: #333 !important;
}`,
    hide: `[class*="ad"], [id*="ad"], [class*="advertisement"] {
  display: none !important;
}

.sidebar, .social-share {
  display: none !important;
}`
  }
  cssCode.value = presets[preset as keyof typeof presets] || ''
}

// Script Management Functions
// Use Chrome storage as the primary source of truth
const loadScripts = async () => {
  try {
    const result = await chrome.storage.local.get('persistentScripts')
    savedScripts.value = result.persistentScripts || []
  } catch (error) {
    console.error('Error loading scripts:', error)
    // Fallback to localStorage if Chrome storage fails
    try {
      const localStorage = window.localStorage.getItem('persistentScripts')
      if (localStorage) {
        savedScripts.value = JSON.parse(localStorage)
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
  }
}

const saveScripts = async () => {
  try {
    // Save to Chrome storage (primary)
    await chrome.storage.local.set({ persistentScripts: savedScripts.value })
    // Also save to localStorage as backup
    window.localStorage.setItem('persistentScripts', JSON.stringify(savedScripts.value))
  } catch (error) {
    console.error('Error saving scripts:', error)
  }
}

const saveScript = async () => {
  const script: SavedScript = {
    ...newScript.value,
    id: Date.now().toString(),
    createdAt: Date.now()
  }
  
  savedScripts.value.push(script)
  await saveScripts()
  clearNewScript()
  showStatus('Script saved successfully!', 'success')
  activeTab.value = 'manage'
}

const clearNewScript = () => {
  newScript.value = {
    name: '',
    type: 'javascript',
    code: '',
    urlPattern: '*://*/*',
    enabled: true
  }
}

const toggleScript = async (scriptId: string) => {
  const script = savedScripts.value.find(s => s.id === scriptId)
  if (script) {
    script.enabled = !script.enabled
    await saveScripts()
    showStatus(`Script ${script.enabled ? 'enabled' : 'disabled'}`, 'success')
  }
}

const editScript = (script: SavedScript) => {
  newScript.value = {
    name: script.name,
    type: script.type,
    code: script.code,
    urlPattern: script.urlPattern,
    enabled: script.enabled
  }
  deleteScript(script.id)
  activeTab.value = 'persistent'
}

const deleteScript = async (scriptId: string) => {
  savedScripts.value = savedScripts.value.filter(s => s.id !== scriptId)
  await saveScripts()
  showStatus('Script deleted', 'success')
}

const runScriptOnce = async (script: SavedScript) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) throw new Error('No active tab found')

    if (script.type === 'javascript') {
      // Create a data URL for CSP-compliant injection
      const scriptUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(script.code)}`
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (scriptUrl: string) => {
          try {
            // Create script element with src instead of inline content
            const scriptEl = document.createElement('script')
            scriptEl.src = scriptUrl
            scriptEl.onload = () => scriptEl.remove()
            scriptEl.onerror = () => scriptEl.remove()
            document.head.appendChild(scriptEl)
          } catch (error) {
            console.error('Script execution error:', error)
          }
        },
        args: [scriptUrl]
      })
    } else {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: script.code
      })
    }

    showStatus(`${script.name} executed successfully!`, 'success')
  } catch (error) {
    showStatus(`Error running ${script.name}: ${error}`, 'error')
  }
}

// URL Pattern Matching
const matchesPattern = (url: string, pattern: string): boolean => {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  
  try {
    const regex = new RegExp('^' + regexPattern + '$', 'i')
    return regex.test(url)
  } catch {
    return false
  }
}

const checkScriptMatch = async (script: SavedScript) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.url) {
      showStatus('No active tab URL found', 'error')
      return
    }

    const matches = matchesPattern(tab.url, script.urlPattern)
    showStatus(
      matches 
        ? `✅ Script "${script.name}" matches current page`
        : `❌ Script "${script.name}" does NOT match current page`,
      matches ? 'success' : 'error'
    )
  } catch (error) {
    showStatus(`Error checking match: ${error}`, 'error')
  }
}

// Auto-inject scripts on page load
const checkAndInjectScripts = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id || !tab.url) {
      showStatus('No active tab found', 'error')
      return
    }


    const enabledScripts = savedScripts.value.filter(script => 
      script.enabled && matchesPattern(tab.url!, script.urlPattern)
    )

    if (enabledScripts.length === 0) {
      showStatus('No enabled scripts match current page', 'success')
      return
    }

    for (const script of enabledScripts) {
      if (script.type === 'javascript') {
        // Create a data URL for CSP-compliant injection
        const scriptUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(script.code)}`
        
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (scriptUrl: string) => {
            try {
              // Create script element with src instead of inline content
              const scriptEl = document.createElement('script')
              scriptEl.src = scriptUrl
              scriptEl.onload = () => scriptEl.remove()
              scriptEl.onerror = () => scriptEl.remove()
              document.head.appendChild(scriptEl)
            } catch (error) {
              console.error('Auto-injection error:', error)
            }
          },
          args: [scriptUrl]
        })
      } else {
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          css: script.code
        })
      }
    }

    showStatus(`${enabledScripts.length} script(s) auto-injected successfully!`, 'success')
  } catch (error) {
    showStatus(`Auto-injection error: ${error}`, 'error')
  }
}

// Load scripts on mount
onMounted(() => {
  loadScripts()
})
</script>