<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { TextUtils, type LoremConfig } from '../helpers/textUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Download, Copy, RefreshCw, X } from 'lucide-vue-next';



// Lorem Generator specific state
const numbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54
];
const sentencesRange = ref([4, 8]);
const wordsRange = ref([4, 16]);
const generatedText = ref('');
const showSettings = ref(false);
const number = ref(2);
const type = ref<'words' | 'sentences' | 'paragraphs'>('paragraphs');
const isManuallyEdited = ref(false);
const showConvertMsg = ref(false);
const showGeneratedComposition = ref(false);
const leftSidebarTab = ref('generator');

// Computed properties
const generatedTextStats = computed(() => TextUtils.getTextStatistics(generatedText.value));

// Generated text composition for sidebar
const allGeneratedLetterComp = computed(() => {
  return generatedTextStats.value.letterComposition;
});

// Functions
const copyText = async (text: string) => {
  const success = await TextUtils.copyToClipboard(text);
  if (!success) {
    alert('Unable to copy to clipboard');
  }
};

const downloadText = (text: string, filename: string) => {
  TextUtils.downloadAsTextFile(text, filename);
};


// Lorem Generator functions
const generateIpsum = () => {
  const count = Math.floor(number.value);
  const config: LoremConfig = {
    sentencesPerParagraph: {
      max: Math.floor(sentencesRange.value[1]),
      min: Math.floor(sentencesRange.value[0])
    },
    wordsPerSentence: {
      max: Math.floor(wordsRange.value[1]),
      min: Math.floor(wordsRange.value[0])
    }
  };

  generatedText.value = TextUtils.generateLoremIpsum(type.value, count, config);
  isManuallyEdited.value = false;
  showConvertMsg.value = false;
};

const onTextEdit = () => {
  isManuallyEdited.value = true;
  if (showConvertMsg.value) {
    showConvertMsg.value = false;
  }
};

const convertGeneratedTextToIpsum = () => {
  const wordsCount = TextUtils.countWords(generatedText.value);
  
  if (wordsCount > 0) {
    generatedText.value = TextUtils.convertTextToLoremIpsum(generatedText.value);
    isManuallyEdited.value = false;
    showConvertMsg.value = false;
  } else {
    showConvertMsg.value = true;
  }
};

const clearConvertMsg = () => {
  showConvertMsg.value = false;
};

const toggleGeneratedComposition = () => {
  if (showGeneratedComposition.value) {
    showGeneratedComposition.value = false;
    leftSidebarTab.value = 'generator';
  } else {
    showGeneratedComposition.value = true;
    leftSidebarTab.value = 'analytics';
  }
};

onMounted(() => {
  generateIpsum();
});
</script>

<template>
  <div class="page-container">
    <h1>Text Tools</h1>
    <p class="text-sm text-muted-foreground mb-6">
      Comprehensive text processing tools: analyze text, convert to lorem ipsum, and generate placeholder content
    </p>

    <div class="w-full">

      <!-- Lorem Generator Tab -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Sidebar - Controls -->
          <div class="lg:col-span-1">
            <Card>
              <CardContent class="p-0">
                <Tabs :model-value="leftSidebarTab" @update:model-value="(val) => leftSidebarTab = val" class="w-full">
                  <TabsList class="grid w-full grid-cols-2">
                    <TabsTrigger value="generator">Generator</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <!-- Generator Tab -->
                  <TabsContent value="generator" class="p-6 space-y-6">
                    <div class="space-y-1">
                      <h3 class="text-lg font-semibold">Lorem Ipsum Generator</h3>
                      <p class="text-sm text-muted-foreground">
                        Generate placeholder text for your designs and mockups
                      </p>
                    </div>
                    
                    <!-- Generation Controls -->
                    <div class="space-y-4">
                      <div class="space-y-2">
                        <Label>Count</Label>
                        <Select :model-value="number.toString()" @update:model-value="(val) => { number = parseInt(val) || 2; generateIpsum(); }">
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
                        <Select :model-value="type" @update:model-value="(val) => { type = val as any; generateIpsum(); }">
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
                      
                      <Button @click="generateIpsum" variant="outline" class="w-full">
                        <RefreshCw class="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    
                    <!-- Advanced Settings -->
                    <div>
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
                          <div class="space-y-4">
                            <div class="space-y-3">
                              <Label class="text-sm font-medium">
                                Sentences per paragraph: {{ sentencesRange[0] }} - {{ sentencesRange[1] }}
                              </Label>
                              <Slider
                                :model-value="sentencesRange"
                                @update:model-value="(val) => { sentencesRange = val || [4, 8]; generateIpsum(); }"
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
                                :model-value="wordsRange"
                                @update:model-value="(val) => { wordsRange = val || [4, 16]; generateIpsum(); }"
                                :min="1"
                                :max="30"
                                :step="1"
                                class="w-full"
                              />
                            </div>
                          </div>
                          <div class="h-2"/>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </TabsContent>
                  
                  <!-- Analytics Tab -->
                  <TabsContent value="analytics" class="p-6 space-y-6">
                    <div class="space-y-1">
                      <h3 class="text-lg font-semibold">Text Analytics</h3>
                      <p class="text-sm text-muted-foreground">
                        Character composition and statistics
                      </p>
                    </div>
                    
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 gap-4">
                      <div class="text-center p-3 bg-muted rounded-lg">
                        <div class="text-2xl font-bold">{{ generatedTextStats.words }}</div>
                        <div class="text-sm text-muted-foreground">Words</div>
                      </div>
                      <div class="text-center p-3 bg-muted rounded-lg">
                        <div class="text-2xl font-bold">{{ generatedTextStats.characters }}</div>
                        <div class="text-sm text-muted-foreground">Characters</div>
                      </div>
                    </div>
                    
                    <!-- Character Composition -->
                    <div class="space-y-3">
                      <h4 class="font-medium">Character Composition</h4>
                      <div class="max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableBody>
                            <TableRow v-for="letter in allGeneratedLetterComp" :key="letter.letter">
                              <TableCell class="font-mono font-medium w-12">
                                {{ letter.letter || '(space)' }}
                              </TableCell>
                              <TableCell class="text-right">
                                <div class="flex items-center justify-end gap-2">
                                  <Badge variant="outline" class="text-xs">
                                    {{ letter.count }}
                                  </Badge>
                                  <span class="text-sm text-muted-foreground">
                                    {{ letter.percentage.toFixed(1) }}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <!-- Right Side - Generated Text -->
          <div class="lg:col-span-2">
            <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <CardTitle>Generated Text</CardTitle>
                <div class="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{{ generatedTextStats.words }} words</span>
                  <span>{{ generatedTextStats.characters }} chars</span>
                  <Button 
                    @click="toggleGeneratedComposition" 
                    variant="ghost" 
                    size="sm"
                    class="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                  >
                    More
                    <ChevronDown 
                      class="ml-1 h-3 w-3 transition-transform" 
                      :class="showGeneratedComposition ? 'rotate-180' : ''"
                    />
                  </Button>
                </div>
              </div>
              <div class="flex gap-2">
                <Button 
                  v-if="isManuallyEdited" 
                  @click="convertGeneratedTextToIpsum" 
                  variant="default" 
                  size="sm"
                >
                  <RefreshCw class="mr-2 h-4 w-4" />
                  Convert to Ipsum
                </Button>
                <Button @click="copyText(generatedText)" variant="outline" size="sm">
                  <Copy class="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button @click="downloadText(generatedText, 'lorem-ipsum.txt')" variant="outline" size="sm">
                  <Download class="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <Alert v-if="showConvertMsg" variant="destructive">
              <AlertDescription class="flex items-center justify-between">
                <span>There is nothing to convert</span>
                <Button @click="clearConvertMsg" variant="ghost" size="sm" class="h-auto p-1">
                  <X class="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
            
            <Textarea
              v-model="generatedText"
              class="min-h-[500px] w-full font-mono text-sm"
              placeholder="Generated lorem ipsum text will appear here or paste your own text to convert..."
              @input="onTextEdit"
            />
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>