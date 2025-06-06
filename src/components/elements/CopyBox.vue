<template>
  <div class="container">
    <div class="label">
      {{ label }}
    </div>
    <div class="copy-text" :class="{ active: showCopy }">
      <input
        type="text"
        class="text"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button @click="copy">
        📋
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'copy-box.vue',
  methods: {
    showmsg() {
      this.showCopy = true;
      setTimeout(() => {
        this.showCopy = false;
      }, 1000);
    },
    copy() {
      this.showmsg();
      navigator.clipboard
        .writeText(this.text)
        .then(this.modelValue, function () {
          alert('unable to copy to clipboard');
          /* clipboard write failed */
        });
    }
  },
  data() {
    return {
      showCopy: false
    };
  },
  props: {
    label: {
      type: String,
      default: 'Text to copy'
    },
    modelValue: {
      type: [String, Number],
      default: ''
    }
  }
};
</script>

<style scoped>
.copy-text {
  position: relative;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  display: flex;
}
.copy-text input {
  width: 100%;
}
.copy-text input.text {
  padding: 10px;
  font-size: 18px;
  color: #555;
  border: none;
  outline: none;
}
.copy-text button {
  padding: 10px;
  aspect-ratio: 1 / 1 !important;
  background: #5784f5;
  color: #fff;
  font-size: 18px;
  border: none;
  outline: none;
  border-radius: 10px;
  cursor: pointer;
}
.copy-text button:before {
  content: 'copied';
  position: absolute;
  top: -45px;
  right: 0px;
  background: #5c81dc;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 15px;
  display: none;
}
.copy-text button:after {
  content: ' ';
  position: absolute;
  top: -20px;
  right: 25px;
  width: 10px;
  height: 10px;
  background: #5c81dc;
  transform: rotate(45deg);
  display: none;
}
.copy-text.active button:before,
.copy-text.active button:after {
  display: block;
}
</style>
