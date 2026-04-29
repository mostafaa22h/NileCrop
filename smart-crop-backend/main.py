from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter  # type: ignore
from slowapi.errors import RateLimitExceeded  # type: ignore
from slowapi.middleware import SlowAPIMiddleware  # type: ignore
from slowapi.util import get_remote_address  # type: ignore

from database import SessionLocal
from database import Base, engine
from models.request_log import RequestLog
from routers import analysis, analytics, city, crop, health, recommend, upload, weather

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("Server starting")
    yield
    print("Server shutting down")


app = FastAPI(lifespan=lifespan, title="Smart Crop API")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    db = SessionLocal()
    try:
        response = await call_next(request)
        db.add(RequestLog(endpoint=request.url.path, method=request.method))
        db.commit()
        return response
    finally:
        db.close()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Input البيانات غير صحيحة",
            "details": exc.errors(),
        },
    )


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"message": "عدد الطلبات كبير جدا، حاول مرة أخرى بعد دقيقة"},
    )


app.include_router(city.router)
app.include_router(recommend.router)
app.include_router(crop.router)
app.include_router(upload.router)
app.include_router(health.router)
app.include_router(weather.router)
app.include_router(analytics.router)
app.include_router(analysis.router)


@app.get("/")
def home():
    return {"message": "Smart Crop API working"}
