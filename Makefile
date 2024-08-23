SHELL := /bin/bash
RM=rm -rf

include .env

.PHONY: build test

all:
	build

build:
	anchor build --provider.wallet $(WALLET_KEYPAIR) --provider.cluster $(RPC_URL)
	$(RM) target/deploy/$(PROGRAM_NAME)-keypair.json

clean_build:
	anchor clean --provider.wallet $(WALLET_KEYPAIR) --provider.cluster $(RPC_URL)
	$(RM) target

deploy:
	anchor deploy -p $(PROGRAM_NAME) --program-keypair $(PROGRAM_KEYPAIR) --provider.wallet $(WALLET_KEYPAIR) --provider.cluster $(RPC_URL)

test:
	anchor test
	$(RM) target/deploy/$(PROGRAM_NAME)-keypair.json

upgrade:

chain:
	solana config set -u $(RPC_URL)
	solana-test-validator -u $(RPC_URL) --config .chain.yml

clean_chain:
	$(RM) test-ledger

new_program_account:
	solana-keygen new --no-bip39-passphrase -f -o $(PROGRAM_KEYPAIR)

get_program_account:
	solana address -k $(PROGRAM_KEYPAIR)

new_data_account:
	solana-keygen new --no-bip39-passphrase -f -o $(DATA_KEYPAIR)

get_data_account:
	solana address -k $(DATA_KEYPAIR)

create_wallet:
	solana-keygen new --no-bip39-passphrase -f -o $(WALLET_KEYPAIR)

get_wallet:
	solana-keygen pubkey $(WALLET_KEYPAIR)

fmt:
	cargo fmt
	yarn fmt:fix

lint:
	cargo clippy --workspace
	cargo clippy --workspace --no-default-features
	cargo clippy --workspace --tests
	$(RM) target/deploy/$(PROGRAM_NAME)-keypair.json
	yarn lint

clean: clean_build clean_chain
