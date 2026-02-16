
import { GoogleGenAI, Modality } from "@google/genai";

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

async function audioBufferToWavBlob(buffer: AudioBuffer): Promise<Blob> {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); 
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16); 
  setUint16(1); 
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); 
  setUint16(numOfChan * 2); 
  setUint16(16); 
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); 

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export interface GenerateSpeechParams {
  text: string;
  voiceName: string;
  language: string;
}

export const generateSpeech = async ({ text, voiceName, language }: GenerateSpeechParams) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  let languageInstruction = "";
  if (language === 'hi') languageInstruction = "Perform in pure Hindi.";
  else if (language === 'ja') languageInstruction = "Perform in authentic Japanese.";
  else if (language === 'hinglish') languageInstruction = "Perform in casual Hinglish.";
  else languageInstruction = "Perform in high-energy English.";

  // Special Naruto-style instruction if Kore is selected
  const characterProfile = voiceName === 'Kore' 
    ? "Character: A high-energy teenage ninja. Tone: Raspy, determined, youthful, and slightly scratchy. Think 'Uzumaki' spirit." 
    : "Character: Dramatic anime male archetype.";

  const prompt = `
    System Instruction:
    - Role: Professional Anime Voice Actor.
    - ${characterProfile}
    - Language Context: ${languageInstruction}
    - Performance Cues: 
      [laugh] = A hearty, character-specific laugh.
      [serious] = Lower pitch, cold determination, slow pacing.
      [angry] = Sharp, loud, shouting with intensity.
      [sad] = Quavering voice, softer, emotional.
      [whisper] = Close to the mic, breathy, secretive.
      [silent] = A distinct pause in narration.
    
    Perform the following script with maximum theatrical energy:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Synthesis empty");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    
    const wavBlob = await audioBufferToWavBlob(audioBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);

    return { audioBuffer, audioContext, audioUrl };
  } catch (error) {
    console.error("TTS Node Failure:", error);
    throw error;
  }
};
