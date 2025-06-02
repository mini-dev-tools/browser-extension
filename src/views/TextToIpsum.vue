<script lang="ts">
import { LoremIpsum } from 'lorem-ipsum';
import { defineComponent } from 'vue';

export default defineComponent({
  // type inference enabled
  data() {
    return {
      loremString: '',
      number: 1,
      type: 'words',
      showMsg: false
    };
  },
  methods: {
    downloadIpsum() {
      let charset = 'utf-8';
      let data = 'text/plain';
      let filename = 'ipsum.txt';
      let FileContent = this.loremString;
      let element = document.createElement('a');
      // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(FileContent));
      element.setAttribute(
        'href',
        'data:' +
          data +
          ';charset=' +
          charset +
          ',' +
          encodeURIComponent(FileContent)
      );

      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    copy() {
      navigator.clipboard.writeText(this.loremString).then(
        function () {
          /* clipboard successfully set */
        },
        function () {
          alert('unable to copy to clipboard');
          /* clipboard write failed */
        }
      );
    },

    CountOfWords() {
      let preg = this.loremString.match(/(\w+)/g);
      if (preg != null) {
        return preg.length;
      } else return 0;
    },
    convertToIpsum() {
      // TODO step one convert into paragraphs paragraphs,
      // TODO paragraph Into sentences
      // Sentences Into words array
      // replace
      /// number of words
      let wordsCount = this.CountOfWords();

      if (wordsCount != null && wordsCount !== 0) {
        const lorem = new LoremIpsum();
        this.loremString = lorem.generateWords(wordsCount);
      } else {
        this.showMsg = true;
        // TODO: add Edsaasdfsdf`
      }
    },

    generateIpsumWords() {},
    clearMsg() {
      this.showMsg = false;
    },
    generateIpsum() {
      // TODO Allow user To create custom prefix

      const lorem = new LoremIpsum();
      switch (this.type) {
        case 'words':
          return (this.loremString = lorem.generateWords(this.number));
          break;
        case 'paragraphs':
          return (this.loremString = lorem.generateParagraphs(this.number));
          break;
        case 'sentences':
          return (this.loremString = lorem.generateSentences(this.number));
          break;
        default:
        // code block
      }
    }
  },
  computed: {
    numberOfWords() {
      let preg = this.loremString.match(/(\w+)/g);
      if (preg != null) {
        return preg.length;
      } else return 0;
    },
    numberOfCharacters() {
      if (this.loremString != null) {
        return this.loremString.length;
      } else return 0;
    }
  },
  mounted() {}
});
</script>
<template>
  <div class="page-container">
    <h1>Text To Ipsum</h1>
    <small
      >Enter text into text box click convert to convert it to lorem ipsum
      {{ numberOfWords }}</small
    >
    <div class="flex-container">
      <div>
        <button
          @click="convertToIpsum"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Convert To Ipsum
        </button>
      </div>
      <div>
        <button
          @click="copy"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Copy
        </button>
      </div>
      <div>
        <button
          @click="downloadIpsum"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Download .txt
        </button>
      </div>
    </div>
    <div
      v-if="showMsg"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold"> There is nothing to convert</strong>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          @click="clearMsg"
          class="fill-current h-6 w-6 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          />
        </svg>
      </span>
    </div>

    <hr />
    <!--  <span v-html="loremString"></span>-->

    <textarea
      class="text-area-input"
      style="width: 100%; min-height: 600px"
      ref="textAria"
      aria-placeholder="Please Enter text to convert to lorem ipsum"
      @focusin="clearMsg"
      @focusout="clearMsg"
      @KeyUp="clearMsg"
      v-model="loremString"
    ></textarea>
  </div>
</template>

<style>
.flex-container {
  display: flex;
}

.flex-container > div {
  padding: 10px;
}
</style>
