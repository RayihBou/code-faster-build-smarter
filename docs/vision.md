# Documento de Visión — Chatbot Empresarial con Contexto Documental

## Objetivo

Construir un chatbot empresarial serverless que permita a los usuarios subir un documento (PDF o TXT) y hacer preguntas en lenguaje natural sobre su contenido. El chatbot responde utilizando Amazon Bedrock (Claude Haiku) con el documento como contexto.

## Problema que Resuelve

Las organizaciones tienen documentación interna (manuales, políticas, procedimientos, reportes) que sus equipos necesitan consultar frecuentemente. Hoy eso implica buscar manualmente en archivos, leer páginas completas o preguntar a colegas. Este chatbot permite obtener respuestas inmediatas basadas en el contenido real del documento.

## Usuarios

- Cualquier persona de la organización que necesite consultar documentación interna
- No requiere conocimientos técnicos para usar el chatbot

## Funcionalidades

1. **Subir documento** — El usuario sube un archivo PDF o TXT desde la interfaz web
2. **Chat con contexto** — El usuario hace preguntas en lenguaje natural y recibe respuestas basadas en el contenido del documento subido
3. **Interfaz web simple** — Frontend HTML embebido, accesible desde cualquier navegador
4. **Historial de conversación** — Mantiene contexto de la conversación actual (en memoria)

## Restricciones

- Serverless (sin servidores que administrar)
- Deploy en un solo comando (CloudFormation stack)
- Costo mínimo (Claude Haiku, pago por uso)
- Sin autenticación (es un workshop/prototipo, no producción)
- Documentos de hasta 50 páginas (dentro del context window del modelo)
- Eliminación completa con delete stack de CloudFormation

## Personalización

El dominio del chatbot es personalizable. El usuario puede subir cualquier documento de su industria:
- RRHH: políticas internas, reglamentos
- Logística: manuales de operación, procedimientos
- Finanzas: reportes, normativas
- Manufactura: fichas técnicas, protocolos de calidad
- Cualquier otro dominio con documentación textual

## Resultado Esperado

Al finalizar la construcción, el usuario tiene:
- Una URL pública (Function URL) donde accede al chatbot
- La capacidad de subir un documento y hacerle preguntas
- Todo corriendo en su cuenta AWS como un stack de CloudFormation
