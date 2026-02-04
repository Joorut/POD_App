# POD_app - Proof of Delivery System

A standalone proof of delivery (leveringskvittering) application for tracking deliveries with photo documentation and digital signatures.

## Features

- **Delivery Creation**: Create new delivery records with case numbers, driver info, and customer details
- **Photo Documentation**: Attach multiple photos to each delivery
- **Digital Signatures**: Capture digital signatures from drivers or foremen
- **Status Tracking**: Track delivery status (pending, approved, rejected)
- **Role-Based Access**: Different permissions for workers, foremen, and admins
- **PDF Export**: Generate PDF reports for each delivery
- **Email Integration**: Send delivery confirmations via email

## Architecture

This is a **completely independent application** with:
- **Backend**: FastAPI on port 8001
- **Frontend**: React on port 5174
- **Database**: SQLite (separate from UsisaatTimeApp)

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy ORM with SQLite
- **Authentication**: JWT
- **PDF Generation**: ReportLab
- **Email**: SMTP/Python-dotenv

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd POD_app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=sqlite:///./data/pod.db
JWT_SECRET_KEY=your-secret-key-change-this
SMTP_SERVER=smtp.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SITE_URL=http://localhost:5174
EOF

# Run backend (port 8001)
python main.py
```

### Frontend Setup

```bash
cd POD_app/frontend

# Install dependencies
npm install

# Development mode (port 5174)
npm run dev

# Production build
npm run build
```

## Running Locally

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd POD_app/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
# Opens http://localhost:8001
# API docs: http://localhost:8001/docs
```

**Terminal 2 - Frontend:**
```bash
cd POD_app/frontend
npm run dev
# Opens http://localhost:5174
```

Then open http://localhost:5174 in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### POD Records
- `POST /api/pod` - Create new delivery
- `GET /api/pod` - List all deliveries (with filters)
- `GET /api/pod/{pod_id}` - Get delivery details
- `POST /api/pod/{pod_id}/approve` - Approve/reject delivery
- `GET /api/pod/{pod_id}/pdf` - Download PDF

### File Upload
- `POST /api/pod/upload` - Upload photo or signature

## Database Schema

### Users Table
```
- id: Integer (primary key)
- username: String (unique)
- email: String (unique)
- full_name: String
- hashed_password: String
- role: Enum (worker, foreman, admin)
- is_active: Boolean
- created_at: DateTime
```

### POD Records Table
```
- id: Integer (primary key)
- case_number: String (indexed)
- driver_id: Integer (FK to users)
- driver_name: String
- foreman_id: Integer (FK to users)
- foreman_name: String
- customer_name: String
- notes: Text
- photo_paths: Text (comma-separated)
- signature_path: String
- status: Enum (pending, approved, rejected)
- approved_by_id: Integer (FK to users)
- approved_at: DateTime
- approval_notes: Text
- created_at: DateTime
```

## Role-Based Access

### Worker
- Create new deliveries
- View own deliveries
- Upload photos and signatures
- Download own PDFs

### Foreman
- Create and manage deliveries
- Approve/reject pending deliveries
- View all deliveries
- Add approval notes
- Send email confirmations

### Admin
- Full access to all features
- Manage all users
- View all deliveries
- Generate reports

## Environment Variables

Create `.env` in `backend/` directory:

```
# Database
DATABASE_URL=sqlite:///./data/pod.db

# Security
JWT_SECRET_KEY=your-secure-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Email (SMTP)
SMTP_SERVER=smtp.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=POD System

# Frontend URL for email links
SITE_URL=http://localhost:5174

# File Upload
MAX_FILE_SIZE_MB=50
UPLOAD_DIR=./data/uploads
```

## Email Configuration

### Outlook/Microsoft 365
1. Enable "App Password" in your Microsoft 365 account
2. Use the app password in `SMTP_PASSWORD`
3. Set `SMTP_SERVER=smtp.outlook.com` and `SMTP_PORT=587`

### Gmail
1. Enable "Less secure app access" or use an App Password
2. Set `SMTP_SERVER=smtp.gmail.com` and `SMTP_PORT=587`

### Custom SMTP
Use your own mail server details

## Deployment

### Railway.app

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy

**Railway Configuration:**
- Root directory: `POD_app`
- For backend: Set start command to `cd backend && python main.py`
- For frontend: Build command: `cd frontend && npm run build`, Start: `npm run preview`

### Docker

Build and run with Docker:
```bash
docker build -f backend/Dockerfile -t pod-backend .
docker build -f frontend/Dockerfile -t pod-frontend .

docker run -p 8001:8001 pod-backend
docker run -p 5174:5174 pod-frontend
```

## File Structure

```
POD_app/
├── backend/
│   ├── database.py          # SQLAlchemy models
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── main.py              # FastAPI app
│   ├── email_sender.py      # Email utilities
│   ├── pdf_generator.py     # PDF generation
│   ├── auth.py              # Authentication
│   ├── requirements.txt      # Python dependencies
│   ├── data/                # SQLite database & uploads
│   └── .env                 # Environment variables
└── frontend/
    ├── src/
    │   ├── pages/           # React pages
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Tailwind CSS
    ├── package.json         # npm dependencies
    ├── vite.config.js       # Vite configuration
    └── .env                 # Environment variables
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 8001
lsof -i :8001
kill -9 <PID>
```

### Database Lock
```bash
# Delete database file and restart
rm backend/data/pod.db
```

### Module Not Found
```bash
# Ensure virtual environment is activated
# and dependencies are installed
pip install -r requirements.txt
```

### CORS Errors
Backend is configured to allow all origins. If you still get CORS errors:
1. Check that backend is running on correct port (8001)
2. Verify VITE_POD_API in frontend .env file
3. Restart both backend and frontend

### Email Not Sending
1. Check SMTP credentials in .env file
2. Verify SMTP server is accessible from your network
3. Check backend logs for error messages
4. For Outlook: Ensure "App Password" is used, not regular password

## Development

### Running Tests
```bash
cd backend
pytest
```

### Code Style
```bash
# Python formatting
black .
flake8 .

# Frontend linting
cd frontend
npm run lint
```

## Support & Documentation

For more information about the complete Usisaat system, see the main [README.md](../README.md) and [INSTALLATION.md](../INSTALLATION.md).

## License

Copyright © Usisaat Transportation Solutions

## Notes

- This application is completely independent from UsisaatTimeApp
- Each has its own database and can be deployed separately
- API endpoints are documented in Swagger UI: http://localhost:8001/docs

## Backend
```bash
cd POD_app/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### SMTP (mail)
Sæt miljøvariabler:
```
SMTP_SERVER=
SMTP_PORT=587
SMTP_SENDER_EMAIL=
SMTP_SENDER_PASSWORD=
```

## Frontend
```bash
cd POD_app/frontend
npm install
npm run dev
```

### API base
Sæt .env i frontend:
```
VITE_POD_API=http://localhost:8001
```

## Næste skridt
- Tilføj login/roller og godkendelsesflow
- Generér rigtig PDF med billeder og signatur
- PWA offline mode og caching
