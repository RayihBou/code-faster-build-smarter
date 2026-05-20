// Handler para servir el frontend con configuración de Cognito inyectada
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { USER_POOL_ID, USER_POOL_CLIENT_ID, COGNITO_REGION, API_ENDPOINT } = process.env;

export async function handler(event) {
  const path = event.rawPath || '/';

  if (path === '/auth.js') {
    // Servir configuración de Cognito como JS
    const config = `window.APP_CONFIG = ${JSON.stringify({
      userPoolId: USER_POOL_ID,
      clientId: USER_POOL_CLIENT_ID,
      region: COGNITO_REGION,
      apiEndpoint: API_ENDPOINT,
    })};`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/javascript' },
      body: config,
    };
  }

  // Servir frontend HTML
  const htmlPath = join(__dirname, 'frontend', 'index.html');
  const html = readFileSync(htmlPath, 'utf-8');
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html,
  };
}
