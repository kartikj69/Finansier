pipeline {
    agent any
    stages {
        stage('Docker Compose') {
            steps {
                script {
                    docker.image('docker/compose:1.29.2').inside('--privileged --user=root') {
                        sh '''
                            docker-compose version
                            docker-compose down
                            docker-compose build --no-cache
                            docker-compose up -d
                        '''
                    }
                }
            }
        }
    }
}
