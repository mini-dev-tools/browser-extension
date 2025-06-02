<template>
  <div class="page-container">
    <h1>Minify</h1>
    <Tabs v-model="activeName" @update:value="handleTabChange">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="first">Json</TabsTrigger>
        <TabsTrigger value="second">JS</TabsTrigger>
        <TabsTrigger value="third">CSS</TabsTrigger>
        <TabsTrigger value="fourth">Task</TabsTrigger>
      </TabsList>
      <TabsContent value="first" class="mt-4">
        <div class="text-sm text-muted-foreground">Json minification</div>
      </TabsContent>
      <TabsContent value="second" class="mt-4">
        <div class="text-sm text-muted-foreground">JavaScript minification</div>
      </TabsContent>
      <TabsContent value="third" class="mt-4">
        <div class="text-sm text-muted-foreground">CSS minification</div>
      </TabsContent>
      <TabsContent value="fourth" class="mt-4">
        <div class="text-sm text-muted-foreground">Task management</div>
      </TabsContent>
    </Tabs>

    <div class="flex">
      <button @click="convert">convert</button>
    </div>
    <div class="flex gap-2">
      <textarea
        v-model="stringInput"
        class="basis-1/2 border border-indigo-100 rounded-md"
      ></textarea>
      <textarea
        v-model="output"
        class="basis-1/2 border border-indigo-100 rounded-md"
        disabled
      ></textarea>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default defineComponent({
  components: {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
  },
  data() {
    return {
      stringInput: '',
      output: '',
      activeName: 'first'
    };
  },
  methods: {
    convert() {
      // TODO: Implement conversion logic based on active tab
    },

    handleTabChange(value: string) {
      console.log('Tab changed to:', value);
      this.activeName = value;
    }
  }
});
</script>
<style scoped>
/* Custom styles for the minify page */
</style>
