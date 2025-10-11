from dotenv import load_dotenv
load_dotenv()

import os, uuid, json, time, random
import numpy as np
import pandas as pd
from pathlib import Path
from anthropic import Anthropic

# Initialize Claude client
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
client = Anthropic(api_key=CLAUDE_API_KEY)

# Temp folder for storing datasets
TEMP_FOLDER = Path("public/temp")
TEMP_FOLDER.mkdir(parents=True, exist_ok=True)
FILE_EXPIRATION_SECONDS = 24 * 60 * 60  # 24 hours
MAX_EVENTS_PER_CLAUDE_CALL = 5

PARTICLE_TYPES = ["electron", "proton", "neutron", "alpha", "muon"]

# ----------------- Utilities -----------------
def _cleanup_old_files():
    now = time.time()
    for f in TEMP_FOLDER.iterdir():
        if f.is_file() and now - f.stat().st_mtime > FILE_EXPIRATION_SECONDS:
            try:
                f.unlink()
            except:
                pass

def _generate_mock_events(num_events, event_type):
    events = []
    for i in range(num_events):
        events.append({
            "event_id": i + 1,
            "detector_position_x": np.random.uniform(-1000, 1000),
            "detector_position_y": np.random.uniform(-1000, 1000),
            "detector_position_z": np.random.uniform(-1000, 1000),
            "time_of_event": round(np.random.uniform(0, 1000), 4),
            "mass": np.random.uniform(1e-30, 1e-24),
            "velocity": np.random.uniform(1e3, 1e6),
            "SNR": np.random.uniform(0, 100),
            "overlapping_signal_flag": random.choice([0, 1]),
            "recoil_type": random.choice(["ER", "NR"]),
            "S1": np.random.uniform(0, 100),
            "S2": np.random.uniform(0, 100),
            "recoil_energy": np.random.uniform(0, 50),
            "pulse_shape_detectors": np.random.uniform(0, 1),
            "particle_type": random.choice(PARTICLE_TYPES),
            "event_type": event_type
        })
    return events

# ----------------- Claude request -----------------
def _request_claude_batch(user_input, batch_size):
    prompt = f"""
You are a data generation assistant. Generate {batch_size} synthetic detector events.
Use columns: event_id, detector_position_x, detector_position_y, detector_position_z, 
time_of_event, mass, velocity, SNR, overlapping_signal_flag, recoil_type (ER/NR), 
S1, S2, recoil_energy, pulse_shape_detectors, particle_type.

Apply missing values at {user_input.get('missingPct', 0.0)} ratio.
Use particle types from {PARTICLE_TYPES}.
Return ONLY valid {user_input['fileType'].upper()} content (JSON or CSV), no extra text.

USER INPUTS:
{json.dumps(user_input, indent=2)}
"""
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:]).rsplit("```", 1)[0].strip()

        if user_input["fileType"].lower() == "json":
            return json.loads(text)
        else:
            from io import StringIO
            df = pd.read_csv(StringIO(text))
            return df.to_dict(orient="records")
    except Exception as e:
        print(f"⚠️ Claude error: {e}, falling back to mock")
        return _generate_mock_events(batch_size, user_input.get("eventType", "Generic"))

# ----------------- Main -----------------
def generate_synthetic_events(user_input, mock=False):
    """
    user_input keys:
      - rows: int
      - missingPct: float
      - eventType: str
      - fileType: "CSV" | "JSON"
      - mock: bool (optional)
    """
    _cleanup_old_files()
    num_rows = user_input.get("rows", 10)
    output_format = user_input.get("fileType", "json").lower()
    event_type = user_input.get("eventType", "Generic")
    all_events = []
    remaining = num_rows

    if mock:
        all_events = _generate_mock_events(num_rows, event_type)
    else:
        while remaining > 0:
            batch_size = min(remaining, MAX_EVENTS_PER_CLAUDE_CALL)
            batch = _request_claude_batch(user_input, batch_size)
            all_events.extend(batch)
            remaining -= len(batch)

    df = pd.DataFrame(all_events)

    # Apply missing values
    missing_ratio = user_input.get("missingPct", 0.0)
    if missing_ratio > 0:
        df = df.mask(np.random.rand(*df.shape) < missing_ratio)

    # Save temp file
    dataset_id = str(uuid.uuid4())
    filename = f"dataset_{dataset_id}.{output_format}"
    filepath = TEMP_FOLDER / filename
    if output_format == "csv":
        df.to_csv(filepath, index=False)
    else:
        df.to_json(filepath, orient="records", indent=2)

    # Read file content to return to Node
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "metadata": {
            "num_events": len(df),
            "dataset_id": dataset_id,
            "format": output_format
        },
        "file_url": f"/temp/{filename}",
        "data": content
    }
