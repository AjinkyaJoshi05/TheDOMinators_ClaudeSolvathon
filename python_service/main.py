from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from simulation import generate_synthetic_events

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/simulate")
async def simulate(request: Request):
    try:
        user_input = await request.json()
        mock = user_input.get("mock", False)  # ✅ default false
        data = generate_synthetic_events(user_input, mock=mock)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
