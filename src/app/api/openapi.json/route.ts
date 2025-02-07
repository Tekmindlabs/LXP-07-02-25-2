import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator';
import { appRouter } from '../../../server/api/root';
import { OpenAPI3 } from 'openapi-typescript';

export const GET = async () => {
  const generator = new OpenApiGeneratorV3(appRouter, {
    shape: ({ schema }) => ({
      ...schema,
      tags: ['tRPC'],
    }),
  });
  const spec: OpenAPI3.Document = generator.generateDocument({
    info: { title: 'My API', version: '1.0.0' },
  });
  return Response.json(spec);
};
