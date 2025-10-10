from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from simulation import generate_synthetic_events
import asyncio
import time

app = FastAPI(title="Synthetic Dataset Service")

# CORS for Node frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# /simulate endpoint
# --------------------------
@app.post("/simulate")
async def simulate(request: Request):
    try:
        body = await request.json()
        num_events = body.get("num_events", 1000)
        include_noise = body.get("include_noise", True)
        missing_rate = body.get("missing_rate", 0.05)
        particle_types = body.get("particle_types", ["WIMP-like","Axion-like","Background"])
        output_format = body.get("output_format", "csv")  # csv or json
        seed = body.get("seed", None)

        result = generate_synthetic_events(
            num_events=num_events,
            include_noise=include_noise,
            missing_rate=missing_rate,
            particle_types=particle_types,
            output_format=output_format,
            seed=seed,
        )

        # Return content + metadata
        return {
            "metadata": result["metadata"],
            "file_content": result["file_content"],
            "output_format": output_format
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
