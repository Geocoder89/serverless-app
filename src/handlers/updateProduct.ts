import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyHandler } from 'aws-lambda';

import type { ProductItem, UpdateProductInput } from '../interfaces/Product';
import dynamoDB from '../utils/DynamoDbClient';
import { getProductsTableName } from '../utils/config';
import { jsonResponse, parseJsonBody } from '../utils/http';
import { logError, logInfo, logWarn } from '../utils/logger';
import { validateUpdateProduct } from '../utils/validation';
export const updateProduct: APIGatewayProxyHandler = async (event, context) => {
  const requestId = context.awsRequestId;
  const productId = event.pathParameters?.id?.trim();

  if (!productId) {
    return jsonResponse(400, {
      success: false,
      error: 'Product ID is required',
    });
  }

  try {
    const input = parseJsonBody<UpdateProductInput>(event.body);
    const validationErrors = validateUpdateProduct(input);

    if (validationErrors.length > 0) {
      logWarn('Product update validation failed', {
        requestId,
        operation: 'updateProduct',
        productId,
        validationErrors,
      });

      return jsonResponse(400, {
        success: false,
        errors: validationErrors,
      });
    }

    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: Record<string, unknown> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (input.name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = input.name.trim();
    }

    if (input.price !== undefined) {
      updateExpressions.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = input.price;
    }

    if (input.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = input.description.trim();
    }

    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: getProductsTableName(),
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'PRODUCT',
        },
        ConditionExpression: 'attribute_exists(PK)',
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }),
    );
    const product = result.Attributes as ProductItem;
    const {
      PK: _pk,
      SK: _sk,
      entityType: _entityType,
      ...publicProduct
    } = product;

    logInfo('Product updated', {
      requestId,
      operation: 'updateProduct',
      productId,
      updatedFields: Object.keys(input),
    });

    return jsonResponse(200, {
      success: true,
      data: publicProduct,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse(400, {
        success: false,
        error: error.message,
      });
    }

    if (error instanceof ConditionalCheckFailedException) {
      return jsonResponse(404, {
        success: false,
        error: 'Product not found',
      });
    }

    logError('Product update failed', error, {
      requestId,
      operation: 'updateProduct',
      productId,
    });

    return jsonResponse(500, {
      success: false,
      error: 'Could not update product',
    });
  }
}