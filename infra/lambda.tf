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
  architectures    = ["x86_64"]
  # Datadog becomes Lambda's entry point
  handler = "/opt/nodejs/node_modules/datadog-lambda-js/handler.handler"
  layers = [
    local.datadog_node_layer_arn,
    local.datadog_extension_layer_arn
  ]
  memory_size = 256
  timeout     = 15

  environment {
    variables = {
      PRODUCTS_TABLE = data.aws_dynamodb_table.products.name
      # Original application handler used by the Datadog wrapper.
      DD_LAMBDA_HANDLER = each.value.handler
      # Unified service tagging.
      DD_API_KEY_SSM_ARN = local.datadog_api_key_ssm_arn
      DD_SITE            = var.datadog_site
      DD_ENV             = var.environment
      DD_SERVICE         = var.project_name
      DD_VERSION         = var.application_version

      # Telemetry collection.
      DD_TRACE_ENABLED    = "true"
      DD_LOGS_ENABLED     = "true"
      DD_ENHANCED_METRICS = "true"

      # Keep request and response payload capture disabled.
      DD_CAPTURE_LAMBDA_PAYLOAD = "false"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy.dynamodb_access,
    aws_iam_role_policy.datadog_api_key_access
  ]

  tags = local.common_tags
}