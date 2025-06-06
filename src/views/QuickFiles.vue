<script setup lang="ts">
import { ref, computed } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
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
import 'brace/theme/chrome';
import 'brace/theme/eclipse';
import 'brace/theme/monokai';
import 'brace/theme/tomorrow_night';

import { fileHandler } from '../helpers/fileHandler';
import { useMainStore } from '../stores/mainStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText } from 'lucide-vue-next';

interface FileType {
  extension: string;
  mime: string;
  label: string;
  aceName: string;
}

const mainStore = useMainStore();
const theme = computed(() => mainStore.isDark ? 'tomorrow_night' : 'eclipse');
const loading = ref(false);

const fileTypes: FileType[] = [
  { extension: '.txt', mime: 'text/plain', label: 'text', aceName: 'text' },
  { extension: '.md', mime: 'text/markdown', label: 'markdown', aceName: 'markdown' },
  { extension: '.py', mime: 'text/x-python', label: 'python', aceName: 'python' },
  { extension: '.js', mime: 'text/javascript', label: 'javascript', aceName: 'javascript' },
  { extension: '.html', mime: 'text/html', label: 'html', aceName: 'html' },
  { extension: '.css', mime: 'text/css', label: 'css', aceName: 'css' },
  { extension: '.json', mime: 'application/json', label: 'json', aceName: 'json' },
  { extension: '.sql', mime: 'text/sql', label: 'sql', aceName: 'sql' },
  { extension: '.php', mime: 'text/x-php', label: 'php', aceName: 'php' }
];

const fileObj = ref({
  name: 'untitled',
  mime: '',
  extension: '',
  content: ''
});

const lang = ref<FileType>({
  extension: '.txt',
  mime: 'text/plain',
  label: 'text',
  aceName: 'text'
});

const dropHandler = (ev: DragEvent) => {
  ev.preventDefault();
  if (ev.dataTransfer?.files[0]) {
    insertFile(ev.dataTransfer.files[0]);
  }
};

const download = () => {
  const filename = fileObj.value.name || 'untitled';
  new fileHandler(fileObj.value.content)
    .setFileName(filename + lang.value.extension)
    .setFileMimeType(lang.value.mime)
    .downloadFile();
};

const readFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    insertFile(file);
  }
};

const updateFileLang = () => {
  fileObj.value.mime = lang.value.mime;
  fileObj.value.extension = lang.value.extension;
  
  const fileName = fileObj.value.name.trim();
  if (fileName.endsWith('.txt') || fileName.endsWith('.sql')) {
    fileObj.value.name = fileName.replace(/\.[^/.]+$/, '');
  }
};

const insertFile = (file: File) => {
  loading.value = true;
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  
  fileObj.value.name = fileName.replace(/\.[^/.]+$/, '');
  fileObj.value.mime = file.type;

  // Auto-detect file type based on extension
  const detectedType = fileTypes.find(type => type.extension === fileExtension);
  if (detectedType) {
    lang.value = detectedType;
    updateFileLang();
  }

  const reader = new FileReader();
  reader.onload = () => {
    fileObj.value.content = reader.result?.toString() || '';
    loading.value = false;
  };
  reader.readAsText(file);
};

const selectedLangValue = computed({
  get: () => `${lang.value.label}${lang.value.extension}`,
  set: (value: string) => {
    const selectedType = fileTypes.find(type => `${type.label}${type.extension}` === value);
    if (selectedType) {
      lang.value = selectedType;
      updateFileLang();
    }
  }
});
</script>

<template>
  <div
    class="min-h-screen"
    @drop="dropHandler"
    @dragover.prevent
    @dragenter.prevent
  >
    <div class="page-container">
      <h1>Quick Files</h1>
      
      <Card class="mb-6">
        <CardContent class="p-6">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div class="flex-1">
              <label class="text-sm font-medium mb-2 block">
                File Name
              </label>
              <Input
                v-model="fileObj.name"
                placeholder="Enter file name"
                class="w-full"
              />
            </div>
            
            <div class="w-full sm:w-48">
              <label class="text-sm font-medium mb-2 block">
                File Type
              </label>
              <Select v-model="selectedLangValue">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="type in fileTypes" 
                    :key="type.extension"
                    :value="`${type.label}${type.extension}`"
                  >
                    {{ type.label }} ({{ type.extension }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="flex gap-2">
              <div class="relative">
                <input 
                  type="file" 
                  id="upload-file" 
                  @change="readFile"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" class="relative">
                  <Upload class="w-4 h-4 sm:mr-2" />
                  <span class="hidden md:inline">Upload</span>
                </Button>
              </div>
              
              <Button 
                @click="download" 
                :disabled="!fileObj.content"
              >
                <Download class="w-4 h-4 sm:mr-2" />
                <span class="hidden md:inline">Download</span>
              </Button>
            </div>
          </div>
          
          <div class="mt-4 flex items-center gap-2" v-if="fileObj.mime">
            <FileText class="w-4 h-4" />
            <Badge variant="secondary">
              {{ fileObj.mime }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-0">
          <v-ace-editor
            v-model:value="fileObj.content"
            :lang="lang.aceName"
            :theme="theme"
            :showPrintMargin="false"
            :readonly="loading"
            :wrap="true"
            :printMargin="false"
            :fontSize="14"
            :showGutter="true"
            :highlightActiveLine="true"
            :tabSize="2"
            :useSoftTabs="true"
            class="min-h-[500px] rounded-md"
            placeholder="Drag and drop a file here, upload one, or start typing..."
          />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
