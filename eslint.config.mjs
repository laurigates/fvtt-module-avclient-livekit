import js from "@eslint/js";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", "webpack.*.js"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.node,
        // FoundryVTT globals
        CONFIG: "readonly",
        game: "readonly",
        canvas: "readonly",
        ui: "readonly",
        foundry: "readonly",
        Hooks: "readonly",
        $: "readonly",
        randomID: "readonly",
        debounce: "readonly",
        // FoundryVTT types
        AVClient: "readonly",
        AVConfig: "readonly",
        AVMaster: "readonly",
        AVSettings: "readonly",
        CameraViews: "readonly",
        User: "readonly",
        AudioHelper: "readonly",
        Dialog: "readonly",
        Canvas: "readonly",
        Game: "readonly",
        // Custom type definitions from types/avclient-livekit.d.ts
        ApplicationOptions: "readonly",
        FoundryGame: "readonly",
        FoundryUI: "readonly",
        FoundrySettings: "readonly",
        FoundrySettingConfig: "readonly",
        FoundryPosition: "readonly",
        // Browser types that might not be available
        JQuery: "readonly",
        EventListener: "readonly",
        MediaDeviceKind: "readonly",
        MediaStream: "readonly",
        HTMLVideoElement: "readonly",
        HTMLElement: "readonly",
        CustomEvent: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];