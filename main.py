import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class CosmicRequest(BaseModel):
    service: str
    data: list

@app.post("/api/generate")
async def generate_report(payload: CosmicRequest):
    if payload.service == "porondum":
        prompt = f"Act as an ancient, mystical Vedic astrologer. The user has provided birth details for two people: {payload.data}. Write a 3-paragraph cosmic compatibility report. Use HTML tags like  for bolding and  for paragraph breaks. Keep it mystical but structured."
    elif payload.service == "kendara":
        prompt = f"Act as an ancient Vedic astrologer. Generate a mystical birth chart overview for someone born with these details: {payload.data}. Use HTML formatting like  and ."
    else:
        prompt = f"Act as a Vedic astrologer. Determine an auspicious time based on these event details: {payload.data}. Use HTML formatting."

    # Send the prompt to Groq (using Meta's Llama 3 model)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3-8b-8192",
    )
    
    return {"report": chat_completion.choices[0].message.content}
