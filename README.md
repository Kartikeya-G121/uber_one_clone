# Uber-like Mini Project

A simple Uber-like application with FastAPI backend and PostgreSQL database.

## Project Structure
```
uber_project/
├── server/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # Database configuration
│   │   └── crud.py          # Database operations
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Server container
├── client/                  # Client implementation (TBD)
├── docker-compose.yml       # Docker orchestration
├── .env                     # Environment variables
└── README.md               # This file
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request_ride` | Create a new ride request |
| GET | `/rides/{user_id}` | Get all rides for a user |
| POST | `/register_driver` | Register a new driver |
| GET | `/drivers/available` | Get all available drivers |
| GET | `/drivers` | Get all drivers |

## Quick Start

1. Start the services:
```bash
docker-compose up --build
```

2. API will be available at: http://localhost:8000
3. PostgreSQL will be available at: localhost:5432

## Testing

Import `Uber_API.postman_collection.json` into Postman to test all endpoints.

## Database Schema

**drivers table:**
- id (Primary Key)
- name
- car_no
- status

**ride_requests table:**
- id (Primary Key)
- user_id
- pickup_location
- drop_location
- created_at