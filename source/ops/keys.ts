import { saveStorage, Storage } from "../storage/storage";
import { prompt } from 'enquirer';
import { log, warn } from '../utils/log';
import ora from 'ora';
import { printMnemonics } from "../utils/printMnemonics";
import Table from "cli-table";
import { deriveWallet } from "../utils/deriveWallet";
import { askKey } from "../utils/askKey";
import { printQR } from "../utils/printQR";

export async function keysOps(dir: string, storage: Storage) {
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Key management',
        initial: 0,
        choices: [
            { name: 'List keys' },
            { name: 'Create new key' },
            { name: 'Reveal key mnemonics' },
            { name: 'Share address' },
            { name: 'Back' }
        ]
    }]);

    // Exit
    if (res.command === 'Back') {
        return true;
    }

    // List mnemonics
    if (res.command === 'List keys') {
        if (Object.keys(storage.derived).length === 0) {
            warn('No keys created');
        } else {
            const spinner = ora('Loading keys');
            var table = new Table({
                colWidths: [12, 50, 64]
            });
            for (let path in storage.derived) {
                let name = storage.derived[path];
                let derived = await deriveWallet(storage, parseInt(path, 10));
                table.push(['#' + path, derived.contract.address.toFriendly(), name]);
            }
            spinner.succeed('Keys loaded')
            log(table.toString());
        }
    }

    // Create new mnemonics
    if (res.command === 'Create new key') {

        // Ask name
        let p = await prompt<{ name: string }>([{
            type: 'input',
            name: 'name',
            message: 'Please, provide key name',
            validate: (src) => src.trim().length > 0
        }]);

        // Resolve id
        let maxExistingId = -1;
        for (let path in storage.derived) {
            maxExistingId = Math.max(parseInt(path, 10), maxExistingId);
        }
        let nextId = maxExistingId + 1;

        // Generate key
        storage.derived[nextId] = p.name;
        saveStorage(dir, storage);
    }

    // Reveal key mnemonics
    if (res.command === 'Reveal key mnemonics') {
        if (Object.keys(storage.derived).length === 0) {
            warn('No keys created');
        } else {

            // Ask for a wallet
            let wallet = await askKey('Key to reveal', storage);
            if (!wallet) {
                return false;
            }

            // Create seed
            const spinner = ora('Loading key "' + wallet.name + '"');
            let derived = await deriveWallet(storage, wallet.id);
            spinner.succeed('Key "' + wallet.name + '" loaded');

            // Print mnemonics
            warn('This key could be used with any TON wallet apps and/or as seed for new vault.');
            log('Address: ' + derived.contract.address.toFriendly());
            printMnemonics(derived.mnemonics);
        }
    }

    // Reveal key mnemonics
    if (res.command === 'Share address') {
        if (Object.keys(storage.derived).length === 0) {
            warn('No keys created');
        } else {

            // Ask for a wallet
            let wallet = await askKey('Key share', storage);
            if (!wallet) {
                return false;
            }

            // Create seed
            const spinner = ora('Loading key "' + wallet.name + '"');
            const derived = await deriveWallet(storage, wallet.id);
            const address = derived.contract.address;
            spinner.succeed('Key "' + wallet.name + '" loaded');

            // Print address
            printQR('ton://transfer/' + address.toFriendly(), {});
        }
    }

    return false;
}