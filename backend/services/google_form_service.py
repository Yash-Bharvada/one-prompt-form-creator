from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from models import FormSchema, FormQuestion
from typing import Dict, Any, Tuple


class GoogleFormService:
    """Service class for creating Google Forms via API"""
    
    def __init__(self, access_token: str):
        """
        Initialize the service with user's access token
        
        Args:
            access_token: User's OAuth access token
        """
        self.credentials = Credentials(token=access_token)
        self.service = build('forms', 'v1', credentials=self.credentials)
    
    def create_form(self, form_schema: FormSchema) -> Tuple[str, str]:
        """
        Create a Google Form from schema using batchUpdate
        
        Args:
            form_schema: FormSchema object with form structure
            
        Returns:
            Tuple of (form_url, form_id)
        """
        # Step 1: Create blank form
        form = {
            "info": {
                "title": form_schema.title,
                "documentTitle": form_schema.title
            }
        }
        
        result = self.service.forms().create(body=form).execute()
        form_id = result["formId"]
        
        # Step 2: Build batchUpdate request with all questions
        requests = []
        
        # Add description if provided
        if form_schema.description:
            requests.append({
                "updateFormInfo": {
                    "info": {
                        "description": form_schema.description
                    },
                    "updateMask": "description"
                }
            })
        
        # Add each question
        for idx, question in enumerate(form_schema.questions):
            request = self._build_question_request(question, idx)
            requests.append(request)
        
        # Execute batchUpdate
        if requests:
            self.service.forms().batchUpdate(
                formId=form_id,
                body={"requests": requests}
            ).execute()
        
        # Construct form URL
        form_url = f"https://docs.google.com/forms/d/{form_id}/edit"
        
        return form_url, form_id
    
    def _build_question_request(self, question: FormQuestion, index: int) -> Dict[str, Any]:
        """
        Build a batchUpdate request for a single question
        
        Args:
            question: FormQuestion object
            index: Question index
            
        Returns:
            Request dictionary for batchUpdate
        """
        location = {"index": index}
        
        # Base question structure
        item = {
            "title": question.title,
            "questionItem": {
                "question": {
                    "required": question.required
                }
            }
        }
        
        # Map question type to Google Forms API format
        if question.question_type == "TEXT":
            item["questionItem"]["question"]["textQuestion"] = {}
            
        elif question.question_type == "MULTIPLE_CHOICE":
            # MULTIPLE_CHOICE maps to choiceQuestion with type RADIO
            if not question.options:
                raise ValueError(f"MULTIPLE_CHOICE question '{question.title}' requires options")
            
            item["questionItem"]["question"]["choiceQuestion"] = {
                "type": "RADIO",
                "options": [{"value": opt} for opt in question.options]
            }
            
        elif question.question_type == "CHECKBOX":
            # CHECKBOX maps to choiceQuestion with type CHECKBOX
            if not question.options:
                raise ValueError(f"CHECKBOX question '{question.title}' requires options")
            
            item["questionItem"]["question"]["choiceQuestion"] = {
                "type": "CHECKBOX",
                "options": [{"value": opt} for opt in question.options]
            }
        else:
            raise ValueError(f"Unsupported question type: {question.question_type}")
        
        return {
            "createItem": {
                "item": item,
                "location": location
            }
        }
