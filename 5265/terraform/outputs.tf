# Output values from Terraform

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.smartexpense_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.smartexpense_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.smartexpense_server.public_dns
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.smartexpense_vpc.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.smartexpense_sg.id
}

output "ssh_connection_string" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.smartexpense_eip.public_ip}"
}

output "application_url" {
  description = "Application URL"
  value       = "http://${aws_eip.smartexpense_eip.public_ip}:8080"
}
