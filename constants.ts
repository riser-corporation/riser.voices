
import { VoiceOption, LanguageOption } from './types';

export const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: 'Kore', 
    name: 'The Hero (Kore)', 
    description: 'Youthful, high energy male voice.',
    previewText: "Believe it! I'm going to be the greatest ninja ever!" 
  },
  { 
    id: 'Charon', 
    name: 'The Mentor (Charon)', 
    description: 'Deep, calm, and authoritative male voice.',
    previewText: "Concentrate your energy. The real battle starts now." 
  },
  { 
    id: 'Fenrir', 
    name: 'The Rival (Fenrir)', 
    description: 'Cool, detached, and slightly edgy male voice.',
    previewText: "Hmph. You're still weak. Train harder." 
  },
  { 
    id: 'Zephyr', 
    name: 'The Ally (Zephyr)', 
    description: 'Friendly and reliable standard male voice.',
    previewText: "Don't worry, I've got your back no matter what!" 
  }
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'en', name: 'English', flag: '🇺🇸', description: 'Standard English' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳', description: 'Native Hindi accent' },
  { id: 'ja', name: 'Japanese', flag: '🇯🇵', description: 'Original Anime feel' },
  { id: 'hinglish', name: 'Hinglish', flag: '🇮🇳🇺🇸', description: 'Mix of Hindi & English' }
];

export const NINJA_PHRASES = [
  "Believe it!",
  "Dattebayo!",
  "Shadow Clone Jutsu!",
  "Namaste, ninja!",
  "Arigato gozaimasu!"
];
