import os
import logging
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from gemini_service import GeminiService

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# Enable CORS for all routes
CORS(app)

# Initialize Gemini service
gemini_service = GeminiService()

# Static file routes
@app.route('/')
def serve_index():
    """Serve the main index page"""
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    """Serve static files like CSS, JS, and other HTML pages"""
    try:
        return send_file(filename)
    except FileNotFoundError:
        return jsonify({'error': {'message': 'File not found'}}), 404

@app.route('/generate-explanation', methods=['POST'])
def generate_explanation():
    """Generate explanation using Gemini AI"""
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({'error': {'message': 'Missing prompt in request'}}), 400
        
        prompt = data['prompt']
        if not prompt.strip():
            return jsonify({'error': {'message': 'Prompt cannot be empty'}}), 400
        
        # Generate explanation using Gemini
        explanation = gemini_service.generate_explanation(prompt)
        
        return jsonify({'explanation': explanation})
        
    except Exception as e:
        logging.error(f"Error generating explanation: {str(e)}")
        return jsonify({'error': {'message': f'Failed to generate explanation: {str(e)}'}}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate text to Nepali using Gemini AI"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': {'message': 'Missing text in request'}}), 400
        
        text = data['text']
        if not text.strip():
            return jsonify({'error': {'message': 'Text cannot be empty'}}), 400
        
        # Translate text using Gemini
        translated_text = gemini_service.translate_to_nepali(text)
        
        return jsonify({'translation': translated_text})
        
    except Exception as e:
        logging.error(f"Error translating text: {str(e)}")
        return jsonify({'error': {'message': f'Failed to translate text: {str(e)}'}}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'ELI12 backend is running'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': {'message': 'Endpoint not found'}}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': {'message': 'Internal server error'}}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
