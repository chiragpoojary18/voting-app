pipeline {

    agent any

    environment {
        IMAGE_NAME = "chiragpoojary1811/voting-app"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/chiragpoojary18/voting-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh 'docker push $IMAGE_NAME'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {

                sh 'kubectl apply -f deployment.yaml'

                sh 'kubectl apply -f service.yaml'
            }
        }
    }

    post {

        success {
            echo 'Application deployed successfully to Kubernetes'
        }

        failure {
            echo 'Pipeline failed'
        }
    }
}
