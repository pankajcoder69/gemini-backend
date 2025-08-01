// Bubble animation
const colors = ['#ff006e', '#8338ec', '#3a86ff', '#fb5607', '#ffbe0b'];
let bubbleInterval;

const createBubble = () => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.width = `${Math.random() * 40 + 20}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 6000);
};

// Start bubble animation
bubbleInterval = setInterval(createBubble, 800);

// DOM elements
const topicInput = document.getElementById('topicInput');
const explainButton = document.getElementById('getExplanation');
const explanationOutput = document.getElementById('resultBox');
const loadingIndicator = document.getElementById('loader');
const translateButton = document.getElementById('translateButton');
const loadingTranslation = document.getElementById('Tloader');
const clearInputButton = document.getElementById('clearInput');
const listenButton = document.getElementById('listenButton');
const mobileMenuToggle = document.getElementById('mobile-menu');
const mobileNavLinks = document.getElementById('mobileNavLinks');
const errorMessageDiv = document.getElementById('errorMessage');

// State variables
let lastEnglishExplanation = '';
let isSpeaking = false;
let currentUtterance = null;
let currentDisplayLanguage = 'en';

translateButton.style.display = "none";


let scrollListenerAdded = false;

if (mobileMenuToggle && mobileNavLinks) {
    // Open/Close menu on toggle click
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();

        const isActive = mobileNavLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');

        if (isActive) {
            document.body.classList.add('menu-open');

            if (!scrollListenerAdded) {
                window.addEventListener('scroll', closeMenu);
                scrollListenerAdded = true;
            }
        } else {
            closeMenu();
        }
    });

    // Close menu on clicking outside
    document.addEventListener('click', (e) => {
        if (
            mobileNavLinks.classList.contains('active') &&
            !mobileNavLinks.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)
        ) {
            closeMenu();
        }
    });

    // Close menu on clicking any link
    mobileNavLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    function closeMenu() {
        mobileNavLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');

        if (scrollListenerAdded) {
            window.removeEventListener('scroll', closeMenu);
            scrollListenerAdded = false;
        }
    }
}


// Helper function to animate loader text
const animateLoaderText = (loaderElement, text) => {
    if (!loaderElement) return;
    
    loaderElement.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        const charSpan = document.createElement('span');
        if (text[i] === ' ') {
            charSpan.innerHTML = '&nbsp;';
        } else {
            charSpan.textContent = text[i];
        }
        charSpan.style.animationDelay = `${i * 0.05}s`;
        loaderElement.appendChild(charSpan);
    }
    loaderElement.style.display = 'flex';
};

// Contact form functionality (only on contact page)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                contactForm.reset();
                if (successMsg) {
                    successMsg.style.display = 'block';
                    setTimeout(() => successMsg.style.display = 'none', 5000);
                }
                if (errorMsg) errorMsg.style.display = 'none';
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) {
                errorMsg.style.display = 'block';
                setTimeout(() => errorMsg.style.display = 'none', 5000);
            }
        }
    });
}

// Main app functionality (only on index page)
if (topicInput && explainButton) {
    // Reset UI function
    const resetUI = () => {
        explanationOutput.innerHTML = "Ready to understand in the easiest way?? <strong>Study smarter not harder.</strong>";
        explanationOutput.classList.remove('animated');
        if (errorMessageDiv) errorMessageDiv.style.display = 'none';
        if (translateButton) translateButton.style.display = 'none';
        if (listenButton) {
            listenButton.style.display = 'none';
            listenButton.disabled = true;
            listenButton.textContent = 'Listen Text';
        }
        lastEnglishExplanation = '';
        currentDisplayLanguage = 'en';
        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
        }
    };

    const scrollToResult = () => {
        const resultContainer = document.querySelector('.result-container');
        if (resultContainer) {
            const buffer = 80; // how much space to leave at the top
            const position = resultContainer.offsetTop - buffer;

            window.scrollTo({ top: position, behavior: 'smooth' });
        }
    };


    // Display error function
    const displayError = (message) => {
        if (errorMessageDiv) {
            errorMessageDiv.innerHTML = `${message} <a href="#" id="tryAgainLink">Try Again</a>`;
            errorMessageDiv.style.display = 'block';
            const tryAgainLink = document.getElementById('tryAgainLink');
            if (tryAgainLink) {
                tryAgainLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    errorMessageDiv.style.display = 'none';
                    generateExplanation();
                });
            }
        }
        resetUI();
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (loadingTranslation) loadingTranslation.style.display = 'none';
        explainButton.disabled = false;
        if (translateButton) translateButton.disabled = true;
        if (listenButton) listenButton.disabled = true;
    };

    // Function to handle the explanation generation
const generateExplanation = async () => {
    const topic = topicInput.value.trim();
    if (!topic) {
        displayError('Please enter a topic to explain.');
        return;
    }

    explanationOutput.innerHTML = '';
    explanationOutput.classList.remove('animated');
    if (errorMessageDiv) errorMessageDiv.style.display = 'none';
    
    animateLoaderText(loadingIndicator, "Explaining like you're 12 years old...");
    if (loadingTranslation) loadingTranslation.style.display = 'none';
    
    explainButton.disabled = true;
    if (translateButton) translateButton.disabled = true;
    if (listenButton) {
        listenButton.disabled = true;
        listenButton.style.display = 'none';
    }
    
    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        if (listenButton) listenButton.textContent = 'Listen Text';
    }

    try {
        const prompt = `Generate an explanation for "${topic}" in the following structured format, suitable for a 12-year-old with low conceptual knowledge. Ensure the explanation is fun, conceptual, and uses relevant examples and metaphors. Keep the explanation part less than 100 words not including the fun facts and quizes. Keep the fun facts very short like less than 9 words and keep the facts funny and visualization less than 40 words. Do not add the ** in the topic and main heading. Use emojis where appropriate:

🔍 Topic: ${topic}

🎈 Explanation (Like I'm 12):
[Provide a fun, easy-to-understand explanation using simple language, analogies, and metaphors.]

🖼️ Visual Imagination:
[Describe a simple scenario or image that helps visualize the concept.]

🧪 Quick Quiz:
[Create 4 simple quiz questions. Include 2 multiple-choice questions with 4 options (a, b, c, d) and 2 true/false question. Provide the correct answer for each question, prefixed with "➤ Correct: ".]

😄 Fun Fact:
[Include 2,3 interesting and engaging fun facts related to the topic.]`;

        // We now send the full, structured prompt to the backend
        const response = await fetch('http://localhost:5000/generate-explanation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorDetail = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorDetail.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();

        if (result.explanation) {
            const text = result.explanation;
            
            explanationOutput.innerHTML = text;
            explanationOutput.classList.add('animated');
            lastEnglishExplanation = text;
            if (translateButton) translateButton.style.display = 'block';
            if (listenButton) {
                listenButton.style.display = 'block';
                listenButton.disabled = false;
                listenButton.textContent = 'Listen Text';
            }
            currentDisplayLanguage = 'en';
            
            setTimeout(() => {
                scrollToResult();
            }, 300);
        } else {
            displayError('Could not generate an explanation. Please try again with a different topic.');
        }

    } catch (error) {
        console.error('Error fetching explanation:', error);
        displayError(`Failed to get explanation: ${error.message}.`);
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        explainButton.disabled = false;
        if (translateButton) translateButton.disabled = false;
    }
};


    // Translate to Nepali function
    // =================================================================================
// Translation and Text-to-Speech (TTS)
// =================================================================================

const translateExplanation = async () => {
    // If we've already translated this, don't make another API call
    if (currentDisplayLanguage === 'en' && lastNepaliExplanation) {
        explanationOutput.innerHTML = lastNepaliExplanation;
        translateButton.textContent = 'Translate to English';
        currentDisplayLanguage = 'ne';
        return;
    }

    if (!lastEnglishExplanation) {
        displayError('No explanation to translate. Please generate one first.');
        return;
    }

    explanationOutput.innerHTML = '';
    explanationOutput.classList.remove('animated');
    if (errorMessageDiv) errorMessageDiv.style.display = 'none';

    animateLoaderText(loadingTranslation, "Translating to Nepali...");
    if (loadingIndicator) loadingIndicator.style.display = 'none';

    explainButton.disabled = true;
    if (translateButton) translateButton.disabled = true;
    if (listenButton) {
        listenButton.disabled = true;
        listenButton.style.display = 'none';
    }

    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        if (listenButton) listenButton.textContent = 'Listen Text';
    }

    try {
        // We now send the text to be translated to the backend
        const response = await fetch('http://localhost:5000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: lastEnglishExplanation, target_lang: 'ne' })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.translation;

        loadingTranslation.style.display = 'none';

        if (translatedText) {
            explanationOutput.innerHTML = translatedText;
            lastNepaliExplanation = translatedText;
            translateButton.textContent = 'Translate to English';
            currentDisplayLanguage = 'ne';
        } else {
            throw new Error('Translation failed');
        }

    } catch (error) {
        console.error('Translation error:', error);
        loadingTranslation.style.display = 'none';
        displayError('Failed to translate. Please try again.');
    } finally {
        if (loadingTranslation) loadingTranslation.style.display = 'none';
        explainButton.disabled = false;
        if (translateButton) translateButton.disabled = false;
    }
};

    // Clean text for speech synthesis
    const cleanTextForSpeech = (text) => {
        return text
            .replace(/[🔍🎈🖼️🧪😄]/g, '') // Remove emojis
            .replace(/➤\s*Correct:/g, 'Correct answer:')
            .replace(/\*\*/g, '') // Remove markdown bold
            .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
            .replace(/\n/g, ' ') // Replace single newlines with spaces
            .trim();
    };

    // Text-to-speech functionality
    const toggleSpeech = () => {
        if (!explanationOutput || explanationOutput.innerHTML.includes("Ready to understand")) {
            return;
        }

        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
            if (listenButton) listenButton.textContent = 'Listen Text';
        } else {
            const textToSpeak = cleanTextForSpeech(explanationOutput.textContent);
            currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
            
            // Set language based on current display language
            currentUtterance.lang = currentDisplayLanguage === 'ne' ? 'ne-NP' : 'en-US';
            currentUtterance.rate = 0.8;
            currentUtterance.pitch = 1;
            currentUtterance.volume = 1;

            currentUtterance.onstart = () => {
                isSpeaking = true;
                if (listenButton) listenButton.textContent = 'Stop';
            };

            currentUtterance.onend = () => {
                isSpeaking = false;
                if (listenButton) listenButton.textContent = 'Listen Text';
            };

            currentUtterance.onerror = () => {
                isSpeaking = false;
                if (listenButton) listenButton.textContent = 'Listen Text';
            };

            speechSynthesis.speak(currentUtterance);
        }
    };

    // Event listeners
    explainButton.addEventListener('click', generateExplanation);
    
    if (translateButton) {
        translateButton.addEventListener('click', translateToNepali);
    }
    
    if (listenButton) {
        listenButton.addEventListener('click', toggleSpeech);
    }

    if (clearInputButton) {
        clearInputButton.addEventListener('click', () => {
            topicInput.value = '';
            topicInput.focus();
        });
    }

    // Enter key support
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateExplanation();
        }
    });

    // Show/hide clear button based on input
    topicInput.addEventListener('input', () => {
        if (clearInputButton) {
            clearInputButton.style.display = topicInput.value ? 'block' : 'none';
        }
    });
}

// Cleanup speech on page unload
window.addEventListener('beforeunload', () => {
    if (isSpeaking) {
        speechSynthesis.cancel();
    }
});

// Handle visibility change to pause speech when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isSpeaking) {
        speechSynthesis.pause();
    } else if (!document.hidden && isSpeaking) {
        speechSynthesis.resume();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');

    const setDarkMode = (enable) => {
        if (enable) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (darkModeToggle) darkModeToggle.textContent = '☀️';
            if (darkModeToggleMobile) darkModeToggleMobile.innerHTML = '<span>☀️</span> Light Mode';
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (darkModeToggle) darkModeToggle.textContent = '🌙';
            if (darkModeToggleMobile) darkModeToggleMobile.innerHTML = '<span>🌙</span> Dark Mode';
        }
    };

    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            setDarkMode(!body.classList.contains('dark-mode'));
        });
    }

    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('click', () => {
            setDarkMode(!body.classList.contains('dark-mode'));
        });
    }
});

