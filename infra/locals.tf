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

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}