SHELL := /bin/bash
RM=rm -rf

include .env

.PHONY: build test

all:
	build

build:
	anchor build --provider.wallet $(basename $(WALLET_KEYPAIR))1.json --provider.cluster $(RPC_URL)
	$(RM) target/deploy/$(PROGRAM_NAME)-keypair.json

clean_build:
	anchor clean --provider.wallet $(basename $(WALLET_KEYPAIR))1.json --provider.cluster $(RPC_URL)
	$(RM) target

deploy:
	anchor deploy -p $(PROGRAM_NAME) --program-keypair $(basename $(PROGRAM_KEYPAIR))1.json --provider.wallet $(basename $(WALLET_KEYPAIR))1.json --provider.cluster $(RPC_URL)

test:
	anchor test
	$(RM) target/deploy/$(PROGRAM_NAME)-keypair.json

upgrade:

chain:
	solana config set -u $(RPC_URL)
	solana-test-validator -u $(RPC_URL) --config .chain.yml

clean_chain:
	$(RM) test-ledger

new_program_account%:
	solana-keygen new --no-bip39-passphrase -f -o $(basename $(PROGRAM_KEYPAIR))$*.json

get_program_account%:
	solana address -k $(basename $(PROGRAM_KEYPAIR))$*.json

new_data_account%:
	solana-keygen new --no-bip39-passphrase -f -o $(basename $(DATA_KEYPAIR))$*.json

get_data_account%:
	solana address -k $(basename $(DATA_KEYPAIR))$*.json

create_wallet%:
	solana-keygen new --no-bip39-passphrase -f -o $(basename $(WALLET_KEYPAIR))$*.json

get_wallet%:
	solana-keygen pubkey $(basename $(WALLET_KEYPAIR))$*.json

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
