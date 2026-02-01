pipeline {
  agent any

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
    stage('Backend: Build & Push') {
      steps {
        script {
          def sha = readFile('.gitsha').trim()
          withCredentials([usernamePassword(credentialsId: "${params.DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
            sh 'set -e; echo "Logging into Docker Hub (backend) as $DH_USER"; echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
            sh "docker build -t ${BACKEND_IMG}:latest -f backend/Dockerfile backend"
            sh "docker tag ${BACKEND_IMG}:latest ${BACKEND_IMG}:sha-${sha}"
            sh "docker push ${BACKEND_IMG}:latest"
            sh "docker push ${BACKEND_IMG}:sha-${sha}"
            sh 'docker logout || true'
          }
        }
      }
    }

    stage('Frontend: Build & Push') {
      steps {
        script {
          def sha = readFile('.gitsha').trim()
          withCredentials([usernamePassword(credentialsId: "${params.DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
            sh 'set -e; echo "Logging into Docker Hub (frontend) as $DH_USER"; echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
            // Catch build errors so pipeline doesn't abort before backend image is delivered
            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
              sh "docker build --build-arg REACT_APP_API_URL=/api -t ${FRONTEND_IMG}:latest -f frontend/Dockerfile.prod frontend"
              sh "docker tag ${FRONTEND_IMG}:latest ${FRONTEND_IMG}:sha-${sha}"
              sh "docker push ${FRONTEND_IMG}:latest"
              sh "docker push ${FRONTEND_IMG}:sha-${sha}"
            }
            sh 'docker logout || true'
          }
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
      sh 'command -v docker >/dev/null 2>&1 && docker image prune -f || true'
    }
  }
}
 
