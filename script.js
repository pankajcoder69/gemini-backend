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
const mobileMenuToggle = document.getElementById('mobile-menu');
const mobileNavLinks = document.getElementById('mobileNavLinks');
const errorMessageDiv = document.getElementById('errorMessage');

// State variables
let lastEnglishExplanation = '';
let lastNepaliExplanation = '';
let currentDisplayLanguage = 'en';

if (translateButton) {
    translateButton.style.display = "none";
}

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
        lastEnglishExplanation = '';
        lastNepaliExplanation = '';
        currentDisplayLanguage = 'en';
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

        try {
            const prompt = `Generate an explanation for "${topic}" in the following structured format, suitable for a 12-year-old with low conceptual knowledge. Ensure the explanation is fun, conceptual, and uses relevant examples and metaphors. Keep the explanation part less than 100 words not including the fun facts and quizes. Keep the fun facts very short like less than 9 words and keep the facts funny and visualization less than 40 words. Do not add the ** in the topic and main headings. Format the response with proper HTML elements like <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li> for better readability. Use emojis to make it more engaging. IMPORTANT: Do not add extra blank lines or excessive spacing between sections. Keep the format compact.

🔍 Topic: ${topic}
🎈 Explanation (Like I'm 12):
[Provide a fun, easy-to-understand explanation using simple language, analogies, and metaphors.]
🖼️ Visual Imagination:
[Describe a simple scenario or image that helps visualize the concept.]
🧪 Quick Quiz:
[Create 4 simple quiz questions. Include 2 multiple-choice questions with 4 options (a, b, c, d) and 2 true/false question. Provide the correct answer for each question, prefixed with "➤ Correct: "]
😄 Fun Fact:
[Include 2,3 interesting and engaging fun facts related to the topic.]`;

            // Send request to Flask backend
            const response = await fetch('/generate-explanation', {
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
                lastNepaliExplanation = '';
                if (translateButton) translateButton.style.display = 'block';
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
    const translateExplanation = async () => {
        // If we're currently showing English and have a cached Nepali translation, use it
        if (currentDisplayLanguage === 'en' && lastNepaliExplanation) {
            explanationOutput.innerHTML = lastNepaliExplanation;
            translateButton.textContent = 'Translate to English';
            currentDisplayLanguage = 'ne';
            return;
        }

        // If we're currently showing Nepali, switch back to English
        if (currentDisplayLanguage === 'ne' && lastEnglishExplanation) {
            explanationOutput.innerHTML = lastEnglishExplanation;
            translateButton.textContent = 'Translate to Nepali';
            currentDisplayLanguage = 'en';
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

        try {
            // Send translation request to Flask backend
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: lastEnglishExplanation })
            });

            if (!response.ok) {
                const errorDetail = await response.json();
                throw new Error(`Translation Error: ${response.status} - ${errorDetail.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.translation) {
                const translatedText = result.translation;
                
                explanationOutput.innerHTML = translatedText;
                explanationOutput.classList.add('animated');
                lastNepaliExplanation = translatedText;
                translateButton.textContent = 'Translate to English';
                currentDisplayLanguage = 'ne';
                
                setTimeout(() => {
                    scrollToResult();
                }, 300);
            } else {
                displayError('Could not translate the explanation. Please try again.');
            }

        } catch (error) {
            console.error('Error translating text:', error);
            displayError(`Failed to translate: ${error.message}.`);
        } finally {
            if (loadingTranslation) loadingTranslation.style.display = 'none';
            explainButton.disabled = false;
            if (translateButton) translateButton.disabled = false;
        }
    };

    // Event listeners
    explainButton.addEventListener('click', generateExplanation);
    
    if (translateButton) {
        translateButton.addEventListener('click', translateExplanation);
    }

    // Enter key functionality
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateExplanation();
        }
    });

    // Clear input functionality
    if (clearInputButton) {
        clearInputButton.addEventListener('click', () => {
            topicInput.value = '';
            topicInput.focus();
            resetUI();
        });

        // Show/hide clear button based on input
        topicInput.addEventListener('input', () => {
            clearInputButton.style.display = topicInput.value.trim() ? 'block' : 'none';
        });
    }
}

// Dark mode functionality
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    
    // Update button text for mobile
    if (darkModeToggleMobile) {
        const span = darkModeToggleMobile.querySelector('span');
        if (span) {
            span.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }
    
    // Update desktop button emoji
    if (darkModeToggle) {
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    }
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

if (darkModeToggleMobile) {
    darkModeToggleMobile.addEventListener('click', toggleDarkMode);
}

// Initialize dark mode button text
document.addEventListener('DOMContentLoaded', () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (darkModeToggleMobile) {
        const span = darkModeToggleMobile.querySelector('span');
        if (span) {
            span.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }
    
    if (darkModeToggle) {
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    }
});
