pipeline {
    agent any

    stages {

        stage('Check Files') {
            steps {
                sh 'ls -la'
            }
        }

        stage('Check Node') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Run App') {
            steps {
                sh 'node app.js'
            }
        }
    }
}
