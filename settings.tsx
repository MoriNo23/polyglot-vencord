import { React } from "@webpack/common";
import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

const settings = definePluginSettings({
  geminiApiKey: {
    type: OptionType.STRING,
    description: "Gemini API key for translation, synonyms, and definitions",
    default: "",
    placeholder: "Enter your Gemini API key",
  },
  deeplApiKey: {
    type: OptionType.STRING,
    description: "DeepL API key for translation fallback (optional)",
    default: "",
    placeholder: "Enter your DeepL API key (optional)",
  },
  learningLanguage: {
    type: OptionType.SELECT,
    description: "Language you are learning (source language for translation)",
    options: [
      { label: "English", value: "en" },
      { label: "Español", value: "es" },
      { label: "Português", value: "pt" },
      { label: "Français", value: "fr" },
      { label: "Deutsch", value: "de" },
    ],
    default: "en",
  },
  nativeLanguage: {
    type: OptionType.SELECT,
    description: "Your native language (for explanations and context)",
    options: [
      { label: "Español", value: "es" },
      { label: "English", value: "en" },
      { label: "Português", value: "pt" },
      { label: "Français", value: "fr" },
      { label: "Deutsch", value: "de" },
    ],
    default: "es",
  },
  interfaceLanguage: {
    type: OptionType.SELECT,
    description: "Interface language for the plugin (UI labels, buttons, etc.)",
    options: [
      { label: "Español", value: "es" },
      { label: "English", value: "en" },
      { label: "Português", value: "pt" },
      { label: "Français", value: "fr" },
      { label: "Deutsch", value: "de" },
    ],
    default: "es",
  },
  primaryTranslationService: {
    type: OptionType.SELECT,
    description: "Primary translation service",
    options: [
      { label: "Gemini API (Recommended)", value: "gemini" },
      { label: "DeepL API", value: "deepl" },
    ],
    default: "gemini",
  },
  geminiModel: {
    type: OptionType.SELECT,
    description: "Gemini model to use",
    options: [
      { label: "Gemini 3.1 Flash Lite (Fastest & Cheapest)", value: "gemini-3.1-flash-lite-preview" },
      { label: "Gemini 3 Flash (Frontier)", value: "gemini-3-flash-preview" },
      { label: "Gemini 3.1 Pro Preview", value: "gemini-3.1-pro-preview" },
      { label: "Gemini 2.5 Flash (Stable)", value: "gemini-2.5-flash" },
      { label: "Gemini 2.5 Pro (Advanced)", value: "gemini-2.5-pro" },
    ],
    default: "gemini-3.1-flash-lite-preview",
  },
  enableSynonyms: {
    type: OptionType.BOOLEAN,
    description: "Enable synonym suggestions",
    default: true,
  },
  enableTranslation: {
    type: OptionType.BOOLEAN,
    description: "Enable translation feature",
    default: true,
  },
  enableDefinitions: {
    type: OptionType.BOOLEAN,
    description: "Enable word definitions",
    default: true,
  },
  maxResults: {
    type: OptionType.NUMBER,
    description: "Maximum number of results to show",
    default: 10,
    markers: [5, 10, 20, 30],
  },
  cacheResults: {
    type: OptionType.BOOLEAN,
    description: "Cache API results for better performance",
    default: true,
  },
  showSynonymDefinitions: {
    type: OptionType.BOOLEAN,
    description: "Show definitions for synonyms (uses more API calls)",
    default: true,
  },
});

export default function SettingsPanel() {
  return (
    <div>
      <h2>Polyglot Plugin Settings</h2>
      <p>Configure your API keys and preferences for the Polyglot plugin.</p>
      
      <div style={{ marginTop: "20px" }}>
        <h3>API Keys</h3>
        <p>
          Get your Gemini API key from{" "}
          <a 
            href="https://makersuite.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Google AI Studio
          </a>
        </p>
        <p>
          Get your DeepL API key from{" "}
          <a 
            href="https://www.deepl.com/pro-api?cta=header-free-api" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            DeepL API Free
          </a>
        </p>
      </div>
    </div>
  );
}

export { settings };