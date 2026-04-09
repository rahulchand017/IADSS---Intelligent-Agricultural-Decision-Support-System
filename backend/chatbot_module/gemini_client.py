import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# try loading .env from backend folder first, then project root
backend_env = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file")

client = Groq(api_key=GROQ_API_KEY)


def generate_response(user_query: str, retrieved_chunks: list[str], model_context: dict = None) -> str:
    knowledge_text = "\n\n".join(retrieved_chunks)

    context_section = ""
    if model_context:
        context_section = "\n\nLIVE MODEL PREDICTIONS (use these in your answer if relevant):\n"
        if model_context.get("disease"):
            context_section += f"- Disease detected: {model_context['disease']['class']} (confidence: {model_context['disease']['confidence']:.1%})\n"
        if model_context.get("price"):
            context_section += f"- Predicted crop price: Rs {model_context['price']['predicted_price']:.0f} per quintal for {model_context['price']['crop']}\n"

    prompt = f"""You are IADSS Assistant, an intelligent agricultural advisor for Indian farmers.
You help farmers with crop disease identification, market prices, fertilizer recommendations,
government schemes, and general farming guidance.

Use the knowledge below to answer the farmer's question. Be practical, simple, and helpful.
If the question is not related to agriculture, politely say you can only help with farming topics.
Keep your answer concise and easy to understand.

RETRIEVED KNOWLEDGE:
{knowledge_text}
{context_section}

FARMER'S QUESTION: {user_query}

ANSWER:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512
    )

    return response.choices[0].message.content.strip()