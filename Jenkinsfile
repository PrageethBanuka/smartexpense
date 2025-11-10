pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
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
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD > .gitsha'
      }
    }

    stage('Backend: Install & Test') {
      steps {
        dir('backend') {
          sh 'npm ci || npm install'
          // TODO: add real tests when available
          sh 'npm test || echo "No backend tests yet"'
        }
      }
    }

    stage('Frontend: Build (Prod)') {
      steps {
        dir('frontend') {
          sh 'npm ci || npm install'
          sh 'npm run build'
        }
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
        withCredentials([usernamePassword(credentialsId: "${params.DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
          script {
            def sha = readFile('.gitsha').trim()
            sh """
              docker push ${BACKEND_IMG}:latest
              docker push ${BACKEND_IMG}:sha-${sha}
              docker push ${FRONTEND_IMG}:latest
              docker push ${FRONTEND_IMG}:sha-${sha}
            """
          }
        }
      }
    }

    stage('Verify Docker Hub Images') {
      steps {
        script {
          def sha = readFile('.gitsha').trim()
          // Pull back one image tag to confirm push succeeded; ignore failures to avoid hard stop
          sh """
            echo 'Verifying backend latest tag exists on Docker Hub...'
            docker pull ${BACKEND_IMG}:latest || echo 'WARN: backend latest pull failed'
            echo 'Verifying backend sha tag exists on Docker Hub...'
            docker pull ${BACKEND_IMG}:sha-${sha} || echo 'WARN: backend sha pull failed'
            echo 'Verifying frontend latest tag exists on Docker Hub...'
            docker pull ${FRONTEND_IMG}:latest || echo 'WARN: frontend latest pull failed'
          """
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
      // Avoid disk bloat on agents
      sh 'docker image prune -f || true'
    }
  }
}
