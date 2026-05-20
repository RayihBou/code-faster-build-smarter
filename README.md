# Code Faster, Build Smarter

Workshop: Construya un chatbot empresarial con Amazon Bedrock usando la metodología AI-DLC y Kiro IDE — de requisitos a deploy en menos de 60 minutos.

## Qué es Este Proyecto

Un starter kit pre-configurado con la metodología [AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) (AI-Driven Development Life Cycle) para construir un chatbot empresarial que responde preguntas sobre documentos internos usando Amazon Bedrock.

El proyecto incluye:
- Reglas de AI-DLC pre-configuradas para Kiro
- Documentos de visión y entorno técnico listos para iniciar
- Script de validación de prerequisites

## Arquitectura Resultante

```
Usuario (Browser) → Lambda Function URL
                      ├── GET /        → Frontend HTML (chat UI)
                      ├── POST /upload → Sube documento a S3
                      └── POST /chat   → Invoca Bedrock con contexto del documento
```

**Servicios:** Lambda + S3 + Bedrock (Claude Haiku)
**Deploy:** SAM (CloudFormation stack)
**Cleanup:** `sam delete` (elimina todo en un comando)

## Inicio Rápido

### 1. Clonar

```bash
git clone https://github.com/RayihBou/code-faster-build-smarter.git
cd code-faster-build-smarter
```

### 2. Validar prerequisites

```bash
chmod +x scripts/validate-setup.sh
./scripts/validate-setup.sh
```

### 3. Abrir en Kiro e iniciar AI-DLC

Abrir el proyecto en Kiro y escribir en el chat:

> Usando AI-DLC, construye el chatbot descrito en docs/vision.md con el entorno técnico definido en docs/tech-environment.md

AI-DLC guiará automáticamente por las fases:
1. **Inception** — Genera requisitos, historias y unidades de trabajo
2. **Construction** — Propone arquitectura, genera código y tests
3. **Operations** — Guía el deploy con SAM

### 4. Deploy (requiere AWS CLI + SAM CLI + credenciales)

```bash
sam build
sam deploy --guided
```

### 5. Cleanup

```bash
sam delete
```

## Prerequisites

| Requisito | Obligatorio | Instalación |
|-----------|-------------|-------------|
| Kiro | ✅ | [kiro.dev](https://kiro.dev) |
| Node.js 20+ | ✅ | [nodejs.org](https://nodejs.org) |
| Git | ✅ | [git-scm.com](https://git-scm.com) |
| AWS CLI | Para deploy | [Instalar](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| SAM CLI | Para deploy | [Instalar](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |
| Credenciales AWS | Para deploy | [Configurar](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html) |
| Claude Haiku habilitado | Para deploy | [Model access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) en us-east-1 |

## Costo Estimado

~$1-3 USD por sesión completa (Lambda + S3 + Bedrock Haiku).
Todo se elimina con `sam delete` (un solo stack de CloudFormation).

## Evento

Este proyecto fue creado para el workshop **"Code Faster, Build Smarter"** — AWS Argentina, 4 de junio de 2026.

## Licencia

MIT
