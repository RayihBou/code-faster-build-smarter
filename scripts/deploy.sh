#!/bin/bash
# deploy.sh — Despliega el chatbot. Solo necesitas tu email.

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Code Faster, Build Smarter — Deploy            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

read -p "Ingresa tu correo electronico (para acceder al chatbot): " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
  echo "Error: Debes ingresar un correo electronico."
  exit 1
fi

echo ""
echo "Desplegando con email: $ADMIN_EMAIL"
echo ""

sam build && sam deploy --parameter-overrides AdminEmail="$ADMIN_EMAIL"

echo ""
echo "Deploy completado. Revisa tu correo para obtener la contrasena temporal."
echo ""
