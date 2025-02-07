import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  const swaggerUIPath = path.join(process.cwd(), 'node_modules', 'swagger-ui-dist');
  const indexContent = await fs.readFile(path.join(swaggerUIPath, 'index.html'), 'utf-8');

  // Replace the default URL with our API endpoint
  const modifiedIndexContent = indexContent.replace(
    'https://petstore.swagger.io/v2/swagger.json',
    '/api/openapi.json'
  );

  return new NextResponse(modifiedIndexContent, {
    headers: { 'Content-Type': 'text/html' },
  });
}
