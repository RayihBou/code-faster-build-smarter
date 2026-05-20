# Documento de Entorno Técnico

## Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Runtime | Node.js 20.x |
| IaC | AWS SAM (genera CloudFormation) |
| Compute | AWS Lambda (Function URL, sin API Gateway) |
| Almacenamiento | Amazon S3 (documentos subidos) |
| IA | Amazon Bedrock — Claude Haiku (anthropic.claude-3-haiku-20240307-v1:0) |
| Frontend | HTML/CSS/JavaScript embebido (servido por la misma Lambda) |

## Arquitectura

```
Usuario (Browser)
    │
    ├── GET /           → FrontendFunction (sin auth) → Sirve HTML con login
    ├── GET /auth.js    → FrontendFunction (sin auth) → Config de Cognito
    ├── POST /upload    → ChatbotFunction (JWT auth) → Guarda documento en S3
    ├── POST /chat      → ChatbotFunction (JWT auth) → Lee doc de S3, invoca Bedrock, retorna respuesta
    └── GET /documents  → ChatbotFunction (JWT auth) → Lista documentos de la sesión
```

## Servicios AWS Utilizados

- **API Gateway HTTP API** — Endpoint HTTPS con Cognito JWT Authorizer
- **AWS Lambda** — Dos funciones: FrontendFunction (sirve HTML) y ChatbotFunction (API)
- **Amazon Cognito** — User Pool + App Client para autenticación (self sign-up con email)
- **Amazon S3** — Bucket para documentos subidos (lifecycle: auto-delete 24h)
- **Amazon Bedrock** — Invocación con streaming a Claude Haiku 4.5
- **IAM** — Roles con permisos mínimos para S3 y Bedrock
- **CloudFormation** — Stack generado por SAM para deploy/cleanup

## Configuración de Lambda

- ChatbotFunction: Timeout 60s, Memoria 512MB, Runtime nodejs20.x, arm64
- FrontendFunction: Timeout 60s, Memoria 512MB, Runtime nodejs20.x, arm64
- API Gateway HTTP API con JWT Authorizer (Cognito)
- Rutas protegidas: /upload, /chat, /documents
- Rutas públicas: /, /auth.js

## Autenticación

- Cognito User Pool con self sign-up habilitado
- Registro con email + verificación por código
- Frontend usa amazon-cognito-identity-js (SDK directo, sin Amplify)
- Token JWT se envía en header Authorization en cada request
- API Gateway valida el token automáticamente

## Región

us-east-1 (Bedrock con Claude Haiku 4.5 disponible)

## Modelo de IA

- ID: us.anthropic.claude-haiku-4-5-20251001-v1:0 (inference profile, no on-demand directo)
- Razón: Bajo costo, respuesta rápida, suficiente para Q&A con contexto. Reemplaza a Claude 3 Haiku que fue marcado como Legacy.
- Context window: 200K tokens (soporta documentos largos)
- Nota: Claude Haiku 4.5 requiere inference profile (prefijo "us.") — no soporta invocación on-demand directa

## Estructura del Proyecto (resultado esperado post AI-DLC)

```
code-faster-build-smarter/
├── .kiro/steering/           ← Reglas AI-DLC
├── docs/                     ← Documentos de entrada
├── src/
│   ├── index.js              ← Handler API (routes: POST /upload, POST /chat, GET /documents)
│   ├── frontend-handler.js   ← Handler frontend (GET /, GET /auth.js)
│   ├── bedrock.js            ← Módulo de invocación a Bedrock con streaming
│   ├── s3.js                 ← Módulo de lectura/escritura S3
│   ├── text-extractor.js     ← Extracción de texto de documentos
│   └── frontend/
│       └── index.html        ← UI del chatbot con login Cognito
├── template.yaml             ← SAM template (API Gateway + Cognito + Lambda + S3)
├── package.json
├── scripts/
│   ├── validate-setup.sh
│   └── cleanup.sh
└── README.md
```

## Convenciones de Código

- ESM modules (import/export)
- Sin frameworks de backend (vanilla Node.js con Lambda handler)
- Frontend vanilla (sin React/Vue, solo HTML + CSS + JS)
- Nombres de archivos en kebab-case
- Variables y funciones en camelCase
- Comentarios en español
- Todo el texto visible al usuario (frontend, mensajes de error, placeholders) debe estar en español

## Deploy

```bash
sam build
sam deploy --guided
```

El stack se elimina completamente con:
```bash
sam delete
```
O desde la consola: CloudFormation → Delete Stack

## Costos Estimados por Sesión

| Servicio | Costo estimado |
|----------|---------------|
| Lambda (invocaciones) | ~$0.01 |
| S3 (almacenamiento) | ~$0.01 |
| Bedrock (Claude Haiku) | ~$0.50-2.00 |
| **Total por participante** | **~$1-3** |
