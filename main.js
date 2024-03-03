const transcriptionElement = document.getElementById('transcription');
const translationElement = document.getElementById('translation');
const startButton = document.getElementById('startButton');

let recognition;
let isTranslating = false;

function initializeRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US'; // Set the source language (e.g., English)
    recognition.continuous = true; // Enable continuous mode

    recognition.onresult = async function (event) {
        const transcript = event.results[event.results.length - 1][0].transcript;
        transcriptionElement.innerText = `Transcription: ${transcript}`;

        if (isTranslating) {
            // Translate the transcript to English using Microsoft Azure Translator API
            try {
                const result = await translateText(transcript, 'en');
                translationElement.innerText = `Translation: ${result}`;
            } catch (err) {
                console.error('Translation error:', err);
                translationElement.innerText = 'Translation: Error. Please try again.';
            }
        }
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
        // Handle errors, e.g., display an error message to the user
    };

    recognition.onend = function () {
        if (isTranslating) {
            // Re-initialize recognition if it ended unexpectedly
            initializeRecognition();
            // Introduce a delay before restarting to avoid potential issues
            setTimeout(() => {
                recognition.start();
            }, 1000); // Adjust the delay as needed
        }
    };
}

initializeRecognition();

// Add an event listener to the startButton
startButton.addEventListener('click', function () {
    const button = document.getElementById("startButton");

    if (button.textContent === "Start Recording") {
        button.textContent = "Stop Translating";
        isTranslating = true;

        // Start or restart recognition
        if (recognition) {
            recognition.start();
        } else {
            initializeRecognition();
            recognition.start();
        }

        // Add UI feedback, for example:
        button.style.backgroundColor = 'red';
    } else {
        button.textContent = "Start Recording";
        isTranslating = false;
        recognition.stop();

        // Reset UI feedback, for example:
        button.style.backgroundColor = ''; // Reset to default
    }
});

async function translateText(text, targetLanguage) {
    const subscriptionKey = 'a461330c73ed435bacf3a5191b954a82';
    const endpoint = 'https://api.cognitive.microsofttranslator.com/';
    const apiUrl = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;

    try {
        // Display loading spinner or other feedback
        translationElement.innerText = 'Translation: Loading...';

        // Log request payload
        console.log('Request Payload:', JSON.stringify([{ Text: text }]));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey,
            },
            body: JSON.stringify([{ Text: text }]),
        });

        // Log response details
        console.log('Response Status:', response.status);
        const responseData = await response.json();
        console.log('Response Body:', responseData);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}. Error: ${responseData.error.message}`);
        }

        if (!responseData[0] || !responseData[0].translations || !responseData[0].translations[0] || !responseData[0].translations[0].text) {
            throw new Error('Translation response is missing expected data.');
        }

        return responseData[0].translations[0].text;
    } catch (err) {
        console.error('Translation error:', err);
        throw new Error('Translation failed. Please try again.');
    } finally {
        // Hide loading spinner or other feedback
    }
}

