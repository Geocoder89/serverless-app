import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import dynamoDB from "../utils/DynamoDbClient";
import { getProductsTableName } from "../utils/config";
import { jsonResponse } from "../utils/http";
import { logError,logInfo,logWarn } from "../utils/logger";
export const deleteProduct: APIGatewayProxyHandlerV2 = async (event,context)=> {
  const requestId = context.awsRequestId;
  const productId = event.pathParameters?.id?.trim()

  if(!productId) {
    logWarn("ProductID was not provided", {
      requestId,
      operation: 'deleteProduct'
    })

    return jsonResponse(400, {
      success: false,
      error: "Product ID is required",
    })
  }

  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: getProductsTableName(),
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: "PRODUCT"
        },
         ConditionExpression: "attribute_exists(PK)",
      })
    )
    logInfo("Product deleted", {
      requestId,
      operation: "deleteProduct",
      productId
    });

    return jsonResponse(200, {
      success: true,
      message: "Product deleted successfully"
    })
  } catch(error) {
    if (error instanceof ConditionalCheckFailedException) {
      return jsonResponse(404, {
        success: false,
        error: "Product not found",
      });
    }

    logError("Product deletion failed", error, {
      requestId,
      operation: "deleteProduct",
      productId,
    });

    return jsonResponse(500, {
      success: false,
      error: "Could not delete product",
    });
  }
}