import os
import json
import pandas as pd
import anthropic
from dotenv import load_dotenv
load_dotenv()  # loads CLAUDE_API_KEY

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

def analyze_dataset(dataset_path, max_tokens=500):
    """
    Reads a dataset and sends top events to Claude for classification.
    Returns a dict with:
        - top5_events
        - classification (per event)
        - summary
    """

    # Load dataset
    try:
        if dataset_path.endswith(".csv"):
            df = pd.read_csv(dataset_path)
        else:
            with open(dataset_path, "r") as f:
                df = pd.DataFrame(json.load(f))
        df = df.fillna(0)
    except Exception as e:
        return {
            "top5_events": [],
            "classification": [],
            "summary": f"Failed to load dataset: {e}"
        }

    # Take top 5 events for context
    top5 = df.head(5).to_dict(orient="records")

    # Build prompt for Claude
    human_prompt = f"""
You are a particle physics AI analyst.

Classify the following events from a dark matter detector dataset.
Use the features to decide particle type: Background, WIMP-like, Axion-like, Sterile neutrino.
Provide:
1. Event label
2. Confidence score (0-1)
3. Brief reasoning for the classification

Top 5 events for context:
{json.dumps(top5, indent=2)}

Return the response as JSON foramt like event Label : value and so on only, with no extra text, markdown, or commentary.
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[{"role": "user", "content": human_prompt}],
        )

        text = response.content[0].text.strip()

        # Remove any code blocks
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:])
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
        text = text.strip()

        try:
            classification = json.loads(text)
        except json.JSONDecodeError:
            classification = {"warning": "Failed to parse Claude response", "raw_text": text}

    except Exception as e:
        classification = {"error": f"Claude API error: {e}"}

    return {
        "top5_events": top5,
        "classification": classification
    }
