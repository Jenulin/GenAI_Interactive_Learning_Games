
export class AITutor {
    constructor() {
        this.avatarElement = document.createElement('div');
        this.avatarElement.id = 'ai-tutor-avatar';
        this.speechBubble = document.createElement('div');
        this.speechBubble.id = 'ai-tutor-speech';
        
       
        this.avatarElement.classList.add('avatar-puzzle-mode');
        
    
        const container = document.querySelector('.container');
        container.appendChild(this.avatarElement);
        container.appendChild(this.speechBubble);
        
   
        this.avatarElement.style.backgroundImage = 'url("ai-tutor.png")';
        this.correctPhrases = [
            "Fantastic work! You're a physics superstar!",
            "Woohoo! You nailed it like a pro!",
            "Brilliant! Your brain's on fire today!",
            "Awesome job! You're unstoppable!",
            "Yes! You've cracked the code!",
            "Incredible! You're a motion master!",
            "Wow, spot on! Keep the momentum going!",
            "Perfect! You're orbiting success!",
            "Superb! You’ve got the force with you!",
            "Amazing! You're accelerating to greatness!"
        ];

        this.incorrectPhrases = [
            "Oops, not quite! Let’s tweak that answer!",
            "No worries, mistakes are just practice runs!",
            "Almost there! Give it another spin!",
            "Don’t sweat it, let’s try a new angle!",
            "Close, but not yet! You’ve got this!",
            "Oh no! Let’s bounce back stronger!",
            "Not this time, but you’re learning fast!",
            "Missed it! Let’s orbit back and retry!",
            "Keep going, every step gets you closer!",
            "Tricky one, huh? Let’s power through!"
        ];
    
    }
    getRandomPhrase(phrasesArray) {
        const randomIndex = Math.floor(Math.random() * phrasesArray.length);
        return phrasesArray[randomIndex];
    }
    speak(message, emotion = 'neutral') {
        return new Promise(resolve => {
            speechSynthesis.cancel();
            this.speechBubble.style.display = 'none';

            this.avatarElement.className = `avatar-${emotion}`;
            this.speechBubble.textContent = message;
            this.speechBubble.style.display = 'block';

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.rate = 0.8;
                utterance.pitch = 0.9;
                
                utterance.onstart = () => {
                    this.speechBubble.style.display = 'block';
                };
                
                utterance.onend = () => {
                    setTimeout(() => {
                        this.speechBubble.style.display = 'none';
                        resolve();
                    }, 1000);
                };
                
                utterance.onerror = (e) => {
                    console.error('Speech error:', e);
                    setTimeout(() => {
                        this.speechBubble.style.display = 'none';
                        resolve();
                    }, message.length * 150);
                };
                
                speechSynthesis.speak(utterance);
            } else {
                const displayTime = Math.max(5000, message.length * 150);
                setTimeout(() => {
                    this.speechBubble.style.display = 'none';
                    resolve();
                }, displayTime);
            }
        });
    }

    async giveHint(hint) {
        await this.speak("Here's a hint...", 'thinking');
        await this.speak(hint, 'helpful');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async celebrate() {
        const message = this.getRandomPhrase(this.correctPhrases);
        await this.speak(message, 'happy');
        this.animate('celebrate');
    }

    async encourage() {
        const message = this.getRandomPhrase(this.incorrectPhrases);
        await this.speak(message, 'encouraging');
    }

    animate(animation) {
        this.avatarElement.classList.add(`animate-${animation}`);
        setTimeout(() => {
            this.avatarElement.classList.remove(`animate-${animation}`);
        }, 1000);
    }


    async narrateIntro(introText) {
        this.avatarElement.classList.remove('avatar-puzzle-mode');
        this.avatarElement.classList.add('avatar-lesson-mode');
        
        this.avatarElement.style.left = '50px';
        this.avatarElement.style.right = 'auto';
        this.avatarElement.style.bottom = '20px';
        this.avatarElement.style.transform = 'scaleX(1)';
      
        this.speechBubble.style.left = '30px';
        this.speechBubble.style.right = 'auto';
        this.speechBubble.style.bottom = '230px';
        
        await this.speak("Let's begin our lesson!", 'excited');
        await this.speak(introText, 'teaching');
    }
    
    async narrateLaws(lawsArray) {
        this.avatarElement.classList.remove('avatar-puzzle-mode');
        this.avatarElement.classList.add('avatar-lesson-mode');
        
        this.avatarElement.style.left = '50px';
        this.avatarElement.style.right = 'auto';
        this.avatarElement.style.bottom = '20px';
        this.avatarElement.style.transform = 'scaleX(1)';
        
        this.speechBubble.style.left = '30px';
        this.speechBubble.style.right = 'auto';
        this.speechBubble.style.bottom = '230px';
        
        await this.speak("Now, let's learn the key concepts:", 'teaching');
        
        for (const law of lawsArray) {
            await this.speak(law, 'explaining');
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

startPuzzleMode() {
    this.avatarElement.classList.remove('avatar-lesson-mode');
    this.avatarElement.classList.add('avatar-puzzle-mode');
    
    
    this.avatarElement.style.left = 'auto';
    this.avatarElement.style.right = '20px';
    this.avatarElement.style.bottom = '20px';
    this.avatarElement.style.transform = 'scaleX(-1)';
  
    this.speechBubble.style.left = 'auto';
    this.speechBubble.style.right = '250px';
    this.speechBubble.style.bottom = '230px';
    
    this.speechBubble.classList.add('avatar-puzzle-mode');
    this.speak("Time for some practice! Answer the questions.", 'encouraging');
}

speak(message, emotion = 'neutral') {
    return new Promise(resolve => {
     
        speechSynthesis.cancel();
        this.speechBubble.style.display = 'none';

        this.avatarElement.className = `avatar-${emotion}`;
        this.speechBubble.textContent = message;
        this.speechBubble.style.display = 'block';

    
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.8; 
            utterance.pitch = 0.9;
            
        
            utterance.onstart = () => {
                this.speechBubble.style.display = 'block';
            };
            
            utterance.onend = () => {
             
                setTimeout(() => {
                    this.speechBubble.style.display = 'none';
                    resolve();
                }, 1000); // 1 second pause after speech
            };
            
            utterance.onerror = (e) => {
                console.error('Speech error:', e);
              
                setTimeout(() => {
                    this.speechBubble.style.display = 'none';
                    resolve();
                }, message.length * 150); 
            };
            
            speechSynthesis.speak(utterance);
        } else {
            
            const displayTime = Math.max(5000, message.length * 150);
            setTimeout(() => {
                this.speechBubble.style.display = 'none';
                resolve();
            }, displayTime);
        }
    });
}

async giveHint(hint) {
 
    await this.speak("Here's a hint...", 'thinking');
    

    await this.speak(hint, 'helpful');
    
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.speechBubble.classList.remove('hint-message', 'hint-pulse');
    await this.speak("Let me help...", 'thinking');
    

    this.speechBubble.classList.add('hint-message', 'hint-pulse');
    await this.speak(hint, 'helpful');
    

    await new Promise(resolve => setTimeout(resolve, 3000));
    this.speechBubble.classList.remove('hint-message', 'hint-pulse');
}

setSpeechBubbleContent(message, isHint = false) {
    this.speechBubble.textContent = message;
    this.speechBubble.className = isHint ? 'hint-message hint-pulse' : '';
    this.speechBubble.style.display = 'block';
    return new Promise(resolve => {
        setTimeout(resolve, isHint ? 3000 : 1500);
    });
}
}

