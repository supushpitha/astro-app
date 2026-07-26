import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, # <-- CHANGE THIS TO FALSE
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
    prompt = f"""Act as an ancient, mystical Vedic astrologer. The user has provided birth details for two people: {payload.data}. 
    Write a detailed cosmic compatibility report. 
    CRITICAL: You MUST include a 4x4 HTML table representing a traditional South Indian Vedic astrology chart for both individuals. 
    Assign the class 'vedic-chart' to the tables, and assign the class 'empty-cell' to the 4 middle squares of the grid. 
    Use HTML tags like  and 

. Keep it mystical, structured, and visually clean. Generate another one from Sinhalese language too"""
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
       model="llama-3.1-8b-instant",
    )
    
    return {"report": chat_completion.choices[0].message.content}
