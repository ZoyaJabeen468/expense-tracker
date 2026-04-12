// pipeline {
//     agent any

//     environment {
//         MONGO_URI = "mongodb://zoya_1234:zoya12345@cluster0-shard-00-00.v5eok.mongodb.net:27017,cluster0-shard-00-01.v5eok.mongodb.net:27017,cluster0-shard-00-02.v5eok.mongodb.net:27017/expensetracker?ssl=true&replicaSet=atlas-12ea3n-shard-0&authSource=admin&appName=Cluster0"
//     }

//     stages {
//         stage('Clone Repository') {
//             steps {
//                 echo 'Cloning repository from GitHub...'
//                 git branch: 'main',
//                     url: 'https://github.com/ZoyaJabeen468/expense-tracker.git'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 echo 'Building Docker image...'
//                 sh 'docker build -t zoyajabeen/expense-tracker:latest .'
//             }
//         }

//         stage('Run Application') {
//             steps {
//                 echo 'Starting application with Docker Compose...'
//                 sh 'docker-compose -f docker-compose.jenkins.yml up -d --build'
//             }
//         }
//     }

//     post {
//         success {
//             echo 'Build successful!'
//         }
//         failure {
//             echo 'Build failed!'
//         }
//     }
// }



pipeline {
    agent any
    triggers {
        githubPush()
    }
    environment {
        MONGO_URI = "mongodb://zoya_1234:zoya12345@cluster0-shard-00-00.v5eok.mongodb.net:27017,cluster0-shard-00-01.v5eok.mongodb.net:27017,cluster0-shard-00-02.v5eok.mongodb.net:27017/expensetracker?ssl=true&replicaSet=atlas-12ea3n-shard-0&authSource=admin&appName=Cluster0"
    }
    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning repository from GitHub...'
            }
        }
        stage('Build Docker Image') {
            steps {
                echo 'Pulling Docker image...'
                sh 'docker pull zoyajabeen/expense-tracker:latest'
            }
        }
        stage('Run Application') {
            steps {
                echo 'Starting application...'
                sh 'docker stop web-jenkins || true'
                sh 'docker rm web-jenkins || true'
                sh 'docker run -d --name web-jenkins -p 3001:3000 -e MONGO_URI="${MONGO_URI}" zoyajabeen/expense-tracker:latest'
            }
        }
    }
    post {
        success { echo 'Pipeline completed! App running on port 3001' }
        failure { echo 'Build failed!' }
    }
}