<script setup lang="ts">
import { ref } from 'vue';
import { useMainStore } from './stores/mainStore';
import CompactNavbar from './components/CompactNavbar.vue';
import { Toaster } from '@/components/ui/sonner';

const mainStore = useMainStore();

const activeIndex = ref('1');
const activeIndex2 = ref('1');
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

const toggleTheme = () => {
  console.log(mainStore.isDark);
  if(mainStore.isDark){
    let ht = document.getElementsByTagName('html')[0];
    ht.classList.toggle('dark');
  }

};

toggleTheme();


</script>

<template>
  <div class="min-h-screen bg-background">
    <CompactNavbar />
    <main class="mx-auto">
      <router-view />
    </main>
    <Toaster />
  </div>
</template>

<style lang="scss">
/* Global layout styles for the app */
main {
  /* Adjust container max-width for better responsive behavior */
  max-width: 100%;
  
  /* For Chrome extension popup - ensure content fits in 700px width */
  @media (max-width: 720px) {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  /* For larger screens - standard container widths */
  @media (min-width: 768px) {
    max-width: 750px;
  }
  
  @media (min-width: 992px) {
    max-width: 970px;
  }
  
  @media (min-width: 1200px) {
    max-width: 1200px;
  }
}

/* Ensure the page content area class works well */
.page-container {
  @apply w-full;
}

/* Extension-specific optimizations */
@media (max-width: 720px) {
  .page-container {
    @apply space-y-1; /* Reduce spacing on small screens */
  }
  
  /* Make cards more compact */
  .card {
    @apply text-sm;
  }
}
</style>
