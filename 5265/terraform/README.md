# Terraform README

## Prerequisites

1. **Install Terraform**
   ```bash
   # macOS
   brew install terraform
   
   # Verify installation
   terraform version
   ```

2. **AWS CLI Setup**
   ```bash
   # Install AWS CLI
   brew install awscli
   
   # Configure credentials
   aws configure
   # Enter: AWS Access Key ID
   # Enter: AWS Secret Access Key
   # Enter: Default region (us-east-1)
   # Enter: Default output format (json)
   ```

3. **SSH Key Generation**
   ```bash
   # Generate SSH key if you don't have one
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
   # Press Enter to accept defaults
   ```

## Usage

### 1. Initialize Terraform
```bash
cd terraform
terraform init
```
This downloads required providers (AWS).

### 2. Create Configuration File
```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

### 3. Preview Changes
```bash
terraform plan
```
Shows what resources will be created.

### 4. Apply Configuration
```bash
terraform apply
```
Type `yes` when prompted. This creates:
- VPC and networking
- Security groups
- EC2 instance
- Elastic IP

**Expected time:** 2-3 minutes

### 5. Get Outputs
```bash
terraform output
```
Shows:
- Public IP address
- SSH connection string
- Application URL

### 6. Connect to Server
```bash
# Use the SSH connection string from output
ssh -i ~/.ssh/id_rsa ubuntu@<PUBLIC_IP>
```

## Terraform State

Terraform creates a `terraform.tfstate` file to track resources. **Never commit this file to Git** (it may contain sensitive data).

## Cleanup

To destroy all resources:
```bash
terraform destroy
```
Type `yes` to confirm. This deletes all AWS resources.

## Cost Estimation

- **t2.micro EC2:** Free tier (750 hours/month)
- **20GB EBS volume:** ~$2/month
- **Elastic IP:** Free while attached to running instance
- **Data transfer:** First 1GB free, then $0.09/GB

**Estimated cost:** $0-2/month (if using free tier)

## Troubleshooting

**Issue: "Error creating EC2 instance: UnauthorizedOperation"**
- Solution: Check AWS credentials with `aws sts get-caller-identity`

**Issue: "Error creating key pair: already exists"**
- Solution: Delete old key: `aws ec2 delete-key-pair --key-name smartexpense-key`

**Issue: SSH connection refused**
- Wait 1-2 minutes for instance to fully boot
- Check security group allows SSH from your IP
- Verify key permissions: `chmod 400 ~/.ssh/id_rsa`

## Next Steps

After Terraform succeeds:
1. Note the public IP address
2. Move to Ansible configuration
3. Deploy application with Ansible
