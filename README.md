# Chatbot Empresarial con Contexto Documental

Chatbot serverless que permite subir documentos (PDF, Word, Excel, TXT, Markdown) y hacer preguntas en lenguaje natural sobre su contenido. Utiliza Amazon Bedrock (Claude Haiku 4.5) para generar respuestas basadas exclusivamente en el documento.

## Arquitectura

```
Usuario (Browser)
    |
    +-- GET /           -> Lambda sirve frontend HTML
    +-- POST /upload    -> Lambda recibe documento, lo guarda en S3
    +-- POST /chat      -> Lambda lee documento de S3, invoca Bedrock, retorna respuesta
    +-- GET /documents  -> Lambda lista documentos de la sesion
```

**Servicios AWS:**
- AWS Lambda (Function URL, sin API Gateway)
- Amazon S3 (almacenamiento de documentos)
- Amazon Bedrock (Claude Haiku 4.5 para generacion de respuestas)

## Requisitos Previos

1. **AWS CLI** configurado con credenciales validas
2. **AWS SAM CLI** instalado ([instrucciones](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
3. **Node.js 20.x** instalado
4. **Amazon Bedrock** con acceso habilitado al modelo Claude Haiku 4.5 en us-east-1

### Habilitar Claude Haiku 4.5 en Bedrock

1. Ir a la consola de AWS -> Amazon Bedrock -> Model access
2. Solicitar acceso a "Anthropic - Claude Haiku 4.5"
3. Esperar aprobacion (generalmente inmediata)

## Deploy

```bash
# Construir el proyecto
sam build

# Desplegar (primera vez, interactivo)
sam deploy --guided
```

Durante el deploy guiado:
- Stack name: `code-faster-chatbot`
- Region: `us-east-1`
- Confirm changes: Yes
- Allow SAM CLI IAM role creation: Yes
- ChatbotFunction Function Url without auth: Yes

Al finalizar, el output muestra la URL del chatbot.

## Uso

1. Acceder a la URL del output (ChatbotUrl)
2. Subir un documento (PDF, Word, Excel, TXT o Markdown)
3. Seleccionar el documento en el panel lateral
4. Escribir preguntas en el chat

## Formatos Soportados

| Formato | Extensiones |
|---------|-------------|
| PDF | .pdf |
| Word | .docx, .doc |
| Excel | .xlsx, .xls |
| Texto plano | .txt |
| Markdown | .md |

Tamano maximo: 20 MB por archivo.

## Estructura del Proyecto

```
├── src/
│   ├── index.js              # Handler principal (router)
│   ├── bedrock.js            # Modulo de invocacion a Bedrock
│   ├── s3.js                 # Modulo de operaciones S3
│   ├── text-extractor.js     # Extraccion de texto multi-formato
│   └── frontend/
│       └── index.html        # Interfaz web del chatbot
├── template.yaml             # SAM template (IaC)
├── package.json              # Dependencias del proyecto
└── README.md
```

## Eliminacion

Para eliminar todos los recursos creados:

```bash
./scripts/cleanup.sh
```

Este script vacía el bucket S3 y elimina el stack de CloudFormation sin errores. No usar `sam delete` directamente (falla si el bucket tiene objetos).

## Costos Estimados

| Servicio | Costo por sesion |
|----------|-----------------|
| Lambda | ~$0.01 |
| S3 | ~$0.01 |
| Bedrock (Claude Haiku) | ~$0.50-2.00 |
| **Total** | **~$1-3** |

## Limitaciones

- Sin autenticacion (prototipo/workshop)
- Historial de conversacion solo en memoria del navegador
- Documentos de hasta 50 paginas (context window del modelo)
- Region fija: us-east-1
