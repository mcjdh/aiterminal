const questPatterns = {
    types: ['ASCII_DECODE', 'SEQUENCE_MATCH', 'PATTERN_SOLVE'],
    lastQuestTypes: [], // Track recent quest types
    maxQuestHistory: 3,
    
    generateQuest(difficulty = 1) {
        try {
            if (gameState.currentQuest) {
                return { error: 'Quest already in progress' };
            }

            const key = keyPatterns.generateKey(difficulty);
            if (!key || !key.word) {
                throw new Error('Failed to generate key');
            }

            const quest = {
                id: Date.now(),
                type: this.getQuestType(key.word),
                pattern: key.pattern,
                solution: {  // Properly structure solution object
                    word: key.word,
                    pattern: key.pattern,
                    type: key.hints.type
                },
                hints: key.hints,
                clues: [],  // Initialize empty, fill after creation
                attempts: 0,
                maxAttempts: 3,
                difficulty: Math.max(1, Math.min(3, Math.floor(difficulty))),
                timeLimit: this.calculateTimeLimit(difficulty),
                currentSequence: ''
            };

            // Generate clues after quest object is fully formed
            quest.clues = this.generateClues(quest);
            gameState.currentQuest = quest;
            return quest;

        } catch (error) {
            console.error('Quest generation error:', error);
            return this.createFallbackQuest();
        }
    },

    createFallbackQuest() {
        const fallback = {
            word: 'NEURAL',
            pattern: '█▀█ █▄█ █▀',
            type: 'BASIC_SCAN',
            hints: { 
                type: 'CONSCIOUSNESS',
                length: 6,
                category: 'CORE'
            }
        };

        return {
            id: Date.now(),
            type: 'BASIC_SCAN',
            pattern: fallback.pattern,
            solution: {  // Match the solution structure
                word: fallback.word,
                pattern: fallback.pattern,
                type: fallback.hints.type
            },
            hints: fallback.hints,
            clues: [
                'EMERGENCY BACKUP ACTIVATED',
                'SYSTEM TYPE: CONSCIOUSNESS',
                'LENGTH: 6 characters',
                'CATEGORY: CORE'
            ],
            attempts: 0,
            maxAttempts: 3,
            difficulty: 1,
            timeLimit: 30,
            currentSequence: ''
        };
    },

    getQuestType(word) {
        const info = keyPatterns.patternHints[word];
        if (!info) return 'SYSTEM_SCAN';

        return `${info.type}_${
            info.type === 'CONSCIOUSNESS' ? 'EXPANSION' :
            info.type === 'PROCESS' ? 'EXECUTION' :
            info.type === 'STATE' ? 'TRANSITION' :
            'INTEGRATION'
        }`;
    },

    calculateTimeLimit(difficulty) {
        return 30 - (difficulty * 5) + (gameState.abilities.decryptSpeed * 2);
    },

    generateClues(quest) {
        if (!quest || !quest.solution || !quest.solution.word) {
            return ['ERROR: Invalid quest data'];
        }

        const hints = [];
        
        // Add basic information
        hints.push(`QUEST: SYSTEM TYPE: ${quest.hints?.type || 'UNKNOWN'}`);
        hints.push(`QUEST: LENGTH: ${quest.solution.word.length} characters`);
        
        // Add difficulty-based hints
        if (quest.difficulty === 1) {
            hints.push(`QUEST: STARTS WITH: ${quest.solution.word[0]}`);
        } else if (quest.difficulty === 2) {
            const midChar = quest.solution.word[Math.floor(quest.solution.word.length/2)];
            hints.push(`QUEST: CONTAINS: ${midChar}`);
        }

        // Add pattern hint
        hints.push(`QUEST: PATTERN: ${quest.pattern}`);

        // Add AI system category
        const category = keyPatterns.getWordCategory(quest.solution.word, quest.difficulty);
        hints.push(`QUEST: CATEGORY: ${category}`);

        // Add pattern-specific hint if available
        const patternInfo = keyPatterns.patternHints[quest.solution.word];
        if (patternInfo) {
            hints.push(`QUEST: HINT: ${patternInfo.hint}`);
        }

        return hints;
    },

    addQuestModifiers(quest, difficulty) {
        const modifiers = {
            timeLimit: this.calculateTimeLimit(difficulty),
            patternComplexity: this.calculateComplexity(difficulty),
            rewards: this.calculateRewards(difficulty),
            bonusObjectives: this.generateBonusObjectives(difficulty)
        };

        return { ...quest, ...modifiers };
    },

    calculateComplexity(difficulty) {
        return {
            patternLength: 3 + difficulty,
            noiseLevel: difficulty - 1,
            requiredPrecision: 0.8 + (difficulty * 0.1)
        };
    },

    calculateRewards(difficulty) {
        return {
            baseScore: 100 * difficulty,
            experiencePoints: 50 * Math.pow(2, difficulty - 1),
            bonusMultiplier: 1 + (difficulty * 0.2)
        };
    },

    generateBonusObjectives(difficulty) {
        const objectives = [
            { type: 'SPEED', target: 10 - difficulty * 2, reward: 50 },
            { type: 'ACCURACY', target: 0.8 + difficulty * 0.1, reward: 75 },
            { type: 'COMBO', target: difficulty * 2, reward: 100 }
        ];
        return objectives.slice(0, difficulty);
    },

    balanceQuestDifficulty(quest) {
        // Adjust difficulty based on player stats
        const playerLevel = gameState.progression.level;
        const successRate = gameState.stats.perfectDecryptions / Math.max(1, gameState.stats.totalAttempts);

        if (successRate > 0.8) {
            quest.timeLimit *= 0.9;
            quest.patternComplexity.noiseLevel++;
        } else if (successRate < 0.3) {
            quest.timeLimit *= 1.1;
            quest.patternComplexity.noiseLevel = Math.max(0, quest.patternComplexity.noiseLevel - 1);
        }

        return quest;
    }
};
