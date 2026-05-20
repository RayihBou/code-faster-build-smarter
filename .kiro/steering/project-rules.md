# Reglas del Proyecto

## Estructura

- No dejar archivos sueltos en la raíz que no tengan un propósito claro (config, README, template.yaml, package.json son aceptables)
- Código fuente en `src/`
- Frontend en `src/frontend/`
- Tests en `tests/`
- Documentación generada por AI-DLC en `aidlc-docs/`
- Scripts utilitarios en `scripts/`

## Código

- Runtime: Node.js 20 con ESM modules (import/export)
- Sin frameworks de backend (vanilla Lambda handler)
- Frontend vanilla (HTML + CSS + JS, sin React/Vue/Angular)
- Nombres de archivos en kebab-case
- Variables y funciones en camelCase
- No usar emojis en código ni documentación generada
- Manejar errores de forma explícita (try/catch con mensajes claros)
- Validar inputs antes de procesarlos

## Seguridad

- No hardcodear credenciales, tokens o secrets en el código
- Usar variables de entorno para configuración sensible
- Sanitizar inputs del usuario antes de inyectarlos en prompts de Bedrock

## Deploy

- Usar AWS SAM (template.yaml) como IaC
- Todo debe quedar en un solo stack de CloudFormation
- Nombrar el stack de forma descriptiva (ej: code-faster-chatbot)
- Incluir outputs en el template (URL del chatbot) para fácil acceso post-deploy

## Modificaciones

- No eliminar archivos existentes sin confirmación explícita
- No modificar archivos de steering ni reglas de AI-DLC
- No modificar docs/vision.md ni docs/tech-environment.md (son documentos de entrada, no de salida)
