interface AudioSources {
  music: HTMLAudioElement | null;
  move: HTMLAudioElement | null;
  capture: HTMLAudioElement | null;
  win: HTMLAudioElement | null;
  lose: HTMLAudioElement | null;
  click: HTMLAudioElement | null;
  select: HTMLAudioElement | null;
  firstMovePlayer: HTMLAudioElement | null;
  firstMoveAI: HTMLAudioElement | null;
}

class AudioService {
  private sources: AudioSources = {
    music: null,
    move: null,
    capture: null,
    win: null,
    lose: null,
    click: null,
    select: null,
    firstMovePlayer: null,
    firstMoveAI: null,
  };

  private soundEnabled = true;
  private musicEnabled = true;
  private soundVolume = 0.5; // Represents 100% of the sound volume slider
  private musicVolume = 0.5; // Represents 100% of the music volume slider
  private hasInteracted = false;

  constructor() {
    const init = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      this.initializeAudio();
    };
    document.body.addEventListener('click', init, { once: true });
    document.body.addEventListener('touchend', init, { once: true });
  }

  private initializeAudio() {
    if (typeof Audio === 'undefined') {
        console.warn("Audio API not supported.");
        return;
    }
    if (this.sources.music) return;
    
    console.log("Initializing audio sources...");

    this.sources.music = new Audio('assets/sounds/music.mp3');
    this.sources.music.loop = true;
    this.sources.music.volume = this.musicVolume;

    this.sources.move = new Audio('assets/sounds/move.mp3');
    this.sources.capture = new Audio('assets/sounds/capture.mp3');
    this.sources.win = new Audio('assets/sounds/announce_win.mp3');
    this.sources.lose = new Audio('assets/sounds/announce_lose.mp3');
    this.sources.click = new Audio('assets/sounds/click.mp3');
    this.sources.select = new Audio('assets/sounds/select.mp3');
    this.sources.firstMovePlayer = new Audio('assets/sounds/first_move_player.mp3');
    this.sources.firstMoveAI = new Audio('assets/sounds/first_move_ai.mp3');
    
    Object.entries(this.sources).forEach(([key, source]) => {
        if (source) {
            if (key !== 'music') {
                source.volume = this.soundVolume * 0.5; // SFX are 50% of the sound volume
            }
            source.load();
            source.addEventListener('error', (e) => {
                console.error(`Error loading audio source: ${source.src}`, e);
            });
        }
    });
    
    if (this.musicEnabled) {
         this.playMusic();
    }
  }

  private playSound(sound: HTMLAudioElement | null) {
    if (!this.soundEnabled || !sound || !this.hasInteracted) {
        return;
    }
    sound.currentTime = 0;
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Ignore user not interacted error as we handle it with hasInteracted
        if (error.name !== 'NotAllowedError') {
             console.error(`Error playing sound ${sound.src}:`, error);
        }
      });
    }
  }

  private playMusic() {
      if (this.musicEnabled && this.sources.music && this.hasInteracted) {
          const playPromise = this.sources.music.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                   if (error.name !== 'NotAllowedError') {
                        console.error("Error playing music:", error);
                   }
              });
          }
      }
  }

  private pauseMusic() {
      if (this.sources.music) {
          this.sources.music.pause();
      }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
        this.playMusic();
    } else {
        this.pauseMusic();
    }
  }

  public setSoundVolume(volume: number) {
      this.soundVolume = volume;
      Object.entries(this.sources).forEach(([key, source]) => {
          if (source && key !== 'music') {
              source.volume = this.soundVolume * 0.5; // Keep SFX at 50% of the slider value
          }
      });
  }

  public setMusicVolume(volume: number) {
      this.musicVolume = volume;
      if (this.sources.music) {
          this.sources.music.volume = this.musicVolume;
      }
  }
  
  public changeMusic(trackSrc: string) {
      if (this.sources.music && this.hasInteracted) {
          this.pauseMusic();
          this.sources.music.src = trackSrc;
          this.sources.music.load();
          this.playMusic();
      }
  }

  public playMoveSound = () => this.playSound(this.sources.move);
  public playCaptureSound = () => this.playSound(this.sources.capture);
  public playWinSound = () => this.playSound(this.sources.win);
  public playLoseSound = () => this.playSound(this.sources.lose);
  public playClickSound = () => this.playSound(this.sources.click);
  public playSelectSound = () => this.playSound(this.sources.select);
  public playFirstMovePlayerSound = () => this.playSound(this.sources.firstMovePlayer);
  public playFirstMoveAISound = () => this.playSound(this.sources.firstMoveAI);
}

export const audioService = new AudioService();