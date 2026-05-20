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
    ├── GET /           → Lambda sirve frontend HTML
    ├── POST /upload    → Lambda recibe documento, lo guarda en S3
    └── POST /chat      → Lambda lee documento de S3, lo inyecta como contexto en Bedrock, retorna respuesta
```

## Servicios AWS Utilizados

- **AWS Lambda** — Una sola función que maneja frontend, upload y chat
- **Amazon S3** — Un bucket para almacenar los documentos subidos
- **Amazon Bedrock** — Invocación directa a Claude Haiku para generar respuestas
- **IAM** — Un role con permisos para S3 y Bedrock
- **CloudFormation** — Stack generado por SAM para deploy/cleanup

## Configuración de Lambda

- Timeout: 30 segundos
- Memoria: 512 MB
- Function URL: AuthType NONE (sin autenticación)
- Runtime: nodejs20.x

## Región

us-east-1 (Bedrock con Claude Haiku disponible)

## Modelo de IA

- ID: anthropic.claude-3-haiku-20240307-v1:0
- Razón: Bajo costo (~$0.00025/1K input tokens), respuesta rápida, suficiente para Q&A con contexto
- Context window: 200K tokens (soporta documentos largos)

## Estructura del Proyecto (resultado esperado post AI-DLC)

```
code-faster-build-smarter/
├── .kiro/steering/           ← Reglas AI-DLC
├── docs/                     ← Documentos de entrada
├── src/
│   ├── index.js              ← Handler principal (routes: GET, POST /upload, POST /chat)
│   ├── bedrock.js            ← Módulo de invocación a Bedrock
│   ├── s3.js                 ← Módulo de lectura/escritura S3
│   └── frontend/
│       └── index.html        ← UI del chatbot
├── template.yaml             ← SAM template
├── package.json
├── scripts/
│   └── validate-setup.sh
└── README.md
```

## Convenciones de Código

- ESM modules (import/export)
- Sin frameworks de backend (vanilla Node.js con Lambda handler)
- Frontend vanilla (sin React/Vue, solo HTML + CSS + JS)
- Nombres de archivos en kebab-case
- Variables y funciones en camelCase
- Comentarios en español

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
