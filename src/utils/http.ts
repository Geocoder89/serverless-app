import type {APIGatewayProxyResult} from 'aws-lambda'

const DEFAULT_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store"
}

export const jsonResponse = (
  statusCode: number,
  payload: unknown
): APIGatewayProxyResult => ({
  statusCode,
  headers: DEFAULT_HEADERS,
  body: JSON.stringify(payload)
})

export function parseJsonBody<T>(
  body: string | null | undefined,
): T {
  if (body == null || body.trim() === '') {
    throw new SyntaxError('Request body is required');
  }

  return JSON.parse(body) as T;
}

