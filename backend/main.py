from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from api.websockets import router as websocket_router, vision
from api.routes import router as api_router

app = FastAPI(title="CODIS Backend Engine")

# Add CORS Middleware to allow Next.js to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(websocket_router)
app.include_router(api_router)

@app.get("/api/video_feed")
async def video_feed():
    """Streams the live annotated YOLOv8 video feed to the Next.js frontend."""
    return StreamingResponse(
        vision.generate_frames(), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/")
async def root():
    return {"status": "CODIS Backend is Online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)