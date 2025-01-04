import { APIGatewayProxyHandler } from 'aws-lambda';
import dynamoDB from '../utils/DynamoDbClient';
import { Product } from '../interfaces/Product';
import { DynamoDB } from 'aws-sdk';

// Handler definition
export const createProduct: APIGatewayProxyHandler = async (event) => {
  const body: Partial<Product> = JSON.parse(event.body || '{}');
  const { name, price, description } = body;
  if (!name || !price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Name and price are required!' }),
    };
  }

  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.PRODUCTS_TABLE!,
    Item: {
      PK: `PRODUCT#${name}`,
      SK: `PRODUCT`,
      name,
      price,
      description,
    } as Product,
  };

  console.log('Params for DynamoDB:', params);

  try {
    const newProduct = await dynamoDB.put(params).promise();
    console.log('Product created successfully:', newProduct); // logging purpose
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Product created successfully',
        data: params.Item,
      }),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Could not create product',
      }),
    };
  }
};
