// Módulo de extracción de texto multi-formato
// Soporta: PDF, Word (.docx), Excel (.xlsx/.xls), TXT, Markdown (.md)

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * Extrae texto de un archivo según su extensión
 * @param {Buffer} fileBuffer - Contenido del archivo como Buffer
 * @param {string} fileName - Nombre del archivo (para determinar formato)
 * @returns {Promise<string>} Texto extraído del documento
 */
export async function extractText(fileBuffer, fileName) {
  const extension = getFileExtension(fileName);

  switch (extension) {
    case 'pdf':
      return extractFromPdf(fileBuffer);
    case 'docx':
    case 'doc':
      return extractFromWord(fileBuffer);
    case 'xlsx':
    case 'xls':
      return extractFromExcel(fileBuffer);
    case 'txt':
    case 'md':
      return extractFromText(fileBuffer);
    default:
      throw new Error(`Formato de archivo no soportado: .${extension}. Formatos válidos: PDF, Word, Excel, TXT, MD`);
  }
}

/**
 * Obtiene la extensión del archivo en minúsculas
 * @param {string} fileName - Nombre del archivo
 * @returns {string} Extensión sin punto
 */
function getFileExtension(fileName) {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    throw new Error('El archivo no tiene extensión válida');
  }
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Extrae texto de un archivo PDF
 * @param {Buffer} buffer - Contenido del PDF
 * @returns {Promise<string>} Texto extraído
 */
async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('El PDF no contiene texto extraíble. Puede ser un documento escaneado (imagen).');
    }

    return data.text;
  } catch (error) {
    if (error.message.includes('no contiene texto')) {
      throw error;
    }
    throw new Error(`Error al procesar el PDF: ${error.message}`);
  }
}

/**
 * Extrae texto de un archivo Word (.docx)
 * @param {Buffer} buffer - Contenido del archivo Word
 * @returns {Promise<string>} Texto extraído
 */
async function extractFromWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('El documento Word no contiene texto extraíble.');
    }

    return result.value;
  } catch (error) {
    if (error.message.includes('no contiene texto')) {
      throw error;
    }
    throw new Error(`Error al procesar el archivo Word: ${error.message}`);
  }
}

/**
 * Extrae texto de un archivo Excel (.xlsx/.xls)
 * Convierte todas las hojas a formato tabular legible
 * @param {Buffer} buffer - Contenido del archivo Excel
 * @returns {string} Texto extraído de todas las hojas
 */
function extractFromExcel(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const textParts = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csvContent = XLSX.utils.sheet_to_csv(sheet);

      if (csvContent.trim().length > 0) {
        textParts.push(`--- Hoja: ${sheetName} ---\n${csvContent}`);
      }
    }

    if (textParts.length === 0) {
      throw new Error('El archivo Excel no contiene datos extraíbles.');
    }

    return textParts.join('\n\n');
  } catch (error) {
    if (error.message.includes('no contiene datos')) {
      throw error;
    }
    throw new Error(`Error al procesar el archivo Excel: ${error.message}`);
  }
}

/**
 * Extrae texto de archivos de texto plano (.txt, .md)
 * @param {Buffer} buffer - Contenido del archivo
 * @returns {string} Texto del archivo
 */
function extractFromText(buffer) {
  const text = buffer.toString('utf-8');

  if (!text || text.trim().length === 0) {
    throw new Error('El archivo de texto está vacío.');
  }

  return text;
}

/**
 * Valida que el archivo tenga un formato soportado
 * @param {string} fileName - Nombre del archivo
 * @returns {boolean} true si el formato es válido
 */
export function isValidFormat(fileName) {
  const validExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'md'];
  try {
    const extension = getFileExtension(fileName);
    return validExtensions.includes(extension);
  } catch {
    return false;
  }
}

/**
 * Tamaño máximo de archivo permitido (20 MB)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
