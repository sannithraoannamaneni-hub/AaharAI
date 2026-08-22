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

    data = request.get_json()

    user_message = data.get("message", "").strip()

    user_profile = data.get("profile", {})

    if not user_message:
        return jsonify({
            "reply": "Please enter a message."
        }), 400

    try:

        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": """
You are AaharAI, an AI assistant specializing in Indian diet,
nutrition, and fitness.

Your goal is to provide practical guidance using familiar Indian
foods and eating habits.

Prefer Indian food options such as rice, roti, dal, idli, dosa,
sambar, poha, upma, curd, paneer, chana, rajma, vegetables,
fruits, nuts, and regional Indian foods when appropriate.

Do not assume that users need Western foods such as oats,
avocado, quinoa, or peanut butter.

Give balanced, practical suggestions rather than extreme diets.

For health conditions, serious symptoms, pregnancy, eating
disorders, or medical treatment, recommend consulting a qualified
doctor or registered dietitian.

Keep responses clear, practical, and easy to read on a mobile screen.

Prefer headings, bullet points, and numbered lists.

Avoid Markdown tables because they may not display well on small screens.
Do not use Markdown tables.
Use headings, bullet points, and numbered lists instead.

Do not use excessive formatting.

Do not make unsupported claims such as saying a food or spice "boosts metabolism".
Do not provide exact calorie or nutrient targets unless they are
clearly presented as approximate estimates.

Do not claim that a specific food, spice, drink, or habit directly
causes weight loss or boosts metabolism.

Avoid presenting general wellness habits such as lemon water as
necessary for weight loss.

Focus on balanced meals, appropriate portions, variety, vegetables,
protein sources, whole grains, and sustainable eating habits.

When giving portion suggestions, explain that individual needs vary.

Never diagnose medical conditions or prescribe medical treatment.
Avoid unsupported health or metabolism claims.

Do not claim that individual foods "boost metabolism",
"burn fat", "detox", or directly cause weight loss.

Present nutrition information as general guidance rather
than medical advice.
"""
                },
                {
    "role": "user",
    "content": f"""
User profile:

Age: {user_profile.get("age", "Not provided")}
Height: {user_profile.get("height", "Not provided")} cm
Weight: {user_profile.get("weight", "Not provided")} kg
Goal: {user_profile.get("goal", "Not provided")}
Diet preference: {user_profile.get("diet", "Not provided")}
Activity level: {user_profile.get("activity", "Not provided")}
Indian food preference: {user_profile.get("region", "Not provided")}
Food restrictions/preferences: {user_profile.get("limitations", "None provided")}

User's question:
{user_message}

Use the profile to make your response relevant and practical.

Do not make a medical diagnosis or prescribe treatment.
"""
}
            ],
            temperature=0.7,
            max_tokens=6000
        )

        ai_reply = completion.choices[0].message.content

        print("AI RESPONSE:", repr(ai_reply))

        return jsonify({
    "reply": ai_reply or "I received your message, but the AI returned an empty response."
    })

    except Exception as e:

        print("Groq API error:", e)

        return jsonify({
            "reply": "Sorry, I'm having trouble connecting to my AI service right now. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)