import google.generativeai as genai
from app.core.config import settings

def get_ai_response(prompt: str) -> str:
    if not settings.GEMINI_API_KEY:
        return "AI features are currently unavailable. Please configure the GEMINI_API_KEY."
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"

def get_replenishment_analysis(low_stock_items: list) -> str:
    if not low_stock_items:
        return "All inventory levels are healthy. No replenishment needed."
        
    prompt = f"""
    As an expert pharmacy operations assistant, analyze the following low-stock items and provide a brief, actionable replenishment recommendation.
    Consider that these are for a regional pharmacy chain.
    
    Low stock items:
    {low_stock_items}
    
    Provide a concise summary and next steps.
    """
    return get_ai_response(prompt)
