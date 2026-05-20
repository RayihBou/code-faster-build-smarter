# Code Faster, Build Smarter

Chatbot empresarial con Amazon Bedrock que permite subir documentos y hacer preguntas en lenguaje natural sobre su contenido. Protegido con autenticacion Cognito.

## Arquitectura

```
Usuario (Browser/Movil)
    |
    +-- GET /            -> FrontendFunction (publica) -> HTML con login
    +-- GET /auth.js     -> FrontendFunction (publica) -> Config Cognito
    +-- POST /upload     -> ChatbotFunction (JWT auth) -> Guarda doc en S3
    +-- POST /chat       -> ChatbotFunction (JWT auth) -> Invoca Bedrock con contexto del doc
    +-- POST /chat-image -> ChatbotFunction (JWT auth) -> Invoca Bedrock con vision (imagen)
    +-- GET /documents   -> ChatbotFunction (JWT auth) -> Lista documentos
```

**Servicios AWS:**
- API Gateway HTTP API (con Cognito JWT Authorizer)
- AWS Lambda (2 funciones: frontend + API)
- Amazon Cognito (User Pool, autenticacion por email)
- Amazon S3 (documentos, auto-delete 24h)
- Amazon Bedrock (Claude Haiku 4.5 via inference profile)
- CloudFormation (stack completo, eliminable en un comando)

## Requisitos Previos

| Requisito | Instalacion |
|-----------|-------------|
| AWS CLI v2 | [Instalar](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| SAM CLI | [Instalar](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| Credenciales AWS | `aws configure` o `aws sso login` |
| Claude Haiku 4.5 | Habilitar en Bedrock Model Access (us-east-1) |

### Validar prerequisites

```bash
chmod +x scripts/validate-setup.sh
./scripts/validate-setup.sh
```

## Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

El script solo te pide tu correo electronico. Con ese email:
1. Se crea un usuario en Cognito automaticamente
2. Recibes una contrasena temporal por email
3. Al primer login, configuras tu contrasena definitiva

Al finalizar el deploy, el output muestra la URL de la aplicacion.

## Uso

1. Abrir la URL del output (AppUrl)
2. Iniciar sesion con el email y la contrasena temporal recibida por correo
3. Configurar tu nueva contrasena
4. Subir un documento o tomar una foto de un documento
5. Hacer preguntas en lenguaje natural

### Modos de entrada

- **Documentos:** Subir PDF, Word, Excel, TXT o Markdown. El chatbot extrae el texto y responde con base en el contenido.
- **Camara (movil):** Tomar foto de un documento fisico. Claude Haiku 4.5 analiza la imagen directamente con vision y responde preguntas sobre lo que ve.
- **Imagen (desktop):** Seleccionar una imagen guardada para analisis.

## Formatos Soportados

**Documentos:**

| Formato | Extensiones |
|---------|-------------|
| PDF | .pdf |
| Word | .docx |
| Excel | .xlsx, .xls |
| Texto plano | .txt |
| Markdown | .md |

**Imagenes (camara/archivo):**

| Formato | Extensiones |
|---------|-------------|
| JPEG | .jpg, .jpeg |
| PNG | .png |
| WebP | .webp |
| GIF | .gif |

Tamano maximo documentos: 20 MB. Documentos se eliminan automaticamente despues de 24 horas.
Imagenes no se almacenan en S3 (se envian directamente al modelo).

## Seguridad

- Autenticacion obligatoria con Cognito (solo usuarios creados por admin)
- JWT Authorizer en API Gateway (todas las rutas de API protegidas)
- Sin self sign-up (solo el email definido en el deploy tiene acceso)
- Documentos auto-eliminados a las 24h (S3 Lifecycle)
- Bucket S3 con cifrado AES-256 y acceso publico bloqueado

## Estructura del Proyecto

```
├── src/
│   ├── index.js              # Handler API (upload, chat, documents)
│   ├── frontend-handler.js   # Handler frontend (HTML + config Cognito)
│   ├── bedrock.js            # Invocacion a Bedrock con streaming
│   ├── s3.js                 # Operaciones S3
│   ├── text-extractor.js     # Extraccion de texto multi-formato
│   └── frontend/
│       └── index.html        # UI con login Cognito + chat
├── template.yaml             # SAM template (API Gateway + Cognito + Lambda + S3)
├── samconfig.toml            # Config de deploy pre-configurada
├── package.json
├── scripts/
│   ├── deploy.sh             # Deploy (solo pide email)
│   ├── cleanup.sh            # Elimina todo (vacia S3 + delete stack)
│   └── validate-setup.sh     # Valida prerequisites
└── README.md
```

## Eliminacion

```bash
./scripts/cleanup.sh
```

Vacia el bucket S3 y elimina el stack de CloudFormation completamente en un solo comando.

## Costos Estimados

| Servicio | Costo por sesion |
|----------|-----------------|
| Lambda | ~$0.01 |
| API Gateway | ~$0.01 |
| S3 | ~$0.01 |
| Cognito | Gratis (< 50K MAU) |
| Bedrock (Claude Haiku 4.5) | ~$0.50-2.00 |
| **Total** | **~$1-3 USD** |

## Workshop

Este proyecto fue creado para el workshop **"Code Faster, Build Smarter"** — AWS Argentina, 4 de junio de 2026. Construido usando la metodologia [AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) con [Kiro IDE](https://kiro.dev).
