# Ton Vault

Simple cold storage of ton keys with flexible backup options.

Features:
* ✍️ Infinite number of keys with a single backup
* 🚀 Wallet v4 based
* 🛑 Fully offline

## Installation and upgrade

Download from releases page. To upgrade you can just download binary and upload it to your cold storage machine.

## How it works

TON Vault is based on idea that for every given valid mnemonics is is possible to create any number of new unique mnemonics from a single existing one. This allows you to create any number of accounts without needing to backup everything but main key and greadly simplifies things and improves security.

Since you can create new mnemonics from existing one than you can create a new vault from generated one to form a tree of keys that all could be gradually backed up using different strategies.

![Bitcoin's Keys](/doc_bip32.png)

## License

MIT