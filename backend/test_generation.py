"""
Test script for verifying Gemini API and form generation logic
Run this before deploying to verify your setup
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from services.gemini_service import generate_form_schema, test_gemini_connection
from models import FormSchema

# Load environment variables
load_dotenv()

def test_env_configuration():
    """Test that all required environment variables are set"""
    print("=" * 60)
    print("Testing Environment Configuration")
    print("=" * 60)
    
    required_vars = [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GEMINI_API_KEY",
        "MONGODB_URI",
        "SECRET_KEY"
    ]
    
    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if not value or value.startswith("your_"):
            missing.append(var)
            print(f"❌ {var}: NOT SET")
        else:
            # Show partial value for security
            masked = value[:8] + "..." if len(value) > 8 else "***"
            print(f"✓ {var}: {masked}")
    
    if missing:
        print(f"\n⚠️  Missing variables: {', '.join(missing)}")
        print("Please update your .env file with actual values")
        return False
    else:
        print("\n✓ All environment variables configured")
        return True


def test_gemini_api():
    """Test Gemini API connectivity"""
    print("\n" + "=" * 60)
    print("Testing Gemini API Connection")
    print("=" * 60)
    
    if test_gemini_connection():
        print("✓ Gemini API connection successful")
        return True
    else:
        print("❌ Gemini API connection failed")
        print("Please check your GEMINI_API_KEY")
        return False


def test_form_generation():
    """Test form schema generation with sample prompts"""
    print("\n" + "=" * 60)
    print("Testing Form Schema Generation")
    print("=" * 60)
    
    test_prompts = [
        "Create a simple contact form with name and email",
        "Event registration with name, email, t-shirt size (S, M, L, XL), and dietary restrictions (Vegetarian, Vegan, Gluten-Free)",
        "Customer feedback survey with rating (1-5 multiple choice) and comments"
    ]
    
    results = []
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\nTest {i}: {prompt}")
        print("-" * 60)
        
        schema = generate_form_schema(prompt)
        
        if schema:
            print(f"✓ Generated successfully")
            print(f"  Title: {schema.title}")
            print(f"  Questions: {len(schema.questions)}")
            for j, q in enumerate(schema.questions, 1):
                print(f"    {j}. {q.title} ({q.question_type})")
                if q.options:
                    print(f"       Options: {', '.join(q.options)}")
            results.append(True)
        else:
            print(f"❌ Generation failed")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n{'=' * 60}")
    print(f"Success Rate: {success_rate:.0f}% ({sum(results)}/{len(results)})")
    
    return all(results)


def test_pydantic_validation():
    """Test Pydantic model validation"""
    print("\n" + "=" * 60)
    print("Testing Pydantic Model Validation")
    print("=" * 60)
    
    # Test valid schema
    try:
        valid_schema = FormSchema(
            title="Test Form",
            description="Test Description",
            questions=[
                {
                    "title": "Name",
                    "question_type": "TEXT",
                    "required": True
                },
                {
                    "title": "Rating",
                    "question_type": "MULTIPLE_CHOICE",
                    "options": ["1", "2", "3", "4", "5"],
                    "required": True
                }
            ]
        )
        print("✓ Valid schema accepted")
    except Exception as e:
        print(f"❌ Valid schema rejected: {e}")
        return False
    
    # Test invalid schema (missing options for MULTIPLE_CHOICE)
    try:
        invalid_schema = FormSchema(
            title="Test Form",
            description="Test",
            questions=[
                {
                    "title": "Rating",
                    "question_type": "MULTIPLE_CHOICE",
                    "required": True
                    # Missing options!
                }
            ]
        )
        print("⚠️  Invalid schema accepted (should have been rejected)")
        return False
    except Exception:
        print("✓ Invalid schema correctly rejected")
    
    return True


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("ONE-PROMPT GOOGLE FORM CREATOR - PRE-DEPLOYMENT TESTS")
    print("=" * 60 + "\n")
    
    tests = [
        ("Environment Configuration", test_env_configuration),
        ("Gemini API Connection", test_gemini_api),
        ("Pydantic Validation", test_pydantic_validation),
        ("Form Generation", test_form_generation),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed! You're ready to deploy.")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues before deploying.")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
