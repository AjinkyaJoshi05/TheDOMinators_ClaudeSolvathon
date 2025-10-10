import numpy as np
import pandas as pd
import random
from io import StringIO

def generate_synthetic_events(
    num_events=1000,
    include_noise=True,
    missing_rate=0.05,
    particle_types=["WIMP-like", "Axion-like", "Background"],
    output_format="csv",
    seed=None,
):
    if seed:
        np.random.seed(seed)
        random.seed(seed)

    events = []
    for _ in range(num_events):
        particle = random.choice(particle_types)
        recoil_energy = np.random.lognormal(mean=1.5, sigma=0.5)
        scintillation = recoil_energy * np.random.uniform(0.8, 1.2)
        ionization = recoil_energy * np.random.uniform(0.6, 1.1)
        s1_s2_ratio = scintillation / (ionization + 1e-6)
        pulse_shape = np.random.normal(0.5, 0.1)
        x, y, z = np.random.uniform(-10, 10, 3)
        time_of_event = pd.Timestamp.now().isoformat()

        events.append({
            "recoil_energy": round(recoil_energy, 4),
            "scintillation_light": round(scintillation, 4),
            "ionization_charge": round(ionization, 4),
            "s1_s2_ratio": round(s1_s2_ratio, 4),
            "pulse_shape": round(pulse_shape, 4),
            "position": {"x": x, "y": y, "z": z},
            "time_of_event": time_of_event,
            "particle_type": particle,
        })

    df = pd.DataFrame(events)

    # Add noise
    if include_noise:
        df["recoil_energy"] += np.random.normal(0, 0.05, size=num_events)

    # Missing values
    if missing_rate > 0:
        for col in ["recoil_energy", "ionization_charge"]:
            df.loc[df.sample(frac=missing_rate).index, col] = np.nan

    # Prepare content to return
    if output_format == "csv":
        buffer = StringIO()
        df.to_csv(buffer, index=False)
        file_content = buffer.getvalue()
    else:  # json
        file_content = df.fillna(0).to_json(orient="records", indent=2)

    return {
        "metadata": {
            "num_events": num_events,
            "missing_rate": missing_rate,
            "particle_types": particle_types
        },
        "file_content": file_content
    }
