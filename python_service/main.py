# # from fastapi import FastAPI, Request
# # from fastapi.middleware.cors import CORSMiddleware
# # from simulation import generate_synthetic_events
# # from analysis import analyze_dataset
# # import asyncio
# # import time

# # app = FastAPI(title="Synthetic Dataset Service")

# # # CORS for Node frontend
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # --------------------------
# # # /simulate endpoint
# # # --------------------------
# # @app.post("/simulate")
# # async def simulate(request: Request):
# #     try:
# #         body = await request.json()
# #         num_events = body.get("num_events", 1000)
# #         include_noise = body.get("include_noise", True)
# #         missing_rate = body.get("missing_rate", 0.05)
# #         particle_types = body.get("particle_types", ["WIMP-like","Axion-like","Background"])
# #         output_format = body.get("output_format", "csv")  # csv or json
# #         seed = body.get("seed", None)

# #         result = generate_synthetic_events(
# #             num_events=num_events,
# #             include_noise=include_noise,
# #             missing_rate=missing_rate,
# #             particle_types=particle_types,
# #             output_format=output_format,
# #             seed=seed,
# #         )

# #         # Return content + metadata
# #         return {
# #             "metadata": result["metadata"],
# #             "file_content": result["file_content"],
# #             "output_format": output_format
# #         }

# #     except Exception as e:
# #         import traceback
# #         traceback.print_exc()
# #         return {"error": str(e)}
    

# # # --------------------------
# # # /classify endpoint
# # # --------------------------
# # # @app.post("/classify")
# # # async def classify(request: Request):
# # #     try:
# # #         body = await request.json()
# # #         dataset_path = body.get("dataset_path")

# # #         if not dataset_path:
# # #             return {"error": "dataset_path missing"}

# # #         result = analyze_dataset(dataset_path)
# # #         return result

# # #     except Exception as e:
# # #         traceback.print_exc()
# # #         return {"error": str(e)}


# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from simulation import generate_synthetic_events
# from analysis import analyze_dataset
# from explain import _request_claude_explain
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
# import traceback

# app = FastAPI(title="Physics Event AI Microservice")

# # --------------------------
# # CORS (for Node/React frontend)
# # --------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --------------------------
# # Thread pool for blocking functions
# # --------------------------
# executor = ThreadPoolExecutor()

# # --------------------------
# # /simulate endpoint
# # --------------------------
# @app.post("/simulate")
# async def simulate(request: Request):
#     try:
#         body = await request.json()
#         num_events = body.get("num_events", 1000)
#         include_noise = body.get("include_noise", True)
#         missing_rate = body.get("missing_rate", 0.05)
#         particle_types = body.get("particle_types", ["WIMP-like", "Axion-like", "Background"])
#         output_format = body.get("output_format", "csv")
#         seed = body.get("seed", None)

#         result = generate_synthetic_events(
#             num_events=num_events,
#             include_noise=include_noise,
#             missing_rate=missing_rate,
#             particle_types=particle_types,
#             output_format=output_format,
#             seed=seed,
#         )

#         return {
#             "metadata": result["metadata"],
#             "file_content": result["file_content"],
#             "output_format": output_format
#         }

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}


# # --------------------------
# # /classify endpoint (analysis)
# # --------------------------
# @app.post("/classify")
# async def classify(request: Request):
#     try:
#         body = await request.json()
#         dataset_path = body.get("dataset_path")

#         if not dataset_path:
#             return {"error": "dataset_path missing"}

#         loop = asyncio.get_event_loop()
#         result = await loop.run_in_executor(executor, analyze_dataset, dataset_path)

#         # 🔹 Ensure consistent return structure
#         return {
#             "metadata": result.get("metadata", {}),
#             "file_content": result.get("file_content", ""),
#             "output_format": result.get("output_format", "csv")
#         }

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}




# @app.post("/explain")
# async def explain(request: Request):
#     try:
#         body = await request.json()
#         dataset_path = body.get("dataset_path")
#         prompt = body.get("prompt")

#         if not dataset_path or not prompt:
#             return {"error": "dataset_path and prompt required"}

#         loop = asyncio.get_event_loop()
#         result = await loop.run_in_executor(executor, _request_claude_explain, dataset_path, prompt)

#         return result

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}



# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from simulation import generate_synthetic_events
# from analysis import analyze_dataset
# from explain import _request_claude_explain
# import traceback
# from anyio import to_thread
# from pathlib import Path
# import concurrent.futures
# import json
# import tempfile
# import time

# app = FastAPI(title="Physics Event AI Microservice")

# # --------------------------
# # CORS for Node/React frontend
# # --------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --------------------------
# # /simulate endpoint
# # --------------------------
# @app.post("/simulate")
# async def simulate(request: Request):
#     try:
#         body = await request.json()
#         num_events = body.get("num_events",10)
#         include_noise = body.get("include_noise", True)
#         missing_rate = body.get("missing_rate", 0.05)
#         particle_types = body.get(
#             "particle_types", ["WIMP-like", "Axion-like", "Background"]
#         )
#         output_format = body.get("output_format", "csv")
#         seed = body.get("seed", None)

#         result = generate_synthetic_events(
#             num_events=num_events,
#             include_noise=include_noise,
#             missing_rate=missing_rate,
#             particle_types=particle_types,
#             output_format=output_format,
#             seed=seed,
#         )

#         return {
#             "metadata": result["metadata"],
#             "file_content": result["file_content"],
#             "output_format": output_format,
#         }

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}


# # --------------------------
# # /classify endpoint
# # --------------------------


# @app.post("/classify")
# async def classify(request: Request):
#     try:
#         body = await request.json()
#         dataset_path = body.get("dataset_path")

#         if not dataset_path:
#             return {"error": "dataset_path missing"}

#         abs_path = Path(dataset_path)
#         if not abs_path.is_absolute():
#             abs_path = Path.cwd() / dataset_path

#         # Run blocking analysis in thread
#         result = await to_thread.run_sync(analyze_dataset, str(abs_path))

#         return result

#     except Exception as e:
#         traceback.print_exc()
#         return {"error": str(e)}


# # --------------------------
# # /explain endpoint
# # --------------------------
# def _request_claude_explain_with_timeout(dataset_path, prompt, max_wait=30):
#     """
#     Wrap _request_claude_explain in a thread executor with timeout
#     """
#     from functools import partial

#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         future = executor.submit(partial(_request_claude_explain, dataset_path, prompt))
#         try:
#             return future.result(timeout=max_wait)
#         except concurrent.futures.TimeoutError:
#             return {
#                 "prompt": prompt,
#                 "top5_events": [],
#                 "explanation": f"Claude API call timed out after {max_wait}s"
#             }


# @app.post("/explain")
# async def explain(request: Request):
#     try:
#         body = await request.json()
#         dataset_path = body.get("dataset_path")
#         prompt = body.get("prompt")

#         if not dataset_path or not prompt:
#             return {"error": "dataset_path and prompt required"}

#         abs_path = Path(dataset_path)
#         if not abs_path.is_absolute():
#             abs_path = Path.cwd() / dataset_path

#         # Run safely in thread
#         result = await to_thread.run_sync(_request_claude_explain, str(abs_path), prompt)

#         return result

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return {"error": str(e)}


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
# CORS for Node/React frontend
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
        # Support both your params and friend's 'mock' param
        num_events = user_input.get("num_events", 10)
        include_noise = user_input.get("include_noise", True)
        missing_rate = user_input.get("missing_rate", 0.05)
        particle_types = user_input.get(
            "particle_types", ["WIMP-like", "Axion-like", "Background"]
        )
        output_format = user_input.get("output_format", "csv")
        seed = user_input.get("seed", None)
        mock = user_input.get("mock", False)  # from friend's version

        # Call the generator
        result = generate_synthetic_events(
            num_events=num_events,
            include_noise=include_noise,
            missing_rate=missing_rate,
            particle_types=particle_types,
            output_format=output_format,
            seed=seed,
        )

        # If mock param is True, return the whole result in 'data'
        if mock:
            return {"status": "success", "data": result}

        return {
            "metadata": result.get("metadata", {}),
            "file_content": result.get("file_content", ""),
            "output_format": output_format,
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
            return {"error": "dataset_path missing"}

        abs_path = Path(dataset_path)
        if not abs_path.is_absolute():
            abs_path = Path.cwd() / dataset_path

        # Run blocking analysis in a thread (non-blocking for FastAPI)
        result = await to_thread.run_sync(analyze_dataset, str(abs_path))

        return result

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# --------------------------
# /explain endpoint
# --------------------------
def _request_claude_explain_with_timeout(dataset_path, prompt, max_wait=30):
    """Wrap _request_claude_explain in a thread executor with timeout"""
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
            return {"error": "dataset_path and prompt required"}

        abs_path = Path(dataset_path)
        if not abs_path.is_absolute():
            abs_path = Path.cwd() / dataset_path

        result = await to_thread.run_sync(_request_claude_explain, str(abs_path), prompt)
        return result

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

# --------------------------
# Run with uvicorn
# --------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5050, reload=True)
