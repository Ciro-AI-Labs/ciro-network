#!/bin/bash

# ===== CIRO Network DevContainer Post-Start Script =====
# This script runs every time the container starts

set -e

echo "🌅 Starting CIRO Network development environment..."

# Check if services are ready
echo "🔍 Checking service health..."

# Wait for PostgreSQL to be ready
echo "🐘 Waiting for PostgreSQL..."
until pg_isready -h postgres -U ciro -d ciro_dev; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "🔴 Waiting for Redis..."
until redis-cli -h redis ping; do
    echo "Redis is unavailable - sleeping"
    sleep 2
done
echo "✅ Redis is ready!"

# Wait for Starknet Devnet to be ready
echo "🏛️ Waiting for Starknet Devnet..."
until curl -f http://starknet-devnet:5050/is_alive; do
    echo "Starknet Devnet is unavailable - sleeping"
    sleep 2
done
echo "✅ Starknet Devnet is ready!"

# Wait for Kafka to be ready
echo "🟢 Waiting for Kafka..."
until kafka-topics --bootstrap-server kafka:9092 --list &>/dev/null; do
    echo "Kafka is unavailable - sleeping"
    sleep 2
done
echo "✅ Kafka is ready!"

# Create required Kafka topics
echo "📝 Creating Kafka topics..."
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic ciro-jobs --partitions 3 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic ciro-results --partitions 3 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic ciro-metrics --partitions 3 --replication-factor 1
kafka-topics --bootstrap-server kafka:9092 --create --if-not-exists --topic ciro-events --partitions 3 --replication-factor 1

# Display service URLs
echo ""
echo "🚀 CIRO Network development environment is ready!"
echo ""
echo "🌐 Service URLs:"
echo "  - PostgreSQL:     postgres://ciro:ciro@localhost:5432/ciro_dev"
echo "  - Redis:          redis://localhost:6379"
echo "  - Starknet:       http://localhost:5050"
echo "  - Kafka:          localhost:9092"
echo "  - Jaeger:         http://localhost:16686"
echo "  - Prometheus:     http://localhost:9090"
echo "  - Grafana:        http://localhost:3001 (admin/admin)"
echo ""
echo "🛠️  Development commands:"
echo "  - cargo build --workspace           # Build all Rust crates"
echo "  - cargo test --workspace            # Run all tests"
echo "  - scarb build                       # Build Cairo contracts"
echo "  - cd tauri-app && npm run dev       # Start Tauri app"
echo "  - cd tauri-app && npm run tauri dev # Start Tauri with hot reload"
echo ""
echo "📊 Monitoring:"
echo "  - View logs: docker-compose logs -f [service]"
echo "  - Check health: docker-compose ps"
echo ""

# Set up shell aliases for convenience
echo "📋 Setting up convenient aliases..."
cat >> ~/.bashrc << 'EOF'

# CIRO Network Development Aliases
alias ciro-build='cargo build --workspace'
alias ciro-test='cargo test --workspace'
alias ciro-fmt='cargo fmt --all'
alias ciro-clippy='cargo clippy --workspace --all-targets --all-features'
alias ciro-cairo='cd cairo-contracts && scarb build'
alias ciro-node='cd rust-node && cargo run'
alias ciro-app='cd tauri-app && npm run tauri dev'
alias ciro-logs='docker-compose logs -f'
alias ciro-services='docker-compose ps'
alias ciro-restart='docker-compose restart'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline --graph'

# Starknet aliases
alias sn-accounts='starkli account list'
alias sn-balance='starkli balance'
alias sn-deploy='starkli deploy'

# Database aliases
alias db-connect='psql postgresql://ciro:ciro@postgres:5432/ciro_dev'
alias db-migrate='sqlx migrate run'
alias db-reset='sqlx database drop && sqlx database create && sqlx migrate run'

EOF

# Source the new aliases
source ~/.bashrc

echo "✅ Post-start setup complete!"
echo "🎉 Happy coding!" 