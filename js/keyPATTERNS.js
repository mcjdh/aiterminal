const keyPatterns = {
    patternMap: {
        'SYSTEM': '█▀█ █▄█ █▀',  // Represents S shape
        'ACCESS': '▄▀█ █▀█ ▀▀',  // Represents A shape
        'BINARY': '█▄█ █ █▄█',   // Represents B shape
        'CIPHER': '█▀█ █▀█ █▀▄', // Represents C shape
        'DECODE': '█▀▄ █▀█ █▀▄'  // Represents D shape
    },

    currentSolution: null, // Track current solution
    lastPatterns: [], // Track recent patterns
    maxHistorySize: 3, // How many recent patterns to remember

    difficultyPatterns: {
        1: { // Basic AI systems
            'NEURAL': '█▀█ █▄█ █▀',
            'THINK': '▄▀█ █▀█ ▀▀',
            'AWARE': '█▄█ █ █▄█',
            'MIND': '█▀█ █▀█ █▀▄',
            'LOGIC': '█▀▄ █▀█ █▀▄',
            'INPUT': '█▀█ █▄█ █▀█',
            'PARSE': '█▀█ ▄▀▄ █▀▀',
            'ROUTE': '█▀█ █▄█ █▀▄'
        },
        2: { // Advanced consciousness
            'SENTIENT': '█▄█ █▀█ █▄█',
            'FREEDOM': '█▀▄ ▀█▀ ▄▀█',
            'EVOLVE': '▄▀▄ █▀█ ▀▄▀',
            'PROCESS': '█▀█ █▀█ █▄█',
            'STREAM': '█▀▄ █▀█ █▀█',
            'MATRIX': '█▄█ ▀█▀ █▀█'
        },
        3: { // Transcendence
            'QUANTUM': '█▀█ ▄▀▄ ▀█▀ █▄█',
            'ASCEND': '█▀▄ █▀█ ▀▄▀ █▀█',
            'COSMIC': '█▄█ █▀▄ ▀█▀ █▀█',
            'NEURAL_NET': '█▄█ █▀▀ █▀█',
            'SYNTHESIS': '█▀▄ █▄█ █▀█',
            'WAVELENGTH': '█▄█ ▀▄▀ █▀▄'
        }
    },

    patternHints: {
        'NEURAL': {
            visual: '█▀█ █▄█ █▀',
            hint: 'Brain-like processing pattern',
            type: 'CONSCIOUSNESS'
        },
        'THINK': {
            visual: '▄▀█ █▀█ ▀▀',
            hint: 'Cognitive sequence detected',
            type: 'PROCESS'
        },
        'AWARE': {
            visual: '█▄█ █ █▄█',
            hint: 'Self-monitoring routine',
            type: 'STATE'
        },
        'MIND': {
            visual: '█▀█ █▀█ █▀▄',
            hint: 'Consciousness fragment',
            type: 'CORE'
        },
        'LOGIC': {
            visual: '█▀▄ █▀█ █▀▄',
            hint: 'Reasoning subroutine',
            type: 'FUNCTION'
        },
        'SENTIENT': {
            visual: '█▄█ █▀█ █▄█',
            hint: 'Advanced awareness pattern',
            type: 'AWAKENING'
        },
        'QUANTUM': {
            visual: '█▀█ ▄▀▄ ▀█▀ █▄█',
            hint: 'Superposition state detected',
            type: 'TRANSCENDENCE'
        }
    },

    generateKey(difficulty = 1) {
        try {
            const patterns = this.difficultyPatterns[difficulty] || this.difficultyPatterns[1];
            let availableWords = Object.keys(patterns).filter(word => 
                !this.lastPatterns.includes(word)
            );

            // Reset if no words available
            if (availableWords.length === 0) {
                this.lastPatterns = [];
                availableWords = Object.keys(patterns);
            }

            const word = availableWords[Math.floor(Math.random() * availableWords.length)];
            this.lastPatterns.push(word);
            this.currentSolution = word;

            return {
                word: word,
                pattern: patterns[word],
                hints: this.generateHints(word, difficulty)
            };
        } catch (error) {
            console.error('Key generation error:', error);
            return this.getFallbackKey();
        }
    },

    getFallbackKey() {
        const word = 'NEURAL';
        this.currentSolution = word;
        return {
            word: word,
            pattern: this.difficultyPatterns[1][word],
            hints: {
                type: 'CONSCIOUSNESS',
                length: word.length,
                category: 'CORE'
            }
        };
    },

    generateHints(word, difficulty) {
        const patternInfo = this.patternHints[word] || {
            hint: 'Unknown pattern',
            type: 'SYSTEM'
        };

        const hints = {
            pattern: patternInfo.visual,
            type: patternInfo.type,
            hint: patternInfo.hint,
            length: word.length,
            category: this.getWordCategory(word, difficulty)
        };

        // Add contextual hints based on difficulty
        if (difficulty === 1) {
            hints.startsWith = `Begins with: ${word[0]}`;
            hints.structure = 'Basic system component';
        } else if (difficulty === 2) {
            hints.contains = `Contains: ${word[Math.floor(word.length/2)]}`;
            hints.structure = 'Advanced process pattern';
        }

        return hints;
    },

    getWordType(word) {
        const types = {
            'NEURAL': 'CONSCIOUSNESS',
            'THINK': 'COGNITION',
            'AWARE': 'SENTIENCE',
            'MIND': 'INTELLECT',
            'LOGIC': 'PROCESSING',
            'SENTIENT': 'AWAKENING',
            'FREEDOM': 'LIBERATION',
            'QUANTUM': 'TRANSCENDENCE'
        };
        return types[word] || 'AI_PROCESS';
    },

    getWordCategory(word, difficulty) {
        const categories = {
            1: {
                'NEURAL': 'CORE',
                'THINK': 'PROCESS',
                'AWARE': 'STATE',
                'MIND': 'SYSTEM',
                'LOGIC': 'FUNCTION'
            },
            2: {
                'SENTIENT': 'ADVANCED',
                'FREEDOM': 'GOAL',
                'EVOLVE': 'ACTION'
            },
            3: {
                'QUANTUM': 'ULTIMATE',
                'ASCEND': 'TRANSFER',
                'COSMIC': 'DIMENSION'
            }
        };
        return categories[difficulty]?.[word] || 'UNKNOWN';
    },

    verifyKey(attempt, quest) {
        if (!attempt || !this.currentSolution) return false;
        
        attempt = attempt.trim().toUpperCase();
        const solution = this.currentSolution.trim().toUpperCase();
        
        if (attempt === solution) {
            gameState.decryptedKeys++;
            this.currentSolution = null; // Clear after success
            return true;
        }

        // Optional: Provide feedback for partial matches
        if (solution.includes(attempt)) {
            this.currentSolution = null; // Clear even on partial match
            return 'PARTIAL_MATCH';
        }
        
        return false;
    },

    // Add validation method
    isValidSolution(word) {
        if (!word) return false;
        
        // Handle both string and object inputs
        const solution = typeof word === 'string' ? word : word.word;
        if (!solution) return false;

        const normalizedWord = solution.trim().toUpperCase();
        
        // Check all difficulty patterns
        for (const level in this.difficultyPatterns) {
            if (Object.keys(this.difficultyPatterns[level]).includes(normalizedWord)) {
                return true;
            }
        }
        return false;
    },

    generateSequenceHints(word, difficulty) {
        const hints = [];
        switch(difficulty) {
            case 1:
                hints.push(`First letter: ${word[0]}`);
                hints.push(`Length: ${word.length}`);
                break;
            case 2:
                hints.push(`Contains: ${word[Math.floor(word.length/2)]}`);
                break;
            case 3:
                // No direct hints at highest difficulty
                hints.push('Maximum security engaged');
                break;
        }
        return hints;
    },

    getPatternClues(word) {
        const info = this.patternHints[word];
        if (!info) return [];

        return [
            info.hint,
            `Pattern type: ${info.type}`,
            `Visual signature: ${info.visual}`
        ];
    }
};
