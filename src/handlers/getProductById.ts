import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import dynamoDB from "../utils/DynamoDbClient";
import { Product } from "../interfaces/Product";

export const getProductById: APIGatewayProxyHandler = async(event)=>{
  const productId = event.pathParameters?.id

  if(!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Product ID is required"
      })
    }
  }

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: "PRODUCT"
    }
  }

  try {

    const result: DynamoDB.DocumentClient.GetItemOutput = await dynamoDB.get(params).promise()
    const product: Product | undefined = result.Item as Product

    if(!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Product not found!"
        })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: product
      })
    }
    
  } catch (error) {
    console.error('Error fetching product:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({error: `Could not fetch product with id ${productId}`})
    }
  }
}