# ELI12 - Explain Like I'm 12

## Overview

ELI12 is an educational web application that simplifies complex topics into easy-to-understand explanations suitable for 12-year-olds. The application uses Google's Gemini AI to generate explanations and provides translation capabilities to Nepali. It features a colorful, kid-friendly interface with animated bubbles and supports both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla HTML, CSS, and JavaScript
- **Design Pattern**: Multi-page application with shared navigation and styling
- **UI Framework**: Custom CSS with Poppins font family from Google Fonts
- **Responsive Design**: Mobile-first approach with hamburger menu for smaller screens
- **Theme Support**: Dark/light mode toggle with localStorage persistence
- **Animation System**: Custom bubble animation using JavaScript intervals

### Backend Architecture
- **Framework**: Flask with Python
- **API Design**: RESTful endpoints for explanation generation and translation
- **Service Layer**: Dedicated `GeminiService` class for AI integration
- **CORS**: Enabled for cross-origin requests
- **Error Handling**: Comprehensive exception handling with detailed error responses
- **Entry Point**: Separate `main.py` for application startup

### Key Components
- **Explanation Generation**: `/generate-explanation` POST endpoint
- **Translation Service**: `/translate` POST endpoint for English to Nepali translation
- **State Management**: Client-side state tracking for language switching
- **Mobile Navigation**: Collapsible menu system for mobile devices

### Design Patterns
- **Separation of Concerns**: Clear separation between AI service logic and Flask routes
- **Configuration Management**: Environment-based configuration for API keys
- **Progressive Enhancement**: Base functionality works without JavaScript, enhanced with interactive features

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI service for generating explanations and translations
  - Model: gemini-2.5-flash
  - API Key: Required via GEMINI_API_KEY environment variable
  - Library: `google.genai` Python package

### Frontend Dependencies
- **Google Fonts**: Poppins font family for consistent typography
- **No JavaScript Frameworks**: Pure vanilla JavaScript implementation

### Backend Dependencies
- **Flask**: Web framework for Python
- **Flask-CORS**: Cross-origin resource sharing support
- **Python Logging**: Built-in logging for debugging and monitoring

### Environment Requirements
- **GEMINI_API_KEY**: Required environment variable for AI service authentication
- **SESSION_SECRET**: Optional environment variable for Flask sessions (defaults to dev key)

### Hosting Configuration
- **Development Server**: Flask development server on port 5000
- **Production Ready**: Configurable host and port settings
- **Debug Mode**: Enabled for development environment