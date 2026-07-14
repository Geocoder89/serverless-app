resource "aws_apigatewayv2_api" "products" {
  name          = "${var.project_name}-${var.environment}"
  protocol_type = "HTTP"

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "product_handlers" {
  for_each = local.functions

  api_id = aws_apigatewayv2_api.products.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.product_handlers[each.key].invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "product_routes" {
  for_each = local.functions

  api_id    = aws_apigatewayv2_api.products.id
  route_key = each.value.route_key
  target    = "integrations/${aws_apigatewayv2_integration.product_handlers[each.key].id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.products.id
  name        = "$default"
  auto_deploy = true

  tags = local.common_tags
}

resource "aws_lambda_permission" "allow_api_gateway" {
  for_each = local.functions

  statement_id  = "AllowApiGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.product_handlers[each.key].function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.products.execution_arn}/*/*"
}