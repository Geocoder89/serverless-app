output "api_url" {
  description = "Base URL for the Products HTTP API."
  value       = aws_apigatewayv2_api.products.api_endpoint
}

output "lambda_function_names" {
  description = "Names of the deployed Lambda functions."
  value = {
    for key, function in aws_lambda_function.product_handlers :
    key => function.function_name
  }
}

output "products_table_name" {
  description = "Existing DynamoDB table used by the application."
  value       = data.aws_dynamodb_table.products.name
}