import { Values, Components } from "@oursky/react-messageformat";
import en from "./translations/en.json";
import zh from "./translations/zh.json";

export type MessageID = keyof typeof en;
export type MessageArgs = Values;
export type MessageComponents = Components;
export type TranslationMap = { [key in MessageID]: string };

export enum Locale {
  en = "en",
  zh = "zh",
}

export const Translations: { [key in Locale]: TranslationMap } = Object.freeze({
  [Locale.en]: en,
  [Locale.zh]: zh,
});
