interface AudioSources {
  music: HTMLAudioElement | null;
  move: HTMLAudioElement | null;
  capture: HTMLAudioElement | null;
  win: HTMLAudioElement | null;
  lose: HTMLAudioElement | null;
  click: HTMLAudioElement | null;
}

class AudioService {
  private sources: AudioSources = {
    music: null,
    move: null,
    capture: null,
    win: null,
    lose: null,
    click: null,
  };

  private soundEnabled = true;
  private musicEnabled = true;
  private hasInteracted = false;

  constructor() {
    // Audio can only play after the first user interaction.
    document.body.addEventListener('click', () => {
        this.hasInteracted = true;
        this.initializeAudio();
    }, { once: true });
  }

  private initializeAudio() {
    if (typeof Audio !== 'undefined') {
        this.sources.music = new Audio('./assets/music.mp3');
        this.sources.music.loop = true;
        this.sources.music.volume = 0.5; // Lower volume for background music
        this.sources.move = new Audio('./assets/move.mp3');
        this.sources.capture = new Audio('./assets/capture.mp3');
        this.sources.win = new Audio('./assets/win.mp3');
        this.sources.lose = new Audio('./assets/lose.mp3');
        this.sources.click = new Audio('./assets/click.mp3');
        
        // If music was enabled before interaction, start it now.
        if (this.musicEnabled) {
             this.sources.music.play().catch(e => console.error("Audio policy prevented music playback:", e));
        }
    }
  }


  private playSound(sound: HTMLAudioElement | null) {
    if (this.soundEnabled && sound && this.hasInteracted) {
      sound.currentTime = 0;
      sound.play().catch(e => console.error("Error playing sound:", e));
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.sources.music && this.hasInteracted) {
        if (enabled) {
            this.sources.music.play().catch(e => console.error("Error playing music:", e));
        } else {
            this.sources.music.pause();
        }
    }
  }

  public playMoveSound = () => this.playSound(this.sources.move);
  public playCaptureSound = () => this.playSound(this.sources.capture);
  public playWinSound = () => this.playSound(this.sources.win);
  public playLoseSound = () => this.playSound(this.sources.lose);
  public playClickSound = () => this.playSound(this.sources.click);
}

export const audioService = new AudioService();
