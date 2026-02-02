# Auto-Deployment Setup

## GitHub Secrets Required

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### 1. EC2_SSH_PRIVATE_KEY
Your private SSH key for EC2 access:

```bash
# Display your private key
cat ~/.ssh/smartexpense-key

# Copy the ENTIRE output (including -----BEGIN and -----END lines)
```

### 2. EC2_HOST
Your EC2 public IP address:
```
44.215.84.51
```

### 3. DOCKERHUB_TOKEN
Your Docker Hub access token (already should be set):

1. Go to https://hub.docker.com/settings/security
2. Create a new access token
3. Copy and save as `DOCKERHUB_TOKEN` secret

## How Auto-Deployment Works

### On Pull Request:
1. ✅ Tests run
2. ✅ Docker images are **built** but **NOT pushed** to Docker Hub
3. ✅ No deployment happens

### On Merge to Main/Master:
1. ✅ Tests run
2. ✅ Docker images are **built and pushed** to Docker Hub
3. ✅ **Automatic deployment** to EC2:
   - SSH into EC2 server
   - Pull latest Docker images
   - Restart containers with new code
   - Clean up old images

## Workflow

```bash
# 1. Make changes locally
git checkout -b feature/update-dashboard
# Edit files...

# 2. Commit and push
git add .
git commit -m "Update dashboard with charts"
git push origin feature/update-dashboard

# 3. Create Pull Request on GitHub
# → CI will build and test (but not deploy)

# 4. Merge PR to main
# → CI will build, push images, and AUTO-DEPLOY to production!

# 5. Check deployment
# Visit: http://44.215.84.51:8080
```

## Manual Deployment Trigger

You can also trigger deployment manually from GitHub Actions:
1. Go to Actions tab
2. Select "Build Docker Images (Docker Hub)" workflow
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"

## Verify Deployment

After merge, check:
- GitHub Actions tab for workflow status
- Application: http://44.215.84.51:8080
- SSH to EC2 to check containers:
  ```bash
  ssh -i ~/.ssh/smartexpense-key ubuntu@44.215.84.51
  docker-compose -f /opt/smartexpense/docker-compose.prod.yml ps
  docker-compose -f /opt/smartexpense/docker-compose.prod.yml logs -f
  ```

## Current Workflow Files

- `.github/workflows/ci.yml` - Tests and build verification
- `.github/workflows/dockerhub-images.yml` - Build images + auto-deploy on main
- `.github/workflows/docker-images.yml` - Build images for GHCR (backup)
- `.github/workflows/deploy.yml` - Manual deployment workflow

## What Happens Now

Your updated Dashboard will be automatically deployed when you:
1. Commit the changes
2. Push to a branch
3. Create a PR
4. Merge the PR to main

**The deployment is automatic - no manual intervention needed!**
