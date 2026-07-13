data "archive_file" "lambda" {
  for_each    = local.functions
  type        = "zip"
  source_file = "${path.module}/../dist/${each.key}.js"
  output_path = "${path.module}/build/${each.key}.zip"
}

resource "aws_lambda_function" "product_handlers" {
  for_each         = local.functions
  function_name    = "${var.project_name}-${each.key}-${var.environment}"
  filename         = data.archive_file.lambda[each.key].output_path
  source_code_hash = data.archive_file.lambda[each.key].output_base64sha256
  role             = aws_iam_role.lambda_execution.arn
  runtime          = "nodejs22.x"
  handler          = each.value.handler
  memory_size      = 256
  timeout          = 10

  environment {
    variables = {
      PRODUCTS_TABLE = data.aws_dynamodb_table.products.name
    }
  }

  tags = local.common_tags
}