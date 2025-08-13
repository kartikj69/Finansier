pipeline {
    agent any
    stages {
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