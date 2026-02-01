# SmartExpense - DevOps Project Documentation

## Project Overview

SmartExpense is a web-based expense tracking application that allows users to manage their personal finances. Users can register, log in, add expenses with different categories, and view monthly reports with visual charts.

The main goal of this project is to implement a complete DevOps pipeline including containerization, CI/CD automation, infrastructure provisioning, and configuration management. The application demonstrates practical use of Docker, GitHub Actions, Terraform, and Ansible for automated deployment to AWS

## System Architecture

The application uses a standard three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
│              React SPA (Single Page App)                 │
│         Nginx Server (Production Deployment)             │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                     Backend Layer                        │
│              Node.js + Express REST API                  │
│           JWT Authentication & Middleware                │
└─────────────────────────────────────────────────────────┘
                            ↓ SQL Queries
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│                PostgreSQL Database                       │
│              Sequelize ORM for Data Access               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 DevOps Architecture

```
Developer → Git Push → GitHub Repository
The DevOps pipeline follows this flow:↓
                    GitHub Actions CI/CD
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
    GitHub Container Registry    Docker Hub
              ↓                         ↓
              └────────────┬────────────┘
                           ↓
                   Terraform (IaC)
                           ↓
                   AWS EC2 Instance
                           ↓
                   Ansible Playbook
                           ↓
                   Docker Compose
                           ↓
              ┌────────────┴────────────┐
              ↓            ↓            ↓
         PostgreSQL    Backend     Frontend
```

## Technology Stack

**Application Stack:**
- Frontend: React 18, React Router, Chart.js, Axios
- Backend: Node.js 18, Express, Sequelize ORM, JWT authentication
- Database: PostgreSQL 16

**DevOps Tools:**
- Containerization: Docker, Docker Compose
- CI/CD: GitHub Actions
- Registries: GitHub Container Registry (GHCR), Docker Hub
- Infrastructure: Terraform (AWS EC2, VPC, Security Groups)
- Configuration: Ansible
- Version Control: Git, GitHub

## Application Features

The application includes basic expense tracking functionality:
- User registration and login with JWT authentication
- Add, edit, and delete expenses with categories (Food, Transport, Bills, Shopping, Entertainment, Health, Other)
- Monthly expense reports with pie charts for category distribution
- Bar charts showing spending trends over the last 6 months
- Responsive design that works on different screen sizes

## Docker Containerization

### 5.1 Container Strategy

The application uses three separate containers orchestrated by Docker Compose:

1. **Frontend Container:** Nginx serving React build
2. **Backend Container:** Node.js Express API server
3. **Database Container:** PostgreSQL database

### 5.2 Dockerfile Configuration

**Frontend Dockerfile:**
- Multi-stage build (build → production)
- Stage 1: Node.js to build React app
- Stage 2: Nginx to serve static files
- Optimized for production with minimal image size

**Backend Dockerfile:**
- Based on Node.js 18 Alpine (lightweight)
- Production dependencies only
- Health check endpoint configured
- Non-root user for security

### 5.3 Docker Compose Setup

**Development Configuration (docker-compose.yml):**
- Hot-reload enabled for frontend and backend
- Volume mounts for live code updates
- PostgreSQL with persistent volume
- Environment variables for configuration

**Production Configuration (docker-compose.prod.yml):**
- Optimized images from registries
- No volume mounts (immutable containers)
- Production-grade settings
- Restart policies configured

### 5.4 Container Networking

- Custom bridge network: `smartexpense-network`
- Internal DNS resolution between containers
- Exposed ports:
  - Frontend: 8080 → 80
  - Backend: 4000 → 4000
  - PostgreSQL: 5433 → 5432

---

## 6. CI/CD Pipeline

### 6.1 GitHub Actions Workflows

Three automated workflows handle the CI/CD process:

#### Workflow 1: Continuous Integration (ci.yml)

**Trigger:** Push to main/master branch or Pull Request

**Jobs:**
1. Docker Containerization

The application runs in three Docker containers:
- Frontend: Nginx serving the React build (multi-stage Dockerfile)
- Backend: Node.js Express API
- Database: PostgreSQL with persistent volume

Two Docker Compose files are used:
- `docker-compose.yml` for local development with hot-reload
- `docker-compose.prod.yml` for production deployment with pre-built images

Containers communicate through a custom bridge network (`smartexpense-network`). The frontend is exposed on port 8080, backend API on port 4000, and PostgreSQL on port 5433.

##.3 Build Optimization

- Caching of npm dependencies
- Layer caching for Docker builds
- Parallel job execution
- Conditional workflow triggers

---

## 7. Infrastructure as Code (Terraform)

### 7.1 Terraform Configuration

**Files Structure:**
- `main.tf` - Primary infrastructure definitions
- `variables.tf` - Input parameters
- `outputs.tf` - Output values after deployment
- `terraform.tfvars.example` - Configuration template

### 7.2 AWS Resources Provisioned

**Network Resources:**
- VPC (Virtual Private Cloud) with CIDR 10.0.0.0/16
- Internet Gateway for external connectivity
- Route Table with public subnet routing
- Subnet in availability zone (us-east-1a)

**Compute Resources:**
- EC2 Instance (t2.micro for free tier)
- Ubuntu 22.04 LTS AMI
- 30 GB EBS volume
- Elastic IP for static addressing

**Security Resources:**
- Security Group with controlled ingress rules:
  - Port 22 (SSH)
  -CI/CD Pipeline

Three GitHub Actions workflows automate the build and deployment process:

**1. CI Workflow (`ci.yml`)**
Triggered on push or pull request to main branch. Builds and tests both frontend and backend code.

**2. GHCR Workflow (`docker-images.yml`)**
Builds Docker images and pushes them to GitHub Container Registry after every push to main.

**3. Docker Hub Workflow (`dockerhub-images.yml`)**
Same as GHCR but pushes images to Docker Hub for public access.

GitHub Secrets are used to store Docker Hub credentials and GitHub tokens securely. The workflows use caching to speed up builds.

##y environment templates
- Set database credentials
- Configure JWT secrets
- Set API URLs

#### 6. Docker Compose Files
- Copy docker-compose.prod.yml
- Validate compose file syntax

#### 7. Image Management
- Pull latest frontend image
- Pull latest backend image
- Pull PostgreSQL image
- Verify image availability

#### 8. Application Deployment
- Stop existing containers (if any)
- Deploy with docker-compose up
- Wait for containers to be healthy
- Verify all services running

#### 9. Health Checks & Backup
- Test backend health endpoint
- Test frontend availability
- Configure automated backup script
- Set up cron job for backups

### 8.3 Ansible Tags

Playbook supports selective execution:
- `system` - System-level tasks
- `docker` - Docker installation
- `deploy` - Application deployment
- `backup` - Backup configuration

### 8.4 Idempotency

All Ansible tasks are idempotent:
- Can be run multiple times safely
- Only applies necessary changes
- No side effects from re-runs

---

## 9. Deployment Strategy

### 9.1 Automated Deployment Script

**deploy.sh** - Interactive menu-driven script:

**FConfiguration Management (Ansible)

Ansible automates the server configuration and application deployment. The playbook (`playbook.yml`) performs these tasks:

1. System updates and prerequisite installation
2. Docker and Docker Compose installation
3. Application directory creation at `/opt/smartexpense`
4. Docker registry authentication
5. Environment variable configuration
6. Docker image pulls from registries
7. Application deployment using docker-compose
8. Health checks and backup script setup

The inventory file (`inventory.ini`) defines the target EC2 instance. All tasks are idempotent, so the playbook can be run multiple times safely.

##Deployment Workflow

A bash script (`deploy.sh`) provides an interactive menu for deployment:
- Prerequisites check
- Terraform provisioning
- Ansible configuration
- Full automated deployment
- Status verification
- Infrastructure cleanup

The deployment process has three phases:

**Phase 1 - Infrastructure (Terraform):**
Initialize Terraform, plan changes, apply configuration, and get the server IP.

**Phase 2 - Configuration (Ansible):**
Update inventory with server IP, set environment variables, run playbook to install Docker and deploy containers.

**Phase 3 - Verification:**
Check container status, test health endpoints, and access the application.

## Monitoring and Maintenance

The backend exposes a health endpoint at `/health` that returns the application status and database connectivity.

Container monitoring uses standard Docker commands:
- `docker ps` to check running containers
- `docker-compose logs` to view application logs
- `docker stats` for resource usage

A backup script runs daily via cron to dump the PostgreSQL database to `/opt/smartexpense/backups/` with 7-day retention.

## Cost Analysis

Using AWS free tier:
- t2.micro EC2 instance: Free for 750 hours/month
- 30 GB EBS storage: ~$3/month
- Data transfer: minimal

Total estimated cost is $3-4/month or free within AWS free tier limits.

## Summary

This project implements a full DevOps pipeline for a web application. It covers containerization with Docker, automated CI/CD using GitHub Actions, infrastructure provisioning with Terraform, and configuration management with Ansible. The application is deployed to AWS EC2 with automated health checks and backup strategies