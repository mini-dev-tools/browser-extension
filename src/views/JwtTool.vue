<script lang="ts">
import {defineComponent} from 'vue';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Alert, AlertDescription} from '@/components/ui/alert';
import CopyButton from '../components/elements/CopyButton.vue';

interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

interface JWTPayload {
  [key: string]: any;
}

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
      // Decoder
      jwtToken: '',
      decodedHeader: '',
      decodedPayload: '',
      signature: '',
      isValidJWT: false,
      decodeError: '',
      
      // Signature validation
      validationSecretKey: '',
      isSignatureValid: null as boolean | null,
      validationError: '',
      
      // Generator
      headerAlgorithm: 'HS256',
      headerType: 'JWT',
      customHeader: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}',
      payloadData: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022,\n  "exp": 1516242622\n}',
      secretKey: 'your-256-bit-secret',
      generatedToken: '',
      
      // Templates
      payloadTemplates: {
        basic: {
          sub: '1234567890',
          name: 'John Doe',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        },
        auth: {
          sub: 'user123',
          email: 'user@example.com',
          roles: ['user'],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          iss: 'your-app'
        },
        api: {
          sub: 'api-client-123',
          scope: ['read', 'write'],
          client_id: 'app123',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7200
        }
      },
      
      activeTab: 'decode'
    };
  },
  watch: {
    jwtToken: {
      handler() {
        this.decodeJWT();
      },
      immediate: true
    },
    customHeader() {
      this.generateJWT();
    },
    payloadData() {
      this.generateJWT();
    },
    secretKey() {
      this.generateJWT();
    },
    validationSecretKey() {
      this.validateSignature();
    }
  },
  methods: {
    // JWT Decoding
    decodeJWT() {
      this.resetDecodeState();
      
      if (!this.jwtToken.trim()) return;
      
      try {
        const parts = this.jwtToken.split('.');
        
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format. Must have 3 parts separated by dots.');
        }
        
        // Decode header
        const header = this.base64UrlDecode(parts[0]);
        this.decodedHeader = JSON.stringify(JSON.parse(header), null, 2);
        
        // Decode payload
        const payload = this.base64UrlDecode(parts[1]);
        this.decodedPayload = JSON.stringify(JSON.parse(payload), null, 2);
        
        // Store signature (base64url encoded)
        this.signature = parts[2];
        
        this.isValidJWT = true;
        
        // Check expiration
        const payloadObj = JSON.parse(payload);
        if (payloadObj.exp && payloadObj.exp < Math.floor(Date.now() / 1000)) {
          this.decodeError = 'Token has expired';
        }
        
      } catch (error) {
        this.decodeError = error instanceof Error ? error.message : 'Invalid JWT format';
        this.isValidJWT = false;
      }
    },
    
    resetDecodeState() {
      this.decodedHeader = '';
      this.decodedPayload = '';
      this.signature = '';
      this.isValidJWT = false;
      this.decodeError = '';
      this.isSignatureValid = null;
      this.validationError = '';
    },
    
    // JWT Generation
    generateJWT() {
      try {
        const header = JSON.parse(this.customHeader);
        const payload = JSON.parse(this.payloadData);
        
        const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
        const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));
        
        // Create signature (simplified HMAC-SHA256 simulation)
        const data = `${headerEncoded}.${payloadEncoded}`;
        const signature = this.createSignature(data, this.secretKey);
        
        this.generatedToken = `${headerEncoded}.${payloadEncoded}.${signature}`;
        
      } catch (error) {
        console.error('Error generating JWT:', error);
        this.generatedToken = 'Error: Invalid JSON in header or payload';
      }
    },
    
    // Base64 URL encoding/decoding
    base64UrlEncode(str: string): string {
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },
    
    base64UrlDecode(str: string): string {
      // Add padding if necessary
      str += '='.repeat((4 - str.length % 4) % 4);
      // Replace URL-safe characters
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(escape(atob(str)));
    },
    
    // Simplified signature creation (not cryptographically secure)
    createSignature(data: string, secret: string): string {
      // This is a simplified implementation for demo purposes
      // In a real app, you'd use proper HMAC-SHA256
      let hash = 0;
      const input = data + secret;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return this.base64UrlEncode(Math.abs(hash).toString());
    },
    
    // Utility methods
    loadTemplate(templateName: any) {
      if (templateName && typeof templateName === 'string' && templateName in this.payloadTemplates) {
        const template = this.payloadTemplates[templateName as keyof typeof this.payloadTemplates];
        this.payloadData = JSON.stringify(template, null, 2);
      }
    },
    
    addCurrentTimestamp() {
      try {
        const payload = JSON.parse(this.payloadData);
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        this.payloadData = JSON.stringify(payload, null, 2);
      } catch (error) {
        console.error('Error adding timestamp:', error);
      }
    },
    
    clearAll() {
      this.jwtToken = '';
      this.validationSecretKey = '';
      this.resetDecodeState();
    },
    
    useDecodedForGeneration() {
      if (this.isValidJWT) {
        this.customHeader = this.decodedHeader;
        this.payloadData = this.decodedPayload;
        this.activeTab = 'generate';
      }
    },
    
    formatTimestamp(timestamp: number): string {
      return new Date(timestamp * 1000).toLocaleString();
    },
    
    getExpirationStatus(exp: number): { status: string, color: string } {
      const now = Math.floor(Date.now() / 1000);
      if (exp < now) {
        return { status: 'Expired', color: 'text-red-500' };
      } else if (exp < now + 300) { // 5 minutes
        return { status: 'Expiring Soon', color: 'text-yellow-500' };
      } else {
        return { status: 'Valid', color: 'text-green-500' };
      }
    },
    
    // Signature validation
    validateSignature() {
      this.isSignatureValid = null;
      this.validationError = '';
      
      if (!this.isValidJWT || !this.validationSecretKey.trim()) {
        this.validationError = 'Please provide a valid JWT and secret key';
        return;
      }
      
      try {
        const parts = this.jwtToken.split('.');
        const data = `${parts[0]}.${parts[1]}`;
        const expectedSignature = this.createSignature(data, this.validationSecretKey);
        
        this.isSignatureValid = expectedSignature === parts[2];
        
        if (!this.isSignatureValid) {
          this.validationError = 'Signature validation failed - secret key may be incorrect';
        }
        
      } catch (error) {
        this.validationError = 'Error validating signature';
        this.isSignatureValid = false;
      }
    }
  },
  computed: {
    decodedPayloadObj() {
      try {
        return this.decodedPayload ? JSON.parse(this.decodedPayload) : null;
      } catch {
        return null;
      }
    },
    
    tokenParts() {
      if (!this.jwtToken) return { header: '', payload: '', signature: '' };
      const parts = this.jwtToken.split('.');
      return {
        header: parts[0] || '',
        payload: parts[1] || '',
        signature: parts[2] || ''
      };
    }
  }
});
</script>

<template>
  <div class="page-container space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>JWT Decoder/Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs v-model="activeTab" default-value="decode" class="space-y-6">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="decode">Decode</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <!-- Decode Tab -->
          <TabsContent value="decode" class="space-y-6">
            <!-- JWT Input -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="jwt-input">JWT Token</Label>
                <div class="flex gap-2">
                  <Button 
                    v-if="isValidJWT" 
                    @click="useDecodedForGeneration" 
                    variant="outline" 
                    size="sm"
                  >
                    Edit in Generator
                  </Button>
                  <Button @click="clearAll" variant="outline" size="sm">
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                id="jwt-input"
                v-model="jwtToken"
                placeholder="Paste your JWT token here..."
                class="min-h-[100px] font-mono text-sm"
              />
              
              <!-- Token Parts Visualization -->
              <div v-if="jwtToken" class="text-xs font-mono break-all space-y-1">
                <div class="text-muted-foreground">Token Parts:</div>
                <div>
                  <span class="bg-red-200 dark:bg-red-900 px-1 rounded">{{ tokenParts.header }}</span>
                  <span class="text-muted-foreground">.</span>
                  <span class="bg-purple-200 dark:bg-purple-900 px-1 rounded">{{ tokenParts.payload }}</span>
                  <span class="text-muted-foreground">.</span>
                  <span class="bg-cyan-200 dark:bg-cyan-900 px-1 rounded">{{ tokenParts.signature }}</span>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <Alert v-if="decodeError" variant="destructive">
              <AlertDescription>{{ decodeError }}</AlertDescription>
            </Alert>

            <!-- Decoded Content -->
            <div v-if="isValidJWT" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Header -->
              <div class="space-y-2">
                <Label class="text-red-600 dark:text-red-400">Header</Label>
                <Textarea
                  v-model="decodedHeader"
                  readonly
                  class="min-h-[150px] bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 font-mono text-sm"
                />
                <CopyButton :value="decodedHeader" label="Copy Header" class="text-sm" />
              </div>

              <!-- Payload -->
              <div class="space-y-2">
                <Label class="text-purple-600 dark:text-purple-400">Payload</Label>
                <Textarea
                  v-model="decodedPayload"
                  readonly
                  class="min-h-[150px] bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 font-mono text-sm"
                />
                <CopyButton :value="decodedPayload" label="Copy Payload" class="text-sm" />
              </div>
            </div>

            <!-- Payload Analysis -->
            <div v-if="decodedPayloadObj" class="space-y-3">
              <Label class="text-base font-medium">Token Analysis</Label>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div v-if="decodedPayloadObj.iss" class="bg-muted p-3 rounded">
                  <div class="font-medium">Issuer (iss)</div>
                  <div class="text-muted-foreground">{{ decodedPayloadObj.iss }}</div>
                </div>
                <div v-if="decodedPayloadObj.sub" class="bg-muted p-3 rounded">
                  <div class="font-medium">Subject (sub)</div>
                  <div class="text-muted-foreground">{{ decodedPayloadObj.sub }}</div>
                </div>
                <div v-if="decodedPayloadObj.aud" class="bg-muted p-3 rounded">
                  <div class="font-medium">Audience (aud)</div>
                  <div class="text-muted-foreground">{{ decodedPayloadObj.aud }}</div>
                </div>
                <div v-if="decodedPayloadObj.iat" class="bg-muted p-3 rounded">
                  <div class="font-medium">Issued At (iat)</div>
                  <div class="text-muted-foreground">{{ formatTimestamp(decodedPayloadObj.iat) }}</div>
                </div>
                <div v-if="decodedPayloadObj.exp" class="bg-muted p-3 rounded">
                  <div class="font-medium">Expires (exp)</div>
                  <div :class="getExpirationStatus(decodedPayloadObj.exp).color">
                    {{ formatTimestamp(decodedPayloadObj.exp) }}
                    ({{ getExpirationStatus(decodedPayloadObj.exp).status }})
                  </div>
                </div>
                <div v-if="decodedPayloadObj.nbf" class="bg-muted p-3 rounded">
                  <div class="font-medium">Not Before (nbf)</div>
                  <div class="text-muted-foreground">{{ formatTimestamp(decodedPayloadObj.nbf) }}</div>
                </div>
              </div>
            </div>

            <!-- Signature -->
            <div v-if="signature" class="space-y-4">
              <Label class="text-cyan-600 dark:text-cyan-400">Signature</Label>
              <div class="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-100 p-3 rounded font-mono text-sm break-all">
                {{ signature }}
              </div>
              
              <!-- Signature Validation -->
              <div class="space-y-3 border-t pt-4">
                <Label class="text-sm font-medium">Validate Signature</Label>
                <div class="space-y-3">
                  <div class="flex gap-2">
                    <Input
                      v-model="validationSecretKey"
                      type="password"
                      placeholder="Enter secret key to validate..."
                      class="flex-1 font-mono text-sm"
                    />
                    <Button 
                      @click="validateSignature" 
                      variant="outline" 
                      size="sm"
                      :disabled="!isValidJWT || !validationSecretKey.trim()"
                    >
                      Validate
                    </Button>
                  </div>
                  
                  <!-- Validation Result -->
                  <div v-if="isSignatureValid !== null" class="flex items-center gap-2 text-sm">
                    <div v-if="isSignatureValid" class="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Signature Valid
                    </div>
                    <div v-else class="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Signature Invalid
                    </div>
                  </div>
                  
                  <!-- Validation Error -->
                  <Alert v-if="validationError" variant="destructive" class="text-sm">
                    <AlertDescription>{{ validationError }}</AlertDescription>
                  </Alert>
                </div>
              </div>
              
              <p class="text-xs text-muted-foreground">
                This uses a simplified signature algorithm for demonstration. Use proper HMAC-SHA256 in production.
              </p>
            </div>
          </TabsContent>

          <!-- Generate Tab -->
          <TabsContent value="generate" class="space-y-6">
            <!-- Header Section -->
            <div class="space-y-4">
              <Label class="text-base font-medium text-red-600 dark:text-red-400">Header</Label>
              <Textarea
                v-model="customHeader"
                class="min-h-[100px] bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 font-mono text-sm"
              />
            </div>

            <!-- Payload Section -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Label class="text-base font-medium text-purple-600 dark:text-purple-400">Payload</Label>
                <div class="flex gap-2">
                  <Select @update:model-value="loadTemplate">
                    <SelectTrigger class="w-40">
                      <SelectValue placeholder="Load template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="api">API Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button @click="addCurrentTimestamp" variant="outline" size="sm">
                    Update Timestamps
                  </Button>
                </div>
              </div>
              <Textarea
                v-model="payloadData"
                class="min-h-[200px] bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100 font-mono text-sm"
              />
            </div>

            <!-- Secret Key -->
            <div class="space-y-2">
              <Label class="text-cyan-600 dark:text-cyan-400">Secret Key</Label>
              <Input
                v-model="secretKey"
                type="password"
                placeholder="Enter your secret key..."
                class="bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-100 font-mono text-sm placeholder:text-cyan-600 dark:placeholder:text-cyan-400"
              />
              <p class="text-xs text-muted-foreground">
                This uses a simplified signature algorithm for demonstration. Use proper HMAC-SHA256 in production.
              </p>
            </div>

            <!-- Generated Token -->
            <div class="space-y-2">
              <Label class="text-base font-medium">Generated JWT</Label>
              <Textarea
                v-model="generatedToken"
                readonly
                class="min-h-[120px] bg-muted font-mono text-sm break-all"
              />
              <div class="flex justify-between">
                <p class="text-sm text-muted-foreground">Length: {{ generatedToken.length }} characters</p>
                <CopyButton
                  v-if="generatedToken"
                  :value="generatedToken"
                  label="Copy JWT"
                  class="text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <!-- JWT Info -->
        <div class="space-y-3 pt-6 border-t">
          <Label class="text-base font-medium">About JWT</Label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="space-y-2">
              <h4 class="font-medium text-red-600 dark:text-red-400">Header</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• Algorithm (alg)</p>
                <p>• Token type (typ)</p>
                <p>• Key ID (kid)</p>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-purple-600 dark:text-purple-400">Payload</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• Subject (sub)</p>
                <p>• Expiration (exp)</p>
                <p>• Issued at (iat)</p>
                <p>• Custom claims</p>
              </div>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-cyan-600 dark:text-cyan-400">Signature</h4>
              <div class="bg-muted p-3 rounded text-xs space-y-1">
                <p>• Verifies integrity</p>
                <p>• Prevents tampering</p>
                <p>• Requires secret key</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Custom styles for JWT tool */
</style>