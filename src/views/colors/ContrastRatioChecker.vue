<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ColorSelector from '@/components/colors/ColorSelector.vue';

const textColor = ref('#000000');
const background = ref('#ffffff');
const ratio = ref(0);

const validateHex = (hex: string) => {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 6) {
    let regEx = /^[0-9a-fA-F]+$/;
    let isHex = regEx.test(hex.toString());
    if (!isHex) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const luminance = (r: number, g: number, b: number) => {
  var a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const hexToRgb = (hex: any) => {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(
    shorthandRegex,
    function (m: any, r: any, g: any, b: any) {
      return r + r + g + g + b + b;
    }
  );

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : {
        r: 0,
        g: 0,
        b: 0
      };
};

const calculateRatio = () => {
  // read the colors and transform them into rgb format
  const color1rgb = hexToRgb(textColor.value);
  const color2rgb = hexToRgb(background.value);

  // calculate the relative luminance
  const color1luminance = luminance(
    color1rgb.r,
    color1rgb.g,
    color1rgb.b
  );
  const color2luminance = luminance(
    color2rgb.r,
    color2rgb.g,
    color2rgb.b
  );

  // calculate the color contrast ratio
  ratio.value =
    color1luminance > color2luminance
      ? (color2luminance + 0.05) / (color1luminance + 0.05)
      : (color1luminance + 0.05) / (color2luminance + 0.05);
};

// Watch for color changes to trigger ratio calculation
watch([textColor, background], () => {
  calculateRatio();
}, { immediate: true });


const score = computed((): number => {
  let score = Math.round((1 - ratio.value) * 100) / 10;
  if (score > 20 / 3) {
    let top = (score - 20 / 3) * (15 / 10);
    return Math.floor(top + 5.75);
  } else {
    return Math.floor(score * (15 / 20));
  }
});

const aaLarge = computed(() => {
  calculateRatio();
  return ratio.value < 1 / 3 ? 'PASS' : 'FAIL';
});

const aaSmall = computed(() => {
  return ratio.value < 1 / 4.5 ? 'PASS' : 'FAIL';
});

const aaaLarge = computed(() => {
  return ratio.value < 1 / 4.5 ? 'PASS' : 'FAIL';
});

const aaaSmall = computed(() => {
  return ratio.value < 1 / 7 ? 'PASS' : 'FAIL';
});

const sampleBoxStyle = computed(() => {
  return {
    color: textColor.value,
    background: background.value
  };
});

const scoreVariant = computed(() => {
  if (ratio.value < 1 / 7) return 'default';
  if (ratio.value < 1 / 3) return 'secondary';
  return 'destructive';
});

const textSmallVariant = computed(() => {
  if (ratio.value < 1 / 7) return 'default';
  if (ratio.value < 1 / 4.5) return 'secondary';
  return 'destructive';
});

const textLargeVariant = computed(() => {
  if (ratio.value < 1 / 4.5) return 'default';
  if (ratio.value < 1 / 3) return 'secondary';
  return 'destructive';
});
</script>

<template>
  <div class="page-container">
    <div class="page-heading">
      <h1>Contrast ratio checker</h1>
      <p class="pb-5">
        Check if your contrast ratio complies with
        <strong>Web Content Accessibility Guidelines (WCAG)</strong>
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle>Color Selection</CardTitle>
          <CardDescription>Choose your text and background colors</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>Text color</Label>
            <ColorSelector v-model="textColor" />
          </div>

          <div class="space-y-2">
            <Label>Background color</Label>
            <ColorSelector v-model="background" />
          </div>
        </CardContent>
      </Card>

      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Accessibility Results</CardTitle>
          <CardDescription>WCAG compliance test results</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-4">
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <Badge :variant="scoreVariant" class="text-lg px-3 py-1">
                    Score: {{ score.toFixed(2) }}/10
                  </Badge>
                  <p class="text-sm text-muted-foreground mt-2">
                    Contrast ratio: {{ ratio.toFixed(3) }}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader class="pb-3">
                  <CardTitle class="text-base">Small Text</CardTitle>
                </CardHeader>
                <CardContent class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">AA-level:</span>
                    <Badge :variant="aaSmall === 'PASS' ? 'default' : 'destructive'">
                      {{ aaSmall }}
                    </Badge>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm">AAA-level:</span>
                    <Badge :variant="aaaSmall === 'PASS' ? 'default' : 'destructive'">
                      {{ aaaSmall }}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader class="pb-3">
                  <CardTitle class="text-base">Large Text</CardTitle>
                </CardHeader>
                <CardContent class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">AA-level:</span>
                    <Badge :variant="aaLarge === 'PASS' ? 'default' : 'destructive'">
                      {{ aaLarge }}
                    </Badge>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm">AAA-level:</span>
                    <Badge :variant="aaaLarge === 'PASS' ? 'default' : 'destructive'">
                      {{ aaaLarge }}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card class="mt-6">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>See how your color combination looks in practice</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="p-8 rounded-lg border text-center" :style="sampleBoxStyle">
          <h2 class="text-xl font-bold mb-4">Quote Sample</h2>
          <p class="mb-4 leading-relaxed">
            Every great developer you know got there by solving problems they were
            unqualified to solve until they actually did it.
          </p>
          <span class="font-semibold">Patrick McKenzie</span>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-6">
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <CardDescription>Learn more about accessibility guidelines</CardDescription>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="https://www.w3.org/TR/WCAG21/" target="_blank" class="text-primary hover:underline">
              Web Content Accessibility Guidelines (WCAG) 2.1
            </a>
          </li>
          <li>
            <a href="https://www.iso.org/standard/58625.html" target="_blank" class="text-primary hover:underline">
              ISO/IEC 40500:2012
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>

