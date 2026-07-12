import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  maxAttempts: 3,
})

const dynamoDB = DynamoDBDocumentClient.from(client,{
  marshallOptions: {
    removeUndefinedValues: true
  }
})

export default dynamoDB