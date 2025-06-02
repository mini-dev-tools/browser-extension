<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  data() {
    return {
      selected: ''
    };
  },
  methods: {}
});
</script>
<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div class="text-6xl mb-4">🚧</div>
    <h2 class="text-2xl font-semibold mb-2">Coming Soon</h2>
    <p class="text-muted-foreground">This feature is under development.</p>
  </div>
</template>
<style></style>
