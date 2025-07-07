# CIRO Tokenomics Web Calculator – TODO

This document tracks the tasks required to expose `tokenomics_engine.py` as an interactive, publicly-hosted calculator.

---

## 1. Architecture Decisions

- [ ] **Choose integration approach**
  - Option A – Python backend (FastAPI) + React/Vite frontend
  - Option B – Tauri (Rust) wrapper calling the Python engine via PyO3 or a CLI
  - Option C – Pure JupyterLite / Pyodide (runs entirely in the browser)
- [ ] Document the chosen stack in `docs/architecture/web-calculator.md`.

## 2. Backend Service (`api`)

- [ ] Set up `fastapi` project in `backend/tokenomics_api/`
- [ ] Expose endpoints:
  - `POST /simulate` – body: params → returns monthly DataFrame as JSON
  - `POST /stress-test` – body: scenario → returns stress test table
- [ ] Write Pydantic models for request / response
- [ ] Add CORS middleware for front-end access
- [ ] Unit-test endpoints with `pytest` + `httpx`

## 3. Front-end (Playground UI)

- [ ] Scaffold React/Vite app in `frontend/`
- [ ] Create form to edit key `CIROParameters` (sliders, inputs)
- [ ] Call `/simulate` and display charts (Recharts / Plotly)
- [ ] Add preset buttons for stress scenarios
- [ ] Responsive mobile layout

## 4. CI/CD & Deployment

- [ ] Dockerize backend (Python 3.11 slim)
- [ ] Dockerize frontend (Nginx static build)
- [ ] GitHub Actions: build & push container images
- [ ] Deploy to Fly.io / Railway free tier

## 5. Documentation & Demo

- [ ] Update project README with live demo link and screenshots
- [ ] Write usage guide in `docs/user-guides/calculator.md`

## 6. Stretch Goals

- [ ] Export results to CSV / Excel
- [ ] Authenticated user profiles to save parameter presets
- [ ] Embed calculator in main CIRO docs site

---

> Source repository for the standalone web simulator: <https://github.com/Ciro-AI-Labs/ciro-tokenomics-simulator>
