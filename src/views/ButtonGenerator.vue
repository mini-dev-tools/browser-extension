<template>
  <div class="page-container">
    <h1>Generate CSS Button</h1>

    <div class="grid grid-cols-2 gap-4 row-span-3">
      <div>
        <input type="text" v-model="btn.text" />
        <input type="color" v-model="btn.background" />
        <input type="color" v-model="btn.textColor" />
      </div>
      <div class="w-full row-span-2">
        <h3>Button Preview</h3>

        <button :style="getButtonStyle(btn.background, btn.textColor)">
          {{ btn.text }}
        </button>
      </div>

      :style="" border generator<br />
      Box-shadow-generator<br />
      text-shadow-generator<br />
      {
      {{ styleConverter(getButtonStyle(btn.background, btn.textColor)) }}; }
    </div>

    {{ btn.textColor }}
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    styleConverter(style: any) {
      return Object.entries(style)
        .reduce((acc: any, [key, value]) => {
          const convertedKey = key.replace(/[A-Z]/g, (match) => {
            return `-${match.toLowerCase()}`;
          });

          acc.push(`${convertedKey}: ${value}`);

          return acc;
        }, [])
        .join('; ');
    },
    getButtonStyle(bgColor: string, color: string) {
      return {
        background: bgColor,
        color: color,
        padding: '5px',
        border: 'none',
        outline: 'none',
        margin: '10px',
        'border-radius': ' 64% 86% 45% 63% / 98% 22% 31% 25%'
      };
    }
  },
  name: 'buttonGenerator',
  fonts: [],
  data() {
    return {
      blob: {
        topLeft1: 23,
        topLeft2: 20,
        topRight1: 20,
        topRight2: 10
      },
      btn: {
        text: 'Button Name',
        background: '#eeeeee',
        fontFamily: '',
        fontSize: '',
        textColor: '',
        textShadow: {
          color: '',
          x: 0,
          y: 0,
          blur: 2
        }
      }
    };
  }
};
</script>

<style scoped></style>
