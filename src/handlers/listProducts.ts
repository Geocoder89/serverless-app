import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyHandler } from 'aws-lambda';

import type { Product, ProductItem } from '../interfaces/Product';
import dynamoDB from '../utils/DynamoDbClient';
import { getProductsTableName } from '../utils/config';
import { jsonResponse } from '../utils/http';
import { logError, logInfo } from '../utils/logger';

const toPublicProduct = (item: ProductItem): Product => {
  const { PK: _pk, SK: _sk, entityType: _entityType, ...product } = item;
  return product;
};
export const listProducts: APIGatewayProxyHandler = async (event, context) => {
  const requestId = context.awsRequestId;

  try {
    const products: Product[] = [];

    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const result = await dynamoDB.send(
        new ScanCommand({
          TableName: getProductsTableName(),
          FilterExpression: '#entityType = :entityType',
          ExpressionAttributeNames: {
            '#entityType': 'entityType',
          },
          ExpressionAttributeValues: {
            ':entityType': 'PRODUCT',
          },
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );

      products.push(
        ...((result.Items ?? []) as ProductItem[]).map(toPublicProduct),
      );
      exclusiveStartKey = result.LastEvaluatedKey;
    } while (exclusiveStartKey);

    logInfo('Products listed', {
      requestId,
      operation: 'listProducts',
      productCount: products.length,
    });

    return jsonResponse(200, {
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    logError('Product listing failed', error, {
      requestId,
      operation: 'listProducts',
    });

    return jsonResponse(500, {
      success: false,
      error: 'Could not fetch products',
    });
  }
};
