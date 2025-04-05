from flask import Flask, jsonify, request
from groq import Groq
from flask_cors import CORS
import json
import re
import uuid
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


client = Groq(api_key="your_api_key") # Replace with your actual API key

puzzle_cache = {}

def query_groq(prompt, max_retries=5, backoff_factor=1.5):
    for attempt in range(max_retries):
        try:
            logger.info(f"Calling Groq API - Attempt {attempt+1}/{max_retries}")
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an AI tutor helping students understand physics."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_completion_tokens=1000,
                top_p=1,
                timeout=10  
            )
            response_text = completion.choices[0].message.content.strip()
            logger.info(f"Groq API response: {response_text[:50]}... ({len(response_text)} chars)")
            return clean_response(response_text, prompt)
        except Exception as e:
            logger.error(f"[Groq API Error] Attempt {attempt+1}/{max_retries}: {str(e)}")
            if attempt < max_retries - 1:
                wait_time = (backoff_factor ** attempt) * 1.0
                logger.info(f"Retrying in {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            else:
                logger.error("All retries failed, returning fallback")
                return get_fallback_response(prompt)  

def get_fallback_response(prompt):
    """Return structured fallback content based on prompt type."""
    if "Create a real-life introduction" in prompt:
        return "Explore physics in action with this intro!" 
    elif "Explain" in prompt:
        return "Physics concept explanation unavailable.\n\nTry again later.\n\nBasic overview provided."  # Fallback laws
    elif "Create 5 physics multiple-choice puzzles" in prompt:
        return json.dumps({
            "puzzles": [
                {"puzzle_type": "multiple_choice", "question": "What is 1+1?", "options": ["1", "2", "3", "4"], "correctIndex": 1, "explanation": "Basic math fallback."}
            ]
        }) 
    return "⚠ Failed to generate content."

def clean_response(response, prompt):
    """Cleans the AI-generated response by removing the prompt text and handling empty cases."""
    cleaned_text = response.replace(prompt, '').strip()
    return cleaned_text if cleaned_text else "⚠ Content could not be generated. Please try again!"

def adjust_difficulty(current_difficulty, user_answer_correct):
    """Adjusts difficulty based on user's answer correctness."""
    levels = ['easy', 'medium', 'hard']
    index = levels.index(current_difficulty)
    if user_answer_correct.lower() == 'correct' and index < len(levels) - 1:
        return levels[index + 1]
    elif user_answer_correct.lower() == 'incorrect' and index > 0:
        return levels[index - 1]
    return current_difficulty

def story_prompt(topic='newton_laws'):
    """Generate an intro prompt based on the topic."""
    prompts = {
        'newton_laws': """Create a real-life introduction explaining Newton's Laws with examples.
        Write 75-100 words that capture students' imagination and set the context for learning physics.
        Make it space-themed and engaging for middle school students.""",
        
        'friction': """Create a real-life introduction explaining the concept of Friction with examples.
        Write 75-100 words that capture students' imagination and set the context for learning about friction.
        Relate it to everyday situations (like sports or transportation) and make it engaging for middle school students.""",
        
        'electricity': """Create an engaging introduction about Electricity for middle school students.
        Write 75-100 words explaining how electricity powers our world with real-life examples.
        Make it exciting and relate to things they use every day like phones and lights.""",
        
        'gravitation': """Create a space-themed introduction about Gravitation for middle school students.
        Write 75-100 words explaining gravity in an exciting way with examples from space and Earth.
        Mention how it keeps planets in orbit and makes things fall.""",
        
        'heat': """Create an engaging introduction about Heat and Thermal Energy for middle school students.
        Write 75-100 words explaining heat transfer with real-life examples like cooking or weather.
        Make it relatable to their daily experiences."""
    }
    return prompts.get(topic, prompts['newton_laws'])

def laws_prompt(topic='newton_laws'):
    """Generate a laws prompt based on the topic."""
    prompts = {
        'newton_laws': """Explain Newton's Three Laws of Motion in a simple, beginner-friendly way.
        Format your response as three separate paragraphs:
        1. First Law (Law of Inertia)
        2. Second Law (F = ma)
        3. Third Law (Action and Reaction)
        Each explanation should be 3-4 sentences maximum.""",
        
        'friction': """Explain the concept of Friction in a simple, beginner-friendly way.
        Format your response as three separate paragraphs:
        1. What is Friction and its causes?
        2. Types of Friction?
        3. Why is Friction important?
        Each explanation should be 3-4 sentences maximum.""",
        
        'electricity': """Explain basic Electricity concepts in a simple, beginner-friendly way.
        Format your response as three separate paragraphs:
        1. What is electricity and how does it flow?
        2. Conductors and insulators
        3. Basic circuits and components
        Each explanation should be 3-4 sentences maximum.""",
        
        'gravitation': """Explain Gravitation concepts in a simple, beginner-friendly way.
        Format your response as three separate paragraphs:
        1. What is gravity and how does it work?
        2. Gravity on Earth vs in space
        3. Orbits and planetary motion
        Each explanation should be 3-4 sentences maximum.""",
        
        'heat': """Explain Heat and Thermal Energy concepts in a simple, beginner-friendly way.
        Format your response as three separate paragraphs:
        1. What is heat and how does it transfer?
        2. Temperature vs heat
        3. Real-world applications
        Each explanation should be 3-4 sentences maximum."""
    }
    return prompts.get(topic, prompts['newton_laws'])

def puzzles_prompt(difficulty, topic, num_puzzles=5):
    """Generates MCQ puzzles in JSON format with a mix of theory and sum-based questions."""
    topic_map = {
        'newton_laws': "Newton's Laws",
        'friction': "Friction",
        'electricity': "Electricity",
        'gravitation': "Gravitation",
        'heat': "Heat and Thermal Energy"
    }
    
    topic_name = topic_map.get(topic, topic.replace('_', ' '))
    base_prompt = f"""
    Create {num_puzzles} physics multiple-choice puzzles about {topic_name} in JSON format.
    Ensure a mix of theory-based questions (e.g., concepts) and sum-based questions (e.g., using formulas).
    
    For each puzzle, include:
    - puzzle_type: "multiple_choice"
    - id: A unique identifier (leave blank, will be assigned later)
    - question: The question text
    - options: Array of 4 possible answers
    - correctIndex: Index of the correct answer (0-3)
    - explanation: Brief explanation of why the answer is correct
    - hint: A helpful clue (1 sentence max) to guide the student
    VERY IMPORTANT:
    - Return EXACTLY {num_puzzles} puzzles
    - Ensure ALL puzzles are about {topic_name}
    - For hard difficulty, include complex calculations and multi-step problems
    - Include ALL required fields for each puzzle
    Return ONLY valid JSON like this (fill in with real puzzles):
    {{
        "puzzles": [
            {{
                "puzzle_type": "multiple_choice",
                "question": "Example question about {topic_name}?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctIndex": 1,
                "explanation": "Explanation why this answer is correct."
            }}
        ]
    }}
    """
    

    if topic == 'electricity':
        base_prompt += """
        Include questions about circuits, Ohm's Law (V=IR), conductors/insulators, and electrical safety.
        """
    elif topic == 'gravitation':
        base_prompt += """
        Include questions about gravitational force (F=Gm₁m₂/r²), orbits, weight vs mass, and planetary motion.
        """
    elif topic == 'heat':
        base_prompt += """
        Include questions about heat transfer (conduction, convection, radiation), specific heat, and thermal expansion.
        """

    if difficulty == 'easy':
        base_prompt += " Questions should be simple and test basic understanding."
    elif difficulty == 'medium':
        base_prompt += " Questions should involve applying concepts to scenarios."
    else:
        base_prompt += " Questions should require deeper understanding and complex calculations."
    
    return base_prompt

def format_laws(laws_text, topic='newton_laws'):
    """Format the laws response into an array with topic-specific labels."""
    laws = [law.strip() for law in laws_text.split('\n\n') if law.strip()]
    expected_count = 3
    if len(laws) != expected_count:
        third = len(laws_text) // expected_count
        laws = [laws_text[i:i+third].strip() for i in range(0, len(laws_text), third)]
    while len(laws) < expected_count:
        laws.append("Information unavailable.")


    if topic == 'newton_laws':
        laws[0] = "Newton's First Law: " + laws[0]
        laws[1] = "Newton's Second Law: " + laws[1]
        laws[2] = "Newton's Third Law: " + laws[2]
    elif topic == 'friction':
        laws[0] = "What is Friction: " + laws[0]
        laws[1] = "Types of Friction: " + laws[1]
        laws[2] = "Importance of Friction: " + laws[2]
    elif topic == 'electricity':
        laws[0] = "What is Electricity: " + laws[0]
        laws[1] = "Circuits: " + laws[1]
        laws[2] = "Safety: " + laws[2]
    elif topic == 'gravitation':
        laws[0] = "What is Gravity: " + laws[0]
        laws[1] = "On Earth: " + laws[1]
        laws[2] = "In Space: " + laws[2]
    elif topic == 'heat':
        laws[0] = "What is Heat: " + laws[0]
        laws[1] = "Transfer Methods: " + laws[1]
        laws[2] = "Effects: " + laws[2]
    else:
    
        laws[0] = "Concept 1: " + laws[0]
        laws[1] = "Concept 2: " + laws[1]
        laws[2] = "Concept 3: " + laws[2]

    return laws[:expected_count]

def parse_puzzles_json(json_text):
    """Extract valid JSON from the model response."""
    logger.info("Attempting to parse JSON")
    clean_text = re.sub(r'```(?:json)?\s*|\s*```', '', json_text).strip()
    try:
        return json.loads(clean_text)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parsing failed: {e}")
        return create_fallback_puzzles()

def create_fallback_puzzles(topic='newton_laws'):
    """Creates fallback MCQ puzzles."""
    logger.info(f"Creating fallback puzzles for topic: {topic}")
    if topic == 'friction':
        return {
            "puzzles": [
                {
                    "puzzle_type": "multiple_choice",
                    "id": str(uuid.uuid4()),
                    "question": "What type of friction occurs when an object slides?",
                    "options": ["Static", "Kinetic", "Rolling", "Fluid"],
                    "correctIndex": 1,
                    "explanation": "Kinetic friction acts when an object is sliding."
                },
                {
                    "puzzle_type": "multiple_choice",
                    "id": str(uuid.uuid4()),
                    "question": "A 10 kg box has a friction coefficient of 0.2. What’s the frictional force (g=10 m/s²)?",
                    "options": ["10 N", "20 N", "30 N", "40 N"],
                    "correctIndex": 1,
                    "explanation": "F = μN = 0.2 * (10 * 10) = 20 N."
                }
            ]
        }
    else:
        return {
            "puzzles": [
                {
                    "puzzle_type": "multiple_choice",
                    "id": str(uuid.uuid4()),
                    "question": "What does Newton's Second Law relate?",
                    "options": ["Force and mass", "Force and acceleration", "Mass and velocity", "Acceleration and time"],
                    "correctIndex": 1,
                    "explanation": "F = ma relates force, mass, and acceleration."
                },
                {
                    "puzzle_type": "multiple_choice",
                    "id": str(uuid.uuid4()),
                    "question": "A 5 kg object accelerates at 2 m/s². What’s the force?",
                    "options": ["5 N", "7 N", "10 N", "15 N"],
                    "correctIndex": 2,
                    "explanation": "F = ma = 5 * 2 = 10 N."
                }
            ]
        }

def assign_ids_to_puzzles(puzzles_data):
    """Assigns unique IDs to puzzles."""
    if not isinstance(puzzles_data, dict) or 'puzzles' not in puzzles_data:
        return {"puzzles": []}
    for puzzle in puzzles_data['puzzles']:
        if 'id' not in puzzle:
            puzzle['id'] = str(uuid.uuid4())
    return puzzles_data

def get_fresh_puzzles(difficulty, topic, num_puzzles=5, max_retries=3):
    """Gets fresh puzzles with retry logic."""
    logger.info(f"Generating fresh puzzles: difficulty={difficulty}, topic={topic}")
    for attempt in range(max_retries):
        try:
            puzzles_raw = query_groq(puzzles_prompt(difficulty, topic, num_puzzles))
            if "⚠" in puzzles_raw:
                logger.warning(f"Error response on attempt {attempt+1}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return create_fallback_puzzles(topic)
            puzzles_data = parse_puzzles_json(puzzles_raw)
            if puzzles_data and 'puzzles' in puzzles_data and len(puzzles_data['puzzles']) > 0:
                logger.info(f"Generated {len(puzzles_data['puzzles'])} puzzles")
                return assign_ids_to_puzzles(puzzles_data)
            logger.warning(f"Invalid puzzles on attempt {attempt+1}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
        except Exception as e:
            logger.error(f"Error on attempt {attempt+1}: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    logger.error("All attempts failed, using fallback")
    return create_fallback_puzzles(topic)

@app.route('/')
def index():
    return "Physics Learning Game Backend is Running!"

@app.route('/api/lesson', methods=['POST'])
def generate_lesson():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    current_difficulty = data.get('difficulty', 'easy')
    user_answer_correct = data.get('user_answer_correct')
    topic = data.get('topic', 'newton_laws')
    next_difficulty = adjust_difficulty(current_difficulty, user_answer_correct) if user_answer_correct else current_difficulty
    logger.info(f"Difficulty: {current_difficulty} -> {next_difficulty}, Topic: {topic}")
    story_text = query_groq(story_prompt(topic))
    laws_text = query_groq(laws_prompt(topic))
    formatted_laws = format_laws(laws_text, topic)
    cache_key = f'{topic}_{next_difficulty}'
    if cache_key not in puzzle_cache or len(puzzle_cache[cache_key]['puzzles']) < 5:
        logger.info(f"Generating puzzles for {cache_key}")
        puzzle_cache[cache_key] = get_fresh_puzzles(next_difficulty, topic)
    return jsonify({
        "intro": story_text,
        "laws": formatted_laws,
        "puzzles": puzzle_cache[cache_key]['puzzles'][:5],  # Ensure 5 puzzles
        "_internal_difficulty": next_difficulty,
        "topic": topic
    })

@app.route('/api/verify', methods=['POST'])
def verify_answer():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    puzzle_id = data.get('puzzle_id')
    user_answer = data.get('user_answer')
    difficulty = data.get('_internal_difficulty', 'easy')
    topic = data.get('topic', 'newton_laws')
    cache_key = f'{topic}_{difficulty}'
    if cache_key not in puzzle_cache:
        return jsonify({"error": "No puzzle found"}), 404
    for puzzle in puzzle_cache[cache_key]['puzzles']:
        if puzzle.get('id') == puzzle_id:
            correct = puzzle['correctIndex'] == user_answer
            next_difficulty = adjust_difficulty(difficulty, 'correct' if correct else 'incorrect')
            logger.info(f"Verification: correct={correct}, selected={user_answer}, correctIndex={puzzle['correctIndex']}")
            return jsonify({
                "correct": correct,
                "correctIndex": puzzle['correctIndex'],
                "explanation": puzzle['explanation'],
                "_internal_difficulty": next_difficulty,
                "topic": topic
            })
    return jsonify({"error": "Puzzle not found"}), 404

@app.route('/api/generate-hint', methods=['POST'])
def generate_hint():
    data = request.get_json()
    question = data.get('question', '')
    topic = data.get('topic', 'newton_laws')
    
    prompt = f"""
    Given this physics question about {topic}:
    "{question}"
    
    Generate a helpful one-sentence hint that guides the student toward the solution 
    without giving away the answer. Make it encouraging and pedagogical.
    
    Respond ONLY with the hint text (no quotes or formatting).
    """
    
    try:
        hint = query_groq(prompt)
        return jsonify({"hint": hint})
    except Exception as e:
        logger.error(f"Hint generation failed: {str(e)}")
        return jsonify({"hint": "Think about the key concepts involved."})

if __name__ == '__main__':
    logger.info("Starting Backend")
    app.run(debug=True, host='0.0.0.0', port=5000)