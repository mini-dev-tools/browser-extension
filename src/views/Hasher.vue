<script setup lang="ts">
import { ref } from 'vue';
import * as crypto from 'crypto-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import CopyButton from '@/components/elements/CopyButton.vue';
import FileDownloadButton from '@/components/elements/FileDownloadButton.vue';
import { Settings } from 'lucide-vue-next';

const original = ref('');
const hashedValue = ref('');
const hashing = ref('select');
const isLowerCase = ref(true);
const showSettings = ref(false);
const isSeparateString = ref(false);
const requestSelect = ref(false);

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const hashString = (str: string) => {
  let hashed = '';
  switch (hashing.value) {
    case 'md5':
      hashed = crypto.MD5(str).toString();
      break;
    case 'sha-1':
      hashed = crypto.SHA1(str).toString();
      break;
    case 'sha-256':
      hashed = crypto.SHA256(str).toString();
      break;
    case 'sha-512':
      hashed = crypto.SHA512(str).toString();
      break;
    case 'sha-3':
      hashed = crypto.SHA3(str).toString();
      break;
    default:
      alert('Please select Hashing Algo');
  }

  return isLowerCase.value ? hashed.toLowerCase() : hashed.toUpperCase();
};

const hashedPass = () => {
  if (hashing.value == 'select') {
    requestSelect.value = true;
    return '';
  }

  hashedValue.value = '';
  if (!isSeparateString.value) {
    hashedValue.value = hashString(original.value);
  }
  if (isSeparateString.value) {
    let arr = original.value.split('\n');
    let hashedArr: Array<string> = [];
    for (let i = 0; i < arr.length; i++) {
      hashedArr.push(hashString(arr[i]));
    }
    hashedValue.value = hashedArr.join('\n');
  }
};

const handleHashingChange = (value: any) => {
  if (typeof value === 'string') {
    hashing.value = value;
    requestSelect.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <div class="flex items-center gap-3 mb-4">
      <h1>Hasher</h1>
      <Badge variant="secondary">Crypto Tool</Badge>
      <Button
        variant="ghost"
        size="icon"
        @click="toggleSettings"
        class="ml-auto"
      >
        <Settings class="h-4 w-4" />
      </Button>
    </div>

    <Card v-if="showSettings" class="mb-4">
      <CardHeader>
        <CardTitle class="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <Label for="lowercase" class="text-sm font-medium">Lower case hashes</Label>
          <div class="flex items-center space-x-2">
            <Switch
              id="lowercase"
              v-model:checked="isLowerCase"
            />
            <span class="text-sm text-muted-foreground">Get {{ isLowerCase ? 'lower' : 'upper' }} case hashes</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <Label for="separate" class="text-sm font-medium">Separate strings</Label>
          <div class="flex items-center space-x-2">
            <Switch
              id="separate"
              v-model:checked="isSeparateString"
            />
            <span class="text-sm text-muted-foreground">Treat each line as separate string</span>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Input</CardTitle>
        <p class="text-sm text-muted-foreground">Hash your string to MD5, SHA1, SHA-256, SHA-512, or SHA-3</p>
      </CardHeader>
      <CardContent class="space-y-4">
        <Textarea
          v-model="original"
          placeholder="Enter text to hash..."
          rows="6"
          class="resize-none"
        />
        
        <div class="flex gap-2">
          <Select :model-value="hashing" @update:model-value="handleHashingChange">
            <SelectTrigger class="w-40" :class="{ 'border-destructive': requestSelect }">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="md5">MD5</SelectItem>
              <SelectItem value="sha-1">SHA-1</SelectItem>
              <SelectItem value="sha-256">SHA-256</SelectItem>
              <SelectItem value="sha-512">SHA-512</SelectItem>
              <SelectItem value="sha-3">SHA-3</SelectItem>
            </SelectContent>
          </Select>
          
          <Button @click="hashedPass" :disabled="!original || hashing === 'select'">
            Generate Hash
          </Button>
        </div>
      </CardContent>
    </Card>
    <Card v-if="hashedValue" class="mt-4">
      <CardHeader>
        <CardTitle class="text-lg">Hashed Result</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Textarea
          :model-value="hashedValue"
          readonly
          rows="4"
          class="font-mono text-sm resize-none bg-muted"
        />
        
        <div class="flex gap-2">
          <CopyButton
            :model-value="hashedValue"
            label="Copy Hash"
            variant="outline"
          />
          <FileDownloadButton
            :model-value="hashedValue"
            filename="hash"
            file-extension="txt"
            label="Download"
            variant="outline"
            :show-input="false"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
