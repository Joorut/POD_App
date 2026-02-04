from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import tempfile
from database import Base, engine, get_db
from models import PODRecord, User
from schemas import (
    PODCreate, PODResponse, EmailRequest,
    UserCreate, UserResponse, LoginRequest, LoginResponse
)
from pdf_generator import generate_pod_pdf
from email_sender import send_email_with_attachment
from auth import (
    get_password_hash, verify_password, create_access_token, 
    get_current_user, ACCESS_TOKEN_EXPIRE_HOURS
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="POD App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(
        data={"user_id": user.id, "username": user.username},
        expires_delta=timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    )
    
    return LoginResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ==================== POD ENDPOINTS ====================

@app.post("/api/pod", response_model=PODResponse)
async def create_pod(
    payload: PODCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = PODRecord(
        case_number=payload.case_number,
        driver_name=payload.driver_name,
        foreman_name=payload.foreman_name,
        customer_name=payload.customer_name,
        notes=payload.notes,
        photo_paths=",".join(payload.photo_paths or []),
        signature_path=payload.signature_path
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.post("/api/pod/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"path": file_path}


@app.get("/api/pod")
async def list_pods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pods = db.query(PODRecord).order_by(PODRecord.created_at.desc()).all()
    result = []
    for pod in pods:
        result.append({
            "id": pod.id,
            "case_number": pod.case_number,
            "driver_name": pod.driver_name,
            "customer_name": pod.customer_name,
            "status": "pending",  # Default status
            "created_at": pod.created_at.isoformat() if pod.created_at else None,
            "photo_paths": pod.photo_paths.split(",") if pod.photo_paths else []
        })
    return result


@app.get("/api/pod/{pod_id}", response_model=PODResponse)
async def get_pod(
    pod_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(PODRecord).filter(PODRecord.id == pod_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="POD not found")
    return record


@app.get("/api/pod/{pod_id}/pdf")
async def get_pod_pdf(
    pod_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(PODRecord).filter(PODRecord.id == pod_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="POD not found")
    pdf_buffer = generate_pod_pdf(record)
    return {
        "content": pdf_buffer.getvalue().hex(),
        "filename": f"POD_{record.case_number}.pdf"
    }


@app.post("/api/pod/{pod_id}/send-email")
async def send_pod_email(
    pod_id: int, 
    payload: EmailRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(PODRecord).filter(PODRecord.id == pod_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="POD not found")

    pdf_buffer = generate_pod_pdf(record)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_buffer.getvalue())
        tmp_path = tmp.name

    subject = payload.subject or f"POD - {record.case_number}"
    body = payload.body or "Vedhæftet POD leveringskvittering."

    success = send_email_with_attachment(payload.to_email, subject, body, tmp_path)

    try:
        os.remove(tmp_path)
    except Exception:
        pass

    if not success:
        raise HTTPException(status_code=500, detail="Email failed")

    return {"status": "success"}


# ==================== SERVE FRONTEND ====================
# Mount frontend static files LAST so it doesn't interfere with API routes
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
