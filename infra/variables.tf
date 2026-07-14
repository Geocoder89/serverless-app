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

# Data dog variables
variable "datadog_site" {
  description = "Datadog site receiving the application telemetry."
  type        = string
  default     = "us5.datadoghq.com"
}

variable "application_version" {
  description = "Application version used for Datadog unified service tagging."
  type        = string
  default     = "1.0.1"
}

variable "datadog_node_layer_version" {
  description = "Datadog Node.js Lambda library layer version."
  type        = number
  default     = 140
}

variable "datadog_extension_layer_version" {
  description = "Datadog Lambda Extension layer version."
  type        = number
  default     = 98
}