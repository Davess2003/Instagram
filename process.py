from fastapi import FastAPI
from pydantic import BaseModel

from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# ------------------------
# App
# ------------------------
app = FastAPI()

# ------------------------
# Presidio setup (loaded ONCE)
# ------------------------
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# SSN recognizer
ssn_pattern = Pattern(
    name="us_ssn",
    regex=r"\b\d{3}-\d{2}-\d{4}\b",
    score=0.85
)

ssn_recognizer = PatternRecognizer(
    supported_entity="US_SSN",
    patterns=[ssn_pattern]
)

analyzer.registry.add_recognizer(ssn_recognizer)

# ------------------------
# Request schema
# ------------------------
class RedactRequest(BaseModel):
    text: str

# ------------------------
# Endpoint
# ------------------------
@app.post("/redact")
def redact_text(payload: RedactRequest):
    text = payload.text

    results = analyzer.analyze(
        text=text,
        language="en",
        entities=None,
        score_threshold=0.0
    )

    anonymized = anonymizer.anonymize(
        text=text,
        analyzer_results=results,
        operators={
            "DEFAULT": OperatorConfig(
                operator_name="replace",
                params={"new_value": "{redacted}"}
            )
        }
    )

    return {
        "redacted_text": anonymized.text
    }
