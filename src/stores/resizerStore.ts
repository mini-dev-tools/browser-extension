import
{ defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
interface preset {
    resizeTarget: string;
    width: number;
    height: number;
    icon: string;
    description: string;
    position: {
        options: string; /// Options: unchanged + center + custom
        top: number;
        right: number;
    };
}



export const useMainStore = defineStore("MainStore", {
    // state
    state: () => {
        return {
            //set type to array of preset
           
            defaultPreset:  [
                {
                  resizeTarget: 'window',
                  width: 320,
                  height: 568,
                  icon: 'fa fa-mobile',
                  description: 'Iphone 5',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
                {
                  resizeTarget: 'window',
                  width: 375,
                  height: 667,
                  icon: 'fa fa-mobile',
                  description: 'Iphone 6',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
                {
                  resizeTarget: 'window',
                  width: 1024,
                  height: 768,
                  icon: 'fa fa-tablet',
                  description: 'Ipad',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
                {
                  resizeTarget: 'window',
                  width: 1440,
                  height: 900,
                  icon: 'fa fa-laptop',
                  description: 'Laptop',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
                {
                  resizeTarget: 'window',
                  width: 1680,
                  height: 1050,
                  icon: 'fa fa-desktop',
                  description: 'Desktop small',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
        
                {
                  resizeTarget: 'window',
                  width: 1920,
                  height: 1080,
                  icon: 'fa fa-tv',
                  description: 'Desktop 2',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                },
                {
                  resizeTarget: 'window',
                  width: 2560,
                  height: 1440,
                  icon: 'fa fa-tv',
                  description: 'Desktop 3',
                  position: {
                    options: 'unchanged', /// Options: unchanged + center + custom
                    top: 0,
                    right: 0
                  }
                }
              ] as preset[],
            userDefinedPreset: useLocalStorage('presetResizer',[] as preset[]),
        };
    },
    getters: {
        doubleCount: (state) => state.userDefinedPreset,
        getPreset: (state) => {
            if (state.userDefinedPreset.length > 0) {
                return state.userDefinedPreset;
            }else{
                return state.defaultPreset;
            };
        },
    },
   
    actions: {
        resetToDefault() {
            this.userDefinedPreset = this.defaultPreset;
        },
        addPreset(preset: preset) {
            this.userDefinedPreset.push(preset);
        }



        
    },
});