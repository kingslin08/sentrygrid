"""FastAPI server.  Run:  uvicorn sentrygrid.api:app --reload
Docs for judges/teammates:  http://localhost:8000/docs
"""
from __future__ import annotations
import asyncio, json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import CLASSES, DB_PATH, METRICS_PATH, MODEL_PATH, PRETTY, TICK_SECONDS
from .engine import Engine
from .model import SentryModel
from .store import Store


class Inject(BaseModel):
    machine_id: str
    kind: str
    magnitude: float = 1.0


class Hub:
    def __init__(self):
        self.clients: set[WebSocket] = set()

    async def broadcast(self, msg: dict):
        dead = []
        for ws in self.clients:
            try:
                await ws.send_text(json.dumps(msg, default=float))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.clients.discard(ws)


hub = Hub()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not MODEL_PATH.exists():
        from . import train
        train.main(n_per_class=30, quiet=True)           # first run: train automatically
    app.state.engine = Engine(SentryModel.load(MODEL_PATH), Store(DB_PATH))

    async def loop():
        while True:
            events = app.state.engine.step()
            for ev in events:
                if ev["type"] != "status" or hub.clients:
                    await hub.broadcast(ev)
            await asyncio.sleep(TICK_SECONDS)

    task = asyncio.create_task(loop())
    yield
    task.cancel()


app = FastAPI(title="SentryGrid API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/machines")
def machines():
    return app.state.engine.snapshot()


@app.get("/api/machines/{machine_id}/history")
def history(machine_id: str, n: int = 120):
    if machine_id not in app.state.engine.machines:
        raise HTTPException(404, "unknown machine")
    return app.state.engine.store.history(machine_id, n)


@app.get("/api/alerts")
def alerts(limit: int = 50):
    return app.state.engine.store.alerts(limit)


@app.get("/api/scenarios")
def scenarios():
    return [{"kind": k, "label": PRETTY[k]} for k in CLASSES if k != "normal"]


@app.post("/api/inject")
def inject(body: Inject):
    if body.machine_id not in app.state.engine.machines:
        raise HTTPException(404, "unknown machine")
    try:
        app.state.engine.inject(body.machine_id, body.kind, body.magnitude)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"injected": body.kind, "machine_id": body.machine_id}


@app.post("/api/clear/{machine_id}")
def clear(machine_id: str):
    if machine_id not in app.state.engine.machines:
        raise HTTPException(404, "unknown machine")
    app.state.engine.clear(machine_id)
    return {"cleared": machine_id}


@app.get("/api/metrics")
def metrics():
    return json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else {}


@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    hub.clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hub.clients.discard(websocket)
