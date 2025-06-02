<template>
  <div class="page-container">
    <div class="heading-group">
      <h1>Swagger/OpenAPI Viewer</h1>
      <p>Upload JSON/YAML files or paste Swagger/OpenAPI documentation to view offline</p>
    </div>

    <div class="space-y-6">
      <!-- Input Methods -->
      <Card v-if="!swaggerSpec">
        <CardHeader>
          <h2>Load API Documentation</h2>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- File Upload -->
          <div>
            <label class="block text-sm font-medium mb-2">Upload File</label>
            <input
              ref="fileInput"
              type="file"
              accept=".json,.yaml,.yml"
              @change="handleFileUpload"
              class="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <!-- Text Input -->
          <div>
            <label class="block text-sm font-medium mb-2">Paste Content</label>
            <Textarea
              v-model="textInput"
              placeholder="Paste your Swagger/OpenAPI JSON or YAML content here..."
              rows="8"
              class="w-full"
            />
          </div>

          <!-- Load Button -->
          <Button @click="loadSwaggerContent" :disabled="!hasContent" class="w-full">
            <FileText class="w-4 h-4 mr-2" />
            Load Documentation
          </Button>
        </CardContent>
      </Card>

      <!-- Error Display -->
      <Alert v-if="error" variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- Recent History & Sample Files -->
      <Card v-if="!swaggerSpec">
        <CardHeader>
          <h3>Recent & Examples</h3>
        </CardHeader>
        <CardContent>
          <!-- Recent History -->
          <div v-if="recentSpecs.length > 0" class="mb-6">
            <h4 class="text-sm font-medium mb-2 text-gray-600">Recent</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                v-for="recent in recentSpecs"
                :key="recent.timestamp"
                @click="loadFromHistory(recent)"
                variant="outline"
                size="sm"
                class="justify-start text-left h-auto py-2"
              >
                <div class="flex items-center w-full">
                  <FileText v-if="recent.type === 'file'" class="w-3 h-3 mr-2 text-blue-500" />
                  <Code v-else-if="recent.type === 'sample'" class="w-3 h-3 mr-2 text-green-500" />
                  <Type v-else class="w-3 h-3 mr-2 text-purple-500" />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium truncate">{{ recent.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatTimestamp(recent.timestamp) }}</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <!-- Sample Files -->
          <div>
            <h4 class="text-sm font-medium mb-2 text-gray-600">Examples</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                v-for="sample in sampleFiles"
                :key="sample.name"
                @click="loadSample(sample)"
                variant="outline"
                size="sm"
                class="justify-start"
              >
                <Code class="w-3 h-3 mr-2" />
                {{ sample.name }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Swagger UI Container -->
      <div v-if="swaggerSpec" class="border rounded-lg">
        <div class="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3>API Documentation</h3>
          <Button @click="clearContent" variant="outline" size="sm">
            <X class="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        <div id="swagger-ui" class="p-4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileText, AlertCircle, Code, X, Type } from 'lucide-vue-next'
import yaml from 'js-yaml'

// Swagger UI types
interface SwaggerUIBundle {
  (options: any): any
  presets: {
    apis: any
    standalone: any
  }
}

declare global {
  interface Window {
    SwaggerUIBundle: SwaggerUIBundle
  }
}

const fileInput = ref<HTMLInputElement>()
const textInput = ref('')
const swaggerSpec = ref<any>(null)
const error = ref('')
const swaggerUI = ref<any>(null)
const recentSpecs = ref<Array<{
  name: string
  spec: any
  timestamp: number
  type: 'file' | 'sample' | 'paste'
}>>([])

const STORAGE_KEY = 'swagger-viewer-history'
const MAX_HISTORY = 10

const hasContent = computed(() => {
  return textInput.value.trim().length > 0
})

const sampleFiles = [
  {
    name: 'Petstore API (JSON)',
    url: 'https://petstore.swagger.io/v2/swagger.json',
    type: 'json'
  },
  {
    name: 'JSONPlaceholder API',
    content: {
      openapi: '3.0.0',
      info: {
        title: 'JSONPlaceholder API',
        version: '1.0.0',
        description: 'A simple API for testing and prototyping'
      },
      servers: [
        { url: 'https://jsonplaceholder.typicode.com' }
      ],
      paths: {
        '/posts': {
          get: {
            summary: 'Get all posts',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          title: { type: 'string' },
                          body: { type: 'string' },
                          userId: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/posts/{id}': {
          get: {
            summary: 'Get post by ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer' }
              }
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        body: { type: 'string' },
                        userId: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
]

const loadSwaggerUI = () => {
  return new Promise<void>((resolve) => {
    // Check if Swagger UI is already loaded
    if (typeof (window as any).SwaggerUIBundle !== 'undefined') {
      resolve()
      return
    }

    // Load Swagger UI CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/swagger-ui/swagger-ui.css'
    document.head.appendChild(link)

    // Load Swagger UI JS
    const script = document.createElement('script')
    script.src = '/swagger-ui/swagger-ui-bundle.js'
    script.onload = () => resolve()
    script.onerror = (error) => {
      console.error('Failed to load Swagger UI:', error)
      resolve()
    }
    document.head.appendChild(script)
  })
}

const renderSwaggerUI = async (spec: any) => {
  try {
    await loadSwaggerUI()
    await nextTick()

    // Clear previous instance
    if (swaggerUI.value) {
      const container = document.getElementById('swagger-ui')
      if (container) {
        container.innerHTML = ''
      }
    }

    // Create new Swagger UI instance
    swaggerUI.value = window.SwaggerUIBundle({
      spec: spec,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        window.SwaggerUIBundle.presets.apis,
        window.SwaggerUIBundle.presets.standalone
      ],
      layout: 'BaseLayout',
      defaultModelRendering: 'model',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    })
  } catch (err) {
    error.value = 'Failed to render Swagger UI: ' + (err as Error).message
  }
}

const parseContent = (content: string): any => {
  // Try JSON first
  try {
    return JSON.parse(content)
  } catch {
    // Try YAML
    try {
      return yaml.load(content)
    } catch (yamlError) {
      throw new Error('Content is not valid JSON or YAML')
    }
  }
}

const addToHistory = (name: string, spec: any, type: 'file' | 'sample' | 'paste') => {
  const historyItem = {
    name,
    spec,
    timestamp: Date.now(),
    type
  }
  
  // Remove duplicate by name if exists
  recentSpecs.value = recentSpecs.value.filter(item => item.name !== name)
  
  // Add to beginning
  recentSpecs.value.unshift(historyItem)
  
  // Keep only MAX_HISTORY items
  if (recentSpecs.value.length > MAX_HISTORY) {
    recentSpecs.value = recentSpecs.value.slice(0, MAX_HISTORY)
  }
  
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSpecs.value))
  } catch (e) {
    console.warn('Failed to save history to localStorage:', e)
  }
}

const loadFromHistory = async (historyItem: any) => {
  try {
    swaggerSpec.value = historyItem.spec
    await renderSwaggerUI(historyItem.spec)
  } catch (err) {
    error.value = 'Failed to load from history: ' + (err as Error).message
  }
}

const formatTimestamp = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

const loadSwaggerContent = async () => {
  error.value = ''
  
  try {
    const content = textInput.value.trim()
    
    if (!content) {
      error.value = 'Please upload a file or paste content'
      return
    }

    const spec = parseContent(content)
    
    // Basic validation
    if (!spec.openapi && !spec.swagger) {
      error.value = 'This does not appear to be a valid Swagger/OpenAPI specification'
      return
    }

    // Determine type and name
    const type = fileInput.value?.files?.length ? 'file' : 'paste'
    const name = type === 'file' 
      ? fileInput.value!.files![0].name 
      : spec.info?.title || 'Untitled API'
    
    // Add to history
    addToHistory(name, spec, type)
    
    swaggerSpec.value = spec
    await renderSwaggerUI(spec)
  } catch (err) {
    error.value = (err as Error).message
  }
}

const loadSample = async (sample: any) => {
  error.value = ''
  
  try {
    let spec: any
    
    if (sample.url) {
      // Fetch remote sample
      const response = await fetch(sample.url)
      if (!response.ok) {
        throw new Error('Failed to fetch sample file')
      }
      spec = await response.json()
    } else if (sample.content) {
      // Use local sample
      spec = sample.content
    } else {
      throw new Error('Invalid sample configuration')
    }
    
    // Add to history
    addToHistory(sample.name, spec, 'sample')
    
    swaggerSpec.value = spec
    await renderSwaggerUI(spec)
  } catch (err) {
    error.value = 'Failed to load sample: ' + (err as Error).message
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    try {
      const content = await file.text()
      textInput.value = content
      error.value = ''
    } catch (err) {
      error.value = 'Failed to read file: ' + (err as Error).message
    }
  }
}

const clearContent = () => {
  swaggerSpec.value = null
  textInput.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  error.value = ''
  
  // Clear Swagger UI container
  const container = document.getElementById('swagger-ui')
  if (container) {
    container.innerHTML = ''
  }
}

const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      recentSpecs.value = JSON.parse(stored)
    }
  } catch (e) {
    console.warn('Failed to load history from localStorage:', e)
  }
}

onMounted(() => {
  // Load history from localStorage
  loadHistoryFromStorage()
  
  // Preload Swagger UI for better performance
  loadSwaggerUI()
})
</script>

<style scoped>
/* Override Swagger UI styles for better integration */
:deep(#swagger-ui) {
  font-family: inherit;
}

:deep(.swagger-ui .topbar) {
  display: none;
}

:deep(.swagger-ui .info) {
  margin: 0;
}
</style>