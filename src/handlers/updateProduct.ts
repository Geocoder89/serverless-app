import { APIGatewayProxyHandler } from "aws-lambda";
import { Product } from "../interfaces/Product";
import { DynamoDB } from "aws-sdk";
import dynamoDB from "../utils/DynamoDbClient";

export const updateProduct: APIGatewayProxyHandler = async (event)=>{
  const productId = event.pathParameters?.id
  const body: Partial<Product> = JSON.parse(event.body || "{}")

  const {name, price, description} = body

  if(!productId || (!name && !price && !description)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'PRODUCT ID and least one field should be updated'
      })
    }
  }

  // set up to store edited values
  const updateExpressions: string[] = []
  const expressionAttributeNames: Record<string,string> = {}
  const expressionAttributeValues: Record<string,any> = {}

  if(name) {
    updateExpressions.push("#name = :name")
    expressionAttributeNames["#name"] = "name"
    expressionAttributeValues[":name"] = name

  }
  if(description) {
    updateExpressions.push("#description = :description")
    expressionAttributeNames["#description"] = "description"
    expressionAttributeValues[":description"] = description

  }
  if(price) {
    updateExpressions.push("#price = :price")
    expressionAttributeNames["#price"] = "price"
    expressionAttributeValues[":price"] = price

  }

  // set up params
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: { PK: `PRODUCT#${productId}`, SK: "PRODUCT" },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  }

  
  try {
    const result: DynamoDB.DocumentClient.UpdateItemOutput = await dynamoDB.update(params).promise()
    const updatedProduct: Product = result.Attributes as Product

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: updatedProduct
      })
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update product." }),
    };
  }
   
}