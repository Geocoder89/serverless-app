
data "aws_caller_identity" "current" {}
locals {
  functions = {
    createProduct = {
      handler   = "createProduct.createProduct"
      route_key = "POST /products"
    }
    listProducts = {
      handler   = "listProducts.listProducts"
      route_key = "GET /products"
    }

    getProductById = {
      handler   = "getProductById.getProductById"
      route_key = "GET /products/{id}"
    }


    updateProduct = {
      handler   = "updateProduct.updateProduct"
      route_key = "PUT /products/{id}"
    }

    deleteProduct = {
      handler   = "deleteProduct.deleteProduct"
      route_key = "DELETE /products/{id}"
    }
  }
  # Data dogs

  datadog_api_key_parameter_name = "/serverless-products-api/dev/datadog-api-key"

  datadog_api_key_ssm_arn = join("", [
    "arn:aws:ssm:",
    var.aws_region,
    ":",
    data.aws_caller_identity.current.account_id,
    ":parameter",
    local.datadog_api_key_parameter_name
  ])

  datadog_node_layer_arn = join("", [
    "arn:aws:lambda:",
    var.aws_region,
    ":464622532012:layer:Datadog-Node22-x:",
    var.datadog_node_layer_version
  ])

  datadog_extension_layer_arn = join("", [
    "arn:aws:lambda:",
    var.aws_region,
    ":464622532012:layer:Datadog-Extension:",
    var.datadog_extension_layer_version
  ])



  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

}