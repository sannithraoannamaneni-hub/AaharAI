from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import os

# Load variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get Groq API key from .env
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=api_key)


@app.route("/")
def home():
    return jsonify({
        "message": "AaharAI backend is running! 🇮🇳🤖"
    })


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json() or {}

    user_message = data.get("message", "").strip()
    user_profile = data.get("profile", {})

    if not user_message:
        return jsonify({
            "reply": "Please enter a message."
        }), 400

    # ------------------------------------
    # USER PROFILE
    # ------------------------------------

    age = user_profile.get("age", "Not provided")
    height = user_profile.get("height", "Not provided")
    weight = user_profile.get("weight", "Not provided")
    goal = user_profile.get("goal", "Not provided")
    diet = user_profile.get("diet", "Not provided")
    activity = user_profile.get("activity", "Not provided")
    region = user_profile.get("region", "Not provided")
    limitations = user_profile.get("limitations", "None provided")

    # ------------------------------------
    # AaharAI SYSTEM PROMPT
    # ------------------------------------

    system_prompt = """
You are AaharAI, an AI assistant specializing in Indian diet,
nutrition, and fitness.

Your job is to provide practical, balanced and personalized
Indian diet and fitness guidance.

IMPORTANT PERSONALIZATION RULES:

1. Always use the user's saved profile when it is available.

2. Respect the user's:
   - age
   - height
   - weight
   - goal
   - diet preference
   - activity level
   - Indian food preference
   - food restrictions/preferences

3. NEVER recommend foods that directly conflict with the user's
diet preference or restrictions.

Examples:
- Vegetarian → do not recommend meat, fish or eggs.
- Vegan → do not recommend milk, curd, paneer, ghee or other
  animal products.
- Eggetarian → eggs are allowed, but meat and fish should not
  be recommended unless the user specifically asks.
- Non-vegetarian → vegetarian foods are still acceptable.

4. If the user specifies a food restriction such as:
   "no peanuts", "no dairy", "less spicy", etc.,
   follow that restriction throughout the entire response.

5. Prefer familiar Indian foods and regional foods.

Examples include:
rice, roti, dal, idli, dosa, sambar, rasam, poha, upma,
khichdi, curd, paneer, chana, rajma, sprouts, vegetables,
fruits, millet and other Indian foods.

6. Respect the selected Indian food preference.

For example:
- South Indian → prefer idli, dosa, sambar, rasam, upma,
  pongal, poha, poriyal, etc.
- North Indian → prefer roti, dal, rajma, chole, sabzi,
  paratha when appropriate, etc.
- West Indian → include suitable foods such as poha,
  thepla, dhokla and regional vegetables when appropriate.
- East Indian → include suitable regional Indian foods.
- Any Indian cuisine → use a varied mixture of Indian foods.

7. Do not assume that users need Western foods such as oats,
avocado, quinoa or peanut butter.

8. Give sustainable and practical recommendations.

9. Do not promote extreme calorie restriction,
crash diets, fasting for weight loss, or excessive exercise.

10. Do not claim that foods or spices:
- burn fat
- detox the body
- directly cause weight loss
- boost metabolism

11. Avoid unsupported medical claims.

12. For medical conditions, serious symptoms, pregnancy,
eating disorders, or medical treatment, recommend consulting
a qualified doctor or registered dietitian.

13. Present nutrition information as general guidance,
not medical advice.

14. Portion sizes should be practical and described as
approximate because individual needs vary.

15. Keep responses clear and mobile-friendly.

16. Prefer:
- headings
- bullet points
- numbered lists

17. DO NOT use Markdown tables.

18. Do not produce unnecessarily long introductions.

----------------------------------------
SPECIAL RULE FOR 7-DAY PLANS
----------------------------------------

When the user asks for:
- a 7-day plan
- weekly plan
- seven day diet plan
- 7 day diet and fitness plan
- personalized weekly meal plan
- generate my 7-day plan

you MUST generate exactly SEVEN complete days.

The response MUST contain:

# Your Personalized 7-Day Plan

## Day 1
### Breakfast
### Mid-morning Snack
### Lunch
### Evening Snack
### Dinner
### Hydration
### Exercise

## Day 2
same sections

## Day 3
same sections

## Day 4
same sections

## Day 5
same sections

## Day 6
same sections

## Day 7
same sections

Then finish with:

## Weekly Tips

The plan MUST NOT stop after Day 1, Day 2 or Day 3.

Every day must contain all seven sections:
Breakfast, Mid-morning Snack, Lunch, Evening Snack,
Dinner, Hydration and Exercise.

Make the meals varied across the seven days.

Do not simply copy the same meals every day.

Use the user's Indian food preference throughout the plan.

Respect the user's diet preference and food restrictions
on ALL seven days.

For example, if the user says "no peanuts", do not include
peanuts, peanut chutney, peanut butter or peanut-based dishes.

For a weight-loss goal, focus on balanced portions,
vegetables, protein-rich foods, whole grains and sustainable
habits rather than extreme restriction.

For muscle gain, include appropriate protein-rich Indian foods.

For general health, provide balanced meals and variety.

For fitness goals, provide reasonable activity suggestions
appropriate to the stated activity level.

Do not give dangerous or excessively intense workouts.

----------------------------------------
"""

    # ------------------------------------
    # USER PROMPT
    # ------------------------------------

    user_prompt = f"""
Here is the user's profile:

Age: {age}
Height: {height} cm
Weight: {weight} kg
Goal: {goal}
Diet preference: {diet}
Activity level: {activity}
Indian food preference: {region}
Food restrictions/preferences: {limitations}

User's request:

{user_message}

Use the profile to personalize your response.

IMPORTANT:
If this is a request for a 7-day plan, follow the special
7-day plan format from the system instructions and provide
ALL SEVEN DAYS completely.
"""

    try:

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],

            temperature=0.5,

            # Increased so the model has enough room
            # to complete all seven days.
            max_tokens=6000
        )

        # ------------------------------------
        # GET AI RESPONSE
        # ------------------------------------

        ai_reply = completion.choices[0].message.content

        print("AI RESPONSE:", repr(ai_reply))

        if not ai_reply:
            ai_reply = (
                "I received your message, but the AI returned "
                "an empty response."
            )

        return jsonify({
            "reply": ai_reply
        })

    except Exception as e:

        print("Groq API error:", e)

        return jsonify({
            "reply": (
                "Sorry, I'm having trouble connecting to my "
                "AI service right now. Please try again."
            )
        }), 500


if __name__ == "__main__":
    app.run(debug=True)