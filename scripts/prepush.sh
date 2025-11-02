#!/usr/bin/env sh
set -e

echo "🧪 Pre-push checks"

# Frontend: typecheck + build rápido
echo "→ Frontend: typecheck"
npx --prefix frontend tsc -p frontend --noEmit

echo "→ Frontend: build"
npm --prefix frontend run build

# Backend: hooks de pre-commit en modo pre-push (si tienes stage definido)
echo "→ Backend: pre-commit (pre-push)"
pre-commit run --hook-stage pre-push --all-files

echo "✅ Pre-push OK"
