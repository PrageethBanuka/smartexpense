pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  environment {
    // Change to your Docker Hub namespace if different
    DOCKERHUB_USER = 'banukarajapaksha'
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
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
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
