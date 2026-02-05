import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from models import FormSchema
from typing import Optional

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# System instruction for precise JSON output
SYSTEM_INSTRUCTION = """You are a precise form schema generator. Output ONLY valid JSON matching the FormSchema structure. 
No conversational text, no explanations, no markdown code blocks. 
Use exact Google Form item types: TEXT, MULTIPLE_CHOICE, CHECKBOX.

The JSON structure must be:
{
  "title": "Form Title",
  "description": "Form Description",
  "questions": [
    {
      "title": "Question text",
      "question_type": "TEXT|MULTIPLE_CHOICE|CHECKBOX",
      "options": ["option1", "option2"],  // Only for MULTIPLE_CHOICE or CHECKBOX
      "required": true|false
    }
  ]
}"""


def generate_form_schema(prompt: str, max_retries: int = 3, api_key: str = None) -> Optional[FormSchema]:
    """
    Generate form schema from natural language prompt using Gemini 3 Pro
    
    Args:
        prompt: Natural language description of the form
        max_retries: Maximum number of retry attempts if JSON parsing fails
        api_key: Optional custom API key. If None, uses default from env.
        
    Returns:
        FormSchema object or None if generation fails
    """
    
    # Use provided key or fallback to env var
    key_to_use = api_key if api_key else GEMINI_API_KEY
    
    if not key_to_use:
        print("Error: No Gemini API Key found")
        return None
        
    genai.configure(api_key=key_to_use)
    
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",  # Using stable Flash model
        generation_config={
            "temperature": 0.1,  # Low temperature for deterministic output
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        },
        system_instruction=SYSTEM_INSTRUCTION
    )
    
    for attempt in range(max_retries):
        try:
            # Generate content
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                # Extract JSON from code block
                lines = response_text.split("\n")
                response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            # Parse JSON
            form_data = json.loads(response_text)
            
            # Validate with Pydantic
            form_schema = FormSchema(**form_data)
            
            return form_schema
            
        except json.JSONDecodeError as e:
            print(f"Attempt {attempt + 1}/{max_retries}: JSON parsing failed - {e}")
            if attempt == max_retries - 1:
                print(f"Raw response: {response_text}")
                return None
                
        except Exception as e:
            print(f"Attempt {attempt + 1}/{max_retries}: Error - {e}")
            if attempt == max_retries - 1:
                return None
    
    return None


def test_gemini_connection() -> bool:
    """Test Gemini API connectivity"""
    try:
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        response = model.generate_content("Say 'connected' if you can read this.")
        return "connected" in response.text.lower()
    except Exception as e:
        print(f"Gemini connection test failed: {e}")
        return False
