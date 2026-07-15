import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import type { ProductItem } from '../interfaces/Product';
import dynamoDB from '../utils/DynamoDbClient';
import { getProductsTableName } from '../utils/config';
import { jsonResponse } from '../utils/http';
import { logError, logInfo, logWarn } from '../utils/logger';

export const getProductById: APIGatewayProxyHandlerV2 = async (
  event,
  context,
) => {
  const requestId = context.awsRequestId;
  const productId = event.pathParameters?.id;

  if (!productId) {
    logWarn('Product ID was not provided', {
      requestId,
      operation: 'getProductById',
    });

    return jsonResponse(400, {
      success: false,
      error: 'Product ID is required',
    });
  }
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: getProductsTableName(),
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'PRODUCT',
        },
        ConsistentRead: false,
      }),
    );
    const product = result.Item as ProductItem | undefined;

    if (!product) {
      logWarn('Product not found', {
        requestId,
        operation: 'getProductById',
        productId,
      });

      return jsonResponse(404, {
        success: false,
        error: 'Product not found',
      });
    }

    const {
      PK: _pk,
      SK: _sk,
      entityType: _entityType,
      ...publicProduct
    } = product;

    logInfo('Product retrieved', {
      requestId,
      operation: 'getProductById',
      productId,
    });

    return jsonResponse(200, {
      success: true,
      data: publicProduct,
    });
  } catch (error) {
    logError('Product retrieval failed', error, {
      requestId,
      operation: 'getProductById',
      productId,
    });

    return jsonResponse(500, {
      success: false,
      error: 'Could not fetch product',
    });
  }
};
