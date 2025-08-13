pipeline {
    agent any
    stages {
        stage('Docker-compose') {
            steps {
                sh '''
                    sudo apt update && sudo apt install docker-compose -y
                '''
            }
        }
        stage('Docker') {
            steps {
                sh '''
                    docker-compose down
                    docker-compose build --no-cache
                    docker-compose up -d
                '''
            }
        }
    }
}