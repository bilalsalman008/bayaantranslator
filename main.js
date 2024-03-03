const transcriptionElement = document.getElementById('transcription');
const translationElement = document.getElementById('translation');
const startButton = document.getElementById('startButton');

let recognition;

let isTranslating = false;

function initializeRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'auto'; // Let the browser detect the language
    recognition.continuous = true;

    recognition.onresult = function (event) {
        const transcript = event.results[event.results.length - 1][0].transcript;
        transcriptionElement.innerText = `Transcription: ${transcript}`;

        if (isTranslating) {
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
    };

    recognition.onend = function () {
        if (isTranslating) {
            initializeRecognition();
            setTimeout(() => {
                recognition.start();
            }, 1000);
        }
    };
}

initializeRecognition();

startButton.addEventListener('click', function () {
    const button = document.getElementById("startButton");

    if (button.textContent === "Start Recording") {
        button.textContent = "Stop Translating";
        isTranslating = true;

        if (recognition) {
            recognition.start();
        } else {
            initializeRecognition();
            recognition.start();
        }

        button.style.backgroundColor = 'red';
    } else {
        button.textContent = "Start Recording";
        isTranslating = false;
        recognition.stop();

        button.style.backgroundColor = '';
    }
});

async function translateText(text, targetLanguage) {
    const apiUrl = '/translate'; // Assuming your server is serving the translation route

    try {
        translationElement.innerText = 'Translation: Loading...';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                sourceLanguage: 'auto', // Let the server detect the source language
                targetLanguage: targetLanguage,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.translations || !data.data.translations[0] || !data.data.translations[0].translatedText) {
            throw new Error('Translation response is missing expected data.');
        }

        return data.data.translations[0].translatedText;
    } catch (err) {
        console.error('Translation error:', err);
        throw new Error('Translation failed. Please try again.');
    } finally {
        // Hide loading spinner or other feedback
    }
}
