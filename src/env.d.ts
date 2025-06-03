/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      $props: {}
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

// Vue 3 JSX types
import { VNode } from 'vue'

// Chrome extension types
declare global {
  interface Window {
    chrome?: typeof chrome;
  }
  
  const chrome: {
    runtime: {
      id: string;
      sendMessage: (message: any, callback?: (response: any) => void) => void;
      onMessage: {
        addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
        removeListener: (callback: any) => void;
      };
    };
    tabs: {
      query: (queryInfo: { active?: boolean; currentWindow?: boolean; url?: string | string[] }) => Promise<Array<{ id?: number; url?: string }>>;
      create: (createProperties: { url?: string; active?: boolean }) => Promise<{ id?: number }>;
      sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
    };
    scripting: {
      executeScript: (injection: {
        target: { tabId: number };
        func: (...args: any[]) => void;
        args?: any[];
      }) => Promise<any>;
      insertCSS: (injection: {
        target: { tabId: number };
        css: string;
      }) => Promise<void>;
    };
    storage: {
      local: {
        get: (keys?: string | string[] | object) => Promise<any>;
        set: (items: object) => Promise<void>;
      };
    };
  };
}

// Module type declarations
declare module '@heroicons/vue/solid' {
  import { DefineComponent } from 'vue'
  const content: Record<string, DefineComponent>
  export = content
}

declare module 'md-editor-v3' {
  import { DefineComponent } from 'vue'
  export const MdEditor: DefineComponent
}
