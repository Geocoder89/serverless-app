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

export const parseJsonBody=  <T> (body: string | null ): T => {
  if(!body) {
    throw new SyntaxError('Request body is required')
  }

  return JSON.parse(body) as T;
}