<script lang="ts">
import { defineComponent } from 'vue';
import Alerts from '../components/elements/Alerts.vue';
import CopyBox from '../components/elements/CopyBox.vue';
import CopyButton from '../components/elements/CopyButton.vue';

import materialColors from '../components/colors/MaterialColorsSelect.vue';

import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { fileHandler } from '../helpers/fileHandler';

export default defineComponent({
  components: {
    alerts: Alerts,
    copyBox: CopyBox,
    materialColors,
    copyButton: CopyButton,

    MdEditor
  },
  data() {
    return {
      fileTypes: [
        {
          extension: '.py',
          mime: 'text/x-python',
          label: 'python',
          aceName: 'python'
        },
        {
          extension: '.html',
          mime: 'text/html',
          label: 'html',
          aceName: 'html'
        },
        {
          extension: '.js',
          mime: 'text/javascript',
          label: 'javascript',
          aceName: 'javascript'
        }
      ],
      fileObj: {
        name: 'untitled'
      },
      loading: false,
      value: 'dsf',
      selected: '',
      content: '',
      contents: '',
      text: '',
      lang: {
        extension: '.py',
        mime: 'text/x-python',
        label: 'python',
        aceName: 'python'
      },
      previewThemes: 'github'
    };
  },
  methods: {
    download: function () {
      let filename = this.fileObj.name ? this.fileObj.name : 'The file';
      new fileHandler(this.content)
        .setFileName(filename + this.lang.extension)
        .setFileMimeType(this.lang.mime)
        .downloadFile();
    },
    readFile(event: any) {
      this.loading = true;

      console.clear();
      let file = event.target.files[0];
      this.fileObj.name = file.name;
      console.log(file);
      const reader = new FileReader();
      reader.onload = () => {
        // this will then display a text file
        this.content = reader.result ? reader.result.toString() : '';
        this.loading = false;
      };

      reader.readAsText(file);
    }
  }
});
</script>
<template>
  <div class="page-container">
    <h1>Dashboard</h1>
  </div>
  <div style="border-style: solid">
    <input type="file" @change="readFile" />
    <div>{{ contents }}</div>
  </div>

  <!--  <input type="file" @change="previewFiles" >-->

  <div class="mx-auto flex w-1/2">
    <input
      type="text"
      class="w-full text-black border border-indigo-100 px-2"
      placeholder="File Name"
      v-model="fileObj.name"
    />
    <select v-model="lang">
      <option v-for="type in fileTypes" :value="type">
        {{ type.label }} ({{ type.extension }})
      </option>
    </select>
    <button @click="download" class="btn-primary">Download</button>
  </div>

  <div class="text-white">
    <md-editor
      previewTheme="github"
      theme="dark"
      language="en-US"
      v-model="text"
    />

    <!--    <copy-button>-->

    <!--    </copy-button>-->
    <!--    <Alerts></Alerts>-->
    <!--    <copy-box label="password" v-model="value"></copy-box>-->
  </div>
</template>
<style>
/*body{*/
/*  background: #272822 !important;*/
/*}*/
</style>
