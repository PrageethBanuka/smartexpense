# Input variables for Terraform configuration

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro" # Free tier eligible

  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium", "t3.micro", "t3.small"], var.instance_type)
    error_message = "Instance type must be a valid t2 or t3 instance."
  }
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "SmartExpense"
}

variable "admin_cidr" {
  description = "CIDR block allowed for SSH access. MUST be set to your IP (e.g. 203.0.113.50/32). No default — forces explicit config."
  type        = string
  # No default! You must set this in terraform.tfvars
  # Find your IP: curl -s https://checkip.amazonaws.com

  validation {
    condition     = var.admin_cidr != "0.0.0.0/0"
    error_message = "SSH must NOT be open to the world (0.0.0.0/0). Set admin_cidr to your IP/32."
  }
}
