// Handler principal de la función Lambda - API del chatbot
// Maneja rutas: POST /upload, POST /chat, GET /documents

import { uploadDocument, getDocument, listDocuments } from './s3.js';
import { extractText, isValidFormat, MAX_FILE_SIZE } from './text-extractor.js';
import { generateResponseStream } from './bedrock.js';

/**
 * Handler principal de Lambda - enruta según método y path
 */
export async function handler(event) {
  const method = event.requestContext?.http?.method || 'GET';
  const path = event.rawPath || '/';

  try {
    if (method === 'POST' && path === '/upload') {
      return await handleUpload(event);
    }

    if (method === 'POST' && path === '/chat') {
      return await handleChat(event);
    }

    if (method === 'GET' && path === '/documents') {
      return await handleListDocuments(event);
    }

    return jsonResponse(404, { error: 'Ruta no encontrada' });

  } catch (error) {
    console.error('Error en handler:', error);
    return jsonResponse(500, { error: error.message || 'Error interno del servidor' });
  }
}

/**
 * Maneja la subida de documentos
 * Valida formato y tamaño, luego almacena en S3
 * @param {object} event - Evento HTTP con el archivo
 * @returns {object} Respuesta con confirmación o error
 */
async function handleUpload(event) {
  // Parsear el body (puede venir en base64)
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : Buffer.from(event.body);

  // Extraer información del multipart/form-data
  const contentType = event.headers?.['content-type'] || '';
  const boundary = extractBoundary(contentType);

  if (!boundary) {
    return jsonResponse(400, { error: 'Content-Type debe ser multipart/form-data' });
  }

  const { fileName, fileBuffer, sessionId } = parseMultipart(body, boundary);

  if (!fileName || !fileBuffer) {
    return jsonResponse(400, { error: 'No se encontró archivo en la solicitud' });
  }

  // Validar formato
  if (!isValidFormat(fileName)) {
    return jsonResponse(400, {
      error: `Formato no soportado. Formatos válidos: PDF, Word (.docx), Excel (.xlsx, .xls), TXT, MD`,
    });
  }

  // Validar tamaño
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return jsonResponse(400, {
      error: `El archivo excede el tamaño máximo permitido (20 MB)`,
    });
  }

  // Generar sessionId si no viene en el request
  const sid = sessionId || generateSessionId();

  // Subir a S3
  const result = await uploadDocument(sid, fileName, fileBuffer, contentType);

  // Extraer texto para validar que el documento es procesable
  try {
    await extractText(fileBuffer, fileName);
  } catch (extractError) {
    return jsonResponse(400, { error: extractError.message });
  }

  return jsonResponse(200, {
    message: 'Documento subido exitosamente',
    fileName: result.fileName,
    key: result.key,
    sessionId: sid,
  });
}

/**
 * Maneja las solicitudes de chat con streaming (Server-Sent Events)
 * Lee el documento de S3, extrae texto e invoca Bedrock con streaming
 * @param {object} event - Evento HTTP con la pregunta
 * @returns {object} Respuesta del chatbot en streaming
 */
async function handleChat(event) {
  const body = JSON.parse(event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body);

  const { message, documentKey, history } = body;

  if (!message) {
    return jsonResponse(400, { error: 'El campo "message" es requerido' });
  }

  if (!documentKey) {
    return jsonResponse(400, { error: 'Debes seleccionar un documento primero' });
  }

  // Obtener documento de S3
  const fileBuffer = await getDocument(documentKey);
  const fileName = documentKey.split('/').pop();

  // Extraer texto del documento
  const documentText = await extractText(fileBuffer, fileName);

  // Generar respuesta con streaming
  let fullResponse = '';
  for await (const chunk of generateResponseStream(documentText, message, history || [])) {
    fullResponse += chunk;
  }

  return jsonResponse(200, { response: fullResponse });
}

/**
 * Lista los documentos de una sesión
 * @param {object} event - Evento HTTP con sessionId como query param
 * @returns {object} Lista de documentos
 */
async function handleListDocuments(event) {
  const sessionId = event.queryStringParameters?.sessionId;

  if (!sessionId) {
    return jsonResponse(400, { error: 'El parámetro "sessionId" es requerido' });
  }

  const documents = await listDocuments(sessionId);

  return jsonResponse(200, { documents });
}

/**
 * Genera una respuesta JSON estandarizada
 * @param {number} statusCode - Código HTTP
 * @param {object} body - Cuerpo de la respuesta
 * @returns {object} Respuesta formateada para Lambda
 */
function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Extrae el boundary del Content-Type multipart
 * @param {string} contentType - Header Content-Type
 * @returns {string|null} Boundary o null si no es multipart
 */
function extractBoundary(contentType) {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
  return match ? (match[1] || match[2]) : null;
}

/**
 * Parsea un body multipart/form-data
 * Extrae el archivo y el sessionId
 * @param {Buffer} body - Body completo
 * @param {string} boundary - Boundary del multipart
 * @returns {{fileName: string|null, fileBuffer: Buffer|null, sessionId: string|null}}
 */
function parseMultipart(body, boundary) {
  const bodyStr = body.toString('latin1');
  const parts = bodyStr.split(`--${boundary}`);

  let fileName = null;
  let fileBuffer = null;
  let sessionId = null;

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      // Extraer sessionId del campo de formulario
      if (part.includes('name="sessionId"')) {
        const valueMatch = part.split('\r\n\r\n')[1];
        if (valueMatch) {
          sessionId = valueMatch.split('\r\n')[0].trim();
        }
      }

      // Extraer archivo
      if (part.includes('filename="')) {
        const fileNameMatch = part.match(/filename="([^"]+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }

        // Extraer contenido del archivo (después del doble CRLF)
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const contentStart = headerEnd + 4;
          // Encontrar el final del contenido (antes del boundary final)
          const contentEnd = part.lastIndexOf('\r\n');
          const fileContent = part.substring(contentStart, contentEnd);
          fileBuffer = Buffer.from(fileContent, 'latin1');
        }
      }
    }
  }

  return { fileName, fileBuffer, sessionId };
}

/**
 * Genera un ID de sesión único
 * @returns {string} ID de sesión
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}
