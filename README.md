# 🧠 Smart MaluDev – Sistema de Inventario Inteligente

[![Status](https://img.shields.io/badge/Estado-Estable%20v1.0.0--apt-brightgreen)](#)
[![Backend](https://img.shields.io/badge/Backend-Django%205.2-blue)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Database](https://img.shields.io/badge/Base%20de%20Datos-SQLite-lightgrey)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/Licencia-MIT-green)](#licencia)

**Smart MaluDev** es un sistema web para la **gestión inteligente de inventario y movimientos de stock** en PYMEs.  
Incluye **dashboard con métricas**, **módulo de inventario con CRUD y filtros**, y un **Punto de Venta (POS)** para ventas y ajustes con historial real de stock.  

Proyecto de Titulación – Ingeniería en Informática – **DUOC UC**.

---

## ✨ Funcionalidades principales

### 📊 Dashboard General
- Total de productos registrados
- Stock total disponible
- Valor estimado del inventario (precio × cantidad)
- Movimientos registrados en los últimos días
- **Productos con stock crítico**
- **Proyección básica de agotamiento (versión beta)**

### 📦 Gestión de Inventario
- CRUD de productos (crear, editar, eliminar)
- Filtros: SKU, nombre, estado (`AVAILABLE`, `PENDING`, `OUT`)
- Ajustes de stock con motivo y nota
- **Valor total del inventario**

### 🛒 Punto de Venta (POS)
- Agregar productos por SKU
- Control de cantidades
- Cálculo automático de **Subtotal + IVA (19%) + Total final**
- Confirmación de compra con descargo real en stock
- Historial reciente integrado

### 📜 Movimientos
- Fecha y hora
- SKU y producto
- Delta en stock (+ / -)
- Motivo y notas

---

## 🖼️ Capturas de pantalla
*(Pendiente agregar rutas reales a `docs/screenshots/`)*

| Vista | Screenshot |
|-------|-----------|
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) |
| Inventario | ![Inventario](docs/screenshots/inventory.png) |
| Punto de Venta | ![POS](docs/screenshots/pos.png) |

---

## 🏗️ Arquitectura

```plaintext
                 ┌───────────────────────────┐
                 │        Frontend (Vite)     │
                 │ React + TypeScript         │
                 │ Axios (API REST)           │
                 │ Tema oscuro / Sidebar      │
                 └──────────────┬────────────┘
                                │ HTTP (JSON)
                 ┌──────────────▼────────────┐
                 │      Backend (Django)     │
                 │ Django REST Framework      │
                 │ /api/products/             │
                 │ /api/products/{id}/buy/    │
                 │ /api/movements/            │
                 │ /api/dashboard/            │
                 └──────────────┬────────────┘
                                │ ORM
                 ┌──────────────▼────────────┐
                 │        SQLite (dev)       │
                 └───────────────────────────┘
🧠 Stack Tecnológico
Backend
Django 5.2 + Django REST Framework

django-cors-headers

python-dotenv

Frontend
React 18

TypeScript

Vite

Axios

React Router

Base de Datos
SQLite (desarrollo)

Preparado para PostgreSQL en producción

🚀 Instalación y ejecución
Backend
bash
Copy code
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# API: http://localhost:8000/api/
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
# UI: http://localhost:5173/
Variables de entorno
makefile
Copy code
backend/.env:
SECRET_KEY=...
DEBUG=1

frontend/.env.local:
VITE_API_URL=http://localhost:8000/api
📡 Endpoints principales
Método	Endpoint	Descripción
GET	/api/products/	Lista productos
POST	/api/products/	Crea producto
PUT	/api/products/{id}/	Edita producto
DELETE	/api/products/{id}/	Elimina producto
POST	/api/products/{id}/buy/	Ajuste/venta de stock

🔧 Estructura del proyecto
plaintext
Copy code
smart-maludev/
├─ backend/
│  ├─ core/
│  ├─ inventory/
│  ├─ manage.py
│  ├─ .env
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  ├─ .env.local
│  └─ package.json
├─ .gitignore
└─ README.md
🌱 Roadmap
Integración Prophet para predicción real de demanda

Autenticación y roles

Reportes PDF / Excel

Docker Compose para entornos productivos

Deploy: Render / Railway + Vercel / Netlify

⚙️ Flujo de trabajo Git (Git Flow)
Rama	Uso
main	versión estable / demo
dev	desarrollo activo
test	pruebas / QA
backup-safe-*	respaldo antes de cambios grandes

bash
Copy code
git checkout dev
git add .
git commit -m "feat: módulo POS funcional"
git push
👤 Autor
Elías Yévenes (Malupitto)
Ingeniería en Informática – DUOC UC

“Sanar sistemas, como sanar personas: mantener el equilibrio.” ⚕️