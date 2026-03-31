import { React } from "@webpack/common";
import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
  geminiApiKey: {
    type: OptionType.STRING,
    description: "Gemini API key for translation, synonyms, and definitions",
    default: "",
    placeholder: "Enter your Gemini API key",
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
    description: "Your native language (for translations)",
    options: [
      { label: "Español", value: "es" },
      { label: "English", value: "en" },
      { label: "Português", value: "pt" },
      { label: "Français", value: "fr" },
      { label: "Deutsch", value: "de" },
    ],
    default: "es",
  },
  geminiModel: {
    type: OptionType.SELECT,
    description: "Gemini model to use",
    options: [
      { label: "Gemini 2.5 Flash (Recommended)", value: "gemini-2.5-flash", default: true },
      { label: "Gemini 2.5 Flash-Lite (Fastest)", value: "gemini-2.5-flash-lite" },
      { label: "Gemini 2.5 Pro (Most Capable)", value: "gemini-2.5-pro" },
    ],
    default: "gemini-2.5-flash",
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
      </div>
    </div>
  );
}
