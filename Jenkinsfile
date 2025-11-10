pipeline {
  agent any

  // Avoid Jenkins' default SCM checkout because we do checkout ourselves in the Checkout stage
  options {
    skipDefaultCheckout()
  }


  parameters {
    string(name: 'DOCKERHUB_USER', defaultValue: 'banukarajapaksha', description: 'Docker Hub username/namespace (lowercase)')
    string(name: 'DOCKERHUB_CREDENTIALS_ID', defaultValue: 'dockerhub', description: 'Jenkins Credentials ID for Docker Hub (username+token)')
  }

  environment {
    // Use parameter (lowercased to satisfy Docker Hub requirements)
    DOCKERHUB_USER = "${params.DOCKERHUB_USER.toLowerCase()}"
    BACKEND_IMG    = "${env.DOCKERHUB_USER}/smartexpense-backend"
    FRONTEND_IMG   = "${env.DOCKERHUB_USER}/smartexpense-frontend"
    // Enable BuildKit for faster, cached builds if Docker supports it
    DOCKER_BUILDKIT = '1'
  }

  triggers {
    // Requires GitHub (or Git) plugin configured; alternatively use Generic Webhook Trigger
    githubPush()
  }

  stages {
    stage('Env Sanity') {
      steps {
        echo '--- Environment sanity check ---'
        sh 'uname -a || true'
        sh 'command -v docker >/dev/null 2>&1 && docker version || echo "Docker CLI not available"'
        sh 'echo "Node check:"'
        sh 'command -v node >/dev/null 2>&1 && node -v || echo "Node not installed on agent"'
      }
    }
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .gitsha'
      }
    }

    stage('Docker Build Images') {
      steps {
        script {
          sh """
            docker build -t ${BACKEND_IMG}:latest -f backend/Dockerfile.prod backend
            docker build -t ${FRONTEND_IMG}:latest -f frontend/Dockerfile.prod frontend
          """
        }
      }
    }

    stage('Tag Images (sha)') {
      steps {
        script {
          def sha = readFile('.gitsha').trim()
          sh """
            docker tag ${BACKEND_IMG}:latest ${BACKEND_IMG}:sha-${sha}
            docker tag ${FRONTEND_IMG}:latest ${FRONTEND_IMG}:sha-${sha}
          """
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        // IMPORTANT: The credential referenced by DOCKERHUB_CREDENTIALS_ID must be of type
        // "Username with password" (StandardUsernamePasswordCredentials) where:
        //   Username = your Docker Hub username (e.g. banukarajapaksha)
        //   Password = Docker Hub access token (not your account password, not an SSH key)
        // If you accidentally created an "SSH Username with private key" credential with this ID,
        // Jenkins will throw: Credentials is of type SSH Username with private key where StandardUsernamePasswordCredentials was expected.
        // Fix: Manage Jenkins -> Credentials -> (Global) -> Add Credentials -> Kind: "Username with password".
        // Use a new ID (e.g. dockerhub-token) and update the parameter default OR recreate with the same ID.
        withCredentials([usernamePassword(credentialsId: "${params.DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh 'set -e; echo "Logging into Docker Hub as $DH_USER"; echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin && echo "Login Succeeded"'
          script {
            def sha = readFile('.gitsha').trim()
            sh """
              docker push ${BACKEND_IMG}:latest
              docker push ${BACKEND_IMG}:sha-${sha}
              docker push ${FRONTEND_IMG}:latest
              docker push ${FRONTEND_IMG}:sha-${sha}
            """
          }
          // Logout to avoid credential leakage across subsequent builds on same agent
          sh 'docker logout || true'
        }
      }
    }
  }

  post {
    success {
      echo 'Jenkins pipeline succeeded.'
    }
    failure {
      echo 'Jenkins pipeline failed.'
    }
    always {
      // Avoid disk bloat on agents; only attempt if docker exists
      sh 'command -v docker >/dev/null 2>&1 && docker image prune -f || true'
    }
  }
}
