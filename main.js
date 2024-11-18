// Check if the API key is already stored in localStorage
let API_KEY = localStorage.getItem("API_KEY");

if (!API_KEY) {
    // If not, prompt the user to enter it
    API_KEY = prompt("Please enter your API key:");
    if (API_KEY) {
        // Save the entered API key to localStorage
        localStorage.setItem("API_KEY", API_KEY);
    } else {
        alert("API key is required to use this application.");
        throw new Error("API key not provided.");
    }
}

// Function to handle form submission and generate suggestions
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    // Collect user input from the form
    const genre = document.getElementById("genre").value;
    const mood = document.getElementById("mood").value;
    const artists = document.getElementById("kunstnere").value;

    // Prepare the prompt for the API
    const userPrompt = `Generate a music proposal based on the following preferences:
    Genre: ${genre}
    Mood: ${mood}
    Favorite Artists: ${artists}. Provide 5 proposals in a numbered list format.`;

    // Fetch suggestions from the API
    fetch("https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            max_tokens: 500,
            stream: false
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Extract the suggestion content
            const suggestion = data.choices[0]?.message?.content || "No suggestion available.";

            // Convert the suggestions into a list format
            const proposals = suggestion.split("\n").filter(line => line.trim() !== ""); // Split into lines
            const proposalList = proposals.map(item => `<li>${item}</li>`).join(""); // Wrap each in <li>

            // Update the content of the proposal-result with a formatted list
            const proposalOutput = document.getElementById("proposal-result");
            proposalOutput.innerHTML = `<ul>${proposalList}</ul>`;

            // Optionally, make the output section visible if it was hidden
            document.getElementById("proposal-output").style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching suggestion:", error);
            document.getElementById("proposal-result").textContent = "An error occurred while fetching suggestions.";
        });
}

// Attach the event listener to the form
document.getElementById("music-form").addEventListener("submit", handleFormSubmit);
