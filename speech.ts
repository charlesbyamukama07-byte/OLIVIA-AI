export interface VoiceState {
  isSpeaking: boolean;
  isPaused: boolean;
  activeText: string;
}

class OliviaVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((state: VoiceState) => void)[] = [];
  private state: VoiceState = {
    isSpeaking: false,
    isPaused: false,
    activeText: '',
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (state: VoiceState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speak(text: string, voiceName?: string) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02; // natural institutional cadence
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best suited female or English voice
    const voices = this.synth.getVoices();
    let selectedVoice = voices.find((v) => v.name === voiceName);

    if (!selectedVoice) {
      // Prioritize natural sounding female voices for "Olivia"
      selectedVoice =
        voices.find((v) => /samantha|karen|victoria|female|zira|george|serena/i.test(v.name) && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang === 'en-GB' || v.lang === 'en-US') ||
        voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.state = { isSpeaking: true, isPaused: false, activeText: text };
      this.notify();
    };

    utterance.onend = () => {
      this.state = { isSpeaking: false, isPaused: false, activeText: '' };
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.state = { isSpeaking: false, isPaused: false, activeText: '' };
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onpause = () => {
      this.state.isPaused = true;
      this.notify();
    };

    utterance.onresume = () => {
      this.state.isPaused = false;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.state.isSpeaking && !this.state.isPaused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.state = { isSpeaking: false, isPaused: false, activeText: '' };
      this.currentUtterance = null;
      this.notify();
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }
}

export const speechEngine = new OliviaVoiceEngine();
