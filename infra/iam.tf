
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    sid     = "AllowLambdaService"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "${var.project_name}-lambda-execution-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags               = local.common_tags
}

# Allows the lambda functions to write logs to cloud watch 
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Defines the DynamoDB permissions required by the handlers.
data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    sid    = "AllowProductsTableCrud"
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem"
    ]

    resources = [
      data.aws_dynamodb_table.products.arn
    ]
  }


}


# Adds the DynamoDB permissions directly to the Lambda execution role.
resource "aws_iam_role_policy" "dynamodb_access" {
  name   = "${var.project_name}-dynamodb-access-${var.environment}"
  role   = aws_iam_role.lambda_execution.id
  policy = data.aws_iam_policy_document.dynamodb_access.json
}