from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Enum
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    WORKER = "worker"
    FOREMAN = "foreman"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.WORKER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PODRecord(Base):
    __tablename__ = "pod_records"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, index=True, nullable=False)
    driver_name = Column(String, nullable=False)
    foreman_name = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    photo_paths = Column(Text, nullable=True)  # comma-separated paths
    signature_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
