<script lang="ts">
import {defineComponent} from 'vue';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import CopyButton from '../components/elements/CopyButton.vue';

export default defineComponent({
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Textarea,
    Label,
    copyButton: CopyButton
  },
  data() {
    return {
      inputText: '',
      outputText: '',
      isEncoded: false
    };
  },
  methods: {
    encodeURL() {
      try {
        this.outputText = encodeURIComponent(this.inputText);
        this.isEncoded = true;
      } catch (error) {
        alert('Error encoding URL: ' + error);
      }
    },
    decodeURL() {
      try {
        this.outputText = decodeURIComponent(this.inputText);
        this.isEncoded = false;
      } catch (error) {
        alert('Error decoding URL: ' + error);
      }
    },
    clearAll() {
      this.inputText = '';
      this.outputText = '';
      this.isEncoded = false;
    },
    swapInputOutput() {
      const temp = this.inputText;
      this.inputText = this.outputText;
      this.outputText = temp;
    }
  },
  computed: {
    inputLength() {
      return this.inputText.length;
    },
    outputLength() {
      return this.outputText.length;
    }
  }
});
</script>
<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>URL Encoder/Decoder</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Input Section -->
        <div class="space-y-2">
          <Label for="input">Input Text</Label>
          <Textarea
              id="input"
              v-model="inputText"
              placeholder="Enter text to encode/decode..."
              class="min-h-[120px]"
          />
          <p class="text-sm text-muted-foreground">Characters: {{ inputLength }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2">
          <Button @click="encodeURL" :disabled="!inputText">
            Encode URL
          </Button>
          <Button @click="decodeURL" :disabled="!inputText">
            Decode URL
          </Button>
          <Button @click="swapInputOutput" variant="outline" :disabled="!outputText">
            Swap ↕
          </Button>
          <Button @click="clearAll" variant="outline">
            Clear All
          </Button>
        </div>

        <!-- Output Section -->
        <div class="space-y-2">
          <Label for="output">Output Text</Label>
          <Textarea
              id="output"
              v-model="outputText"
              readonly
              placeholder="Encoded/decoded text will appear here..."
              class="min-h-[120px] bg-muted"
          />
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">Characters: {{ outputLength }}</p>
            <copy-button
                v-if="outputText"
                :value="outputText"
                label="Copy Output"
                class="text-sm"
            />
          </div>
        </div>

        <!-- Usage Examples -->
        <div class="space-y-3">
          <Label class="text-base font-medium">Examples</Label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium">Encoding</h4>
              <div class="bg-muted p-3 rounded">
                <p class="text-muted-foreground">Input:</p>
                <code>hello world & special chars!</code>
                <p class="text-muted-foreground mt-2">Output:</p>
                <code>hello%20world%20%26%20special%20chars!</code>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium">Decoding</h4>
              <div class="bg-muted p-3 rounded">
                <p class="text-muted-foreground">Input:</p>
                <code>hello%20world%20%26%20special%20chars!</code>
                <p class="text-muted-foreground mt-2">Output:</p>
                <code>hello world & special chars!</code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Custom styles for URL encoder/decoder */
</style>