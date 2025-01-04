import { APIGatewayProxyHandler } from 'aws-lambda'
import dynamoDB from '../utils/DynamoDbClient'
import {DynamoDB} from 'aws-sdk'
import { Product } from '../interfaces/Product'
export const listProducts: APIGatewayProxyHandler = async(event)=> {
  
 const params: DynamoDB.DocumentClient.ScanInput = {
      
      TableName: process.env.PRODUCTS_TABLE!,
    }

    try {
     const result: DynamoDB.DocumentClient.ScanOutput = await dynamoDB.scan(params).promise()
     const products: Product[] = result.Items as Product[] || []
     return {
      statusCode: 200,
      body: JSON.stringify({
        success: "true",
        data: products
      })
     }
    } catch (error) {
      console.error('Error Fetching products:',error)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Could not fetch products'
        })
      }
    }
  } 

  

  
