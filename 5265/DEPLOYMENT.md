# SmartExpense - Complete Deployment Guide

This guide walks you through deploying the SmartExpense application to AWS from scratch.

## Overview

**Architecture:**
```
Developer → GitHub → GitHub Actions (CI/CD) → Docker Images (GHCR/Docker Hub)
                                                        ↓
                            Terraform (Infrastructure) → AWS EC2
                                                        ↓
                            Ansible (Configuration) → Docker Compose
                                                        ↓
                                [PostgreSQL] [Backend] [Frontend]
                                                        ↓
                                                    End Users
```

## Prerequisites Checklist

- [ ] AWS Account (Free tier eligible)
- [ ] Terraform installed (`brew install terraform`)
- [ ] Ansible installed (`brew install ansible`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] SSH key generated (`ssh-keygen`)
- [ ] Docker Hub account
- [ ] GitHub repository with CI/CD workflows

## Step-by-Step Deployment

### Phase 1: Local Setup (5 minutes)

1. **Generate SSH Key** (if you don't have one)
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
   # Press Enter for all prompts
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`
   - Output format: `json`

3. **Verify AWS Access**
   ```bash
   aws sts get-caller-identity
   ```

### Phase 2: Provision Infrastructure with Terraform (5-10 minutes)

1. **Navigate to Terraform directory**
   ```bash
   cd terraform
   ```

2. **Create configuration file**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   nano terraform.tfvars
   ```
   
   Update if needed (defaults should work):
   ```hcl
   aws_region = "us-east-1"
   environment = "production"
   instance_type = "t2.micro"
   ssh_public_key_path = "~/.ssh/id_rsa.pub"
   ```

3. **Initialize Terraform**
   ```bash
   terraform init
   ```

4. **Preview infrastructure changes**
   ```bash
   terraform plan
   ```
   Review the resources that will be created.

5. **Create infrastructure**
   ```bash
   terraform apply
   ```
   Type `yes` when prompted.
   
   **Wait 2-3 minutes** for completion.

6. **Save the outputs**
   ```bash
   terraform output > ../deployment-info.txt
   cat ../deployment-info.txt
   ```
   
   You'll see:
   ```
   instance_public_ip = "54.123.45.67"
   ssh_connection_string = "ssh -i ~/.ssh/id_rsa ubuntu@54.123.45.67"
   application_url = "http://54.123.45.67:8080"
   ```

7. **Test SSH connection**
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@<YOUR_IP>
   # Type 'yes' when prompted
   # You should see Ubuntu prompt
   exit
   ```

### Phase 3: Configure Server with Ansible (10-15 minutes)

1. **Navigate to Ansible directory**
   ```bash
   cd ../ansible
   ```

2. **Install Ansible dependencies**
   ```bash
   ansible-galaxy collection install community.docker
   ```

3. **Update inventory with your server IP**
   ```bash
   nano inventory.ini
   ```
   
   Replace `YOUR_SERVER_IP` with the IP from Terraform output:
   ```ini
   production ansible_host=54.123.45.67 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
   ```

4. **Create environment variables file**
   ```bash
   nano ansible_env.sh
   ```
   
   Add:
   ```bash
   #!/bin/bash
   export DOCKERHUB_TOKEN="your_token_here"  # Optional
   export DB_PASSWORD="secure_password_123"
   export JWT_SECRET="your_jwt_secret_key_here"
   ```
   
   Save and load:
   ```bash
   chmod +x ansible_env.sh
   source ansible_env.sh
   ```

5. **Test Ansible connection**
   ```bash
   ansible app_servers -m ping
   ```
   
   Expected:
   ```
   production | SUCCESS => {
       "ping": "pong"
   }
   ```

6. **Run deployment playbook**
   ```bash
   ansible-playbook playbook.yml
   ```
   
   **This will take 5-10 minutes**. The playbook will:
   - Update system packages
   - Install Docker and Docker Compose
   - Create application directories
   - Pull Docker images
   - Deploy application with Docker Compose
   - Set up health checks and backups

7. **Verify deployment**
   ```bash
   # Check containers are running
   ansible app_servers -a "docker ps" -b
   
   # Check application health
   curl http://<YOUR_IP>:4000/health
   curl http://<YOUR_IP>:8080
   ```

### Phase 4: Access Your Application

1. **Open in browser**
   ```
   http://<YOUR_IP>:8080
   ```

2. **Create test account**
   - Click "Register"
   - Enter name, email, password
   - Login with credentials

3. **Test functionality**
   - Add expenses
   - View dashboard
   - Check reports

## Verification Checklist

- [ ] Terraform created all resources successfully
- [ ] Can SSH to server
- [ ] Ansible playbook completed without errors
- [ ] All 3 containers running (`docker ps`)
- [ ] Backend health endpoint responds (`curl http://IP:4000/health`)
- [ ] Frontend accessible in browser (`http://IP:8080`)
- [ ] Can register and login
- [ ] Can add and view expenses

## Common Issues and Solutions

### Issue: Terraform fails with "InvalidClientTokenId"
**Solution:** AWS credentials not configured correctly
```bash
aws configure
# Re-enter your credentials
```

### Issue: SSH connection refused
**Solution:** Wait 1-2 minutes for instance to boot, or check security group
```bash
terraform output security_group_id
# Verify port 22 is open in AWS console
```

### Issue: Ansible "UNREACHABLE" error
**Solution:** Check inventory.ini has correct IP and SSH key path
```bash
ssh -i ~/.ssh/id_rsa ubuntu@<IP>  # Test manually
```

### Issue: Docker containers not starting
**Solution:** Check logs and disk space
```bash
ssh ubuntu@<IP>
cd /opt/smartexpense
docker-compose logs
df -h  # Check disk space
```

### Issue: Frontend shows "Cannot connect to backend"
**Solution:** Check backend is running and environment variables
```bash
docker-compose logs backend
docker-compose exec backend env | grep DB
```

## Post-Deployment Tasks

### 1. Setup Domain Name (Optional)
1. Buy domain from Route53/Namecheap
2. Point A record to your server IP
3. Update CORS_ORIGIN in .env

### 2. Enable HTTPS with Let's Encrypt
```bash
ssh ubuntu@<IP>
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 3. Setup Monitoring
Consider adding:
- CloudWatch for AWS metrics
- Prometheus + Grafana for application metrics
- Uptime monitoring (UptimeRobot, Pingdom)

### 4. Regular Maintenance
- Backup database: Cron job already configured (`/usr/local/bin/backup-smartexpense.sh`)
- Update Docker images: Re-run Ansible playbook
- Check logs: `docker-compose logs -f`

## Cleanup / Destroy Resources

**Warning:** This will delete everything!

```bash
# Stop application
cd ansible
ansible-playbook playbook.yml --tags deploy --extra-vars "compose_state=absent"

# Destroy infrastructure
cd ../terraform
terraform destroy
# Type 'yes' to confirm
```

## Cost Estimate

**Monthly costs (using free tier):**
- t2.micro EC2: $0 (free tier 750 hrs/month)
- EBS Storage (30GB): ~$3
- Elastic IP: $0 (while attached)
- Data transfer: ~$0-1

**Total: ~$3-4/month** (or $0 if within free tier limits)

## Next Steps

1. **Automate deployment in GitHub Actions** (optional)
2. **Add monitoring and alerting**
3. **Setup automated backups to S3**
4. **Implement blue-green deployment**
5. **Scale to multiple instances** (with load balancer)

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Review Ansible output for errors
3. Verify all prerequisites are met
4. Check AWS console for resource status

---

**Congratulations!** 🎉 

Your SmartExpense application is now running in production on AWS with a complete CI/CD pipeline!
