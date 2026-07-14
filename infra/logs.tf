resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.functions

  name              = "/aws/lambda/${aws_lambda_function.product_handlers[each.key].function_name}"
  retention_in_days = 7

  tags = local.common_tags
}