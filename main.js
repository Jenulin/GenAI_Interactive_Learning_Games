import Phaser from 'phaser';
import { HomeScene, StoryScene, PuzzleScene } from './gameScenes.js';
import { AITutor } from './avatar.js';


const topicScreen = document.getElementById('topic-screen');
const introScreen = document.getElementById('intro-screen');
const lawsScreen = document.getElementById('laws-screen');
const puzzleScreen = document.getElementById('puzzle-screen');
const introContent = document.getElementById('intro-content');
const lawsContent = document.getElementById('laws-content');
const puzzleContent = document.getElementById('puzzle-content');
const nextIntroBtn = document.getElementById('next-intro-btn');
const nextLawBtn = document.getElementById('next-law-btn');
const nextPuzzleBtn = document.getElementById('next-puzzle-btn');
const aiTutor = new AITutor();

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: [HomeScene, StoryScene, PuzzleScene],
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};


const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
gameContainer.style.display = 'none';
document.body.appendChild(gameContainer);

const game = new Phaser.Game(config);


let currentTopic = null;
let currentGameData = null;
let currentPuzzles = [];
let currentPuzzleIndex = 0;
let correctAnswers = 0;
let lawIndex = 0;
let lawsArray = [];
let currentDifficulty = 'easy';
let lives = 3;
let astronautPosition = -20; 
let answeredIds = [];
let score = 0;
let currentRockIndex = 0; 
const fallbackData = {
    newton_laws: {
        easy: {
            intro: "Let's start with the basics of Newton's Laws! Imagine you're floating in space - why don't you stop moving? Newton explains how things move!",
            laws: [
                "1st Law (Simple): Things keep doing what they're doing unless pushed",
                "2nd Law (Simple): Push things to make them move faster",
                "3rd Law (Simple): When you push something, it pushes back"
            ],
            puzzles: [
                { 
                    id: "f1-easy", 
                    question: "What keeps a moving spaceship going in space?", 
                    options: ["Engine power", "No friction", "Fuel", "It slows down"], 
                    correctIndex: 1, 
                    explanation: "With no friction, it keeps moving (1st Law)", 
                    hint: "Think about what stops things on Earth" 
                },
                { 
                    id: "f2-easy", 
                    question: "What happens when you push a small ball vs big ball?", 
                    options: ["Small moves faster", "Same speed", "Big moves faster", "Neither moves"], 
                    correctIndex: 0, 
                    explanation: "Same force moves lighter objects faster (2nd Law)", 
                    hint: "Think about pushing different sized objects" 
                }
            ]
        },
        medium: {
            intro: "Newton's Laws govern all motion. Let's explore how forces affect objects with some math!",
            laws: [
                "1st Law: An object in motion stays in motion unless acted upon",
                "2nd Law: F=ma (Force = mass × acceleration)",
                "3rd Law: For every action there's an equal opposite reaction"
            ],
            puzzles: [
                { 
                    id: "f1-med", 
                    question: "A 5kg object accelerates at 2m/s². What force is needed?", 
                    options: ["2.5 N", "5 N", "10 N", "20 N"], 
                    correctIndex: 2, 
                    explanation: "F=ma → 5×2=10N", 
                    hint: "Use F = m × a" 
                },
                { 
                    id: "f2-med", 
                    question: "When a rocket fires gas downward, what happens?", 
                    options: ["It slows down", "It speeds up", "Nothing", "Spins"], 
                    correctIndex: 1, 
                    explanation: "Gas pushing down makes rocket go up (3rd Law)", 
                    hint: "Action-reaction pairs" 
                }
            ]
        },
        hard: {
            intro: "Advanced applications of Newton's Laws in complex systems",
            laws: [
                "1st Law: Inertial frames of reference",
                "2nd Law: Vector form F=dp/dt",
                "3rd Law: Conservation of momentum implications"
            ],
            puzzles: [
                { 
                    id: "f1-hard", 
                    question: "A 10kg block on a frictionless plane has a 3N and 4N force at right angles. What's acceleration?", 
                    options: ["0.5 m/s²", "0.7 m/s²", "5 m/s²", "7 m/s²"], 
                    correctIndex: 0, 
                    explanation: "Resultant force=5N (3-4-5 triangle), a=F/m=0.5", 
                    hint: "Combine forces vectorially first" 
                },
                { 
                    id: "f2-hard", 
                    question: "Two skaters push off each other (60kg and 90kg). If the lighter moves at 3m/s, how fast does the heavier move?", 
                    options: ["1 m/s", "2 m/s", "3 m/s", "4.5 m/s"], 
                    correctIndex: 1, 
                    explanation: "Conservation of momentum: 60×3 = 90×v → v=2", 
                    hint: "Momentum before = 0" 
                }
            ]
        }
    },
    friction: {
        easy: {
            intro: "Friction is what stops your bike when you brake! Let's learn the basics.",
            laws: [
                "Friction slows things down",
                "Rough surfaces have more friction",
                "Friction helps us walk and grip"
            ],
            puzzles: [
                { 
                    id: "fr1-easy", 
                    question: "Which surface has most friction?", 
                    options: ["Ice", "Carpet", "Wet floor", "Glass"], 
                    correctIndex: 1, 
                    explanation: "Rougher surfaces create more friction", 
                    hint: "Think about what's hardest to slide on" 
                }
            ]
        },
        medium: {
            intro: "Friction calculations and practical applications",
            laws: [
                "Static vs kinetic friction",
                "Friction force F=μN",
                "Coefficients of friction"
            ],
            puzzles: [
                { 
                    id: "fr1-med", 
                    question: "A 10kg box (μ=0.3) on flat ground. What's friction force? (g=10m/s²)", 
                    options: ["3 N", "10 N", "30 N", "100 N"], 
                    correctIndex: 2, 
                    explanation: "F=μN=0.3×(10×10)=30N", 
                    hint: "N = normal force = weight" 
                }
            ]
        },
        hard: {
            intro: "Advanced friction dynamics and real-world engineering applications",
            laws: [
                "Friction on inclined planes",
                "Non-uniform friction distributions",
                "Thermodynamic aspects of friction"
            ],
            puzzles: [
                { 
                    id: "fr1-hard", 
                    question: "A 5kg block slides down a 30° incline (μ=0.2). What's acceleration? (g=10m/s²)", 
                    options: ["1.7 m/s²", "3.3 m/s²", "5 m/s²", "6.7 m/s²"], 
                    correctIndex: 1, 
                    explanation: "a = g(sinθ - μcosθ) = 10(0.5 - 0.2×0.866) ≈ 3.3", 
                    hint: "Resolve forces along the plane" 
                }
            ]
        }
    },
    electricity: {
        easy: {
            intro: "Electricity powers our devices! Let's learn the basics.",
            laws: [
                "Electricity flows through wires",
                "Circuits need a complete loop",
                "Batteries provide power"
            ],
            puzzles: [
                { 
                    id: "e1-easy", 
                    question: "What flows in wires to create electricity?", 
                    options: ["Water", "Electrons", "Air", "Light"], 
                    correctIndex: 1, 
                    explanation: "Electrons moving create electric current", 
                    hint: "Think tiny particles" 
                }
            ]
        },
        medium: {
            intro: "Electrical circuits and Ohm's Law fundamentals",
            laws: [
                "V=IR (Voltage = Current × Resistance)",
                "Series vs parallel circuits",
                "Power calculations"
            ],
            puzzles: [
                { 
                    id: "e1-med", 
                    question: "A circuit has 12V battery and 3Ω resistor. What's the current?", 
                    options: ["0.25 A", "4 A", "9 A", "36 A"], 
                    correctIndex: 1, 
                    explanation: "I=V/R=12/3=4A", 
                    hint: "Use Ohm's Law" 
                }
            ]
        },
        hard: {
            intro: "Advanced circuit analysis and electromagnetic theory",
            laws: [
                "Kirchhoff's Laws",
                "RC circuit time constants",
                "Maxwell's Equations"
            ],
            puzzles: [
                { 
                    id: "e1-hard", 
                    question: "Three 6Ω resistors in parallel have total resistance:", 
                    options: ["2 Ω", "6 Ω", "9 Ω", "18 Ω"], 
                    correctIndex: 0, 
                    explanation: "1/R = 1/6 + 1/6 + 1/6 = 3/6 → R=2", 
                    hint: "Parallel resistance formula" 
                }
            ]
        }
    },
   
    gravitation: {
        easy: {
            intro: "Gravity keeps us on the ground and makes things fall! Let's learn the basics.",
            laws: [
                "Gravity pulls objects toward Earth",
                "All objects fall at the same speed (without air resistance)",
                "The Moon stays in orbit because of gravity"
            ],
            puzzles: [
                { 
                    id: "g1-easy", 
                    question: "What makes things fall to the ground?", 
                    options: ["Magnetism", "Gravity", "Wind", "Electricity"], 
                    correctIndex: 1, 
                    explanation: "Gravity pulls objects toward Earth's center", 
                    hint: "What keeps us from floating away?" 
                },
                { 
                    id: "g2-easy", 
                    question: "Which falls faster in vacuum - feather or hammer?", 
                    options: ["Feather", "Hammer", "Same speed", "Neither falls"], 
                    correctIndex: 2, 
                    explanation: "Without air resistance, all objects fall equally", 
                    hint: "Think about astronauts on the Moon" 
                }
            ]
        },
        medium: {
            intro: "Understanding gravitational forces and planetary motion",
            laws: [
                "Newton's Law of Gravitation: F = Gm₁m₂/r²",
                "Orbits result from gravitational attraction",
                "g = 9.8 m/s² on Earth's surface"
            ],
            puzzles: [
                { 
                    id: "g1-med", 
                    question: "If Earth's mass doubled but radius stayed same, how would your weight change?", 
                    options: ["Same", "Double", "Half", "Quadruple"], 
                    correctIndex: 1, 
                    explanation: "Weight depends directly on mass (F ∝ m)", 
                    hint: "Look at the gravitation formula" 
                },
                { 
                    id: "g2-med", 
                    question: "At what height would g be 1/4 of Earth's surface value? (Earth radius = 6371 km)", 
                    options: ["3186 km", "6371 km", "9556 km", "12742 km"], 
                    correctIndex: 1, 
                    explanation: "g ∝ 1/r² → need r=2×surface radius → height=6371 km", 
                    hint: "Inverse square law" 
                }
            ]
        },
        hard: {
            intro: "Advanced gravitational theory and astrophysical applications",
            laws: [
                "Kepler's Laws of Planetary Motion",
                "Gravitational potential energy",
                "Einstein's General Relativity concepts"
            ],
            puzzles: [
                { 
                    id: "g1-hard", 
                    question: "A satellite orbits Earth at altitude where g=6 m/s². Orbital speed is: (Earth radius=6400 km)", 
                    options: ["5.5 km/s", "6.9 km/s", "7.8 km/s", "9.8 km/s"], 
                    correctIndex: 1, 
                    explanation: "v=√(gr)=√(6×6.4×10⁶)≈6.9 km/s", 
                    hint: "Use v=√(gr) for circular orbit" 
                },
                { 
                    id: "g2-hard", 
                    question: "Two stars (4M and 9M) are 5R apart. Where between them is gravitational field zero?", 
                    options: ["1R from 4M", "2R from 4M", "3R from 4M", "4R from 4M"], 
                    correctIndex: 1, 
                    explanation: "Solve GM/x² = G9M/(5R-x)² → x=2R", 
                    hint: "Set gravitational forces equal" 
                }
            ]
        }
    },
    heat: {
        easy: {
            intro: "Heat makes things warmer and can change materials! Let's explore basics.",
            laws: [
                "Heat flows from hot to cold",
                "Thermometers measure temperature",
                "Materials expand when heated"
            ],
            puzzles: [
                { 
                    id: "h1-easy", 
                    question: "What happens to ice when heated?", 
                    options: ["Expands", "Melts", "Contracts", "Turns blue"], 
                    correctIndex: 1, 
                    explanation: "Heat energy breaks ice's solid structure into water", 
                    hint: "What happens to ice cubes in drink?" 
                },
                { 
                    id: "h2-easy", 
                    question: "How does heat travel through empty space?", 
                    options: ["Conduction", "Convection", "Radiation", "Currents"], 
                    correctIndex: 2, 
                    explanation: "Radiation doesn't need medium (like sunlight)", 
                    hint: "How does Sun warm Earth?" 
                }
            ]
        },
        medium: {
            intro: "Thermodynamics principles and heat transfer calculations",
            laws: [
                "Q = mcΔT (Heat transfer equation)",
                "First Law of Thermodynamics: ΔU = Q - W",
                "Specific heat capacities"
            ],
            puzzles: [
                { 
                    id: "h1-med", 
                    question: "How much heat to raise 2kg water from 20°C to 50°C? (c=4200 J/kg°C)", 
                    options: ["126 kJ", "252 kJ", "378 kJ", "504 kJ"], 
                    correctIndex: 1, 
                    explanation: "Q=mcΔT=2×4200×30=252,000 J", 
                    hint: "Calculate temperature change first" 
                },
                { 
                    id: "h2-med", 
                    question: "Which warms fastest in sunlight? (same mass)", 
                    options: ["Water", "Sand", "Iron", "Wood"], 
                    correctIndex: 2, 
                    explanation: "Lower specific heat means faster temperature rise", 
                    hint: "Check specific heat values" 
                }
            ]
        },
        hard: {
            intro: "Advanced thermodynamics and statistical mechanics concepts",
            laws: [
                "Second Law of Thermodynamics",
                "Heat engine efficiency η = 1 - T_cold/T_hot",
                "Entropy and disorder"
            ],
            puzzles: [
                { 
                    id: "h1-hard", 
                    question: "A Carnot engine operates between 400K and 300K. Maximum efficiency is:", 
                    options: ["25%", "33%", "50%", "75%"], 
                    correctIndex: 0, 
                    explanation: "η=1-300/400=0.25=25%", 
                    hint: "Use Carnot efficiency formula" 
                },
                { 
                    id: "h2-hard", 
                    question: "10g steam at 100°C condenses to water at 80°C. Total heat released? (L=2260 kJ/kg, c=4200 J/kg°C)", 
                    options: ["2.26 kJ", "23.9 kJ", "26.5 kJ", "42.0 kJ"], 
                    correctIndex: 2, 
                    explanation: "Q=mL+mcΔT=0.01×2260+0.01×4.2×20=26.5 kJ", 
                    hint: "Two stages: condensation then cooling" 
                }
            ]
        }
    }
};

window.addEventListener('topicSelected', (e) => {
    currentTopic = e.detail.topic;
    console.log(`Topic selected: ${currentTopic}`);
    topicScreen.style.display = 'none';
    introScreen.style.display = 'block';
    fetchLessonData();
});

document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', function() {
        const topic = this.getAttribute('data-topic');
        console.log(`Topic selected: ${topic}`);
        topicModal.style.display = 'none';
        
        
        window.dispatchEvent(new CustomEvent('topicSelected', {
            detail: { topic: topic }
        }));
    });
});

window.addEventListener('gameDataUpdated', (e) => {
    currentGameData = e.detail || fallbackData[currentTopic][currentDifficulty];
    currentDifficulty = currentGameData._internal_difficulty || currentDifficulty;
    lawsArray = Array.isArray(currentGameData.laws) ? currentGameData.laws : fallbackData[currentTopic][currentDifficulty].laws;
    currentPuzzles = Array.isArray(currentGameData.puzzles) ? currentGameData.puzzles : fallbackData[currentTopic][currentDifficulty].puzzles;
    lawIndex = 0;
    console.log('Game data updated:', currentGameData);
    introContent.innerHTML = `<h2>Intro</h2><p>${currentGameData.intro || fallbackData[currentTopic][currentDifficulty].intro}</p>`;
});

window.addEventListener('puzzleDataUpdated', (e) => {
    currentPuzzles = (e.detail.puzzles && e.detail.puzzles.length >= 5) ? 
    e.detail.puzzles.slice(0, 5) : 
    fallbackData[currentTopic][currentDifficulty].puzzles;

currentDifficulty = e.detail._internal_difficulty || currentDifficulty;
currentPuzzleIndex = 0;
correctAnswers = 0;
lives = 3;
astronautPosition = -20;
currentRockIndex = 0;
score = 0;
console.log('Puzzle data updated:', currentPuzzles);
displayPuzzleScene();
});


function fetchLessonData() {
    introContent.innerHTML = '<div class="loading">Loading...</div>';
    console.log(`Fetching lesson data for ${currentTopic}, difficulty: ${currentDifficulty}`);
    aiTutor.speak(`Loading ${currentDifficulty} level content about ${currentTopic.replace('_', ' ')}...`);
    fetch('http://127.0.0.1:5000/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            difficulty: currentDifficulty,
            user_answer_correct: null,
            topic: currentTopic
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error(`Fetch failed with status: ${response.status}`);
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Lesson data received:', data);
        if (!data.intro || !data.laws || !data.puzzles) {
            console.warn('Incomplete data, using fallback');
            currentGameData = fallbackData[currentTopic];
        } else {
            currentGameData = data;
        }
        aiTutor.speak(`Let's learn about ${currentTopic.replace('_', ' ')}!`);
        window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: currentGameData }));
    })
    .catch(err => {
        console.error('Error fetching lesson:', err);
        if (fallbackData[currentTopic]) {
            currentGameData = fallbackData[currentTopic];
            window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: currentGameData }));
        } else {
            console.error(`No fallback data for topic: ${currentTopic}`);
            introContent.innerHTML = '<h2>Error</h2><p>Topic not supported. Please select another topic.</p>';
            introScreen.style.display = 'none';
            topicScreen.style.display = 'block';
        }
    });
}


function displayCurrentLaw() {
    if (lawIndex < lawsArray.length) {
        lawsContent.innerHTML = `<h2>Laws</h2><p>${lawsArray[lawIndex]}</p>`;
        console.log(`Displaying law ${lawIndex + 1}: ${lawsArray[lawIndex]}`);
    } else {
        console.log('No more laws to display');
    }
}

function displayPuzzleScene() {
    if (currentPuzzleIndex >= currentPuzzles.length || lives <= 0) {
        showResults();
        return;
    }

    const puzzle = currentPuzzles[currentPuzzleIndex];
    const blockPositions = [80, 280, 480, 680, 880]; 

    puzzleContent.innerHTML = `
        <div class="puzzle-container">
        <div class="difficulty-indicator">
                Difficulty: <span class="difficulty-${currentDifficulty}">${currentDifficulty}</span>
            </div>
            <div class="lives-container">
                ${Array(3).fill().map((_, i) => `
                    <div class="heart ${i >= lives ? 'lost' : ''}"></div>
                `).join('')}
            </div>
            
            <div class="score-display">Score: ${score}</div>
            
            <button class="hint-btn">Hint</button>
            <button class="home-btn">Home</button>
            <div class="hint-text"></div>
            
            <div class="question-container">
                <div class="question">${puzzle.question}</div>
            </div>
            
            <div class="options-container">
                ${puzzle.options.map((opt, idx) => `
                    <button class="option-btn" data-index="${idx}">${opt}</button>
                `).join('')}
            </div>
            
            <div class="game-path"></div>
          
            <div class="astronaut-character" style="left: ${astronautPosition}px;"></div>
            ${blockPositions.map((pos, idx) => `
                <div class="rock" style="left: ${pos}px; ${idx < currentRockIndex ? 'opacity: 0.3;' : ''}"></div>
            `).join('')}
        </div>
    `;
    
    nextPuzzleBtn.style.display = 'none';
    setupPuzzle(puzzle, blockPositions);
    

    puzzleContent.querySelector('.hint-btn').addEventListener('click', function() {
        aiTutor.giveHint(puzzle.hint || "Think about the key concept.");
    });


document.getElementById('home-btn').addEventListener('click', () => {
    console.log('Home clicked');
    puzzleScreen.style.display = 'none';
    topicScreen.style.display = 'flex'; 
    topicScreen.style.justifyContent = 'center'; 
    topicScreen.style.alignItems = 'center'; 
    currentTopic = null;
    answeredIds = [];
});
puzzleContent.querySelector('.home-btn').addEventListener('click', function() {
    console.log('Home button clicked from puzzle screen');
    

    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    

    topicScreen.style.display = 'flex';
    topicScreen.style.justifyContent = 'center';
    topicScreen.style.alignItems = 'center';
    

    currentTopic = null;
    answeredIds = [];
    currentPuzzleIndex = 0;
    lives = 3;
    score = 0;
});
}

function setupPuzzle(puzzle, blockPositions) {
    const optionButtons = puzzleContent.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedIndex = parseInt(btn.getAttribute('data-index'));
            console.log(`User selected: ${puzzle.options[selectedIndex]}`);
            fetch('http://127.0.0.1:5000/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    puzzle_id: puzzle.id,
                    user_answer: selectedIndex,
                    _internal_difficulty: currentDifficulty,
                    topic: currentTopic
                })
            })
            .then(response => {
                if (!response.ok) throw new Error(`Verify failed: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log('Verification result:', data);
                handleAnswer(data, puzzle, blockPositions, optionButtons, selectedIndex);
            })
            .catch(err => {
                console.error('Verification error:', err);
                const data = {
                    correct: puzzle.correctIndex === selectedIndex,
                    correctIndex: puzzle.correctIndex,
                    explanation: puzzle.explanation,
                    _internal_difficulty: currentDifficulty,
                    topic: currentTopic
                };
                handleAnswer(data, puzzle, blockPositions, optionButtons, selectedIndex);
            });
        });
    });
}

function handleAnswer(data, puzzle, blockPositions, optionButtons, selectedIndex) {
    optionButtons.forEach(b => {
        b.disabled = true;
        const idx = parseInt(b.getAttribute('data-index'));
        if (idx === data.correctIndex) b.classList.add('correct');
        else if (idx === selectedIndex) b.classList.add('incorrect');
    });

    const astronaut = puzzleContent.querySelector('.astronaut-character');
    
    if (data.correct) {
        aiTutor.celebrate();
        correctAnswers++;
        score += 10;
    
        const targetLeft = blockPositions[currentRockIndex];
        

        astronaut.classList.add('jump');
        
        
        setTimeout(() => {
            astronautPosition = targetLeft; 
            astronaut.style.left = `${astronautPosition}px`; 
            astronaut.classList.remove('jump');
            puzzleContent.querySelector('.score-display').textContent = `Score: ${score}`;
            currentRockIndex++; 
            currentPuzzleIndex++; 
            nextPuzzleBtn.style.display = 'block';
            console.log(`Astronaut landed at: ${astronautPosition}, currentRockIndex: ${currentRockIndex}`);
        }, 1000); 
    } else {
        aiTutor.encourage();
        lives--;
        if (lives <= 0) {
            showResults();
        } else {
            currentPuzzleIndex++; 
            nextPuzzleBtn.style.display = 'block';
        }
    }
    currentDifficulty = data._internal_difficulty;
    answeredIds.push(puzzle.id);
}


nextIntroBtn.addEventListener('click', () => {
    console.log('Next intro clicked');
    introScreen.style.display = 'none';
    lawsScreen.style.display = 'block';
    displayCurrentLaw();
});

nextLawBtn.addEventListener('click', () => {
    console.log('Next law clicked');
    lawIndex++;
    if (lawIndex < lawsArray.length) {
        displayCurrentLaw();
    } else {
        lawsScreen.style.display = 'none';
        puzzleScreen.style.display = 'block';
        window.dispatchEvent(new CustomEvent('puzzleDataUpdated', { detail: currentGameData }));
    }
});

nextPuzzleBtn.addEventListener('click', () => {
    console.log('Next puzzle clicked');
    displayPuzzleScene();
});


function showResults() {
    const total = 5;
    const percentage = Math.round((correctAnswers / total) * 100);
    let resultMessage, resultClass;
    if (lives <= 0) {
        resultMessage = "Out of lives! Practice more to conquer the path!";
        resultClass = "needs-practice-result";
    } else if (percentage >= 80) {
        resultMessage = "Excellent! You’ve mastered the path!";
        resultClass = "excellent-result";
    } else if (percentage >= 60) {
        resultMessage = "Good job! You’re on the right track!";
        resultClass = "good-result";
    } else {
        resultMessage = "Keep practicing to clear all blocks!";
        resultClass = "needs-practice-result";
    }

    puzzleContent.innerHTML = `
        <div class="results ${resultClass}">
            <h3>Challenge Complete!</h3>
            <div class="score">Score: ${correctAnswers}/${total} (${percentage}%)</div>
            <div class="lives">Lives Remaining: ${lives}</div>
            <div class="result-message">${resultMessage}</div>
            <div class="result-actions">
                <button id="revise-btn" class="btn">Revise</button>
                <button id="home-btn" class="btn">Home</button>
            </div>
        </div>
    `;
    nextPuzzleBtn.style.display = 'none';
    console.log('Results:', { correctAnswers, total, lives });

    document.getElementById('revise-btn').addEventListener('click', () => {
        console.log('Revise clicked');
        puzzleScreen.style.display = 'none';
        introScreen.style.display = 'block';
        fetchLessonData();
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        console.log('Home clicked');
        puzzleScreen.style.display = 'none';
        topicScreen.style.display = 'flex'; 
        topicScreen.style.justifyContent = 'center'; 
        topicScreen.style.alignItems = 'center';
        currentTopic = null;
        answeredIds = [];
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const chooseTopicBtn = document.getElementById('choose-topic-btn');
    const topicModal = document.getElementById('topic-modal');
    const difficultyDropdown = document.getElementById('difficulty-dropdown');
    
    
    chooseTopicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        console.log('Choose Topic button clicked');
        topicModal.style.display = 'flex';
    });
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.stopPropagation(); 
            const topic = this.getAttribute('data-topic');
            console.log(`Topic selected: ${topic}`);
            topicModal.style.display = 'none';
            
         
            window.dispatchEvent(new CustomEvent('topicSelected', {
                detail: { topic: topic }
            }));
        });
    });

document.querySelector('.close-modal').addEventListener('click', () => {
    topicModal.style.display = 'none';
});

    topicModal.addEventListener('click', (e) => {
        if (e.target === topicModal) {
            console.log('Clicked outside modal, closing');
            topicModal.style.display = 'none';
        }
    });
    
   
    difficultyDropdown.addEventListener('change', function() {
        currentDifficulty = this.value;
        console.log(`Difficulty set to: ${currentDifficulty}`);
        if (aiTutor) {
            aiTutor.speak(`Difficulty set to ${currentDifficulty}. Good choice!`, 'happy');
        }
    });

    
     document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
     
            document.querySelectorAll('.difficulty-btn').forEach(b => {
                b.classList.remove('active');
            });
            
          
            this.classList.add('active');
            
          
            currentDifficulty = this.getAttribute('data-difficulty');
            console.log(`Difficulty set to: ${currentDifficulty}`);
            
      
            aiTutor.speak(`Difficulty set to ${currentDifficulty}. Good choice!`, 'happy');
        });
    });
    document.querySelector('.difficulty-btn[data-difficulty="easy"]').classList.add('active');
});