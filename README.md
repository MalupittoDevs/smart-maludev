# 🧠 Smart MaluDev – Sistema de Inventario Inteligente

[![Status](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)](#)
[![Backend](https://img.shields.io/badge/Backend-Django%205.2-blue)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Database](https://img.shields.io/badge/Base%20de%20Datos-SQLite-lightgrey)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/Licencia-MIT-green)](#licencia)

**Inventario Smart** es un sistema web para la **gestión inteligente de productos y stock** en PYMEs.  
Permite **visualizar, agregar, comprar y eliminar** productos. Backend **Django + DRF** y Frontend **React + TS (Vite)**.  
Proyecto de titulación – Ingeniería en Informática (DuocUC).

---

## 🏗️ Arquitectura

```plaintext
                 ┌───────────────────────────┐
                 │        Frontend (Vite)     │
                 │───────────────────────────│
                 │ React + TypeScript         │
                 │ Axios (API REST)           │
                 │ Tema oscuro / Sidebar      │
                 └──────────────┬────────────┘
                                │ HTTP (JSON)
                 ┌──────────────▼────────────┐
                 │      Backend (Django)     │
                 │───────────────────────────│
                 │ Django REST Framework      │
                 │ CRUD /products/            │
                 │ Acción POST /products/{id}/buy/
                 └──────────────┬────────────┘
                                │ ORM
                 ┌──────────────▼────────────┐
                 │        SQLite (dev)       │
                 │  Product(id, sku, name,   │
                 │  qty, status, updated_at) │
                 └───────────────────────────┘
🚀 Ramas (Git Flow)
Rama	Descripción	Uso principal
main	Producción estable	Código listo para deploy
dev	Desarrollo activo	Implementación de features
test	Pruebas / QA	Validación e integración
backup	Respaldo manual	Copias antes de cambios grandes

Rutina diaria (dev):

bash
Copy code
git checkout dev
git add .
git commit -m "feat: X"
git push
Promocionar a producción:

bash
Copy code
git checkout test && git merge dev && git push
git checkout main && git merge test && git push
🧩 Stack
Backend: Django 5.2 + Django REST Framework, django-cors-headers, python-dotenv

Frontend: React 18 + TypeScript + Vite, Axios, React Router, Lucide Icons

DB (dev): SQLite

Entornos: venv (Python) / Node LTS (20/22)

🧰 Cómo correr el proyecto
Backend
bash
Copy code
cd backend
# activar venv (Windows)
.venv\Scripts\activate
# migrar y levantar
python manage.py migrate
python manage.py runserver 8000
# API: http://localhost:8000/api/products/
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
# UI:  http://localhost:5173
Variables de entorno:

backend/.env → SECRET_KEY=... / DEBUG=1

frontend/.env.local → VITE_API_URL=http://localhost:8000/api

📡 Endpoints clave
GET /api/products/ — Lista productos

POST /api/products/ — Crea producto {sku, name, qty, status}

DELETE /api/products/{id}/ — Elimina producto

POST /api/products/{id}/buy/ { qty } — Compra (decrementa stock y ajusta status):

qty <= 0 → 400

qty > stock → 400

qty == stock → status = OUT

0 < stock <= 5 → status = PENDING

stock > 5 → status = AVAILABLE

📁 Estructura
plaintext
Copy code
smart-maludev/
├─ backend/
│  ├─ core/            # settings/urls
│  ├─ inventory/       # modelos, serializers, viewsets
│  ├─ manage.py
│  ├─ .env             # (no se sube)
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  │  ├─ components/   # formularios, modales
│  │  ├─ lib/api.ts    # cliente Axios
│  │  ├─ pages/        # General, Inventory, Ventas
│  │  ├─ App.tsx, main.tsx, vite-env.d.ts
│  ├─ .env.local       # (no se sube)
│  └─ package.json
├─ .gitignore
└─ README.md
🧪 Roadmap corto
 Validaciones de formulario en front (SKU único, qty ≥ 0)

 Paginación y búsqueda en /products/

 Estados visuales (toasts/spinners/errores)

 Docker Compose para dev

 Deploy (Railway/Render + Vercel/Netlify)

👤 Autor
Elías Yévenes (Malupitto) – Ingeniería en Informática, DuocUC

“Sanar sistemas, como sanar personas: mantener el equilibrio.” ⚕️

📜 Licencia
MIT – uso y modificación permitidos con atribución al autor.