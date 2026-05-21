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
- NUNCA indicar `sam deploy --guided` ni `sam deploy` directamente
- Para desplegar, SIEMPRE indicar al usuario que ejecute: `./scripts/deploy.sh`
- Este script solo solicita el correo electrónico del administrador y despliega automáticamente
- Para eliminar, indicar: `./scripts/cleanup.sh`

## Modificaciones

- No eliminar archivos existentes sin confirmación explícita
- No modificar archivos de steering ni reglas de AI-DLC
- No modificar docs/vision.md ni docs/tech-environment.md (son documentos de entrada, no de salida)

## Build y Validación

- No ejecutar `sam validate`, `sam build` ni `npm ls` durante la fase de Code Generation
- Esos comandos se ejecutan únicamente en la fase de Build and Test
- Para validar sintaxis de archivos JS, usar `node --check <archivo>`
- Para validar YAML, no usar `yaml.safe_load` (no soporta tags de CloudFormation como !Sub, !Ref)
- Si el shell reporta "No such file or directory" para cwd, indicar al usuario que abra un nuevo terminal en Kiro
