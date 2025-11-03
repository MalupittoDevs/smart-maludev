# 🧠 Smart MaluDev – Sistema de Inventario Inteligente

**Inventario Smart** es un sistema web diseñado para la gestión inteligente de productos y stock en PYMEs, desarrollado como parte del proyecto de titulación en Ingeniería en Informática (DuocUC).

El sistema permite **visualizar, agregar, eliminar y comprar productos**, integrando un backend Django con un frontend React + TypeScript, todo bajo un flujo de desarrollo profesional con control de versiones Git.

---

## 🚀 Estructura de Ramas

El repositorio sigue un flujo **Git estándar de entornos** para mantener el control y seguridad del desarrollo:

| Rama | Descripción | Uso principal |
|------|--------------|----------------|
| `main` | Rama **estable de producción** | Código final, probado y listo para deploy |
| `dev` | Rama **activa de desarrollo** | Implementación de nuevas funciones |
| `test` | Rama de **pruebas / QA** | Validación e integración backend-frontend |
| `backup` | Rama de **respaldo manual** | Copias de seguridad previas a cambios grandes |

---

## ⚙️ Flujo de Trabajo

### Crear commit y subir cambios
```bash
git add .
git commit -m "Descripción del cambio"
git push


Cambiar entre ramas
git checkout dev
git checkout test
git checkout main
git checkout backup

Actualizar rama de respaldo
git checkout backup
git merge dev
git push origin backup

Unir cambios estables a producción
git checkout main
git merge test
git push origin main