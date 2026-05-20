// Módulo de invocación a Amazon Bedrock (Claude Haiku 4.5)
// Genera respuestas basadas exclusivamente en el contexto del documento

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });
const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
const MAX_TOKENS = 2048;

// Prompt del sistema que restringe las respuestas al contenido del documento
const SYSTEM_PROMPT = `Eres un asistente especializado en responder preguntas basándote EXCLUSIVAMENTE en el contenido del documento proporcionado.

Reglas estrictas:
1. SOLO responde con información que esté contenida en el documento proporcionado.
2. Si la pregunta NO puede responderse con el contenido del documento, responde: "No encuentro información sobre eso en el documento proporcionado. Solo puedo responder preguntas relacionadas con el contenido del documento."
3. NUNCA inventes información ni uses conocimiento externo al documento.
4. Si la respuesta está parcialmente en el documento, indica qué parte encontraste y qué parte no está disponible.
5. Responde en el mismo idioma en que se hace la pregunta.
6. Sé conciso pero completo en tus respuestas.`;

/**
 * Genera una respuesta del chatbot usando Bedrock
 * @param {string} documentText - Texto completo del documento como contexto
 * @param {string} userMessage - Pregunta del usuario
 * @param {Array<{role: string, content: string}>} conversationHistory - Historial de la conversación
 * @returns {Promise<string>} Respuesta generada por el modelo
 */
export async function generateResponse(documentText, userMessage, conversationHistory = []) {
  // Construir los mensajes con el contexto del documento
  const messages = buildMessages(documentText, userMessage, conversationHistory);

  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages,
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text;
    }

    return 'No pude generar una respuesta. Por favor intenta reformular tu pregunta.';
  } catch (error) {
    console.error('Error al invocar Bedrock:', error);

    if (error.name === 'AccessDeniedException') {
      throw new Error('No se tiene acceso al modelo de Bedrock. Verifica que Claude Haiku 4.5 esté habilitado en tu cuenta.');
    }

    if (error.name === 'ThrottlingException') {
      throw new Error('Demasiadas solicitudes al modelo. Por favor espera unos segundos e intenta de nuevo.');
    }

    throw new Error(`Error al generar respuesta: ${error.message}`);
  }
}

/**
 * Construye el array de mensajes para la API de Claude
 * Incluye el contexto del documento en el primer mensaje del usuario
 * @param {string} documentText - Texto del documento
 * @param {string} userMessage - Mensaje actual del usuario
 * @param {Array<{role: string, content: string}>} history - Historial previo
 * @returns {Array<{role: string, content: string}>} Mensajes formateados
 */
function buildMessages(documentText, userMessage, history) {
  const messages = [];

  // Incluir historial de conversación previo
  for (const msg of history) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Mensaje actual del usuario con el contexto del documento
  const contextualMessage = `<documento>\n${documentText}\n</documento>\n\nPregunta del usuario: ${userMessage}`;

  messages.push({
    role: 'user',
    content: contextualMessage,
  });

  return messages;
}
