pipeline {
    agent any

    environment {
        IMAGE_NAME = "electricity-frontend"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        REGISTRY_CREDENTIALS = credentials('docker-registry-credentials')
        REGISTRY = "docker.io/YOUR_DOCKERHUB_USERNAME"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm ci'
                sh 'CI=true npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -t ${REGISTRY}/${IMAGE_NAME}:latest ."
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "echo ${REGISTRY_CREDENTIALS_PSW} | docker login ${REGISTRY} -u ${REGISTRY_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    docker pull ${REGISTRY}/${IMAGE_NAME}:latest
                    docker stop ${IMAGE_NAME} || true
                    docker rm ${IMAGE_NAME} || true
                    docker run -d --name ${IMAGE_NAME} --restart unless-stopped -p 80:80 ${REGISTRY}/${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout ${REGISTRY} || true'
        }
        failure {
            echo 'Build failed.'
        }
    }
}
