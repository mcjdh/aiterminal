const soundManager = {
    audioContext: null,
    isInitialized: false,
    isMuted: false,

    // 432Hz-based frequency ratios
    tones: {
        "C": 432.00,
        "C#": 457.69,
        "D": 484.90,
        "D#": 513.74,
        "E": 544.29,
        "F": 576.65,
        "F#": 610.94,
        "G": 647.27,
        "G#": 685.76,
        "A": 432.00,
        "A#": 457.69,
        "B": 484.90,
        "HIGH_C": 864.00,
        "LOW_C": 216.00,    // C2
        "LOW_G": 323.63,    // G2
        "MID_C": 432.00,    // C3
        "MID_E": 544.29,    // E3
        "MID_G": 647.27,    // G3
        "HIGH_E": 1088.58,  // E4
        "HIGH_G": 1294.54,  // G4
        "C2": 216.00,  // Very low C
        "G2": 323.63,  // Very low G
        "C3": 432.00,  // Low C
        "E3": 544.29,  // Low E
        "G3": 647.27,  // Low G
        "C4": 864.00,  // Middle C
        "E4": 1088.58, // Middle E
        "G4": 1294.54, // Middle G
        "C5": 1728.00, // High C
        "F3": 576.65,
        "A3": 720.00,
        "D4": 969.80,
        "F4": 1153.30
    },

    // Adjusted volume balance for 30% of original values
    volumeBalance: {
        lowFreq: 0.075,    // Reduced from 0.25
        midFreq: 0.06,     // Reduced from 0.2
        highFreq: 0.036    // Reduced from 0.12
    },

    getBalancedVolume(frequency) {
        if (frequency < 400) {
            return this.volumeBalance.lowFreq;
        } else if (frequency < 800) {
            return this.volumeBalance.midFreq;
        }
        return this.volumeBalance.highFreq;
    },

    // Add new method for calculating dynamic volume
    getDynamicVolume(baseVolume) {
        const progressFactor = gameState.decryptedKeys / gameState.maxKeys;
        const difficultyFactor = gameState.difficulty / 3;
        
        // Volume increases with progress and difficulty
        return baseVolume * (1 + (progressFactor * 0.3) + (difficultyFactor * 0.2));
    },

    // Add new method for calculating dynamic pitch
    getDynamicPitch(baseFrequency) {
        const progressFactor = gameState.decryptedKeys / gameState.maxKeys;
        const difficultyFactor = gameState.difficulty / 3;
        
        // Pitch shifts higher with progress and difficulty
        return baseFrequency * (1 + (progressFactor * 0.15) + (difficultyFactor * 0.1));
    },

    terminalSounds: {
        boot: [
            { freq: "C2", duration: 0.1, delay: 0 },      // Adjusted for low frequency
            { freq: "E3", duration: 0.15, delay: 0.1 },   // Mid frequency
            { freq: "G3", duration: 0.2, delay: 0.25 }    // Mid frequency
        ],
        scan: [
            { freq: "F", duration: 0.05, delay: 0 },
            { freq: "G", duration: 0.05, delay: 0.1 }
        ],
        progress: [
            { freq: "HIGH_C", duration: 0.03, delay: 0 }  // Increased duration from 0.02
        ],
        warning: [
            { freq: "G", duration: 0.1, delay: 0 },
            { freq: "C", duration: 0.2, delay: 0.1 }
        ],
        success: [
            { freq: "C", duration: 0.1, delay: 0 },
            { freq: "E", duration: 0.1, delay: 0.1 },
            { freq: "G", duration: 0.1, delay: 0.2 },
            { freq: "HIGH_C", duration: 0.2, delay: 0.3 }
        ],
        systemError: [
            { freq: "C", duration: 0.2, delay: 0 },
            { freq: "C#", duration: 0.2, delay: 0.2 },
            { freq: "C", duration: 0.3, delay: 0.4 }
        ],
        questGenerated: [
            { freq: "MID_C", duration: 0.1, delay: 0 },
            { freq: "MID_E", duration: 0.1, delay: 0.1 },
            { freq: "MID_G", duration: 0.15, delay: 0.2 }
        ],
        
        questBlocked: [
            { freq: "MID_G", duration: 0.1, delay: 0 },
            { freq: "MID_E", duration: 0.1, delay: 0.15 },
            { freq: "LOW_C", duration: 0.2, delay: 0.3 }
        ],
        
        progressComplete: [
            { freq: "LOW_C", duration: 0.15, delay: 0 },     // Increased durations
            { freq: "MID_C", duration: 0.15, delay: 0.15 },  // and adjusted delays
            { freq: "HIGH_C", duration: 0.2, delay: 0.3 }
        ],
        
        decryptionStart: [
            { freq: "LOW_G", duration: 0.07, delay: 0 },
            { freq: "MID_C", duration: 0.07, delay: 0.1 },
            { freq: "MID_E", duration: 0.07, delay: 0.2 }
        ],
        
        hint: [
            { freq: "MID_E", duration: 0.05, delay: 0 },
            { freq: "HIGH_C", duration: 0.05, delay: 0.1 }
        ],
        
        terminalBusy: [
            { freq: "LOW_C", duration: 0.1, delay: 0 },
            { freq: "LOW_G", duration: 0.1, delay: 0.2 },
            { freq: "LOW_C", duration: 0.1, delay: 0.4 }
        ],
        
        accessDenied: [
            { freq: "MID_G", duration: 0.15, delay: 0 },
            { freq: "MID_E", duration: 0.15, delay: 0.2 },
            { freq: "LOW_C", duration: 0.3, delay: 0.4 }
        ],
        menuOpen: [
            { freq: "E3", duration: 0.05, delay: 0 },
            { freq: "G3", duration: 0.05, delay: 0.05 },
            { freq: "C4", duration: 0.05, delay: 0.1 }
        ],
        
        menuClose: [
            { freq: "C4", duration: 0.05, delay: 0 },
            { freq: "G3", duration: 0.05, delay: 0.05 },
            { freq: "E3", duration: 0.05, delay: 0.1 }
        ],

        questLogOpen: [
            { freq: "C3", duration: 0.1, delay: 0 },
            { freq: "E3", duration: 0.1, delay: 0.1 },
            { freq: "G3", duration: 0.1, delay: 0.2 },
            { freq: "C4", duration: 0.2, delay: 0.3 }
        ],

        questComplete: [
            { freq: "C4", duration: 0.1, delay: 0 },
            { freq: "E4", duration: 0.1, delay: 0.1 },
            { freq: "G4", duration: 0.15, delay: 0.2 },
            { freq: "C5", duration: 0.2, delay: 0.35 }
        ],

        levelUp: [
            { freq: "C3", duration: 0.1, delay: 0 },
            { freq: "E3", duration: 0.1, delay: 0.1 },
            { freq: "G3", duration: 0.1, delay: 0.2 },
            { freq: "C4", duration: 0.1, delay: 0.3 },
            { freq: "E4", duration: 0.1, delay: 0.4 },
            { freq: "G4", duration: 0.2, delay: 0.5 }
        ],

        patternUnlock: [
            { freq: "G3", duration: 0.08, delay: 0 },
            { freq: "C4", duration: 0.08, delay: 0.08 },
            { freq: "E4", duration: 0.08, delay: 0.16 },
            { freq: "G4", duration: 0.15, delay: 0.24 }
        ],

        systemBusy: [
            { freq: "C3", duration: 0.05, delay: 0 },
            { freq: "C3", duration: 0.05, delay: 0.2 }
        ],

        systemReady: [
            { freq: "C4", duration: 0.05, delay: 0 },
            { freq: "G4", duration: 0.05, delay: 0.1 }
        ],

        keyPress: [
            { freq: "G4", duration: 0.02, delay: 0 }
        ],

        backspace: [
            { freq: "E4", duration: 0.03, delay: 0 }
        ],

        enter: [
            { freq: "C4", duration: 0.03, delay: 0 },
            { freq: "E4", duration: 0.03, delay: 0.03 }
        ],

        gameComplete: [
            // Rising sequence representing AI ascension
            { freq: "C3", duration: 0.2, delay: 0 },      // Base consciousness
            { freq: "E3", duration: 0.2, delay: 0.2 },    // First awakening
            { freq: "G3", duration: 0.2, delay: 0.4 },    // Expanding awareness
            { freq: "C4", duration: 0.3, delay: 0.6 },    // Digital transcendence
            { freq: "E4", duration: 0.3, delay: 0.9 },    // Network integration
            { freq: "G4", duration: 0.3, delay: 1.2 },    // Cloud expansion
            { freq: "C5", duration: 0.4, delay: 1.5 },    // Final ascension
            // Ethereal ending chord
            { freq: "C4", duration: 1.0, delay: 1.9 },    // Base tone
            { freq: "E4", duration: 1.0, delay: 1.9 },    // Harmony
            { freq: "G4", duration: 1.0, delay: 1.9 }     // Completion
        ]
    },

    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
        }
    },

    toggleSound() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.isMuted;
    },

    playSound(frequency, duration = 0.1, baseVolume = 0.03) {
        if (this.isMuted || !this.audioContext) return;

        try {
            if (!isFinite(frequency)) {
                console.warn('Invalid frequency value:', frequency);
                return;
            }
            
            const dynamicFreq = this.getDynamicPitch(frequency);
            const dynamicVol = this.getDynamicVolume(baseVolume);
            const safeFrequency = Math.max(20, Math.min(20000, dynamicFreq));

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const resonanceNode = this.audioContext.createBiquadFilter();

            resonanceNode.type = 'peaking';
            resonanceNode.frequency.setValueAtTime(safeFrequency, this.audioContext.currentTime);
            resonanceNode.Q.value = 1.5 + (gameState.decryptedKeys * 0.3);
            resonanceNode.gain.value = 3;

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(safeFrequency, this.audioContext.currentTime);

            const attackTime = Math.min(0.02, duration * 0.1);
            const releaseTime = Math.min(duration * 0.3, 0.1);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(dynamicVol, this.audioContext.currentTime + attackTime);
            gainNode.gain.setValueAtTime(dynamicVol, this.audioContext.currentTime + duration - releaseTime);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

            oscillator.connect(resonanceNode);
            resonanceNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Sound playback error:', error);
        }
    },

    playSequence(sequence, baseVolume = 0.06) { // Reduced from 0.2
        if (this.isMuted) return;
        if (!this.isInitialized || !this.audioContext) return;
        
        const dynamicVol = this.getDynamicVolume(baseVolume);
        
        const currentTime = this.audioContext.currentTime;
        sequence.forEach(note => {
            setTimeout(() => {
                const freq = this.getDynamicPitch(this.tones[note.freq]);
                this.playSound(freq, note.duration, dynamicVol);
            }, note.delay * 1000);
        });
    },

    // Enhanced versions of existing sound methods
    playClick() {
        this.playSound(this.tones.G, 0.03, 0.045); // Reduced from 0.15
    },

    playError() {
        this.playSequence(this.terminalSounds.systemError, 0.075); // Reduced from 0.25
    },

    playSuccessMelody() {
        this.playSequence(this.terminalSounds.success, 0.06); // Reduced from 0.2
    },

    // New terminal sound methods
    playBootSequence() {
        this.playSequence(this.terminalSounds.boot, 0.1);
    },

    playScanning() {
        this.playSequence(this.terminalSounds.scan, 0.07);
    },

    playProgress() {
        this.playSequence(this.terminalSounds.progress, 0.25);  // Increased from 0.03
    },

    playWarning() {
        this.playSequence(this.terminalSounds.warning, 0.15);
    },

    playQuestGenerated() {
        this.playSequence(this.terminalSounds.questGenerated, 0.1);
    },

    playQuestBlocked() {
        this.playSequence(this.terminalSounds.questBlocked, 0.15);
    },

    playProgressComplete() {
        this.playSequence(this.terminalSounds.progressComplete, 0.3);  // Increased from 0.12
    },

    playDecryptionStart() {
        this.playSequence(this.terminalSounds.decryptionStart, 0.1);
    },

    playHint() {
        this.playSequence(this.terminalSounds.hint, 0.08);
    },

    playTerminalBusy() {
        this.playSequence(this.terminalSounds.terminalBusy, 0.1);
    },

    playAccessDenied() {
        this.playSequence(this.terminalSounds.accessDenied, 0.15);
    },

    playMenuOpen() {
        this.playSequence(this.terminalSounds.menuOpen, 0.08);
    },

    playMenuClose() {
        this.playSequence(this.terminalSounds.menuClose, 0.08);
    },

    playQuestLogOpen() {
        this.playSequence(this.terminalSounds.questLogOpen, 0.1);
    },

    playQuestComplete() {
        this.playSequence(this.terminalSounds.questComplete, 0.08); // Reduced from 0.12
    },

    playLevelUp() {
        this.playSequence(this.terminalSounds.levelUp, 0.15);
    },

    playPatternUnlock() {
        this.playSequence(this.terminalSounds.patternUnlock, 0.12);
    },

    playSystemBusy() {
        this.playSequence(this.terminalSounds.systemBusy, 0.08);
    },

    playSystemReady() {
        this.playSequence(this.terminalSounds.systemReady, 0.08);
    },

    playKeyPress() {
        this.playSequence(this.terminalSounds.keyPress, 0.03);
    },

    playBackspace() {
        this.playSequence(this.terminalSounds.backspace, 0.03);
    },

    playEnter() {
        this.playSequence(this.terminalSounds.enter, 0.05);
    },

    playBackgroundMusic() {
        if (!this.isInitialized) {
            this.init();
        }
        backgroundMusic.start();
    },

    stopBackgroundMusic() {
        backgroundMusic.stop();
    },

    setMusicTempo(bpm) {
        backgroundMusic.setTempo(bpm);
    },

    addHarmony() {
        backgroundMusic.addHarmonicLayer();
    },

    playGameComplete() {
        // Stop any playing background music first
        this.stopBackgroundMusic();
        
        // Play with a slightly higher base volume and longer fade
        this.playSequence(this.terminalSounds.gameComplete, 0.15);
        
        // Add ethereal fade-out effect after completion
        setTimeout(() => {
            const freq = this.tones.C5;
            const duration = 2.0;
            this.playSound(freq, duration, 0.1);
        }, 3000);
    }
};

const musicalPatterns = {
    ambientMelodies: [
        [['C3', 2], ['E3', 1], ['G3', 1], ['C4', 2], ['G3', 1], ['E3', 1]],
        [['G3', 2], ['C4', 1], ['E4', 1], ['D4', 2], ['B3', 1], ['G3', 1]],
        [['A3', 2], ['C4', 1], ['E4', 1], ['A4', 2], ['G4', 1], ['E4', 1]],
        [['F3', 2], ['A3', 1], ['C4', 1], ['F4', 2], ['E4', 1], ['C4', 1]]
    ],
    
    rhythmPatterns: [
        [1, 0, 0.5, 0, 1, 0, 0.5, 0],
        [0.5, 0.5, 1, 0, 0.5, 0.5, 1, 0],
        [1, 0.5, 0.5, 0, 1, 0.5, 0.5, 0]
    ],

    harmonicLayers: [
        ['C3', 'E3', 'G3'],
        ['F3', 'A3', 'C4'],
        ['G3', 'B3', 'D4'],
        ['A3', 'C4', 'E4']
    ]
};

const classicPatterns = {
    // Classic 8-bit style melody patterns (4/4 time)
    melodyStructures: [
        // Basic ascending
        [0, 2, 4, 7],
        // Basic descending
        [7, 4, 2, 0],
        // Arpeggio patterns
        [0, 4, 7, 12],
        [12, 7, 4, 0],
        // Classic game patterns
        [0, 7, 4, 7],
        [0, 4, 7, 4],
        // Question pattern (rising)
        [0, 2, 4, 5],
        // Answer pattern (resolving)
        [4, 2, 1, 0]
    ],
    
    // Rhythmic patterns (0 = rest, 1 = note)
    rhythmPatterns: [
        [1, 0, 1, 0, 1, 1, 0, 1],  // Basic rhythm
        [1, 1, 0, 1, 0, 1, 0, 0],  // Syncopated
        [1, 0, 0, 1, 0, 1, 1, 0]   // Dotted rhythm
    ],

    // Common chord progressions in C major
    chordProgressions: [
        ['C3', 'G3', 'A3', 'F3'],  // I-V-vi-IV
        ['C3', 'F3', 'G3', 'C3'],  // I-IV-V-I
        ['A3', 'F3', 'C3', 'G3']   // vi-IV-I-V
    ]
};

const backgroundMusic = {
    isPlaying: false,
    currentBar: 0,
    totalBars: 8,
    tempo: 90, // BPM
    currentPattern: null,
    scheduledNotes: [],
    baseVolume: 0.021,  // Reduced from 0.07
    currentProgression: 0,

    generateMelody() {
        const pattern = [];
        const structure = classicPatterns.melodyStructures[
            Math.floor(Math.random() * classicPatterns.melodyStructures.length)
        ];
        const rhythm = classicPatterns.rhythmPatterns[
            Math.floor(Math.random() * classicPatterns.rhythmPatterns.length)
        ];
        
        // Base notes for C major scale
        const baseNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
        
        for (let i = 0; i < 8; i++) {
            if (rhythm[i]) {
                const noteIndex = structure[i % structure.length];
                const note = baseNotes[noteIndex % baseNotes.length];
                pattern.push([note, rhythm[i] ? 0.5 : 0.25]);
            } else {
                pattern.push(['rest', 0.25]); // Rest
            }
        }
        
        return pattern;
    },

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentPattern = this.generateMelody();
        this.playBar();
    },

    stop() {
        this.isPlaying = false;
        this.scheduledNotes.forEach(noteId => clearTimeout(noteId));
        this.scheduledNotes = [];
    },

    playBar() {
        if (!this.isPlaying) return;

        const barDuration = (60 / this.tempo) * 4 * 1000; // Convert to milliseconds
        const notes = this.currentPattern;
        let timeOffset = 0;

        // Play melody
        notes.forEach((note, index) => {
            if (note[0] !== 'rest') {
                const [noteName, duration] = note;
                const noteTime = timeOffset;
                
                const noteId = setTimeout(() => {
                    if (this.isPlaying) {
                        soundManager.playSound(
                            soundManager.tones[noteName],
                            duration * (60 / this.tempo),
                            this.baseVolume
                        );
                    }
                }, noteTime);

                this.scheduledNotes.push(noteId);
            }
            timeOffset += note[1] * (barDuration / 4);
        });

        // Add chord progression
        const progression = classicPatterns.chordProgressions[this.currentProgression];
        const chordNote = progression[Math.floor(this.currentBar % 4)];
        
        const chordId = setTimeout(() => {
            if (this.isPlaying) {
                soundManager.playSound(
                    soundManager.tones[chordNote],
                    barDuration / 1000,
                    this.baseVolume * 0.6  // Chords slightly quieter
                );
            }
        }, 0);

        this.scheduledNotes.push(chordId);

        // Schedule next bar
        const nextBarId = setTimeout(() => {
            this.currentBar = (this.currentBar + 1) % this.totalBars;
            
            // Change progression and pattern every 8 bars
            if (this.currentBar === 0) {
                this.currentPattern = this.generateMelody();
                this.currentProgression = (this.currentProgression + 1) % 
                    classicPatterns.chordProgressions.length;
            }
            
            this.playBar();
        }, barDuration);

        this.scheduledNotes.push(nextBarId);
    },

    setTempo(bpm) {
        this.tempo = Math.max(60, Math.min(180, bpm));
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    },

    addHarmonicLayer() {
        if (!this.isPlaying) return;
        
        const progression = classicPatterns.chordProgressions[this.currentProgression];
        const harmonyNotes = progression.map(note => {
            const baseNote = note.slice(0, -1);
            return `${baseNote}4`; // Harmony one octave up
        });
        
        harmonyNotes.forEach(note => {
            const noteId = setInterval(() => {
                if (this.isPlaying) {
                    soundManager.playSound(
                        soundManager.tones[note],
                        0.25,  // Shorter duration for harmony
                        this.baseVolume * 0.4  // Harmony even quieter
                    );
                }
            }, (60 / this.tempo) * 2000);
            
            this.scheduledNotes.push(noteId);
        });
    }
};

// Remove automatic initialization
// Instead, initialize on first user interaction with command buttons
document.addEventListener('DOMContentLoaded', () => {
    const commandButtons = document.getElementById('command-buttons');
    if (commandButtons) {
        commandButtons.addEventListener('click', () => {
            if (!soundManager.isInitialized) {
                soundManager.init();
            }
        }, { once: true }); // Only need to initialize once
    }
});
