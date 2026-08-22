const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");

const saveProfileButton = document.getElementById("save-profile-btn");
const profileStatus = document.getElementById("profile-status");

const generatePlanButton = document.getElementById("generate-plan-btn");


// ====================================
// USER PROFILE
// ====================================

let userProfile = {};


// ====================================
// SAVE PROFILE
// ====================================

saveProfileButton.addEventListener("click", function () {

    userProfile = {
        age: document.getElementById("age").value,
        height: document.getElementById("height").value,
        weight: document.getElementById("weight").value,
        goal: document.getElementById("goal").value,
        diet: document.getElementById("diet").value,
        activity: document.getElementById("activity").value,
        region: document.getElementById("region").value,
        limitations: document.getElementById("food-limitations").value
    };


    // Validate profile
    if (
        !userProfile.age ||
        !userProfile.height ||
        !userProfile.weight
    ) {

        profileStatus.textContent =
            "⚠️ Please enter your age, height and weight.";

        return;
    }


    // Save profile in browser
    localStorage.setItem(
        "aaharAIProfile",
        JSON.stringify(userProfile)
    );


    profileStatus.textContent =
        "✅ Profile saved! AaharAI will use your preferences.";

    console.log("USER PROFILE:", userProfile);
});


// ====================================
// LOAD SAVED PROFILE
// ====================================

const savedProfile = localStorage.getItem("aaharAIProfile");

if (savedProfile) {

    try {

        userProfile = JSON.parse(savedProfile);

        document.getElementById("age").value =
            userProfile.age || "";

        document.getElementById("height").value =
            userProfile.height || "";

        document.getElementById("weight").value =
            userProfile.weight || "";

        document.getElementById("goal").value =
            userProfile.goal || "general health";

        document.getElementById("diet").value =
            userProfile.diet || "vegetarian";

        document.getElementById("activity").value =
            userProfile.activity || "low";

        document.getElementById("region").value =
            userProfile.region || "South Indian";

        document.getElementById("food-limitations").value =
            userProfile.limitations || "";

        profileStatus.textContent =
            "✅ Saved profile loaded.";

    } catch (error) {

        console.error(
            "Could not load saved profile:",
            error
        );

    }
}


// ====================================
// ADD MESSAGE TO CHAT
// ====================================

function addMessage(message, type) {

    const messageDiv =
        document.createElement("div");

    messageDiv.classList.add("message");


    if (type === "user") {

        messageDiv.classList.add("user-message");

        messageDiv.innerHTML = `
            <strong>You:</strong>
            <p>${escapeHTML(message)}</p>
        `;

    } else {

        messageDiv.classList.add("bot-message");

        messageDiv.innerHTML = `
            <strong>AaharAI:</strong>
            <div>${formatAIResponse(message)}</div>
        `;
    }


    chatBox.appendChild(messageDiv);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ====================================
// FORMAT AI RESPONSE
// ====================================

function formatAIResponse(text) {

    if (!text) {

        return "Sorry, I didn't receive a response from the AI.";
    }


    if (typeof marked !== "undefined") {

        return marked.parse(text, {
            breaks: true
        });

    }


    return escapeHTML(text).replace(
        /\n/g,
        "<br>"
    );
}


// ====================================
// BASIC HTML ESCAPING
// ====================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ====================================
// SEND CHAT MESSAGE
// ====================================

async function sendMessage() {

    const message =
        input.value.trim();


    if (message === "") {
        return;
    }


    // Show user message
    addMessage(
        message,
        "user"
    );


    // Clear input
    input.value = "";


    // Disable button
    sendButton.disabled = true;

    sendButton.textContent =
        "Thinking...";


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        profile: userProfile

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "BACKEND RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.reply ||
                "Backend error"
            );
        }


        addMessage(
            data.reply,
            "bot"
        );


    } catch (error) {

        console.error(
            "AaharAI error:",
            error
        );


        addMessage(
            "Sorry, I couldn't connect to the AaharAI backend. 😕",
            "bot"
        );

    } finally {

        sendButton.disabled =
            false;

        sendButton.textContent =
            "Send";
    }
}


// ====================================
// GENERATE 7-DAY PLAN
// ====================================

async function generateSevenDayPlan() {

    // Make sure profile exists
    if (
        !userProfile.age ||
        !userProfile.height ||
        !userProfile.weight
    ) {

        profileStatus.textContent =
            "⚠️ Please save your profile first.";

        return;
    }


    // Disable button
    generatePlanButton.disabled = true;

    generatePlanButton.textContent =
        "Generating Plan... ⏳";


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: `
Create a complete personalized 7-day Indian diet and fitness plan.

IMPORTANT:
- You MUST provide all 7 days.
- Do NOT stop before Day 7.
- Keep the response concise enough to fit in one response.
- Follow the user's diet preference strictly.
- Follow all food restrictions strictly.
- Never suggest a food that conflicts with the user's diet.
- For vegetarian users, do NOT suggest meat, chicken, fish, or eggs.
- For vegan users, do NOT suggest meat, chicken, fish, eggs, milk, curd, paneer, or other dairy.
- For eggetarian users, eggs are allowed but meat and fish are not allowed.
- For non-vegetarian users, meat, fish, and eggs may be included.
- If the user says "no peanuts", do not recommend peanuts or peanut products.

For each day include:

1. Breakfast
2. Mid-morning snack
3. Lunch
4. Evening snack
5. Dinner
6. Hydration
7. Exercise

User Profile:

Age: ${userProfile.age}
Height: ${userProfile.height} cm
Weight: ${userProfile.weight} kg
Goal: ${userProfile.goal}
Diet Preference: ${userProfile.diet}
Activity Level: ${userProfile.activity}
Indian Food Preference: ${userProfile.region}
Food Restrictions: ${userProfile.limitations || "None"}

Format the response using Markdown.

Start with:

# 🍱 Your Personalized 7-Day Plan

Then provide:

## Day 1
...

## Day 2
...

## Day 3
...

## Day 4
...

## Day 5
...

## Day 6
...

## Day 7
...

Finish with:

## 🌟 Weekly Tips

Provide 3 to 5 short practical tips.

IMPORTANT:
The response MUST contain Day 1, Day 2, Day 3, Day 4, Day 5, Day 6, and Day 7.
Do not stop early.
                        `,

                        profile: userProfile

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "7-DAY PLAN RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.reply ||
                "Could not generate the plan."
            );
        }


        if (!data.reply) {

            throw new Error(
                "The AI returned an empty response."
            );
        }


        // Remove previous plan
        const existingPlan =
            document.getElementById("plan-result");

        if (existingPlan) {
            existingPlan.remove();
        }


        // Create plan section
        const planResult =
            document.createElement("div");

        planResult.id =
            "plan-result";

        planResult.className =
            "plan-result";


        // Add AI response
        planResult.innerHTML =
            formatAIResponse(data.reply);


        // Put plan directly below button
        generatePlanButton.parentElement.appendChild(
            planResult
        );


        // Scroll to plan
        planResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "7-Day Plan error:",
            error
        );


        // Show error inside plan section
        const errorPlan =
            document.createElement("div");

        errorPlan.id =
            "plan-result";

        errorPlan.className =
            "plan-result";


        errorPlan.innerHTML = `
            <h2>⚠️ Unable to Generate Plan</h2>
            <p>
                Sorry, I couldn't generate your 7-day plan right now.
                Please make sure the AaharAI backend is running.
            </p>
            <p>
                <strong>Error:</strong>
                ${escapeHTML(error.message)}
            </p>
        `;


        generatePlanButton.parentElement.appendChild(
            errorPlan
        );

    } finally {

        generatePlanButton.disabled =
            false;

        generatePlanButton.textContent =
            "Generate My 7-Day Plan 🚀";
    }
}


// ====================================
// BUTTON EVENTS
// ====================================

sendButton.addEventListener(
    "click",
    sendMessage
);


generatePlanButton.addEventListener(
    "click",
    generateSevenDayPlan
);


// ====================================
// ENTER KEY
// ====================================

input.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


console.log(
    "AaharAI script loaded successfully."
);