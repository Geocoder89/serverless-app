
import { randomUUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import type { CreateProductInput, ProductItem } from '../interfaces/Product';
import dynamoDB from '../utils/DynamoDbClient';
import { getProductsTableName } from '../utils/config';
import { jsonResponse, parseJsonBody } from '../utils/http';
import { logError, logInfo, logWarn } from '../utils/logger';
import { validateCreateProduct } from '../utils/validation';


// Handler definition
export const createProduct: APIGatewayProxyHandlerV2 = async (event, context) => {
  const requestId = context.awsRequestId;
  try {
    // parse event body
    const input = parseJsonBody<CreateProductInput>(event.body);

    // try for validation issues
    const validationErrors = validateCreateProduct(input);

    if (validationErrors.length > 0) {
      logWarn('Product validation failed', {
        requestId,
        operation: 'createProduct',
        validationErrors,
      });
      return jsonResponse(400, {
        success: false,
        errors: validationErrors,
      });
    }
    // if none build what is returned
    const now = new Date().toISOString();
    const id = randomUUID();

    const product: ProductItem = {
      PK: `PRODUCT#${id}`,
      SK: 'PRODUCT',
      entityType: 'PRODUCT',
      id,
      name: input.name.trim(),
      price: input.price,
      createdAt: now,
      updatedAt: now,
      ...(input.description?.trim()
        ? { description: input.description.trim() }
        : {}),
    };

    // send the document to dynamo db

    await dynamoDB.send(
      new PutCommand({
        TableName: getProductsTableName(),
        Item: product,
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
    // send a success log
    logInfo('Product created', {
      requestId,
      operation: 'createProduct',
      productId: id,
    });
    const {
      PK: _pk,
      SK: _sk,
      entityType: _entityType,
      ...publicProduct
    } = product;

    return jsonResponse(201, {
      success: true,
      data: publicProduct,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      logWarn('Invalid JSON request body', {
        requestId,
        operation: 'createProduct',
      });
      return jsonResponse(400, {
        success: false,
        error: error.message
      })
    }

    if(error instanceof ConditionalCheckFailedException) {
      return jsonResponse(409, {
        success: false, 
        error: "A product with this identifier already exists"
      })
    }
    logError("Product creation failed", error, {
      requestId,
      operation: "createProduct"
    })
    return jsonResponse(500, {
      success: false,
      error: "Could not create product"
    })
  }
};
