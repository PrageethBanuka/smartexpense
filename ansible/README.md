# Ansible README

## Prerequisites

1. **Install Ansible**
   ```bash
   # macOS
   brew install ansible
   
   # Verify installation
   ansible --version
   ```

2. **Install Required Ansible Collections**
   ```bash
   ansible-galaxy collection install community.docker
   ```

3. **SSH Access**
   Ensure you can SSH to your server:
   ```bash
   ssh -i ~/.ssh/id_rsa ubuntu@YOUR_SERVER_IP
   ```

## Configuration

### 1. Update Inventory
Edit `inventory.ini` and replace `YOUR_SERVER_IP` with your actual server IP from Terraform output:

```bash
nano inventory.ini
```

Change:
```ini
production ansible_host=YOUR_SERVER_IP ansible_user=ubuntu
```

### 2. Set Environment Variables
Create a file `ansible_env.sh`:

```bash
#!/bin/bash
# Ansible environment variables for deployment

# Docker Hub credentials (for pulling private images)
export DOCKERHUB_TOKEN="your_dockerhub_token"

# Database password (change this!)
export DB_PASSWORD="strong_password_here"

# JWT secret for authentication (change this!)
export JWT_SECRET="your_jwt_secret_key_here"
```

Make it executable and source it:
```bash
chmod +x ansible_env.sh
source ansible_env.sh
```

**Security Note:** Never commit `ansible_env.sh` to Git!

## Usage

### Test Connection
```bash
cd ansible
ansible app_servers -m ping
```

Expected output:
```
production | SUCCESS => {
    "ping": "pong"
}
```

### Run Playbook

**Full deployment (all tasks):**
```bash
ansible-playbook playbook.yml
```

**Deploy with specific tags:**
```bash
# Only Docker installation
ansible-playbook playbook.yml --tags docker

# Only application deployment
ansible-playbook playbook.yml --tags deploy

# Only configuration update
ansible-playbook playbook.yml --tags config
```

**Dry run (check mode):**
```bash
ansible-playbook playbook.yml --check
```

**Verbose output:**
```bash
ansible-playbook playbook.yml -v
# or -vv, -vvv for more verbosity
```

## Deployment Steps

The playbook performs these steps:

1. **System Preparation**
   - Updates system packages
   - Installs required dependencies

2. **Docker Installation**
   - Adds Docker repository
   - Installs Docker and Docker Compose
   - Configures Docker service

3. **Application Setup**
   - Creates application directory
   - Copies configuration files
   - Sets up environment variables

4. **Image Management**
   - Pulls latest Docker images
   - Cleans up old images

5. **Deployment**
   - Stops old containers
   - Starts new containers with Docker Compose
   - Waits for services to be healthy

6. **Post-Deployment**
   - Sets up log rotation
   - Creates backup scripts
   - Schedules daily backups

## Verification

After deployment, verify the application:

```bash
# Check all containers are running
ssh ubuntu@YOUR_SERVER_IP "docker ps"

# Check application logs
ssh ubuntu@YOUR_SERVER_IP "cd /opt/smartexpense && docker-compose logs -f"

# Test backend API
curl http://YOUR_SERVER_IP:4000/health

# Test frontend
curl http://YOUR_SERVER_IP:8080
```

Access in browser: `http://YOUR_SERVER_IP:8080`

## Common Operations

### Update Application
```bash
# Re-run playbook to pull latest images and redeploy
ansible-playbook playbook.yml --tags deploy
```

### View Logs
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /opt/smartexpense
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
ssh ubuntu@YOUR_SERVER_IP
cd /opt/smartexpense
docker-compose restart backend
docker-compose restart frontend
```

### Backup Database
```bash
ssh ubuntu@YOUR_SERVER_IP
/usr/local/bin/backup-smartexpense.sh
```

### Stop Application
```bash
ansible-playbook playbook.yml --tags deploy --extra-vars "compose_state=absent"
```

## Troubleshooting

**Issue: "Failed to connect to the host via ssh"**
- Solution: Verify server IP in inventory.ini
- Check SSH key: `ssh -i ~/.ssh/id_rsa ubuntu@IP`

**Issue: "Permission denied (publickey)"**
- Solution: Check SSH key path in inventory.ini
- Verify key permissions: `chmod 400 ~/.ssh/id_rsa`

**Issue: Docker containers not starting**
- Check logs: `docker-compose logs`
- Verify images pulled: `docker images`
- Check disk space: `df -h`

**Issue: Database connection errors**
- Wait longer for PostgreSQL to start
- Check environment variables in .env file
- Verify network connectivity: `docker network ls`

## Security Best Practices

1. **Change default passwords** in `ansible_env.sh`
2. **Use Ansible Vault** for sensitive data:
   ```bash
   ansible-vault create secrets.yml
   ```
3. **Restrict SSH access** to specific IPs in AWS Security Group
4. **Enable firewall** on server:
   ```bash
   sudo ufw enable
   sudo ufw allow 22,80,443,8080/tcp
   ```

## Next Steps

After successful deployment:
1. Configure domain name (optional)
2. Setup SSL/TLS with Let's Encrypt
3. Configure monitoring (Prometheus/Grafana)
4. Setup automated deployments via GitHub Actions
