import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize the server
app = FastAPI()

# Enable CORS so your GitHub Pages frontend can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup the AI using an Environment Variable (secure way to store keys)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Define the incoming data structure
class CosmicRequest(BaseModel):
    service: str
    data: list

@app.post("/api/generate")
async def generate_report(payload: CosmicRequest):
    # Create a prompt based on the service the user clicked
    if payload.service == "porondum":
        prompt = f"Act as an ancient, mystical Vedic astrologer. The user has provided birth details for two people: {payload.data}. Write a 3-paragraph cosmic compatibility report. Use HTML tags like  for bolding and  for paragraph breaks. Keep it mystical but structured."
    elif payload.service == "kendara":
        prompt = f"Act as an ancient Vedic astrologer. Generate a mystical birth chart overview for someone born with these details: {payload.data}. Use HTML formatting like  and ."
    else:
        prompt = f"Act as a Vedic astrologer. Determine an auspicious time based on these event details: {payload.data}. Use HTML formatting."

    # Send the prompt to Gemini
    response = model.generate_content(prompt)
    
    # Return the AI's text to your frontend
    return {"report": response.text}