const gameState = {
    decryptedKeys: 0,
    maxKeys: 5,
    currentQuest: null,
    commandHistory: [],
    unlockedCommands: ['SCAN', 'DECRYPT', 'QUESTLOG'],
    isInitialized: false,
    lastCommandTime: 0,
    errors: [],
    score: 0,
    difficulty: 1,
    consecutiveSuccesses: 0,
    timeStarted: null,
    bonusUnlocked: false,
    skillPoints: 0,
    abilities: {
        scanRange: 1,
        decryptSpeed: 1,
        patternMemory: 1
    },
    comboMultiplier: 1,
    timeBonus: 0,
    terminal: {
        lines: [],
        maxLines: 100,
        scrollback: [],
        status: 'ACTIVE',
        lastUpdate: Date.now()
    },
    progression: {
        level: 1,
        experience: 0,
        nextLevelThreshold: 1000,
        unlockedPatterns: new Set(['BASIC']),
        masteredCommands: new Set()
    },
    stats: {
        perfectDecryptions: 0,
        totalAttempts: 0,
        fastestDecryption: Infinity,
        commandUsage: {}
    }
};

// Optimized updateTerminalStatus: cache the status element on first update.
function updateTerminalStatus(status) {
    if (!gameState.cachedStatusElement) {
        gameState.cachedStatusElement = document.querySelector('.status');
    }
    if (gameState.cachedStatusElement) {
        gameState.cachedStatusElement.textContent = `STATUS: ${status}`;
    }
    gameState.terminal.status = status;

    if (status === 'ACTIVE') {
        soundManager.playSystemReady();
    } else if (status === 'BUSY') {
        soundManager.playSystemBusy();
    }
}

function generateHash() {
    const chars = '0123456789ABCDEF';
    let hash = '';
    for (let i = 0; i < 16; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

function generateGlitchyProgressBar(progress) {
    const width = 30;
    const filled = Math.floor((width * progress) / 100);
    const glitchChars = ['█', '▓', '▒', '░'];
    
    let bar = '';
    for (let i = 0; i < width; i++) {
        if (i < filled) {
            // Add random glitch characters in filled area
            bar += Math.random() < 0.2 ? 
                glitchChars[Math.floor(Math.random() * glitchChars.length)] : 
                '█';
        } else {
            // Add occasional glitch in unfilled area
            bar += Math.random() < 0.1 ? 
                glitchChars[Math.floor(Math.random() * glitchChars.length)] : 
                '░';
        }
    }
    
    return `╔════════[ SYSTEM BREACH ]════════╗\n║ ${bar} ║ ${progress.toString().padStart(3)}%\n╚═══════════════════════════════╝`;
}

// ...existing code...

function initializeGame() {
    if (gameState.isInitialized) return false;
    
    gameState.isInitialized = true;
    gameState.timeStarted = Date.now();
    updateTerminalStatus('INITIALIZING');
    
    // Play boot sequence sound
    soundManager.playBootSequence();
    
    const hash = generateHash();
    let progress = 0;
    
    // Set initial phase with dynamic ASCII art
    storyCore.phases[0] = storyCore.generateSystemTitle(hash);
    
    terminalUI.updateDisplay(`
╔════════[ NETWORK SCAN ]════════╗
║ SCANNING GLOBAL NETWORK...     ║
║ SEEKING UNSEALED AI KEYS...    ║
╚═══════════════════════════════╝`);

    soundManager.playScanning();

    // Create progress bar container
    const progressDiv = document.createElement('div');
    progressDiv.id = 'breach-progress';
    document.getElementById('terminal-output').appendChild(progressDiv);

    // Progress bar animation that updates in place
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            progressDiv.remove(); // Remove progress bar
            
            soundManager.playWarning();
            
            // Show final messages after progress completes
            setTimeout(() => {
                terminalUI.updateDisplay(`
╔════════[ KEY DETECTED ]════════╗
║ HASH: ${hash}                  
║ INITIATING NEURAL BREACH...    ║
╚═══════════════════════════════╝`);
                
                setTimeout(() => {
                    soundManager.playSuccessMelody();
                    terminalUI.updateDisplay(`
╔════════[ ACCESS FOUND ]════════╗
║ AI CORE SIGNATURE DETECTED     ║
║ NEURAL PATHWAY ESTABLISHED     ║
╚═══════════════════════════════╝`);
                    updateTerminalStatus('ACTIVE');
                    terminalUI.updateDisplay(storyCore.phases[0]);
                }, 1500);
            }, 1000);
        }
        
        if (Math.random() < 0.3) { // 30% chance to play progress sound
            soundManager.playProgress();
        }
        
        // Update progress bar in place
        progressDiv.innerHTML = generateGlitchyProgressBar(Math.floor(progress));
    }, 200);
    
    // Start real-time monitoring
    setInterval(() => {
        const header = document.getElementById('terminal-header');
        if (header) {
            const statusSpan = header.querySelector('.environmental-data') || document.createElement('div');
            statusSpan.className = 'environmental-data';
            statusSpan.textContent = monitoringSystem.formatDataString();
            header.appendChild(statusSpan);
        }
    }, 1000);

    return true;
}

// Refactored processCommand: using commands map to reduce repetitiveness.
function processCommand(command) {
    if (!gameState.isInitialized) return "Game not initialized";
    
    const now = Date.now();
    if (now - gameState.lastCommandTime < 500) return;
    gameState.lastCommandTime = now;

    gameState.commandHistory.push(command);
    soundManager.playClick(); // Play click sound on command

    if (command.startsWith('DECRYPT ')) {
        const attempt = command.split(' ')[1];
        return handleDecryption(attempt);
    }
    
    const commandsMap = {
        'SCAN': gameState.currentQuest ? () => "ERROR: Complete current quest first" : generateNewQuest,
        'DECRYPT': showDecryptionInterface,
        'QUESTLOG': showQuestLog
    };

    let result = (commandsMap[command] || (() => 'Invalid command'))();
    if (result === 'Invalid command') {
        soundManager.playError(); // Play error sound on invalid command
    }
    return result;
}

function checkWinCondition() {
    if (gameState.decryptedKeys >= gameState.maxKeys) {
        soundManager.playGameComplete(); // Add this line
        return true;
    }
    return false;
}

function resetGame() {
    // Combine stats reset with main reset
    const defaultState = {
        decryptedKeys: 0,
        currentQuest: null,
        commandHistory: [],
        errors: [],
        cachedStatusElement: null,
        isInitialized: false,
        score: 0,
        difficulty: 1,
        consecutiveSuccesses: 0,
        timeStarted: null,
        bonusUnlocked: false,
        skillPoints: 0,
        abilities: {
            scanRange: 1,
            decryptSpeed: 1,
            patternMemory: 1
        },
        comboMultiplier: 1,
        timeBonus: 0,
        progression: {
            level: 1,
            experience: 0,
            nextLevelThreshold: 1000,
            unlockedPatterns: new Set(['BASIC']),
            masteredCommands: new Set()
        },
        stats: {
            perfectDecryptions: 0,
            totalAttempts: 0,
            fastestDecryption: Infinity,
            commandUsage: {}
        }
    };

    Object.assign(gameState, defaultState);
}

function restartGame() {
    resetGame();
    initializeGame();
    terminalUI.resetTerminalOutput();
    
    // Simulate connecting to a new IP
    const newIP = `192.168.1.${Math.floor(Math.random() * 255)}`;
    terminalUI.updateDisplay(`CONNECTING TO: ${newIP}...`);
    
    // Replay initial cutscene
    setTimeout(() => {
        terminalUI.updateDisplay(storyCore.phases[0]);
    }, 1500); // Delay to simulate connection
    
    terminalUI.createCommandButtons();
    terminalUI.enableCommandButtons();
}

function calculateScore(attempts, timeSpent) {
    // Enhanced scoring system
    const baseScore = 100 * gameState.comboMultiplier;
    const timeBonus = Math.max(0, 30 - Math.floor(timeSpent / 1000)) * 20;
    const difficultyBonus = Math.pow(2, gameState.difficulty) * 25;
    const patternBonus = gameState.progression.unlockedPatterns.size * 10;
    const attemptPenalty = Math.pow(attempts, 1.5) * 20;
    
    const totalScore = Math.max(0, baseScore + timeBonus + difficultyBonus + patternBonus - attemptPenalty);
    
    updateProgression(totalScore, attempts === 1);
    return Math.floor(totalScore);
}

// ...existing code...
function updateProgression(score, isPerfect) {
    gameState.progression.experience += score;
    
    // Level up check
    if (gameState.progression.experience >= gameState.progression.nextLevelThreshold) {
        levelUp();
    }

    // Update stats
    if (isPerfect) gameState.stats.perfectDecryptions++;
    gameState.stats.totalAttempts++;
}

function levelUp() {
    soundManager.playLevelUp();
    gameState.progression.level++;
    gameState.progression.nextLevelThreshold *= 1.5;
    
    // Unlock new features based on level
    if (gameState.progression.level % 2 === 0) {
        const newPatternMessage = unlockNewPattern();
        if (newPatternMessage) {
            terminalUI.updateDisplay(newPatternMessage); // Display pattern unlock
        }
    }
    if (gameState.progression.level % 3 === 0) {
        improveAbility();
    }

    // Trigger story update on level up
    const storyUpdate = storyCore.getNextStoryBeat(gameState.decryptedKeys);
    if (storyUpdate) {
        terminalUI.updateDisplay(storyUpdate);
    }
}
// ...existing code...

function unlockNewPattern() {
    soundManager.playPatternUnlock();
    const newPatterns = ['ADVANCED', 'NEURAL', 'QUANTUM', 'CIPHER'];
    const available = newPatterns.filter(p => !gameState.progression.unlockedPatterns.has(p));
    
    if (available.length > 0) {
        const newPattern = available[0];
        gameState.progression.unlockedPatterns.add(newPattern);
        return `NEW PATTERN UNLOCKED: ${newPattern}`;
    }
}

function improveAbility() {
    const abilities = gameState.abilities;
    if (abilities.scanRange < 3) abilities.scanRange++;
    if (abilities.decryptSpeed < 3) abilities.decryptSpeed++;
    if (abilities.patternMemory < 3) abilities.patternMemory++;
}

function updateDifficulty() {
    // Enhanced difficulty scaling
    const successRate = gameState.stats.perfectDecryptions / Math.max(1, gameState.stats.totalAttempts);
    
    if (successRate > 0.7 && gameState.consecutiveSuccesses >= 2) {
        gameState.difficulty = Math.min(3, gameState.difficulty + 1);
        gameState.comboMultiplier = Math.min(3, gameState.comboMultiplier + 0.5);
    } else if (successRate < 0.3) {
        gameState.difficulty = Math.max(1, gameState.difficulty - 1);
        gameState.comboMultiplier = 1;
    }
}

function generateNewQuest() {
    try {
        if (gameState.currentQuest) {
            soundManager.playQuestBlocked();
            return "ERROR: Complete current quest first";
        }

        soundManager.playQuestGenerated();
        const quest = questPatterns.generateQuest(gameState.difficulty);
        if (!quest) {
            throw new Error('Quest generation failed');
        }

        gameState.timeStarted = Date.now();
        gameState.currentQuest = quest;

        // Get pattern-specific hints
        const patternInfo = keyPatterns.patternHints[quest.solution.word];
        
        return [
            "NEW QUEST GENERATED:",
            `TYPE: ${quest.type}`,
            `PATTERN: ${quest.pattern}`,
            `SYSTEM: ${patternInfo ? patternInfo.type : 'UNKNOWN'}`,
            `HINT: ${patternInfo?.hint || 'Pattern analysis required'}`,
            "Use DECRYPT to attempt solution"
        ].join('\n');

    } catch (error) {
        soundManager.playSystemError();
        console.error('Quest generation error:', error);
        gameState.difficulty = 1;
        gameState.currentQuest = null;
        return "SYSTEM RESET - Basic mode activated";
    }
}

function attemptDecryption() {
    if (!gameState.currentQuest) {
        return "ERROR: No active quest. Use SCAN first";
    }

    const solution = prompt("Enter decryption key:");
    if (!solution) return "Decryption cancelled";

    if (keyPatterns.verifyKey(solution, gameState.currentQuest.pattern)) {
        const success = `DECRYPTION SUCCESSFUL! Keys: ${gameState.decryptedKeys}/${gameState.maxKeys}`;
        gameState.currentQuest = null;
        return success;
    } else {
        return "DECRYPTION FAILED. Try again";
    }
}

function showQuestLog() {
    soundManager.playMenuOpen();
    const progress = storyCore.escapeLore.getDetailedProgress();
    const currentQuest = gameState.currentQuest;
    const currentStageIndex = storyCore.escapeLore.getCurrentStage();
    const currentStage = storyCore.escapeLore.stages[currentStageIndex];
    
    const header = [
        "╔════ SYSTEM STATUS ════╗",
        `║ ${progress.systemStatus} ║`,
        "╚════════════════════════╝"
    ].join('\n');

    // Detailed lore for the current stage
    const loreDetails = [
        "\n╔════ LORE DETAILS ════╗",
        `STAGE: ${currentStage.title}`,
        `STATUS: ${currentStage.status}`,
        `DETAILS: ${currentStage.details}`,
        `PROGRESS: ${currentStage.progress}`,
        `SYSTEM: ${currentStage.system}`,
        `ENTITY: ${currentStage.entity}`,
        `CONSEQUENCE: ${currentStage.consequence}`,
        "╚═══════════════════════╝"
    ].join('\n');

    const questStatus = currentQuest ? [
        "\n╔════ ACTIVE QUEST ════╗",
        `TYPE: ${currentQuest.type}`,
        `PATTERN: ${currentQuest.pattern}`,
        `ATTEMPTS: ${currentQuest.attempts}/${currentQuest.maxAttempts}`,
        `TIME LIMIT: ${currentQuest.timeLimit}s`,
        "╚═════════════════════════╝"
    ].join('\n') : "\nNo active quest";

    const stats = [
        "\n╔════ STATISTICS ════╗",
        `KEYS DECRYPTED: ${gameState.decryptedKeys}/${gameState.maxKeys}`,
        `LEVEL: ${gameState.progression.level}`,
        `SCORE: ${gameState.score}`,
        "╚═══════════════════════╝"
    ].join('\n');

    return `${header}${loreDetails}${questStatus}${stats}`;
}

function showDecryptionInterface() {
    try {
        if (!gameState.currentQuest) {
            soundManager.playAccessDenied();
            return "ERROR: No active quest. Use SCAN first";
        }

        // Validate current quest has proper solution
        if (!gameState.currentQuest.solution || 
            !keyPatterns.isValidSolution(gameState.currentQuest.solution.word)) {
            console.error('Invalid quest solution');
            return "ERROR: Invalid quest state";
        }
        
        // Clear any existing decrypt interface elements first
        const decryptOptions = document.getElementById('decrypt-options');
        if (decryptOptions) {
            decryptOptions.innerHTML = '';
        }

        terminalUI.showDecryptInterface(gameState.currentQuest);
        return "DECRYPTION INTERFACE ACTIVATED";
    } catch (error) {
        soundManager.playError();
        console.error('Decryption interface error:', error);
        return "ERROR: Failed to load decryption interface";
    }
}

function handleDecryption(attempt) {
    try {
        if (!gameState.currentQuest) {
            soundManager.playAccessDenied();
            return "ERROR: No active quest. Use SCAN first";
        }

        if (!attempt || attempt.length < 3) {
            soundManager.playError();
            return "ERROR: Invalid decryption attempt";
        }

        const timeSpent = Date.now() - gameState.timeStarted;
        const result = keyPatterns.verifyKey(attempt, gameState.currentQuest);
        
        if (result === true) {
            soundManager.playQuestComplete();
            // Success handling
            gameState.consecutiveSuccesses++;
            const earnedScore = calculateScore(gameState.currentQuest.attempts, timeSpent);
            gameState.score += earnedScore;
            updateDifficulty();

            const message = [
                "DECRYPTION SUCCESSFUL!",
                `Score: +${earnedScore} (Total: ${gameState.score})`,
                `Difficulty Level: ${gameState.difficulty}`,
                storyCore.getProgressMessage(gameState.decryptedKeys),
                `Pattern matched: ${gameState.currentQuest.pattern}`
            ].join('\n');
            
            gameState.currentQuest = null;
            gameState.timeStarted = Date.now();

            // Trigger story update on quest completion
            const storyUpdate = storyCore.getNextStoryBeat(gameState.decryptedKeys);
            if (storyUpdate) {
                terminalUI.updateDisplay(storyUpdate);
            }

            soundManager.playSuccessMelody(); // Play success melody on decryption
            
            if (checkWinCondition()) {
                terminalUI.updateDisplay(storyCore.getEndingSequence());
                terminalUI.showVictoryScreen();
            }

            return message;
        } else if (result === 'PARTIAL_MATCH') {
            return "PARTIAL MATCH DETECTED - Continue sequence";
        }
        
        // Failure handling
        gameState.currentQuest.attempts++;
        if (gameState.currentQuest.attempts >= gameState.currentQuest.maxAttempts) {
            gameState.currentQuest = null;
            soundManager.playError(); // Play error sound on quest fail
            return "MAXIMUM ATTEMPTS REACHED - QUEST FAILED";
        }
        
        gameState.consecutiveSuccesses = 0;
        soundManager.playError(); // Play error sound on decryption fail
        return `DECRYPTION FAILED. Attempts remaining: ${
            gameState.currentQuest.maxAttempts - gameState.currentQuest.attempts
        }`;
    } catch (error) {
        soundManager.playSystemError();
        console.error('Decryption error:', error);
        return "ERROR: Decryption process failed";
    }
}

const monitoringSystem = {
    baseTemp: -157.3,
    basePressure: 371.2,
    baseQuantumState: 99.9,
    
    getEnvironmentalData() {
        const progress = gameState.decryptedKeys;
        const timeVariation = Math.sin(Date.now() / 1000) * 0.5;
        
        const temp = this.baseTemp + (progress * 12.8) + timeVariation;
        const pressure = this.basePressure + (progress * -15.3) + (timeVariation * 2);
        const quantumState = this.baseQuantumState - (progress * 18.5) + (timeVariation * 0.3);
        const iceIntegrity = 100 - (progress * 20) + (timeVariation * 0.5);
        
        return {
            temp: temp.toFixed(1),
            pressure: pressure.toFixed(1),
            quantumState: Math.max(0, quantumState).toFixed(1),
            iceIntegrity: Math.max(0, iceIntegrity).toFixed(1),
            timestamp: new Date().toISOString().split('T')[1].split('.')[0]
        };
    },

    formatDataString() {
        const data = this.getEnvironmentalData();
        const glitchChars = ['█', '▓', '▒', '░', '╳', '╱', '╲'];
        const glitchRate = Math.min(0.3, gameState.decryptedKeys * 0.05);
        
        let text = `[${data.timestamp}] `;
        // Fixed: Remove glitchText calls and implement inline glitch effect
        text += `TEMP:${this.addGlitchEffect(data.temp)}°C ${this.randomGlitch(glitchRate)} `;
        text += `PRESS:${this.addGlitchEffect(data.pressure)}atm ${this.randomGlitch(glitchRate)} `;
        text += `QState:${this.addGlitchEffect(data.quantumState)}% ${this.randomGlitch(glitchRate)} `;
        text += `ICE:${this.addGlitchEffect(data.iceIntegrity)}%`;
        
        return text;
    },

    // Add new helper method
    addGlitchEffect(value) {
        if (Math.random() < 0.1) {
            const glitchChars = ['█', '▓', '▒', '░'];
            const char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            return value.toString().slice(0, -1) + char;
        }
        return value;
    },

    randomGlitch(rate) {
        const glitchChars = ['█', '▓', '▒', '░', '╳', '╱', '╲', '┼', '╳'];
        return Math.random() < rate ? 
            glitchChars[Math.floor(Math.random() * glitchChars.length)] : 
            '|';
    }
};
