# Smart MaluDev – Sistema de Inventario

Inventario Smart es un sistema web para la gestión inteligente de productos y stock en PYMEs.
Permite visualizar, agregar, comprar y eliminar productos, además de revisar un historial de movimientos.

- **Backend:** Django + Django REST Framework
- **Frontend:** React + TypeScript (Vite)
- Proyecto de titulación – Ingeniería en Informática (DuocUC)

---

## Arquitectura

```text
                     ┌───────────────────────────┐
                     │       Frontend (Vite)     │
                     │───────────────────────────│
                     │ React + TypeScript        │
                     │ Axios (API REST)          │
                     │ Tema oscuro / Sidebar     │
                     └──────────────┬────────────┘
                                    │ HTTP (JSON)
                     ┌──────────────▼────────────┐
                     │      Backend (Django)     │
                     │───────────────────────────│
                     │ Django REST Framework     │
                     │ CRUD /api/products/       │
                     │ Acción POST /buy/         │
                     └──────────────┬────────────┘
                                    │ ORM
                     ┌──────────────▼────────────┐
                     │        SQLite (dev)        │
                     │ Product(                   │
                     │   id, sku, name, qty,      │
                     │   price, status, updated_at│
                     │ )                          │
                     └────────────────────────────┘
Ramas (Git Flow)
Rama	Descripción	Uso principal
main	Producción estable	Código listo para deploy
dev	Desarrollo activo	Implementación de features
test	Pruebas / QA	Validación e integración
backup / backup-safe*	Respaldo manual	Copias antes de cambios grandes

Rutina diaria (dev)
bash
Copy code
git checkout dev
git add .
git commit -m "feat: X"
git push
Promocionar a producción
bash
Copy code
git checkout test && git merge dev && git push
git checkout main && git merge test && git push
Stack tecnológico
Backend: Django 5.x, Django REST Framework, django-cors-headers, python-dotenv

Frontend: React 18, TypeScript, Vite, Axios, React Router, Lucide Icons

Base de datos (desarrollo): SQLite

Entornos: venv (Python) / Node LTS (20/22)

Cómo correr el proyecto
Backend
bash
Copy code
cd backend
.venv\Scripts\activate     # activar entorno virtual (Windows)
python manage.py migrate   # migraciones
python manage.py runserver 8000
# API: http://localhost:8000/api/products/
Frontend
bash
Copy code
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
Variables de entorno (recomendado)
backend/.env → SECRET_KEY=..., DEBUG=1

frontend/.env.local → VITE_API_URL=http://localhost:8000/api


Endpoints clave
GET /api/products/ — Lista productos

POST /api/products/ — Crea producto { sku, name, qty, price, status }

PUT /api/products/{id}/ — Actualiza producto

DELETE /api/products/{id}/ — Elimina producto

POST /api/products/{id}/buy/ — Compra { qty } y ajusta stock/estado:

Condición	Resultado
qty <= 0	     400
qty > stock	     400
qty == stock	status = OUT
stock <= 5	status = PENDING
stock > 5	status = AVAILABLE

Estructura del repositorio
text
Copy code
smart-maludev/
├─ backend/
│  ├─ core/            # settings/urls
│  ├─ inventory/       # modelos, serializers, viewsets
│  ├─ manage.py
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  │  ├─ components/   # formularios, toasts, layout
│  │  ├─ lib/api.ts    # cliente Axios
│  │  ├─ pages/        # General, Inventory, Movements
│  │  ├─ App.tsx, main.tsx, vite-env.d.ts
│  ├─ index.html
│  └─ package.json
├─ .gitignore
└─ README.md
 Roadmap corto
Validaciones de formulario en frontend (SKU único, qty ≥ 0, price ≥ 0)

Paginación y búsqueda en /products/

Estados visuales (toasts, loaders, manejo de errores)

Docker Compose para desarrollo

Deploy (Railway/Render backend + Vercel/Netlify frontend)

Integración futura de módulo de predicción (Prophet u otra librería)

👤 Autor
Elías Yévenes (Malupitto) – Ingeniería en Informática, DuocUC


 Licencia
Proyecto bajo licencia MIT.
Se permite uso y modificación con atribución al autor original.
