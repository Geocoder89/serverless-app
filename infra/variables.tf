variable "aws_region" {
  description = "AWS region used for the project resources"
  type        = string
  default     = "ca-central-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Base name used for AWS resources"
  type        = string
  default     = "serverless-products-api"
}