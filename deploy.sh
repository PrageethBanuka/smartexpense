#!/bin/bash
# SmartExpense Quick Deploy Script
# This script guides you through the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Start
print_header "SmartExpense Deployment Script"

# Check prerequisites
print_header "Checking Prerequisites"

MISSING_DEPS=0

if ! check_command terraform; then
    echo "  Install: brew install terraform"
    MISSING_DEPS=1
fi

if ! check_command ansible; then
    echo "  Install: brew install ansible"
    MISSING_DEPS=1
fi

if ! check_command aws; then
    echo "  Install: brew install awscli"
    MISSING_DEPS=1
fi

if ! check_command ssh-keygen; then
    print_error "ssh-keygen not found (should be built-in)"
    MISSING_DEPS=1
fi

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "Please install missing dependencies and run again"
    exit 1
fi

print_success "All prerequisites met!"

# Check SSH key
print_header "Checking SSH Key"

if [ ! -f ~/.ssh/id_rsa ]; then
    print_info "SSH key not found. Generating..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    print_success "SSH key generated at ~/.ssh/id_rsa"
else
    print_success "SSH key exists at ~/.ssh/id_rsa"
fi

# Check AWS credentials
print_header "Checking AWS Credentials"

if aws sts get-caller-identity &> /dev/null; then
    print_success "AWS credentials configured"
    aws sts get-caller-identity
else
    print_error "AWS credentials not configured"
    print_info "Run: aws configure"
    exit 1
fi

# Ask user what to do
print_header "Deployment Options"
echo "What would you like to do?"
echo "1) Deploy infrastructure (Terraform)"
echo "2) Deploy application (Ansible)"
echo "3) Full deployment (Terraform + Ansible)"
echo "4) Check deployment status"
echo "5) Destroy infrastructure"
echo "6) Exit"

read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        print_header "Deploying Infrastructure with Terraform"
        cd terraform
        
        if [ ! -f terraform.tfvars ]; then
            print_info "Creating terraform.tfvars from example..."
            cp terraform.tfvars.example terraform.tfvars
        fi
        
        terraform init
        terraform plan
        
        read -p "Apply this plan? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            terraform apply -auto-approve
            print_success "Infrastructure deployed!"
            
            echo ""
            terraform output
            echo ""
            
            SERVER_IP=$(terraform output -raw instance_public_ip)
            print_info "Server IP: $SERVER_IP"
            print_info "Save this IP for Ansible configuration"
            
            echo "$SERVER_IP" > ../server_ip.txt
            print_success "IP saved to server_ip.txt"
        fi
        ;;
        
    2)
        print_header "Deploying Application with Ansible"
        
        if [ ! -f server_ip.txt ]; then
            print_error "Server IP not found. Run Terraform first or create server_ip.txt"
            exit 1
        fi
        
        SERVER_IP=$(cat server_ip.txt)
        print_info "Using server IP: $SERVER_IP"
        
        cd ansible
        
        # Update inventory
        print_info "Updating inventory.ini..."
        sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" inventory.ini
        
        # Check if ansible_env.sh exists
        if [ ! -f ansible_env.sh ]; then
            print_info "Creating ansible_env.sh..."
            cat > ansible_env.sh << EOF
#!/bin/bash
export DOCKERHUB_TOKEN=""
export DB_PASSWORD="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 32)"
EOF
            chmod +x ansible_env.sh
            print_success "Created ansible_env.sh with random passwords"
        fi
        
        # Source env vars
        source ansible_env.sh
        
        # Install Ansible collections
        print_info "Installing Ansible collections..."
        ansible-galaxy collection install community.docker
        
        # Test connection
        print_info "Testing connection to server..."
        if ansible app_servers -m ping; then
            print_success "Connection successful!"
        else
            print_error "Cannot connect to server"
            exit 1
        fi
        
        # Run playbook
        print_info "Running deployment playbook..."
        ansible-playbook playbook.yml
        
        print_success "Deployment complete!"
        print_info "Access your app at: http://$SERVER_IP:8080"
        ;;
        
    3)
        print_header "Full Deployment"
        print_info "This will run Terraform then Ansible"
        
        # Run Terraform
        cd terraform
        if [ ! -f terraform.tfvars ]; then
            cp terraform.tfvars.example terraform.tfvars
        fi
        
        terraform init
        terraform apply -auto-approve
        
        SERVER_IP=$(terraform output -raw instance_public_ip)
        echo "$SERVER_IP" > ../server_ip.txt
        
        print_success "Infrastructure deployed!"
        print_info "Waiting 30 seconds for server to boot..."
        sleep 30
        
        # Run Ansible
        cd ../ansible
        sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" inventory.ini
        
        if [ ! -f ansible_env.sh ]; then
            cat > ansible_env.sh << EOF
#!/bin/bash
export DOCKERHUB_TOKEN=""
export DB_PASSWORD="$(openssl rand -base64 32)"
export JWT_SECRET="$(openssl rand -base64 32)"
EOF
            chmod +x ansible_env.sh
        fi
        
        source ansible_env.sh
        ansible-galaxy collection install community.docker
        ansible-playbook playbook.yml
        
        print_success "Full deployment complete!"
        print_info "Access your app at: http://$SERVER_IP:8080"
        ;;
        
    4)
        print_header "Checking Deployment Status"
        
        if [ ! -f server_ip.txt ]; then
            print_error "No deployment found"
            exit 1
        fi
        
        SERVER_IP=$(cat server_ip.txt)
        
        cd ansible
        print_info "Checking containers..."
        ansible app_servers -a "docker ps" -b
        
        print_info "Testing backend health..."
        curl -s http://$SERVER_IP:4000/health || print_error "Backend not responding"
        
        print_info "Testing frontend..."
        curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:8080
        ;;
        
    5)
        print_header "Destroying Infrastructure"
        print_error "This will DELETE all resources!"
        read -p "Are you sure? Type 'destroy' to confirm: " confirm
        
        if [ "$confirm" = "destroy" ]; then
            cd terraform
            terraform destroy -auto-approve
            rm -f ../server_ip.txt
            print_success "Infrastructure destroyed"
        else
            print_info "Cancelled"
        fi
        ;;
        
    6)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_success "Done!"
