document.addEventListener('DOMContentLoaded', () => {
    const transcriptionElement = document.getElementById('transcription');
    const translationElement = document.getElementById('translation');
    const startButton = document.getElementById('startButton');

    let recognition;
    let isTranslating = false;

    function initializeRecognition() {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US'; // Set the source language (e.g., English)
        recognition.continuous = true; // Enable continuous mode

        recognition.onresult = function (event) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            transcriptionElement.innerText = `Transcription: ${transcript}`;

            if (isTranslating) {
                // Translate the transcript to English using Google Cloud Translation API
                translateText(transcript, 'en').then(result => {
                    translationElement.innerText = `Translation: ${result}`;
                }).catch(err => {
                    console.error('Translation error:', err);
                    translationElement.innerText = 'Translation: Error. Please try again.';
                });
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
    const apiKey = 'AIzaSyD7fEM_TUF-_vxagdZGzdf3-XsLfPkOnXo';
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        // Display loading spinner or other feedback
        translationElement.innerText = 'Translation: Loading...';

        // Log request payload
        console.log('Request Payload:', JSON.stringify({ q: text, source: 'auto', target: targetLanguage }));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'auto',
                target: targetLanguage,
            }),
        });

        // Log response details
        console.log('Response Status:', response.status);
        const responseData = await response.json();
        console.log('Response Body:', responseData);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}. Error: ${responseData.error.message}`);
        }

        if (!responseData.data || !responseData.data.translations || !responseData.data.translations[0] || !responseData.data.translations[0].translatedText) {
            throw new Error('Translation response is missing expected data.');
        }

        return responseData.data.translations[0].translatedText;
    } catch (err) {
        console.error('Translation error:', err);
        throw new Error('Translation failed. Please try again.');
    } finally {
        // Hide loading spinner or other feedback
    }
}




});
