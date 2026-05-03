pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        MONGO_URI = "mongodb://zoya_1234:zoya12345@cluster0-shard-00-00.v5eok.mongodb.net:27017/expensetracker?ssl=true&replicaSet=atlas-12ea3n-shard-0&authSource=admin"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo 'Cloning app repository...'
                checkout scm
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
                sh '''docker run -d --name web-jenkins -p 3001:3000 \
                -e MONGO_URI="mongodb://zoya_1234:zoya12345@cluster0-shard-00-00.v5eok.mongodb.net:27017/expensetracker?ssl=true&replicaSet=atlas-12ea3n-shard-0&authSource=admin" \
                zoyajabeen/expense-tracker:latest'''
                sh 'sleep 10'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Selenium tests...'
                sh 'rm -rf /tmp/expense-tracker-tests'
                sh 'git clone https://github.com/ZoyaJabeen468/expense-tracker-tests.git /tmp/expense-tracker-tests'
                sh 'cd /tmp/expense-tracker-tests && python3 -m pytest test_expense_tracker.py -v --html=/tmp/report.html --self-contained-html || true'
            }
        }

    }

    post {
        always {
            script {
                def status = currentBuild.result ?: 'SUCCESS'
                def recipientEmail = sh(
                    script: "git log -1 --format='%ae'",
                    returnStdout: true
                ).trim()

                emailext(
                    to: recipientEmail,
                    subject: "Expense Tracker - Build #${BUILD_NUMBER} - ${status}",
                    body: """
                        <h2>Jenkins Pipeline Report</h2>
                        <p><b>Project:</b> Expense Tracker</p>
                        <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                        <p><b>Status:</b> ${status}</p>
                        <p><b>Triggered by:</b> ${recipientEmail}</p>
                        <p>Check full logs at: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                    """,
                    mimeType: 'text/html'
                )
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}