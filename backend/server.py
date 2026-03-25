from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Models ---

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = ""
    status: str = Field(default="todo", pattern="^(todo|in_progress|done)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    status: str
    priority: str
    due_date: Optional[str]
    user_id: str
    created_at: str
    updated_at: str

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class AnalyticsResponse(BaseModel):
    total: int
    todo: int
    in_progress: int
    done: int
    low: int
    medium: int
    high: int
    completion_percentage: float

# --- Auth Helpers ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Auth Routes ---

@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(data: UserSignup):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, data.email)
    return AuthResponse(
        token=token,
        user=UserResponse(id=user_id, email=data.email, name=data.name)
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    return AuthResponse(
        token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"])

# --- Task Routes ---

@api_router.post("/tasks", response_model=TaskResponse)
async def create_task(data: TaskCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    task_doc = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description or "",
        "status": data.status,
        "priority": data.priority,
        "due_date": data.due_date,
        "user_id": user["id"],
        "created_at": now,
        "updated_at": now
    }
    await db.tasks.insert_one(task_doc)
    return TaskResponse(**{k: v for k, v in task_doc.items() if k != "_id"})

@api_router.get("/tasks", response_model=TaskListResponse)
async def get_tasks(
    user: dict = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    query = {"user_id": user["id"]}
    
    if status_filter:
        query["status"] = status_filter
    if priority:
        query["priority"] = priority
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    
    sort_dir = -1 if sort_order == "desc" else 1
    
    total = await db.tasks.count_documents(query)
    skip = (page - 1) * per_page
    
    cursor = db.tasks.find(query, {"_id": 0}).sort(sort_by, sort_dir).skip(skip).limit(per_page)
    tasks = await cursor.to_list(per_page)
    
    total_pages = max(1, (total + per_page - 1) // per_page)
    
    return TaskListResponse(
        tasks=[TaskResponse(**t) for t in tasks],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@api_router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, data: TaskUpdate, user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "user_id": user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return TaskResponse(**updated)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

@api_router.get("/tasks/analytics", response_model=AnalyticsResponse)
async def get_analytics(user: dict = Depends(get_current_user)):
    query = {"user_id": user["id"]}
    total = await db.tasks.count_documents(query)
    todo = await db.tasks.count_documents({**query, "status": "todo"})
    in_progress = await db.tasks.count_documents({**query, "status": "in_progress"})
    done = await db.tasks.count_documents({**query, "status": "done"})
    low = await db.tasks.count_documents({**query, "priority": "low"})
    medium = await db.tasks.count_documents({**query, "priority": "medium"})
    high = await db.tasks.count_documents({**query, "priority": "high"})
    
    completion = (done / total * 100) if total > 0 else 0
    
    return AnalyticsResponse(
        total=total, todo=todo, in_progress=in_progress, done=done,
        low=low, medium=medium, high=high,
        completion_percentage=round(completion, 1)
    )

# --- Root ---
@api_router.get("/")
async def root():
    return {"message": "Task Manager API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.tasks.create_index("user_id")
    await db.tasks.create_index("id", unique=True)
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
