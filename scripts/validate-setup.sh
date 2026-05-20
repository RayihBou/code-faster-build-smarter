#!/bin/bash
# validate-setup.sh — Valida prerequisites para el workshop Code Faster, Build Smarter

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Code Faster, Build Smarter — Setup Validation  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js no encontrado. Instalar desde https://nodejs.org"
    ERRORS=$((ERRORS + 1))
fi

# AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    echo "✅ AWS CLI instalado: $AWS_VERSION"
else
    echo "❌ AWS CLI no encontrado. Instalar desde https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    ERRORS=$((ERRORS + 1))
fi

# SAM CLI
if command -v sam &> /dev/null; then
    SAM_VERSION=$(sam --version 2>&1)
    echo "✅ SAM CLI instalado: $SAM_VERSION"
else
    echo "❌ SAM CLI no encontrado. Instalar desde https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    ERRORS=$((ERRORS + 1))
fi

# Credenciales AWS
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo "✅ Credenciales AWS válidas (cuenta: $ACCOUNT)"
else
    echo "❌ Credenciales AWS no configuradas o expiradas. Ejecutar: aws sso login o aws configure"
    ERRORS=$((ERRORS + 1))
fi

# Bedrock access
if aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?modelId=='anthropic.claude-3-haiku-20240307-v1:0'].modelId" --output text 2>/dev/null | grep -q "claude"; then
    echo "✅ Amazon Bedrock accesible (Claude Haiku disponible)"
else
    echo "⚠️  No se pudo verificar acceso a Bedrock. Asegúrese de habilitar Claude Haiku en la consola de Bedrock (us-east-1)"
fi

# Git
if command -v git &> /dev/null; then
    echo "✅ Git instalado"
else
    echo "❌ Git no encontrado"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "────────────────────────────────────────────────────"
if [ $ERRORS -eq 0 ]; then
    echo "🎉 Todo listo. Puede iniciar el workshop."
else
    echo "⚠️  $ERRORS problema(s) encontrado(s). Resolver antes del evento."
fi
echo ""
