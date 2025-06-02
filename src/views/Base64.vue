<script lang="ts">
import {defineComponent} from 'vue';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import CopyButton from '../components/elements/CopyButton.vue';
import FileDownloadButton from '../components/elements/FileDownloadButton.vue';

export default defineComponent({
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Textarea,
    Label,
    Input,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    CopyButton,
    FileDownloadButton
  },
  data() {
    return {
      textInput: '',
      textOutput: '',
      fileOutput: '',
      fileName: '',
      fileType: '',
      selectedFile: null as File | null,
      isTextEncoded: false,
      activeTab: 'text'
    };
  },
  methods: {
    // Text encoding/decoding
    encodeText() {
      try {
        this.textOutput = btoa(unescape(encodeURIComponent(this.textInput)));
        this.isTextEncoded = true;
      } catch (error) {
        alert('Error encoding text: ' + error);
      }
    },
    decodeText() {
      try {
        this.textOutput = decodeURIComponent(escape(atob(this.textInput)));
        this.isTextEncoded = false;
      } catch (error) {
        alert('Error decoding text: Invalid Base64 string');
      }
    },
    clearText() {
      this.textInput = '';
      this.textOutput = '';
      this.isTextEncoded = false;
    },
    swapTextInputOutput() {
      const temp = this.textInput;
      this.textInput = this.textOutput;
      this.textOutput = temp;
    },
    
    // File handling
    handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        this.selectedFile = file;
        this.fileName = file.name;
        this.fileType = file.type;
        this.encodeFile();
      }
    },
    encodeFile() {
      if (!this.selectedFile) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // Remove data URL prefix if present
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          this.fileOutput = base64;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    },
    clearFile() {
      this.selectedFile = null;
      this.fileName = '';
      this.fileType = '';
      this.fileOutput = '';
      const fileInput = this.$refs.fileInput as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    downloadDecodedFile() {
      if (!this.fileOutput || !this.fileName) return;
      
      try {
        const byteCharacters = atob(this.fileOutput);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: this.fileType || 'application/octet-stream' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        alert('Error downloading file: ' + error);
      }
    }
  },
  computed: {
    textInputLength() {
      return this.textInput.length;
    },
    textOutputLength() {
      return this.textOutput.length;
    },
    fileOutputLength() {
      return this.fileOutput.length;
    },
    fileSizeKB() {
      return this.selectedFile ? (this.selectedFile.size / 1024).toFixed(2) : '0';
    }
  }
});
</script>

<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Base64 Encoder/Decoder</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs v-model="activeTab" default-value="text" class="space-y-6">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="file">File/Image</TabsTrigger>
          </TabsList>

          <!-- Text Tab -->
          <TabsContent value="text" class="space-y-6">
            <!-- Input Section -->
            <div class="space-y-2">
              <Label for="text-input">Input Text</Label>
              <Textarea
                id="text-input"
                v-model="textInput"
                placeholder="Enter text to encode/decode..."
                class="min-h-[120px]"
              />
              <p class="text-sm text-muted-foreground">Characters: {{ textInputLength }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button @click="encodeText" :disabled="!textInput">
                Encode to Base64
              </Button>
              <Button @click="decodeText" :disabled="!textInput">
                Decode from Base64
              </Button>
              <Button @click="swapTextInputOutput" variant="outline" :disabled="!textOutput">
                Swap ↕
              </Button>
              <Button @click="clearText" variant="outline">
                Clear All
              </Button>
            </div>

            <!-- Output Section -->
            <div class="space-y-2">
              <Label for="text-output">Output Text</Label>
              <Textarea
                id="text-output"
                v-model="textOutput"
                readonly
                placeholder="Encoded/decoded text will appear here..."
                class="min-h-[120px] bg-muted font-mono text-sm"
              />
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">Characters: {{ textOutputLength }}</p>
                <CopyButton
                  v-if="textOutput"
                  :value="textOutput"
                  label="Copy Output"
                  class="text-sm"
                />
              </div>
            </div>
          </TabsContent>

          <!-- File Tab -->
          <TabsContent value="file" class="space-y-6">
            <!-- File Input Section -->
            <div class="space-y-2">
              <Label for="file-input">Select File</Label>
              <Input
                id="file-input"
                ref="fileInput"
                type="file"
                @change="handleFileSelect"
                class="cursor-pointer"
              />
              <div v-if="selectedFile" class="text-sm text-muted-foreground space-y-1">
                <p><strong>File:</strong> {{ fileName }}</p>
                <p><strong>Type:</strong> {{ fileType || 'Unknown' }}</p>
                <p><strong>Size:</strong> {{ fileSizeKB }} KB</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button @click="encodeFile" :disabled="!selectedFile">
                Encode File
              </Button>
              <Button @click="downloadDecodedFile" :disabled="!fileOutput" variant="outline">
                Download Decoded File
              </Button>
              <Button @click="clearFile" variant="outline">
                Clear File
              </Button>
            </div>

            <!-- Base64 Output -->
            <div class="space-y-2">
              <Label for="file-output">Base64 Output</Label>
              <Textarea
                id="file-output"
                v-model="fileOutput"
                readonly
                placeholder="Base64 encoded file data will appear here..."
                class="min-h-[200px] bg-muted font-mono text-xs break-all"
              />
              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">Characters: {{ fileOutputLength }}</p>
                <CopyButton
                  v-if="fileOutput"
                  :value="fileOutput"
                  label="Copy Base64"
                  class="text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <!-- Usage Examples -->
        <div class="space-y-3 pt-6 border-t">
          <Label class="text-base font-medium">Examples</Label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium">Text Encoding</h4>
              <div class="bg-muted p-3 rounded">
                <p class="text-muted-foreground">Input:</p>
                <code>Hello, World!</code>
                <p class="text-muted-foreground mt-2">Output:</p>
                <code class="break-all">SGVsbG8sIFdvcmxkIQ==</code>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium">Use Cases</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• Email attachments</p>
                <p>• Data URLs for images</p>
                <p>• API data transmission</p>
                <p>• Configuration files</p>
                <p>• JWT token inspection</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Custom styles for Base64 encoder/decoder */
</style>