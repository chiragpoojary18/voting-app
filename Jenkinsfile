pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Check Files') {
            steps {
                sh 'ls -la'
            }
        }

        stage('Check Node and NPM') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Application') {
    steps {
        sh '''
            BUILD_ID=dontKillMe \
            nohup node server.js > app.log 2>&1 &
            
            sleep 5
            
            cat app.log
            
            ps aux | grep node
        '''
    }
}
    }

    post {

        success {
            echo 'Pipeline executed successfully'
        }

        failure {
            echo 'Pipeline failed'
        }
    }
}
