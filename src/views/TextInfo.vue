<script setup lang="ts">
import { ref, computed } from 'vue';
import { letterComposition } from '../helpers/txt/letterComposition';
import { wordsCount, charCount } from '../helpers/txt/txt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';

const loremString = ref('');
const showAllComposition = ref(false);

const letterComp = computed(() => {
  let composition = letterComposition(loremString.value);
  if (!showAllComposition.value) {
    composition = composition.slice(0, 8);
  }
  return composition;
});

const showLess = computed(() => {
  return letterComp.value.length > 8 && showAllComposition.value;
});

const showMore = computed(() => {
  const fullComposition = letterComposition(loremString.value);
  return fullComposition.length > 8 && !showAllComposition.value;
});

const numberOfWords = computed(() => {
  return wordsCount(loremString.value);
});

const numberOfCharacters = computed(() => {
  return loremString.value?.length || 0;
});

const numberOfCharactersExcludingBreaks = computed(() => {
  return charCount(loremString.value, [' ']);
});
</script>
<template>
  <div class="page-container">
    <h1>Text Info</h1>
    
    <div class="flex flex-wrap gap-2 mb-4">
      <Badge variant="secondary">
        Words: {{ numberOfWords }}
      </Badge>
      <Badge variant="secondary">
        Characters: {{ numberOfCharactersExcludingBreaks }}
      </Badge>
      <Badge variant="outline">
        With breaks: {{ numberOfCharacters }}
      </Badge>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <Textarea
          v-model="loremString"
          placeholder="Enter your text here to analyze..."
          class="min-h-[500px] resize-none"
        />
      </div>
      
      <div class="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Character Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow v-for="letter in letterComp" :key="letter.letter">
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
            
            <div class="flex justify-center mt-4" v-if="showMore || showLess">
              <Button
                v-if="showMore"
                variant="ghost"
                size="sm"
                @click="showAllComposition = true"
                class="text-sm"
              >
                Show More
                <ChevronDown class="ml-1 h-3 w-3" />
              </Button>
              <Button
                v-if="showLess"
                variant="ghost"
                size="sm"
                @click="showAllComposition = false"
                class="text-sm"
              >
                Show Less
                <ChevronUp class="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

