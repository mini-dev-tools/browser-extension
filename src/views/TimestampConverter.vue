<script lang="ts">
import {defineComponent} from 'vue';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Alert, AlertDescription} from '@/components/ui/alert';
import CopyButton from '../components/elements/CopyButton.vue';

interface ConversionResult {
  unixSeconds: number;
  unixMilliseconds: number;
  iso8601: string;
  utcString: string;
  localString: string;
  dateObject: Date;
}

export default defineComponent({
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Alert,
    AlertDescription,
    CopyButton
  },
  data() {
    return {
      // Current timestamp (live)
      currentTimestamp: Math.floor(Date.now() / 1000),
      currentDate: new Date(),
      
      // Converter inputs
      timestampInput: '',
      dateTimeInput: '',
      selectedTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      inputType: 'seconds', // seconds, milliseconds, microseconds
      
      // Results
      conversionResult: null as ConversionResult | null,
      error: '',
      
      // Batch conversion
      batchInput: '',
      batchResults: [] as Array<{input: string, result: ConversionResult | null, error: string}>,
      
      // Common timezones
      commonTimezones: [
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ],
      
      // Quick actions
      quickTimestamps: [
        { label: 'Now', value: () => Math.floor(Date.now() / 1000) },
        { label: 'Start of Today', value: () => Math.floor(new Date().setHours(0, 0, 0, 0) / 1000) },
        { label: 'End of Today', value: () => Math.floor(new Date().setHours(23, 59, 59, 999) / 1000) },
        { label: 'Start of Week', value: () => {
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return Math.floor(startOfWeek.setHours(0, 0, 0, 0) / 1000);
        }},
        { label: 'Start of Month', value: () => Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000) },
        { label: 'Start of Year', value: () => Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000) }
      ],
      
      activeTab: 'convert'
    };
  },
  mounted() {
    this.updateCurrentTime();
    // Update current time every second
    setInterval(this.updateCurrentTime, 1000);
    
    // Set default datetime input to now
    this.dateTimeInput = new Date().toISOString().slice(0, 16);
  },
  watch: {
    timestampInput() {
      this.convertFromTimestamp();
    },
    dateTimeInput() {
      this.convertFromDateTime();
    },
    inputType() {
      this.convertFromTimestamp();
    }
  },
  methods: {
    updateCurrentTime() {
      this.currentTimestamp = Math.floor(Date.now() / 1000);
      this.currentDate = new Date();
    },
    
    convertFromTimestamp() {
      this.error = '';
      this.conversionResult = null;
      
      if (!this.timestampInput.trim()) return;
      
      try {
        let timestamp = parseFloat(this.timestampInput);
        
        if (isNaN(timestamp)) {
          throw new Error('Invalid timestamp format');
        }
        
        // Convert to milliseconds based on input type
        let timestampMs: number;
        switch (this.inputType) {
          case 'seconds':
            timestampMs = timestamp * 1000;
            break;
          case 'milliseconds':
            timestampMs = timestamp;
            break;
          case 'microseconds':
            timestampMs = timestamp / 1000;
            break;
          default:
            timestampMs = timestamp * 1000;
        }
        
        // Validate reasonable timestamp range (1970-2100)
        if (timestampMs < 0 || timestampMs > 4102444800000) {
          throw new Error('Timestamp out of reasonable range (1970-2100)');
        }
        
        const date = new Date(timestampMs);
        
        if (isNaN(date.getTime())) {
          throw new Error('Invalid timestamp');
        }
        
        this.conversionResult = {
          unixSeconds: Math.floor(timestampMs / 1000),
          unixMilliseconds: Math.floor(timestampMs),
          iso8601: date.toISOString(),
          utcString: date.toUTCString(),
          localString: date.toLocaleString(),
          dateObject: date
        };
        
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Conversion error';
      }
    },
    
    convertFromDateTime() {
      this.error = '';
      this.conversionResult = null;
      
      if (!this.dateTimeInput) return;
      
      try {
        const date = new Date(this.dateTimeInput);
        
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date/time format');
        }
        
        const timestampMs = date.getTime();
        
        this.conversionResult = {
          unixSeconds: Math.floor(timestampMs / 1000),
          unixMilliseconds: timestampMs,
          iso8601: date.toISOString(),
          utcString: date.toUTCString(),
          localString: date.toLocaleString(),
          dateObject: date
        };
        
        // Update timestamp input to show the converted value
        this.timestampInput = this.conversionResult.unixSeconds.toString();
        
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Conversion error';
      }
    },
    
    setQuickTimestamp(quickTimestamp: any) {
      const timestamp = quickTimestamp.value();
      this.timestampInput = timestamp.toString();
      this.inputType = 'seconds';
    },
    
    setCurrentTimestamp() {
      this.timestampInput = this.currentTimestamp.toString();
      this.inputType = 'seconds';
    },
    
    clearAll() {
      this.timestampInput = '';
      this.dateTimeInput = '';
      this.conversionResult = null;
      this.error = '';
    },
    
    // Batch conversion
    processBatchConversion() {
      this.batchResults = [];
      
      if (!this.batchInput.trim()) return;
      
      const lines = this.batchInput.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        try {
          const timestamp = parseFloat(trimmedLine);
          
          if (isNaN(timestamp)) {
            this.batchResults.push({
              input: trimmedLine,
              result: null,
              error: 'Invalid number'
            });
            continue;
          }
          
          // Assume seconds if < 1e12, milliseconds if >= 1e12
          const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
          const date = new Date(timestampMs);
          
          if (isNaN(date.getTime())) {
            this.batchResults.push({
              input: trimmedLine,
              result: null,
              error: 'Invalid timestamp'
            });
            continue;
          }
          
          this.batchResults.push({
            input: trimmedLine,
            result: {
              unixSeconds: Math.floor(timestampMs / 1000),
              unixMilliseconds: Math.floor(timestampMs),
              iso8601: date.toISOString(),
              utcString: date.toUTCString(),
              localString: date.toLocaleString(),
              dateObject: date
            },
            error: ''
          });
          
        } catch (error) {
          this.batchResults.push({
            input: trimmedLine,
            result: null,
            error: 'Conversion error'
          });
        }
      }
    },
    
    clearBatch() {
      this.batchInput = '';
      this.batchResults = [];
    },
    
    exportBatchResults() {
      if (this.batchResults.length === 0) return;
      
      const headers = ['Input', 'Unix Seconds', 'Unix Milliseconds', 'ISO 8601', 'UTC String', 'Local String'];
      const rows = this.batchResults.map(result => {
        if (result.result) {
          return [
            result.input,
            result.result.unixSeconds.toString(),
            result.result.unixMilliseconds.toString(),
            result.result.iso8601,
            result.result.utcString,
            result.result.localString
          ];
        } else {
          return [result.input, 'ERROR', 'ERROR', 'ERROR', 'ERROR', result.error];
        }
      });
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timestamp-conversion-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    // Utility methods
    formatTimestamp(timestamp: number, decimals: number = 0): string {
      return timestamp.toFixed(decimals);
    },
    
    getRelativeTime(date: Date): string {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (Math.abs(diffSeconds) < 60) {
        return diffSeconds === 0 ? 'now' : `${Math.abs(diffSeconds)} seconds ${diffSeconds > 0 ? 'ago' : 'from now'}`;
      } else if (Math.abs(diffMinutes) < 60) {
        return `${Math.abs(diffMinutes)} minutes ${diffMinutes > 0 ? 'ago' : 'from now'}`;
      } else if (Math.abs(diffHours) < 24) {
        return `${Math.abs(diffHours)} hours ${diffHours > 0 ? 'ago' : 'from now'}`;
      } else {
        return `${Math.abs(diffDays)} days ${diffDays > 0 ? 'ago' : 'from now'}`;
      }
    },
    
    formatInTimezone(date: Date, timezone: string): string {
      try {
        return date.toLocaleString('en-US', { 
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch {
        return 'Invalid timezone';
      }
    }
  },
  computed: {
    currentFormats() {
      const now = new Date();
      return {
        unixSeconds: Math.floor(now.getTime() / 1000),
        unixMilliseconds: now.getTime(),
        iso8601: now.toISOString(),
        utcString: now.toUTCString(),
        localString: now.toLocaleString()
      };
    }
  }
});
</script>

<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Timestamp/Epoch Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs v-model="activeTab" default-value="convert" class="space-y-6">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="convert">Convert</TabsTrigger>
            <TabsTrigger value="current">Current Time</TabsTrigger>
            <TabsTrigger value="batch">Batch</TabsTrigger>
          </TabsList>

          <!-- Convert Tab -->
          <TabsContent value="convert" class="space-y-6">
            <!-- Quick Actions -->
            <div class="space-y-2">
              <Label class="text-base font-medium">Quick Timestamps</Label>
              <div class="flex flex-wrap gap-2">
                <Button @click="setCurrentTimestamp" variant="outline" size="sm">
                  Now
                </Button>
                <Button 
                  v-for="quick in quickTimestamps.slice(1)" 
                  :key="quick.label"
                  @click="setQuickTimestamp(quick)" 
                  variant="outline" 
                  size="sm"
                >
                  {{ quick.label }}
                </Button>
              </div>
            </div>

            <!-- Timestamp to Date -->
            <div class="space-y-4">
              <Label class="text-base font-medium">Timestamp to Date</Label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="timestamp-input">Timestamp</Label>
                  <Input
                    id="timestamp-input"
                    v-model="timestampInput"
                    placeholder="1609459200"
                    class="font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="input-type">Type</Label>
                  <Select v-model="inputType">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Unix Seconds</SelectItem>
                      <SelectItem value="milliseconds">Unix Milliseconds</SelectItem>
                      <SelectItem value="microseconds">Unix Microseconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button @click="clearAll" variant="outline" class="w-full">
                    Clear All
                  </Button>
                </div>
              </div>
            </div>

            <!-- Date to Timestamp -->
            <div class="space-y-4">
              <Label class="text-base font-medium">Date to Timestamp</Label>
              <div class="space-y-2">
                <Label for="datetime-input">Date & Time</Label>
                <Input
                  id="datetime-input"
                  v-model="dateTimeInput"
                  type="datetime-local"
                  class="font-mono"
                />
              </div>
            </div>

            <!-- Error Display -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Conversion Results -->
            <div v-if="conversionResult" class="space-y-4">
              <Label class="text-base font-medium">Conversion Results</Label>
              
              <!-- Timestamps -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Unix Timestamp (seconds)</div>
                    <div class="font-mono text-lg">{{ conversionResult.unixSeconds }}</div>
                    <CopyButton :value="conversionResult.unixSeconds.toString()" class="mt-2" size="sm" />
                  </div>
                  
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Unix Timestamp (milliseconds)</div>
                    <div class="font-mono text-lg">{{ conversionResult.unixMilliseconds }}</div>
                    <CopyButton :value="conversionResult.unixMilliseconds.toString()" class="mt-2" size="sm" />
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">ISO 8601</div>
                    <div class="font-mono text-sm break-all">{{ conversionResult.iso8601 }}</div>
                    <CopyButton :value="conversionResult.iso8601" class="mt-2" size="sm" />
                  </div>
                  
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Relative Time</div>
                    <div class="text-lg">{{ getRelativeTime(conversionResult.dateObject) }}</div>
                  </div>
                </div>
              </div>

              <!-- Formatted Dates -->
              <div class="space-y-3">
                <div class="bg-muted p-4 rounded">
                  <div class="font-medium text-sm mb-1">UTC</div>
                  <div class="font-mono">{{ conversionResult.utcString }}</div>
                  <CopyButton :value="conversionResult.utcString" class="mt-2" size="sm" />
                </div>
                
                <div class="bg-muted p-4 rounded">
                  <div class="font-medium text-sm mb-1">Local Time</div>
                  <div class="font-mono">{{ conversionResult.localString }}</div>
                  <CopyButton :value="conversionResult.localString" class="mt-2" size="sm" />
                </div>

                <!-- Common Timezones -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div 
                    v-for="tz in commonTimezones.slice(0, 6)" 
                    :key="tz" 
                    class="bg-muted p-3 rounded text-sm"
                  >
                    <div class="font-medium mb-1">{{ tz }}</div>
                    <div class="font-mono text-xs">{{ formatInTimezone(conversionResult.dateObject, tz) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Current Time Tab -->
          <TabsContent value="current" class="space-y-6">
            <div class="space-y-4">
              <Label class="text-base font-medium">Current Timestamp (Live)</Label>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Unix Seconds</div>
                    <div class="font-mono text-xl">{{ currentFormats.unixSeconds }}</div>
                    <CopyButton :value="currentFormats.unixSeconds.toString()" class="mt-2" size="sm" />
                  </div>
                  
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Unix Milliseconds</div>
                    <div class="font-mono text-lg">{{ currentFormats.unixMilliseconds }}</div>
                    <CopyButton :value="currentFormats.unixMilliseconds.toString()" class="mt-2" size="sm" />
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">ISO 8601</div>
                    <div class="font-mono text-sm break-all">{{ currentFormats.iso8601 }}</div>
                    <CopyButton :value="currentFormats.iso8601" class="mt-2" size="sm" />
                  </div>
                  
                  <div class="bg-muted p-4 rounded">
                    <div class="font-medium text-sm mb-1">Local Time</div>
                    <div class="font-mono text-sm">{{ currentFormats.localString }}</div>
                    <CopyButton :value="currentFormats.localString" class="mt-2" size="sm" />
                  </div>
                </div>
              </div>

              <!-- Common Formats -->
              <div class="space-y-3">
                <Label class="text-base font-medium">Common Formats</Label>
                <div class="grid grid-cols-1 gap-3">
                  <div class="bg-muted p-3 rounded">
                    <div class="font-medium text-sm mb-1">JavaScript Date.now()</div>
                    <div class="font-mono text-sm">{{ currentFormats.unixMilliseconds }}</div>
                  </div>
                  <div class="bg-muted p-3 rounded">
                    <div class="font-medium text-sm mb-1">Python time.time()</div>
                    <div class="font-mono text-sm">{{ formatTimestamp(currentFormats.unixSeconds, 3) }}</div>
                  </div>
                  <div class="bg-muted p-3 rounded">
                    <div class="font-medium text-sm mb-1">Go time.Now().Unix()</div>
                    <div class="font-mono text-sm">{{ currentFormats.unixSeconds }}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Batch Tab -->
          <TabsContent value="batch" class="space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Label class="text-base font-medium">Batch Conversion</Label>
                <div class="flex gap-2">
                  <Button @click="processBatchConversion" variant="outline" size="sm">
                    Convert All
                  </Button>
                  <Button 
                    @click="exportBatchResults" 
                    :disabled="batchResults.length === 0"
                    variant="outline" 
                    size="sm"
                  >
                    Export CSV
                  </Button>
                  <Button @click="clearBatch" variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </div>
              
              <textarea
                v-model="batchInput"
                placeholder="Enter timestamps, one per line:&#10;1609459200&#10;1640995200&#10;1672531200"
                class="w-full min-h-[120px] p-3 border rounded-md font-mono text-sm"
              />
              
              <div v-if="batchResults.length > 0" class="space-y-2">
                <Label class="text-base font-medium">Results ({{ batchResults.length }} items)</Label>
                <div class="max-h-96 overflow-auto space-y-2">
                  <div 
                    v-for="(result, index) in batchResults" 
                    :key="index"
                    class="bg-muted p-3 rounded text-sm"
                  >
                    <div class="font-mono font-medium mb-1">{{ result.input }}</div>
                    <div v-if="result.result" class="space-y-1 text-xs">
                      <div><strong>Seconds:</strong> {{ result.result.unixSeconds }}</div>
                      <div><strong>ISO:</strong> {{ result.result.iso8601 }}</div>
                      <div><strong>Local:</strong> {{ result.result.localString }}</div>
                    </div>
                    <div v-else class="text-red-500 text-xs">{{ result.error }}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <!-- Reference -->
        <div class="space-y-3 pt-6 border-t">
          <Label class="text-base font-medium">Quick Reference</Label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium">Common Ranges</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• 2000: 946684800</p>
                <p>• 2020: 1577836800</p>
                <p>• 2025: 1735689600</p>
                <p>• 2030: 1893456000</p>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium">Programming Languages</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• JavaScript: Date.now()</p>
                <p>• Python: time.time()</p>
                <p>• PHP: time()</p>
                <p>• Go: time.Now().Unix()</p>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium">Formats</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• Seconds: 10 digits</p>
                <p>• Milliseconds: 13 digits</p>
                <p>• Microseconds: 16 digits</p>
                <p>• ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Custom styles for timestamp converter */
</style>