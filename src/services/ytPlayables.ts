/**
 * YouTube Playables SDK Wrapper
 * Provides seamless integration with YouTube Playables runtime APIs
 * and safe fallback for local development or non-Playables environments.
 */

declare global {
  interface Window {
    ytgame?: {
      IN_PLAYABLES_ENV?: boolean;
      game?: {
        firstFrameReady: () => void;
        gameReady: () => void;
        saveData: (data: string) => Promise<void>;
        loadData: () => Promise<string | null>;
      };
      system?: {
        isAudioEnabled: () => boolean;
        onAudioEnabledChange: (callback: (enabled: boolean) => void) => void;
        onPause: (callback: () => void) => void;
        onResume: (callback: () => void) => void;
      };
      engagement?: {
        sendScore: (params: { value: number }) => Promise<void>;
      };
    };
  }
}

class YouTubePlayablesService {
  private isAvailable: boolean = false;
  private audioEnabled: boolean = true;
  private audioCallbacks: Array<(enabled: boolean) => void> = [];
  private pauseCallbacks: Array<() => void> = [];
  private resumeCallbacks: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && window.ytgame) {
      this.isAvailable = true;
      console.log('🎮 [YT Playables] SDK detected');

      // Initialize audio state
      if (window.ytgame.system?.isAudioEnabled) {
        this.audioEnabled = window.ytgame.system.isAudioEnabled();
      }

      // Hook audio toggle
      window.ytgame.system?.onAudioEnabledChange?.((enabled: boolean) => {
        this.audioEnabled = enabled;
        this.audioCallbacks.forEach((cb) => cb(enabled));
      });

      // Hook pause/resume
      window.ytgame.system?.onPause?.(() => {
        this.pauseCallbacks.forEach((cb) => cb());
      });

      window.ytgame.system?.onResume?.(() => {
        this.resumeCallbacks.forEach((cb) => cb());
      });
    } else {
      console.log('ℹ️ [YT Playables] Running in standalone/local mode (mock SDK active)');
    }
  }

  public isRunningInPlayables(): boolean {
    return this.isAvailable;
  }

  public notifyFirstFrameReady() {
    if (window.ytgame?.game?.firstFrameReady) {
      window.ytgame.game.firstFrameReady();
      console.log('🚀 [YT Playables] firstFrameReady notified');
    }
  }

  public notifyGameReady() {
    if (window.ytgame?.game?.gameReady) {
      window.ytgame.game.gameReady();
      console.log('🏁 [YT Playables] gameReady notified');
    }
  }

  public isAudioActive(): boolean {
    return this.audioEnabled;
  }

  public toggleAudio(): boolean {
    this.audioEnabled = !this.audioEnabled;
    this.audioCallbacks.forEach((cb) => cb(this.audioEnabled));
    return this.audioEnabled;
  }

  public onAudioChange(cb: (enabled: boolean) => void) {
    this.audioCallbacks.push(cb);
    return () => {
      this.audioCallbacks = this.audioCallbacks.filter((c) => c !== cb);
    };
  }

  public onPause(cb: () => void) {
    this.pauseCallbacks.push(cb);
    return () => {
      this.pauseCallbacks = this.pauseCallbacks.filter((c) => c !== cb);
    };
  }

  public onResume(cb: () => void) {
    this.resumeCallbacks.push(cb);
    return () => {
      this.resumeCallbacks = this.resumeCallbacks.filter((c) => c !== cb);
    };
  }

  public async saveGameState(data: unknown): Promise<void> {
    const serialized = JSON.stringify(data);
    if (window.ytgame?.game?.saveData) {
      try {
        await window.ytgame.game.saveData(serialized);
        console.log('💾 [YT Playables] Saved game state to cloud');
        return;
      } catch (err) {
        console.warn('Failed to save to YT Playables cloud:', err);
      }
    }
    // Fallback to localStorage
    try {
      localStorage.setItem('kubedefender_save', serialized);
    } catch {
      // Ignore in private browsing
    }
  }

  public async loadGameState<T>(): Promise<T | null> {
    if (window.ytgame?.game?.loadData) {
      try {
        const raw = await window.ytgame.game.loadData();
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn('Failed to load from YT Playables cloud:', err);
      }
    }
    // Fallback to localStorage
    try {
      const local = localStorage.getItem('kubedefender_save');
      if (local) return JSON.parse(local);
    } catch {
      // Ignore
    }
    return null;
  }

  public async submitScore(score: number): Promise<void> {
    console.log(`🏆 [YT Playables] Submitting score: ${score}`);
    if (window.ytgame?.engagement?.sendScore) {
      try {
        await window.ytgame.engagement.sendScore({ value: Math.round(score) });
      } catch (err) {
        console.warn('Failed to submit score to YT Playables:', err);
      }
    }
  }
}

export const ytPlayables = new YouTubePlayablesService();
