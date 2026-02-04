# Build stage - Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Final stage - Backend with Python
FROM python:3.11-slim
WORKDIR /app

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copy backend
COPY backend/requirements.txt ./backend/
RUN cd backend && pip install --no-cache-dir -r requirements.txt

COPY backend ./backend

# Set environment
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Start command
CMD cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
