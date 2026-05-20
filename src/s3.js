// Módulo de operaciones con Amazon S3
// Maneja subida, lectura y listado de documentos

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = process.env.BUCKET_NAME;

/**
 * Sube un documento a S3
 * @param {string} sessionId - Identificador de sesión del usuario
 * @param {string} fileName - Nombre original del archivo
 * @param {Buffer} fileContent - Contenido del archivo en bytes
 * @param {string} contentType - Tipo MIME del archivo
 * @returns {Promise<{key: string, fileName: string}>} Información del archivo subido
 */
export async function uploadDocument(sessionId, fileName, fileContent, contentType) {
  const key = `${sessionId}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return { key, fileName };
}

/**
 * Obtiene el contenido de un documento desde S3
 * @param {string} key - Clave del objeto en S3
 * @returns {Promise<Buffer>} Contenido del archivo como Buffer
 */
export async function getDocument(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  // Convertir el stream a Buffer
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Lista los documentos de una sesión específica
 * @param {string} sessionId - Identificador de sesión del usuario
 * @returns {Promise<Array<{key: string, fileName: string, size: number, lastModified: Date}>>}
 */
export async function listDocuments(sessionId) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${sessionId}/`,
  });

  const response = await s3Client.send(command);

  if (!response.Contents) {
    return [];
  }

  return response.Contents.map(item => ({
    key: item.Key,
    fileName: item.Key.replace(`${sessionId}/`, ''),
    size: item.Size,
    lastModified: item.LastModified,
  }));
}
