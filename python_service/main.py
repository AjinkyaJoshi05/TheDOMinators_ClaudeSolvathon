from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from simulation import generate_synthetic_events
from analysis import analyze_dataset
from explain import _request_claude_explain
from anyio import to_thread
from pathlib import Path
import concurrent.futures
import traceback

app = FastAPI(title="Physics Event AI Microservice")

# --------------------------
# CORS
# --------------------------
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
        user_input = await request.json()
        mock = user_input.get("mock", False)

        # ✅ Pass dict instead of keywords
        result = generate_synthetic_events(user_input, mock=mock)

        return {
            "status": "success",
            "metadata": result.get("metadata", {}),
            "data": result.get("data", ""),
            "output_format": result["metadata"].get("format", "json"),
        }

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --------------------------
# /classify endpoint
# --------------------------
@app.post("/classify")
async def classify(request: Request):
    try:
        body = await request.json()
        dataset_path = body.get("dataset_path")

        if not dataset_path:
            return {"status": "error", "message": "dataset_path missing"}

        abs_path = Path(dataset_path)
        if not abs_path.is_absolute():
            abs_path = Path.cwd() / dataset_path

        # Run blocking analysis in a thread
        result = await to_thread.run_sync(analyze_dataset, str(abs_path))
        return {"status": "success", "data": result}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --------------------------
# /explain endpoint
# --------------------------
def _request_claude_explain_with_timeout(dataset_path, prompt, max_wait=30):
    """Run Claude explain in a separate thread with timeout"""
    from functools import partial
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(partial(_request_claude_explain, dataset_path, prompt))
        try:
            return future.result(timeout=max_wait)
        except concurrent.futures.TimeoutError:
            return {
                "prompt": prompt,
                "top5_events": [],
                "explanation": f"Claude API call timed out after {max_wait}s"
            }

@app.post("/explain")
async def explain(request: Request):
    try:
        body = await request.json()
        dataset_path = body.get("dataset_path")
        prompt = body.get("prompt")

        if not dataset_path or not prompt:
            return {"status": "error", "message": "dataset_path and prompt required"}

        abs_path = Path(dataset_path)
        if not abs_path.is_absolute():
            abs_path = Path.cwd() / dataset_path

        result = await to_thread.run_sync(_request_claude_explain, str(abs_path), prompt)
        return {"status": "success", "data": result}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --------------------------
# Run with uvicorn
# --------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5050, reload=True)
