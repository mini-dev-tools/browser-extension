import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useMainStore = defineStore("MainStore", {
    // state
    state: () => {
        return {
            env: {
                environment: useLocalStorage("environment", "dev"),
                showComingSoon: useLocalStorage("showComingSoon", false),
            },
            isDark:  useLocalStorage("isDark", false),
            logoUrl: useLocalStorage(
                "localUrl",
                "https://localhost:8000/assets/logo-landscape.png"
            ),
            counter: useLocalStorage("counter", 0),
        };
    },
    getters: {
        doubleCount: (state) => state.counter * 2,
    },

    actions: {
        toggleTheme(){
            this.isDark = !this.isDark;
        },

        inc() {
            this.counter++;
        },
    },
});
