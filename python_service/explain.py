# import os
# import json
# import pandas as pd
# import anthropic
# from dotenv import load_dotenv
# load_dotenv()  # loads .env file into os.environ

# def explain_dataset(dataset_path, user_prompt):
#     """
#     Reads the dataset and sends it + user prompt to Claude API for explanation.
#     """
#     # Load dataset
#     if dataset_path.endswith(".csv"):
#         df = pd.read_csv(dataset_path)
#     else:
#         with open(dataset_path, "r") as f:
#             df = pd.DataFrame(json.load(f))

#     df = df.fillna(0)

#     # Prepare top 5 events for context
#     top5 = df.head(5).to_dict(orient="records")

#     # Build prompt for Claude
#     full_prompt = f"""
# You are a particle physics data analyst. 
# The user gave the following instruction: "{user_prompt}"

# Here is a sample of events from the dataset:
# {json.dumps(top5, indent=2)}

# Respond concisely, in human-readable form, directly answering the user's prompt.
# """

#     # Call Claude API
#     client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
#     response = client.messages.create(
#         model="claude-3-haiku-20240307",
#         max_tokens=500,
#         temperature=0.7,
#         messages=[{"role": "user", "content": full_prompt}]
#     )

#     explanation_text = response.content[0].text

#     return {
#         "prompt": user_prompt,
#         "top5_events": top5,
#         "explanation": explanation_text
#     }


import os
import json
import pandas as pd
import anthropic
from dotenv import load_dotenv
load_dotenv()  # loads .env file into os.environ

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

def _request_claude_explain(dataset_path, user_prompt, max_tokens=500):
    """ 
    Calls Claude API to explain a dataset given a user prompt.
    Returns a dict with:
        - top5_events
        - explanation text
        - original prompt
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
            "prompt": user_prompt,
            "top5_events": [],
            "explanation": f"Failed to load dataset: {e}"
        }

    # Take top 5 events for context
    top5 = df.head(5).to_dict(orient="records")

    # Build human-readable prompt for Claude
    human_prompt = f"""
You are a particle physics data analyst.
The user asked: "{user_prompt}"

Here are the top 5 events from the dataset for context:
{json.dumps(top5, indent=2)}

Provide a clear, concise, human-readable explanation.
Focus on:
- Features influencing classification (energy, S1/S2, pulse shape)
- Possible follow-up experiments or checks
- Flagging unusual or novel events if any

Return only plain text, no JSON, no markdown, no extra commentary.
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[{"role": "user", "content": human_prompt}],
        )

        explanation_text = response.content[0].text.strip()

        # Extra safety: if Claude returns code blocks or extra markers, remove them
        if explanation_text.startswith("```"):
            explanation_text = "\n".join(explanation_text.split("\n")[1:])
        if explanation_text.endswith("```"):
            explanation_text = explanation_text.rsplit("```", 1)[0]
        explanation_text = explanation_text.strip()

    except Exception as e:
        explanation_text = f"Claude API error: {e}"

    return {
        "prompt": user_prompt,
        "top5_events": top5,
        "explanation": explanation_text
    }
