<script setup lang="ts">
import { ref, computed } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

// Import all the ace editor modes and themes
import 'brace/mode/text';
import 'brace/mode/python';
import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/mode/css';
import 'brace/mode/json';
import 'brace/mode/php';
import 'brace/mode/less';
import 'brace/mode/twig';
import 'brace/mode/sql';
import 'brace/mode/markdown';
import 'brace/mode/typescript';
import 'brace/mode/jsx';
import 'brace/mode/tsx';
import 'brace/mode/xml';
import 'brace/mode/yaml';
import 'brace/mode/scss';
import 'brace/theme/chrome';
import 'brace/theme/eclipse';
import 'brace/theme/monokai';
import 'brace/theme/tomorrow_night';

import { useFileStore } from '../stores/files';
import { useMainStore } from '../stores/mainStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { 
  Upload, 
  Download, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Copy
} from 'lucide-vue-next';

const fileStore = useFileStore();
const mainStore = useMainStore();

const theme = computed(() => mainStore.isDark ? 'tomorrow_night' : 'eclipse');
const loading = ref(false);
const showDialog = ref(false);
const isEditing = ref(false);
const deleteFileId = ref<string | null>(null);
const searchTerm = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const filteredFiles = computed(() => {
  if (!searchTerm.value) return fileStore.files;
  return fileStore.searchFiles(searchTerm.value);
});

const currentFile = computed(() => {
  const file = fileStore.getCurrentFile;
  console.log('Current file computed:', file);
  return file;
});

const selectedFileTypeValue = computed({
  get: () => {
    if (!currentFile.value) return '';
    return `${currentFile.value.fileType.label}${currentFile.value.fileType.extension}`;
  },
  set: (value: string) => {
    if (!currentFile.value) return;
    const selectedType = fileStore.availableTypes.find(type => `${type.label}${type.extension}` === value);
    if (selectedType) {
      fileStore.updateFileType(currentFile.value.id, selectedType);
    }
  }
});

const dropHandler = (ev: DragEvent) => {
  ev.preventDefault();
  if (ev.dataTransfer?.files[0]) {
    handleFileUpload(ev.dataTransfer.files[0]);
  }
};

const readFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFileUpload(file);
  }
};

const handleFileUpload = async (file: File) => {
  loading.value = true;
  try {
    await fileStore.importFile(file);
  } catch (error) {
    console.error('Failed to upload file:', error);
  } finally {
    loading.value = false;
  }
};

const createNewFile = () => {
  console.log('Creating new file...');
  const newFile = fileStore.createFile();
  console.log('Created new file:', newFile);
  console.log('Store currentFileId:', fileStore.currentFileId);
  console.log('Store getCurrentFile:', fileStore.getCurrentFile);
  console.log('All files:', fileStore.files);
  isEditing.value = true;
  showDialog.value = true;
};

const selectFile = (file: any) => {
  fileStore.selectFile(file.id);
};

const saveFile = () => {
  isEditing.value = false;
  showDialog.value = false;
};

const deleteFile = (fileId: string) => {
  fileStore.deleteFile(fileId);
  deleteFileId.value = null;
};

const exportFile = (file: any) => {
  fileStore.exportFile(file.id);
};

const duplicateFile = (file: any) => {
  fileStore.duplicateFile(file.id);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const updateFileContent = (content: string) => {
  if (currentFile.value) {
    fileStore.updateFileContent(currentFile.value.id, content);
  }
};

const updateFileName = (name: string) => {
  if (currentFile.value) {
    fileStore.updateFileName(currentFile.value.id, name);
  }
};

const getFileStats = (file: any) => {
  const lines = file.content.split('\n').length;
  const chars = file.content.length;
  const size = new Blob([file.content]).size;
  return { lines, chars, size };
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
</script>

<template>
  <div
    class="min-h-screen"
    @drop="dropHandler"
    @dragover.prevent
    @dragenter.prevent
  >
    <div class="page-container">
      <div class="flex justify-between items-center mb-6">
        <div class="heading-group">
          <h1>Quick Files</h1>
          <p>Create, edit, and download text files with syntax highlighting. Supports drag & drop file uploads.</p>
        </div>
        <Button @click="createNewFile" class="gap-2">
          <Plus class="w-4 h-4" />
          New File
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <!-- Files List -->
        <div class="md:col-span-1">
          <div class="mb-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="searchTerm"
                placeholder="Search files..."
                class="pl-10"
              />
            </div>
          </div>

          <div class="mb-4">
            <input 
              type="file" 
              ref="fileInput"
              @change="readFile"
              class="hidden"
              :disabled="loading"
            />
            <Button 
              variant="outline" 
              class="w-full" 
              :disabled="loading"
              @click="fileInput?.click()"
            >
              <Upload class="w-4 h-4 mr-2" />
              {{ loading ? 'Uploading...' : 'Upload File' }}
            </Button>
          </div>

          <div class="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
            <Card 
              v-for="file in filteredFiles" 
              :key="file.id"
              class="cursor-pointer hover:shadow-md transition-shadow"
              :class="{ 'ring-2 ring-blue-500': currentFile?.id === file.id }"
              @click="selectFile(file)"
            >
              <CardHeader class="pb-2">
                <div class="flex justify-between items-start">
                  <CardTitle class="text-sm font-medium truncate">
                    {{ file.name }}{{ file.extension }}
                  </CardTitle>
                  <div class="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      @click.stop="selectFile(file); isEditing = true; showDialog = true"
                      class="h-6 w-6 p-0"
                    >
                      <Edit class="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      @click.stop="duplicateFile(file)"
                      class="h-6 w-6 p-0"
                    >
                      <Copy class="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      @click.stop="exportFile(file)"
                      class="h-6 w-6 p-0"
                    >
                      <Download class="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          @click.stop="deleteFileId = file.id"
                          class="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 class="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{{ file.name }}{{ file.extension }}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction @click="deleteFile(file.id)">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="pt-0">
                <div class="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" class="text-xs">
                    {{ file.fileType.label }}
                  </Badge>
                  <Badge variant="outline" class="text-xs">
                    {{ getFileStats(file).lines }} lines
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ formatDate(file.updatedAt) }}
                </p>
              </CardContent>
            </Card>

            <div v-if="filteredFiles.length === 0" class="text-center text-muted-foreground py-8">
              <FileText class="w-12 h-12 mx-auto mb-4 opacity-50" />
              {{ searchTerm ? 'No files found' : 'No files yet. Create your first file!' }}
            </div>
          </div>
        </div>

        <!-- File Editor/Preview -->
        <div class="md:col-span-2">
          <Card v-if="currentFile" class="h-64 md:h-[600px]">
            <CardHeader class="pb-2">
              <div class="flex justify-between items-start">
                <CardTitle class="text-sm md:text-base truncate">
                  {{ currentFile.name }}{{ currentFile.extension }}
                </CardTitle>
                <div class="flex gap-2 ml-2">
                  <Select v-model="selectedFileTypeValue">
                    <SelectTrigger class="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="type in fileStore.availableTypes" 
                        :key="type.extension"
                        :value="`${type.label}${type.extension}`"
                      >
                        {{ type.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button @click="isEditing = true; showDialog = true" size="sm" class="h-8 px-3 text-xs">
                    <Edit class="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button @click="exportFile(currentFile)" variant="outline" size="sm" class="h-8 px-3 text-xs">
                    <Download class="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{{ formatDate(currentFile.updatedAt) }}</span>
                <Badge variant="secondary" class="text-xs">
                  {{ currentFile.mime }}
                </Badge>
                <span>{{ getFileStats(currentFile).chars }} chars</span>
                <span>{{ formatFileSize(getFileStats(currentFile).size) }}</span>
              </div>
            </CardHeader>
            <CardContent class="h-full overflow-hidden p-2">
              <!-- Debug content info for preview -->
              <div class="text-xs mb-2 p-2 bg-blue-100 rounded">
                Preview Content: {{ (currentFile.content || '').length }} chars
              </div>
              <!-- Markdown Preview -->
              <div v-if="currentFile.fileType.editorType === 'markdown'" class="h-full w-full">
                <MdEditor
                  :model-value="currentFile.content || ''"
                  :editable="false"
                  :toolbars="[]"
                  preview-theme="github"
                  :theme="mainStore.isDark ? 'dark' : 'light'"
                  :height="450"
                  class="w-full rounded-lg"
                />
              </div>
              <!-- Ace Editor for other file types -->
              <div v-else class="h-full w-full">
                <v-ace-editor
                  :model-value="currentFile.content || ''"
                  :lang="currentFile.fileType.aceName"
                  :theme="theme"
                  :readonly="true"
                  :showPrintMargin="false"
                  :wrap="true"
                  :printMargin="false"
                  :fontSize="14"
                  :showGutter="true"
                  :highlightActiveLine="false"
                  :tabSize="2"
                  :useSoftTabs="true"
                  class="h-full rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          <div v-else class="flex items-center justify-center h-64 md:h-[600px] text-muted-foreground">
            <div class="text-center">
              <FileText class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p class="text-sm md:text-lg">Select a file to preview or create a new one</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Dialog -->
      <Dialog v-model:open="showDialog">
        <DialogContent class="max-w-[95vw] max-h-[90vh] w-full flex flex-col">
          <DialogHeader>
            <DialogTitle>
              <Input
                v-if="currentFile"
                :model-value="currentFile.name"
                @update:model-value="updateFileName"
                class="text-lg font-semibold border-none p-0 h-auto"
                placeholder="File name..."
              />
            </DialogTitle>
          </DialogHeader>
          <div class="flex-1 overflow-hidden" v-if="currentFile">
            <!-- File info -->
            <div class="text-xs text-muted-foreground mb-2 p-2 border rounded">
              {{ currentFile?.fileType?.label }} • {{ currentFile?.extension }}
            </div>
            <!-- Debug content info -->
            <div class="text-xs mb-2 p-2 bg-yellow-100 rounded">
              Content length: {{ currentFile.content?.length || 0 }} chars<br>
              Content preview: {{ (currentFile.content || '').substring(0, 100) }}...
            </div>
            <!-- Markdown Editor -->
            <div v-if="currentFile.fileType.editorType === 'markdown'" class="h-[400px]">
              <MdEditor
                :model-value="currentFile.content || ''"
                @update:model-value="updateFileContent"
                :height="400"
                preview-theme="github"
                :theme="mainStore.isDark ? 'dark' : 'light'"
                language="en-US"
                class="w-full h-full"
              />
            </div>
            <!-- Ace Editor -->
            <div v-else class="h-[400px]">
              <v-ace-editor
                :model-value="currentFile.content || ''"
                @update:model-value="updateFileContent"
                :lang="currentFile.fileType.aceName"
                :theme="theme"
                :showPrintMargin="false"
                :wrap="true"
                :printMargin="false"
                :fontSize="14"
                :showGutter="true"
                :highlightActiveLine="true"
                :tabSize="2"
                :useSoftTabs="true"
                class="h-full w-full rounded-md"
                placeholder="Start typing..."
              />
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center text-muted-foreground">
            <div class="text-center">
              <p>No file selected</p>
              <p class="text-xs mt-2">Create a new file or select an existing one to start editing</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" @click="showDialog = false">Close</Button>
            <Button @click="saveFile">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
/* Ensure md-editor stays within container bounds */
:deep(.md-editor) {
  max-width: 100% !important;
  overflow: hidden;
}

:deep(.md-editor-preview) {
  max-width: 100% !important;
  overflow-x: auto;
}

:deep(.md-editor-input-wrapper) {
  max-width: 100% !important;
}

/* For extension popup - single column layout on smaller screens */
@media (max-width: 767px) {
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .md\:col-span-2 {
    grid-column: span 1;
  }
  
  .md\:col-span-1 {
    grid-column: span 1;
  }
}
</style>