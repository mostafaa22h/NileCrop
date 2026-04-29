# Nile Crop

Nile Crop is an agriculture project that combines:

- `nile-crop/`: Frontend application
- `smart-crop-backend/`: Backend API and AI disease/crop logic

## Project Structure

This repository is a single project that contains both parts:

- Frontend: upload plant images, view disease results, and use crop recommendations
- Backend: serves API endpoints, runs crop recommendation logic, and runs plant disease prediction

## Folders

- `nile-crop`
  - React + Vite frontend
  - UI, pages, modals, translations, and API calls

- `smart-crop-backend`
  - FastAPI backend
  - ML models for crop recommendation
  - Disease detection model and API routes

## Quick Start

### Frontend

```bash
cd nile-crop
npm install
npm run dev
```

### Backend

```bash
cd smart-crop-backend
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## Notes

- This is a `monorepo`, which means frontend and backend are in the same GitHub repository.
- The frontend is not missing.
- The backend and AI parts are not separate repositories; they are organized as folders inside the same project.
