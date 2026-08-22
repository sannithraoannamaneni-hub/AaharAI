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


    // Show message
    addMessage(
        "Please create my personalized 7-day Indian diet and fitness plan.",
        "user"
    );


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
Create a detailed personalized 7-day Indian diet and fitness plan.

The plan must cover:

Day 1 through Day 7.

For each day include:
- Breakfast
- Mid-morning snack
- Lunch
- Evening snack
- Dinner
- Water/hydration suggestion
- Simple exercise/workout

Use Indian foods and respect the user's diet preference, region preference, activity level, goal, and food restrictions.

Keep portions practical and suitable for the user's profile.

User profile:

Age: ${userProfile.age}
Height: ${userProfile.height} cm
Weight: ${userProfile.weight} kg
Goal: ${userProfile.goal}
Diet: ${userProfile.diet}
Activity level: ${userProfile.activity}
Indian food preference: ${userProfile.region}
Food restrictions/preferences: ${userProfile.limitations || "None specified"}

Format the response clearly with headings for Day 1 through Day 7.
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


        // Display the generated plan
        addMessage(
            data.reply,
            "bot"
        );


    } catch (error) {

        console.error(
            "7-Day Plan error:",
            error
        );


        addMessage(
            "Sorry, I couldn't generate your 7-day plan right now. Please make sure the AaharAI backend is running.",
            "bot"
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