# ZapisyGrupowe

System do elektronicznych zapisów na grupy laboratoryjne dla studentów. Administratorzy (starostowie) tworzą kampanie rekrutacyjne, studenci składają priorytety, a system przydziela miejsca według wybranej metody.

---

## Struktura repo

```
ZapisyGrupowe/
├── backend/        ← API (Python, FastAPI, PostgreSQL)
├── assets/
├── pages/
├── styles/
├── src/
└── index.html      ← Frontend (vanilla JS)
```

---

## Backend

Szczegółowa dokumentacja backendu: [`backend/README.md`](./backend/README.md)

**Stack:** Python · FastAPI · PostgreSQL · SQLModel · Docker

**Uruchomienie lokalnie:**
```bash
cd backend
cp .env.example .env   # uzupełnij dane do bazy i SMTP
./run.sh               # Linux/macOS
.\run.ps1              # Windows
```

**Uruchomienie przez Docker:**
```bash
cd backend
docker-compose up --build
```

Swagger docs dostępny pod `localhost:8000/docs` po uruchomieniu.

---

## Frontend

Vanilla JS + HTML/CSS. Hostowany na GitHub Pages pod adresem [zapisy-grupowe.xyz](https://zapisy-grupowe.xyz).

---

## Status projektu

Zobacz [`backend/README.md`](./backend/README.md) po pełną listę zaimplementowanych funkcji.