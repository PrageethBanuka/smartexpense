# SmartExpense Infrastructure
# This Terraform configuration provisions AWS infrastructure for the application

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  # Credentials should be configured via:
  # - AWS CLI: aws configure
  # - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  # - IAM role (if running on EC2)
}

# VPC for network isolation
resource "aws_vpc" "smartexpense_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "smartexpense-vpc"
    Project     = "SmartExpense"
    Environment = var.environment
  }
}

# Internet Gateway for public internet access
resource "aws_internet_gateway" "smartexpense_igw" {
  vpc_id = aws_vpc.smartexpense_vpc.id

  tags = {
    Name    = "smartexpense-igw"
    Project = "SmartExpense"
  }
}

# Public subnet for the application server
resource "aws_subnet" "smartexpense_public_subnet" {
  vpc_id                  = aws_vpc.smartexpense_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name    = "smartexpense-public-subnet"
    Project = "SmartExpense"
  }
}

# Route table for public subnet
resource "aws_route_table" "smartexpense_public_rt" {
  vpc_id = aws_vpc.smartexpense_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.smartexpense_igw.id
  }

  tags = {
    Name    = "smartexpense-public-rt"
    Project = "SmartExpense"
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "public_subnet_association" {
  subnet_id      = aws_subnet.smartexpense_public_subnet.id
  route_table_id = aws_route_table.smartexpense_public_rt.id
}

# Security Group - Firewall rules
resource "aws_security_group" "smartexpense_sg" {
  name        = "smartexpense-security-group"
  description = "Security group for SmartExpense application"
  vpc_id      = aws_vpc.smartexpense_vpc.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # IMPORTANT: Restrict to your IP in production
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application port
  ingress {
    description = "Application"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API (optional - usually internal only)
  ingress {
    description = "Backend API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Only from within VPC
  }

  # All outbound traffic
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "smartexpense-sg"
    Project = "SmartExpense"
  }
}

# Key pair for SSH access (you need to create this key first)
resource "aws_key_pair" "smartexpense_key" {
  key_name   = "smartexpense-key"
  public_key = file(var.ssh_public_key_path)

  tags = {
    Name    = "smartexpense-key"
    Project = "SmartExpense"
  }
}

# EC2 Instance for application
resource "aws_instance" "smartexpense_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.smartexpense_key.key_name

  subnet_id                   = aws_subnet.smartexpense_public_subnet.id
  vpc_security_group_ids      = [aws_security_group.smartexpense_sg.id]
  associate_public_ip_address = true

  # Storage
  root_block_device {
    volume_size           = 20  # GB
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "smartexpense-root-volume"
    }
  }

  # Additional volume for database persistence
  ebs_block_device {
    device_name           = "/dev/sdb"
    volume_size           = 10  # GB for database
    volume_type           = "gp3"
    delete_on_termination = false
    encrypted             = true

    tags = {
      Name = "smartexpense-data-volume"
    }
  }

  # User data script - runs on first boot
  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              # Update system
              apt-get update
              apt-get upgrade -y
              
              # Install basic tools
              apt-get install -y curl wget git unzip
              
              # Create app user
              useradd -m -s /bin/bash appuser
              
              # Setup data volume
              if [ ! -b /dev/xvdb ]; then
                mkfs -t ext4 /dev/xvdb
                mkdir -p /data
                mount /dev/xvdb /data
                echo '/dev/xvdb /data ext4 defaults,nofail 0 2' >> /etc/fstab
              fi
              
              # Create application directory
              mkdir -p /opt/smartexpense
              chown appuser:appuser /opt/smartexpense
              
              echo "Instance initialization complete" > /var/log/user-data.log
              EOF

  tags = {
    Name        = "smartexpense-server"
    Project     = "SmartExpense"
    Environment = var.environment
  }
}

# Elastic IP for static public IP
resource "aws_eip" "smartexpense_eip" {
  instance = aws_instance.smartexpense_server.id
  domain   = "vpc"

  tags = {
    Name    = "smartexpense-eip"
    Project = "SmartExpense"
  }

  depends_on = [aws_internet_gateway.smartexpense_igw]
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Data source for latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Ubuntu)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
