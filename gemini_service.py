import os
import logging
from google import genai
from google.genai import types

class GeminiService:
    def __init__(self):
        """Initialize Gemini client with API key from environment"""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=api_key)
        logging.info("Gemini service initialized successfully")
    
    def generate_explanation(self, prompt: str) -> str:
        """Generate explanation using Gemini AI"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            if response.text:
                return response.text
            else:
                raise Exception("Empty response from Gemini")
                
        except Exception as e:
            logging.error(f"Error generating explanation with Gemini: {str(e)}")
            raise Exception(f"Gemini API error: {str(e)}")
    
    def translate_to_nepali(self, text: str) -> str:
        """Translate text to Nepali using Gemini AI"""
        try:
            translation_prompt = f"""
Translate the following English text to Nepali language. 
Maintain the structure and formatting of the original text including:
- Emojis and special characters
- Line breaks and spacing
- Bold text indicators (**text**)
- Any bullet points or numbered lists

English text to translate:
{text}

Please provide only the Nepali translation without any additional comments or explanations.
"""
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=translation_prompt
            )
            
            if response.text:
                return response.text
            else:
                raise Exception("Empty response from Gemini")
                
        except Exception as e:
            logging.error(f"Error translating text with Gemini: {str(e)}")
            raise Exception(f"Gemini translation error: {str(e)}")
