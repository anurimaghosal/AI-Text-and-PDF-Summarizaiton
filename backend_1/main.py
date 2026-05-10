from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from transformers import pipeline
from pdf_handler import extract_text_from_pdf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load summarization model
summarizer = pipeline(
    "summarization",
    model="sshleifer/distilbart-cnn-12-6"
)

# Request model
class TextRequest(BaseModel):
    text: str


# =========================
# TEXT SUMMARIZATION ROUTE
# =========================
@app.post("/summarize")
def summarize_text(request: TextRequest):

    text = request.text.strip()

    # Limit text size
    text = text[:1000]

    # Small text check
    if len(text.split()) < 20:
        return {"summary": "Please enter more text"}

    # Generate summary
    result = summarizer(
        text,
        max_length=80,
        min_length=30,
        truncation=True
    )

    return {"summary": result[0]["summary_text"]}


# =========================
# PDF SUMMARIZATION ROUTE
# =========================
@app.post("/summarize-pdf")
async def summarize_pdf(file: UploadFile = File(...)):

    try:
        # Read uploaded PDF
        pdf_bytes = await file.read()

        # Extract text from PDF
        text = extract_text_from_pdf(pdf_bytes)

        text = text.strip()

        print("Extracted Text Length:", len(text))
        print(text[:500])

        # IMPORTANT: limit text size
        text = text[:1000]

        # Small text check
        if len(text.split()) < 20:
            return {
                "summary": "Not enough readable text found in PDF"
            }

        # Generate summary
        result = summarizer(
            text,
            max_length=80,
            min_length=30,
            truncation=True
        )

        return {"summary": result[0]["summary_text"]}

    except Exception as e:
        print("PDF ERROR:", str(e))
        return {"summary": f"Error processing PDF: {str(e)}"}