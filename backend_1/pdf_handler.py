from PyPDF2 import PdfReader
from io import BytesIO

def extract_text_from_pdf(pdf_bytes):

    pdf_file = BytesIO(pdf_bytes)

    reader = PdfReader(pdf_file)

    text = ""

    for page in reader.pages:
        extracted = page.extract_text()

        if extracted:
            text += extracted + " "

    return text