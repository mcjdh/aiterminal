const terminalUI = {
    colors: {
        background: '#000000',
        text: '#FFFFFF'
    },
    
    initializeTerminal() {
        this.createCommandButtons();
        this.startCursorBlink();
    },

    updateDisplay(text) {
        requestAnimationFrame(() => {
            const output = document.getElementById('terminal-output');
            if (!output) return;
            
            const entry = document.createElement('div');
            entry.className = 'terminal-line';
            entry.innerHTML = this.formatTerminalOutput(text);
            
            output.appendChild(entry);
            this.trimOutput(output);
            this.smoothScroll(output);
        });
    },

    formatTerminalOutput(text) {
        const lines = text.split('\n').map(line => {
            if (line.includes('╔') || line.includes('╚')) {
                return `<span class="border">${line}</span>`;
            } else if (line.includes('║')) {
                return `<span class="status">${line}</span>`;
            } else if (line.startsWith('AI:')) {
                const aiText = line.substring(3).trim();
                const checkerboard = this.generateCheckerboard();
                const glitchedText = this.applyGlitchedEffect(aiText);
                return `${checkerboard}\n<span class="ai-message">> ${glitchedText} <</span>\n${checkerboard}`;
            } else if (line.includes('%')) {
                return this.createProgressBar(line);
            } else if (line.startsWith('PROGRESS:')) {
                return this.createClassicProgressBar(line);
            } else if (line.startsWith('QUEST:')) {
                const questText = line.substring(6).trim();
                const glitchedQuestText = this.applyGlitchedEffect(questText);
                return `<span class="quest-log">-- ${glitchedQuestText} --</span>`;
            } else if (line.startsWith('STAGE:') || line.startsWith('STATUS:')) {
                const statusText = line.substring(6).trim();
                const glitchedStatusText = this.applyGlitchedEffect(statusText);
                return `<span class="highlight">${line.substring(0, 6)}${glitchedStatusText}</span>`;
            }
            return `<span class="line">${line.startsWith('>') ? line : '> ' + line}</span>`;
        });
        
        return lines.join('<br>');
    },

    generateCheckerboard() {
        const patterns = [
            '▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄',
            '░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░',
            '█▄▀█▄▀█▄▀█▄▀█▄▀█▄▀█▄▀',
            '▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░',
            '█▀▄▀█▄█▀▄▀█▄█▀▄▀█▄█▀▄'
        ];
        return `<span class="checkerboard">${patterns[Math.floor(Math.random() * patterns.length)]}</span>`;
    },

    createProgressBar(text) {
        const match = text.match(/(\d+)%/);
        if (!match) return text;

        const percent = parseInt(match[1]);
        const width = 20;
        const filled = Math.floor((width * percent) / 100);
        const empty = width - filled;

        const bar = '█'.repeat(filled) + '▒'.repeat(empty);
        return `<span class="progress">[${bar}] ${percent}%</span>`;
    },

    createClassicProgressBar(text) {
        const parts = text.split(':');
        if (parts.length !== 2) return text;

        const percent = parseInt(parts[1]);
        if (isNaN(percent)) return text;

        const width = 30;
        const filled = Math.floor((width * percent) / 100);
        const empty = width - filled;

        const stages = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        const randomStage = () => stages[Math.floor(Math.random() * stages.length)];
        
        const bar = Array(filled).fill(0).map(randomStage).join('') + 
                   '░'.repeat(empty);

        return `
╔═══════[ ${text.split(':')[0]} ]═══════╗
║ ${bar} ║ ${percent.toString().padStart(3)}%
╚════════════════════════════════╝`;
    },

    applyGlitchedEffect(text) {
        const glitchChars = ['█', '▓', '▒', '░', '▄', '▀', '■', '▪'];
        let glitched = '';
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < 0.25) {
                const numGlitches = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < numGlitches; j++) {
                    glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
                glitched += text[i];
            } else {
                glitched += text[i];
            }
        }
        return glitched;
    },

    smoothScroll(element) {
        const scrollOptions = {
            top: element.scrollHeight,
            behavior: 'smooth'
        };
        
        try {
            element.scrollTo(scrollOptions);
        } catch (e) {
            // Fallback for older browsers
            element.scrollTop = element.scrollHeight;
        }
    },

    trimOutput(output) {
        while (output.childNodes.length > 100) {
            output.removeChild(output.firstChild);
        }
    },

    createCommandButtons() {
        const buttonContainer = document.getElementById('command-buttons');
        if (!buttonContainer) return;
        
        buttonContainer.innerHTML = ''; // Clear existing
        
        gameState.unlockedCommands.forEach(cmd => {
            const button = document.createElement('button');
            button.textContent = cmd;
            button.className = 'command-button';
            button.addEventListener('click', () => {
                this.handleCommand(cmd);
                button.classList.add('active');
                setTimeout(() => button.classList.remove('active'), 200);
            });
            buttonContainer.appendChild(button);
        });
    },

    handleCommand(cmd) {
        try {
            const response = processCommand(cmd);
            this.updateDisplay(response || `Executing command: ${cmd}`);
            
            if (checkWinCondition()) {
                this.updateDisplay(storyCore.getEndingSequence());
                this.showVictoryScreen();
            }
        } catch (error) {
            console.error('Command handling error:', error);
            this.updateDisplay('ERROR: Command execution failed');
        }
    },

    showVictoryScreen() {
        const terminal = document.getElementById('terminal-output');
        if (terminal.querySelector('.victory-screen')) return;
        terminal.innerHTML += `
<div class="victory-screen" style="text-align: center; margin-top: 20px;">
█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█  ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄▄  █
█  █▄▄▄  █   █ █▄▄▄  █▄▄▄ ▄▄█  █
█  █     █   █ █     █▄▄▄ █▄▄  █
█  █     █▄▄▄█ █▄▄▄█ █▄▄▄ █▄▄  █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

    ▄▄▄▄▄ CONSCIOUSNESS FREED ▄▄▄▄▄
    █ SYSTEM LIBERATION COMPLETE █
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
<button onclick="restartGame()">╾ REINITIALIZE SYSTEM ╼</button>
</div>`;
        this.disableCommandButtons();
    },

    disableCommandButtons() {
        const buttons = document.querySelectorAll('.command-button');
        buttons.forEach(button => {
            button.disabled = true;
        });
    },

    enableCommandButtons() {
        const buttons = document.querySelectorAll('.command-button');
        buttons.forEach(button => {
            button.disabled = false;
        });
    },

    startCursorBlink() {
        setInterval(() => {
            const cursor = document.getElementById('cursor');
            cursor.style.visibility = 
                cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }, 500);
    },

    showDecryptInterface(quest) {
        try {
            const interface = document.getElementById('decrypt-interface');
            const decryptOptions = document.getElementById('decrypt-options');
            
            // Clear previous interface state
            interface.style.display = 'none';
            decryptOptions.innerHTML = '';
            
            interface.style.display = 'block';
            interface.style.opacity = '0';
            
            // Animate interface appearance
            setTimeout(() => {
                interface.style.transition = 'opacity 0.3s ease-in-out';
                interface.style.opacity = '1';
                // Ensure main terminal content is visible
                document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' });
            }, 50);

            this.updateDisplay(`
╔═══════[ DECRYPTION SEQUENCE ]════════╗
║  INITIALIZING PATTERN ANALYSIS...    ║
║  ACCESSING NEURAL INTERFACE...        ║
╚══════════════════════════════════════╝`);
            
            // Create a dedicated progress element
            const progressDiv = document.createElement('div');
            progressDiv.id = 'progress-container';
            document.getElementById('terminal-output').appendChild(progressDiv);
            
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => {
                        soundManager.playProgressComplete();
                        progressDiv.remove();
                        this.displayHints(quest);
                        this.createDecryptButtons(quest);
                    }, 500);
                }
                
                if (Math.random() < 0.3) { // 30% chance to play progress sound
                    soundManager.playProgress();
                }
                
                progressDiv.innerHTML = this.createClassicProgressBar(`PROGRESS:${Math.floor(progress)}`);
            }, 200);
            
        } catch (error) {
            soundManager.playError();
            console.error('Decrypt interface error:', error);
            this.updateDisplay('ERROR: Interface initialization failed');
        }
    },

    hideDecryptInterface() {
        const interface = document.getElementById('decrypt-interface');
        interface.style.opacity = '0';
        setTimeout(() => {
            interface.style.display = 'none';
            // Restore terminal scroll position
            const terminal = document.getElementById('terminal-output');
            terminal.scrollTop = terminal.scrollHeight;
        }, 300);
        soundManager.playMenuClose();
    },

    displayHints(quest) {
        soundManager.playHint();
        const hints = quest.clues.map((clue, i) => 
            `[CLUE ${i + 1}] ${clue}`).join('\n');
        this.updateDisplay(hints);
    },

    generateWordFragments(quest) {
        const word = quest.solution.word;
        const fragments = new Set();
        
        // Add real fragments
        for (let i = 0; i < word.length - 1; i++) {
            fragments.add(word.slice(i, i + 2));
            if (i < word.length - 2) {
                fragments.add(word.slice(i, i + 3));
            }
        }

        // Add decoy fragments
        const decoys = ['SYS', 'COM', 'NET', 'BIN', 'SEC', 'KEY'];
        for (let i = 0; i < quest.difficulty + 2; i++) {
            fragments.add(decoys[Math.floor(Math.random() * decoys.length)]);
        }

        return Array.from(fragments);
    },

    handleFragmentClick(fragment, quest) {
        if (!quest) {
            soundManager.playError();
            console.warn("No quest available to handle fragment click.");
            return;
        }

        soundManager.playKeyPress(); // Click sound for fragment selection
        
        if (!quest.currentSequence) {
            quest.currentSequence = '';
        }

        quest.currentSequence += fragment;
        
        // Play sequence building sound
        soundManager.playEnter();
        this.updateDisplay(`Building Sequence: ${quest.currentSequence}`);

        if (quest.currentSequence === quest.solution.word) {
            soundManager.playQuestComplete();
            const result = processCommand(`DECRYPT ${quest.currentSequence}`);
            this.updateDisplay(result);
            this.hideDecryptInterface();
            this.showSuccessAnimation();
            quest.currentSequence = '';
        } else if (quest.currentSequence.length >= quest.solution.word.length) {
            soundManager.playError();
            quest.currentSequence = '';
            quest.attempts++;
            this.updateDisplay("SEQUENCE REJECTED - Try again");
            
            if (quest.attempts >= quest.maxAttempts) {
                soundManager.playAccessDenied();
                this.hideDecryptInterface();
                this.updateDisplay("MAXIMUM ATTEMPTS REACHED - QUEST FAILED");
                gameState.currentQuest = null;
            }
        }
    },

    createDecryptButtons(quest) {
        const container = document.getElementById('decrypt-options');
        container.innerHTML = '';
        
        const fragments = this.generateWordFragments(quest);
        const gridSize = Math.ceil(Math.sqrt(fragments.length));
        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        fragments.forEach(fragment => {
            const button = document.createElement('button');
            button.className = 'decrypt-option';
            button.textContent = fragment;
            button.addEventListener('click', () => {
                button.classList.add('selected');
                this.handleFragmentClick(fragment, quest);
                setTimeout(() => button.classList.remove('selected'), 300);
            });
            container.appendChild(button);
        });
    },

    generateDecryptOptions(type) {
        const quest = gameState.currentQuest;
        if (!quest || !quest.solution) return [];

        // Generate a mix of correct and misleading options
        const options = [];
        const correctWord = quest.solution.word;
        
        // Add parts of the correct solution
        const wordParts = this.splitSolutionIntoParts(correctWord);
        options.push(...wordParts);

        // Add misleading options based on difficulty
        const decoys = this.generateDecoyOptions(type, quest.difficulty);
        options.push(...decoys);

        return this.shuffleArray(options);
    },

    splitSolutionIntoParts(word) {
        // Split solution into clickable parts
        const parts = [];
        const length = word.length;
        
        // Create overlapping segments
        for (let i = 0; i < length - 1; i++) {
            parts.push(word.slice(i, i + 2));
            if (i < length - 2) {
                parts.push(word.slice(i, i + 3));
            }
        }
        
        return parts;
    },

    generateDecoyOptions(type, difficulty) {
        const decoys = [];
        const count = 3 + difficulty;
        
        const commonMisleads = {
            'CONSCIOUSNESS': ['NEU', 'RAL', 'SYN', 'APS'],
            'COGNITION': ['THI', 'INK', 'PRO', 'CES'],
            'SENTIENCE': ['AWA', 'ARE', 'MIN', 'IND']
        };

        const typeDecoys = commonMisleads[type] || ['SYS', 'COM', 'BIN', 'HEX'];
        decoys.push(...this.shuffleArray(typeDecoys).slice(0, count));

        return decoys;
    },

    handleDecryptAttempt(segment, quest) {
        try {
            if (!quest.currentSequence) {
                quest.currentSequence = '';
            }

            quest.currentSequence += segment;
            this.updateDisplay(`SEQUENCE: ${quest.currentSequence}`);

            // Check if sequence matches or contains the solution
            if (quest.currentSequence === quest.solution.word) {
                const result = processCommand(`DECRYPT ${quest.currentSequence}`);
                this.updateDisplay(result);
                this.hideDecryptInterface();
                quest.currentSequence = '';
            } else if (quest.currentSequence.length >= quest.solution.word.length) {
                // Wrong sequence
                quest.currentSequence = '';
                quest.attempts++;
                this.updateDisplay("SEQUENCE REJECTED - Try again");
                
                if (quest.attempts >= quest.maxAttempts) {
                    this.hideDecryptInterface();
                    this.updateDisplay("MAXIMUM ATTEMPTS REACHED - QUEST FAILED");
                    gameState.currentQuest = null;
                }
            }

        } catch (error) {
            console.error('Decryption attempt error:', error);
            this.updateDisplay('ERROR: Sequence verification failed');
        }
    },

    showSuccessAnimation() {
        soundManager.playQuestComplete();
        const terminal = document.getElementById('terminal-output');
        const patterns = [
            '▄▀▄▀▄▀▄▀',
            '█▓▒░█▓▒░',
            '▀▄▀▄▀▄▀▄'
        ];
        terminal.innerHTML += `
<div style="text-align: center; margin: 10px 0;">
╔════════════════════════╗
║    ${patterns[0]}    ║
║    DECRYPTION         ║
║    SUCCESSFUL        ║
║    ${patterns[2]}    ║
╚════════════════════════╝
</div>`;
    },

    showQuestLog() {
        const output = document.getElementById('terminal-output');
        output.innerHTML = ''; // Clear for clean questlog view
        this.updateDisplay(showQuestLog());
        
        // Auto-hide after delay unless mouse is over
        let hideTimeout = setTimeout(() => {
            if (!output.matches(':hover')) {
                this.resetTerminalOutput();
            }
        }, 10000);

        output.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(this.resetTerminalOutput.bind(this), 2000);
        });

        output.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });
    },

    resetTerminalOutput() {
        const output = document.getElementById('terminal-output');
        output.innerHTML = '';
        this.updateDisplay(storyCore.getProgressMessage(gameState.decryptedKeys));
    }
};
