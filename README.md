# PowerLog - Powerlifting SaaS App

Aplikasi SaaS untuk atlet powerlifting. Kalkulator 1RM, pencatatan SBD, rekomendasi aksesori, dan checklist warmup/cooldown.

## Tech Stack

- **Backend:** Go 1.25 + Fiber v2 + GORM
- **Database:** MariaDB 10.11
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Infrastructure:** Docker + Docker Compose + Nginx

## Fitur

- Landing page pengenalan aplikasi
- Kalkulator 1RM (Epley, Brzycki, Lombardi)
- Pencatatan lift Squat/Bench/Deadlift dengan RPE tracking
- Rekomendasi gerakan aksesori per target lift
- Checklist warmup & cooldown harian
- Dashboard ringkasan progress
- Autentikasi JWT (Register/Login)

## Cara Instalasi

### Prerequisites

- Docker & Docker Compose
- Git

### Langkah-langkah

```bash
# 1. Clone repositori
git clone https://github.com/sinungp/power-log.git
cd power-log

# 2. Jalankan aplikasi
docker compose up -d

# 3. Akses aplikasi
#    Frontend : http://localhost
#    Backend  : http://localhost:8080
#    Database : localhost:3307 (user: powerlog_user, pass: powerlog_pass)
```

### Build dari Source (tanpa Docker)

```bash
# Backend
cd backend
go mod download
go run main.go

# Frontend (terminal terpisah)
cd frontend
npm install
npm run dev
```

## Penggunaan

1. Buka http://localhost → Landing page
2. Klik **Get Started** atau langsung ke `/register` untuk daftar
3. Login dengan email dan password
4. Mulai gunakan fitur di `/app/*`:
   - **Dashboard** — Ringkasan aktivitas
   - **Calculator** — Hitung 1RM
   - **Lifts** — Catat latihan SBD
   - **Accessories** — Cari gerakan aksesori
   - **Checklist** — Checklist warmup/cooldown

## Struktur Direktori

```
├── backend/           # Go API server
│   ├── main.go
│   ├── config/
│   ├── database/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint               | Auth      | Deskripsi             |
|--------|------------------------|-----------|-----------------------|
| POST   | /api/v1/auth/register  | ❌        | Daftar akun           |
| POST   | /api/v1/auth/login     | ❌        | Login, return JWT     |
| GET    | /api/v1/auth/me        | ✅        | Profil user           |
| POST   | /api/v1/calculator/one-rm | ❌      | Hitung 1RM            |
| GET    | /api/v1/lifts          | ✅        | List catatan lift     |
| POST   | /api/v1/lifts          | ✅        | Tambah catatan lift   |
| GET    | /api/v1/lifts/summary  | ✅        | Ringkasan PR          |
| GET    | /api/v1/accessories    | ❌        | List aksesori         |
| GET    | /api/v1/checklists     | ❌        | List checklist        |
| POST   | /api/v1/checklists/log | ✅        | Simpan log checklist  |
| GET    | /api/v1/checklists/log | ✅        | Ambil log checklist   |

## Lisensi

MIT
