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
    # Inside your POST endpoint function...
    
    if payload.service == "porondum":
        prompt = f"""Act as an ancient, mystical Vedic astrologer. The user has provided birth details for two people: {payload.data}. 
        Write a detailed cosmic compatibility report. 
        CRITICAL: You MUST include a 4x4 HTML table representing a traditional South Indian Vedic astrology chart for both individuals. 
        Assign the class 'vedic-chart' to the tables, and assign the class 'empty-cell' to the 4 middle squares of the grid. 
        Use HTML tags like <b> and <br><br>. Keep it mystical, structured, and visually clean. Add a description in sinhalese language too for both individuals shared future"""
        
    elif payload.service == "kendara":
        prompt = f"""Act as an ancient, mystical Vedic astrologer. The user has provided birth details: {payload.data}. 
        Write a detailed reading of their birth chart.
        CRITICAL: You MUST include a 4x4 HTML table representing a traditional South Indian Vedic astrology chart. 
        Assign the class 'vedic-chart' to the table, and assign the class 'empty-cell' to the 4 middle squares. 
        Use HTML tags. Keep it visually clean."""
        
    elif payload.service == "nakath":
        prompt = f"""Act as an ancient, mystical Vedic astrologer. The user has provided event details: {payload.data}. 
        Determine the most auspicious date and time (Nakath) for this event. 
        Format the response beautifully using HTML tags like <b>, <h3>, and <br><br>."""

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
