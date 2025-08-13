#!/bin/bash
set -euo pipefail

# Backup script for CIRO Network sensitive artifacts and deployment metadata
# Destination: CIRO_Network_Backup/<timestamp>

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TS="$(date +%Y%m%d_%H%M%S)"
DEST_DIR="$ROOT_DIR/CIRO_Network_Backup/${TS}"

mkdir -p "$DEST_DIR"

copy_if_exists() {
	local src="$1"
	local dst="$2"
	if [ -e "$src" ]; then
		mkdir -p "$(dirname "$dst")"
		cp -R "$src" "$dst"
		echo "Backed up: $src -> $dst"
	fi
}

echo "Backing up artifacts to $DEST_DIR"

# Top-level deployment metadata
copy_if_exists "$ROOT_DIR/contracts.json" "$DEST_DIR/contracts.json"

# Cairo contracts: deployment jsons, logs, and keystores/accounts (no secrets to git)
copy_if_exists "$ROOT_DIR/cairo-contracts/core_deployment_*.json" "$DEST_DIR/cairo-contracts/"
copy_if_exists "$ROOT_DIR/cairo-contracts/deployment_*.json" "$DEST_DIR/cairo-contracts/"
copy_if_exists "$ROOT_DIR/cairo-contracts/reputation_manager_deployment.json" "$DEST_DIR/cairo-contracts/reputation_manager_deployment.json"
copy_if_exists "$ROOT_DIR/cairo-contracts/reputation_manager_deployment_*.log" "$DEST_DIR/cairo-contracts/"
copy_if_exists "$ROOT_DIR/cairo-contracts/DEPLOYMENTS.md" "$DEST_DIR/cairo-contracts/DEPLOYMENTS.md"

# Keystores and account configs (safely copy for backup; these are ignored by git)
copy_if_exists "$ROOT_DIR/cairo-contracts/testnet_keystore.json" "$DEST_DIR/cairo-contracts/keystores/testnet_keystore.json"
copy_if_exists "$ROOT_DIR/cairo-contracts/fresh_deployer_key" "$DEST_DIR/cairo-contracts/keystores/fresh_deployer_key"
copy_if_exists "$ROOT_DIR/cairo-contracts/testnet_account.json" "$DEST_DIR/cairo-contracts/accounts/testnet_account.json"
copy_if_exists "$ROOT_DIR/cairo-contracts/testnet_deployer.json" "$DEST_DIR/cairo-contracts/accounts/testnet_deployer.json"
copy_if_exists "$ROOT_DIR/cairo-contracts/temp_account.json" "$DEST_DIR/cairo-contracts/accounts/temp_account.json"

# Admin accounts bundle (if exists)
copy_if_exists "$ROOT_DIR/cairo-contracts/admin_accounts/keystores" "$DEST_DIR/cairo-contracts/admin_accounts/keystores"
copy_if_exists "$ROOT_DIR/cairo-contracts/admin_accounts/generated" "$DEST_DIR/cairo-contracts/admin_accounts/generated"

# Airdrop artifacts
copy_if_exists "$ROOT_DIR/cairo-contracts/airdrop/recipients.json" "$DEST_DIR/cairo-contracts/airdrop/recipients.json"
copy_if_exists "$ROOT_DIR/cairo-contracts/airdrop/keystores" "$DEST_DIR/cairo-contracts/airdrop/keystores"
copy_if_exists "$ROOT_DIR/cairo-contracts/airdrop/generated" "$DEST_DIR/cairo-contracts/airdrop/generated"
copy_if_exists "$ROOT_DIR/cairo-contracts/airdrop/airdrop.sh" "$DEST_DIR/cairo-contracts/airdrop/airdrop.sh"
copy_if_exists "$ROOT_DIR/cairo-contracts/airdrop/airdrop_plan.md" "$DEST_DIR/cairo-contracts/airdrop/airdrop_plan.md"

# Rust-node config snapshots
copy_if_exists "$ROOT_DIR/rust-node/FINAL_SUMMARY.md" "$DEST_DIR/rust-node/FINAL_SUMMARY.md"
copy_if_exists "$ROOT_DIR/rust-node/STATUS.md" "$DEST_DIR/rust-node/STATUS.md"

echo "Backup completed: $DEST_DIR"

