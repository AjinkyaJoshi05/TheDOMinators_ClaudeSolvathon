import anthropic
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("CLAUDE_API_KEY")
if not api_key:
    raise RuntimeError("CLAUDE_API_KEY not found in environment")

client = anthropic.Anthropic(api_key=api_key)

HISTORY_FILE = "history.txt"


def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""


def save_to_history(role, content):
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n\n{role.upper()}: {content.strip()}\n")


def get_response(prompt):
    history = load_history()
    if history:
        prompt = f"""
        You are continuing an ongoing analytical session.

        Below is the conversation history so far (including your prior responses and my prompts):
        {history}

        Now, based on this context, respond thoughtfully to the following new request:
        {prompt}

        Please ensure your reasoning aligns with the prior discussion and maintains analytical continuity.
        """

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1000,
        temperature=0.7,
        messages=[{"role": "user", "content": prompt}],
    )
    
    reply = response.content[0].text
    save_to_history("user", prompt)
    save_to_history("assistant", reply)
    print("Claude 4.5 response:")
    return reply