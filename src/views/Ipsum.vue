<script lang="ts">
import { defineComponent } from 'vue';
import { LoremIpsum } from 'lorem-ipsum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useMainStore } from "../stores/mainStore";

export default defineComponent({
  name: 'LoremIpsumGenerator',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Label,
    Badge,
    Separator,
    Slider,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
  },
  setup(){
    const MainStore = useMainStore();
    // alert(MainStore.counter);
    return {
      // you can return the whole store instance to use it in the template
      MainStore,
    }

  },
  data() {
    return {
      numbers: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
        39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54
      ],
      sentencesRange: [4, 8],
      wordsRange: [4, 16],
      loremString: '',
      showSettings: false,
      sentencesPerParagraph: 4,
      number: 2,
      sliderMarks: [],
      type: 'paragraphs'
    };
  },
  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.loremString);
        // Could add toast notification here
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    },
    
    async downloadText() {
      const blob = new Blob([this.loremString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lorem-ipsum.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
    generateIpsum() {
      let number = Math.floor(this.number);
      //allows user to customize results
      let config = {
        sentencesPerParagraph: {
          max: Math.floor(this.sentencesRange[1]),
          min: Math.floor(this.sentencesRange[0])
        },
        wordsPerSentence: {
          max: Math.floor(this.wordsRange[1]),
          min: Math.floor(this.wordsRange[0])
        }
      };

      const lorem = new LoremIpsum(config);
      switch (this.type) {
        case 'words':
          return (this.loremString = lorem.generateWords(number));
          // code block
          break;
        case 'paragraphs':
          return (this.loremString = lorem.generateParagraphs(number));
          break;
        case 'sentences':
          return (this.loremString = lorem.generateSentences(number));
          break;
        default:
        // code block
      }
    }
  },
  computed: {
    numberOfWords() {
      let preg = this.loremString.match(/(\w+)/g);
      if (preg != null) {
        return preg.length;
      } else return 0;
    },
    numberOfCharacters() {
      if (this.loremString != null) {
        return this.loremString.length;
      } else return 0;
    }
  },
  mounted() {
    this.generateIpsum();
    // const lorem = new LoremIpsum();
    // this.loremString =  lorem.generateWords(1);
  }
});
</script>

<template>
  <div class="page-container space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <CardTitle>Lorem Ipsum Generator</CardTitle>
            <p class="text-sm text-muted-foreground">
              Generate placeholder text for your designs and mockups
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">{{ numberOfWords }} words</Badge>
            <Badge variant="outline">{{ numberOfCharacters }} chars</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <!-- Generation Controls -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="space-y-2">
            <Label>Count</Label>
            <Select @update:model-value="(val) => { number = parseInt(val as string) || 2; generateIpsum(); }">
              <SelectTrigger>
                <SelectValue :placeholder="number.toString()" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="item in numbers"
                  :key="item"
                  :value="item.toString()"
                >
                  {{ item }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label>Type</Label>
            <Select @update:model-value="(val) => { type = (val as string) || 'paragraphs'; generateIpsum(); }">
              <SelectTrigger>
                <SelectValue :placeholder="type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="flex items-end">
            <Button @click="generateIpsum" variant="outline" class="w-full">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-1 .05v17.9a9.75 9.75 0 0 0 1 .05 9 9 0 0 0 9-9z"/>
                <path d="M2 12a10 10 0 0 1 10-10"/>
              </svg>
              Generate
            </Button>
          </div>
        </div>
        
        <!-- Advanced Settings -->
        <Collapsible v-model:open="showSettings">
          <CollapsibleTrigger as-child>
            <Button variant="ghost" size="sm" class="flex items-center gap-2 p-0 h-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Advanced Settings
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                :class="showSettings ? 'rotate-180' : ''"
                class="transition-transform"
              >
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent class="space-y-4 pt-4">
            <Separator />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <Label class="text-sm font-medium">
                  Sentences per paragraph: {{ sentencesRange[0] }} - {{ sentencesRange[1] }}
                </Label>
                <Slider
                  @update:model-value="(val) => { sentencesRange = val || [4, 8]; generateIpsum(); }"
                  :model-value="sentencesRange"
                  :min="1"
                  :max="20"
                  :step="1"
                  class="w-full"
                />
              </div>
              
              <div class="space-y-3">
                <Label class="text-sm font-medium">
                  Words per sentence: {{ wordsRange[0] }} - {{ wordsRange[1] }}
                </Label>
                <Slider
                  @update:model-value="(val) => { wordsRange = val || [4, 16]; generateIpsum(); }"
                  :model-value="wordsRange"
                  :min="1"
                  :max="30"
                  :step="1"
                  class="w-full"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>

    <!-- Generated Text -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Generated Text</CardTitle>
          <div class="flex gap-2">
            <Button @click="copy" variant="outline" size="sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Copy
            </Button>
            <Button @click="downloadText" variant="outline" size="sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          v-model="loremString"
          class="min-h-[400px] w-full font-mono text-sm"
          placeholder="Generated lorem ipsum text will appear here..."
          readonly
        />
      </CardContent>
    </Card>
  </div>
</template>


<style scoped>
/* Custom styles for ipsum page */
</style>