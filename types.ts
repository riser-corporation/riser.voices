
export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  previewText: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  flag: string;
  description: string;
}

export interface SpeechHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  voice: string;
  language: string;
  audioBlobUrl: string;
}

export enum AnimeStyle {
  ENERGETIC = 'Energetic Ninja',
  GRITTY = 'Serious Rival',
  CASUAL = 'Default Male'
}
