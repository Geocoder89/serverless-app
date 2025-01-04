import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import dynamoDB from "../utils/DynamoDbClient";

export const deleteProduct: APIGatewayProxyHandler = async (event)=> {
  const productId = event.pathParameters?.id

  if(!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Product ID is required'
      })
    }
  }

  const params: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: "PRODUCT",
    },
    ConditionExpression: "attribute_exists(PK)"
  }

  try {
    await dynamoDB.delete(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Product deleted successfully"
      })
    }
  } catch (error: any) {
    console.error('Error deleting product:', error)

    if (error.code === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: "Product not found.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Could not delete product.",
      }),
    };
  }
}