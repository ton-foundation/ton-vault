import { prompt } from 'enquirer';
import { mnemonicToHDSeed, deriveMnemonicsPath } from 'ton-crypto';
import { saveStorage, Storage } from "./storage/storage";
import { log, warn } from './utils/log';
import Table from 'cli-table';
import ora from 'ora';

function printMnemonics(mnemonics: string[]) {
    var table = new Table({
        colWidths: [24, 24, 24]
    });
    for (let i = 0; i < 8; i++) {
        table.push([(i + 1) + '. ' + mnemonics[i], (i + 9) + '. ' + mnemonics[i + 8], (i + 17) + '. ' + mnemonics[i + 16]]);
    }
    log(table.toString());
}

export async function opts(dir: string, storage: Storage) {
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Select command',
        initial: 0,
        choices: [
            { name: 'List keys' },
            { name: 'Create new key' },
            { name: 'Reveal key mnemonics' },
            { name: 'Backup vault' },
            { name: 'Exit' }
        ]
    }]);

    // Exit
    if (res.command === 'Exit') {
        return true;
    }

    // Backup vault
    if (res.command === 'Backup vault') {
        warn('Backup this seed phrase that could be used to get access to ANY key in the vault! NEVER SHARE this with anyone!');
        printMnemonics(storage.mnemonics);
    }

    // List mnemonics
    if (res.command === 'List keys') {
        if (Object.keys(storage.derived).length === 0) {
            warn('No keys created');
        } else {
            for (let path in storage.derived) {
                let name = storage.derived[path];
                log('#' + path + ': ' + name);
            }
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
            let wallet = (await prompt<{ wallet: string }>([{
                type: 'select',
                name: 'wallet',
                message: 'Key to reveal',
                initial: 0,
                choices: Object.keys(storage.derived).map((v) => ({
                    name: v,
                    message: storage.derived[v]
                }))
            }])).wallet;

            // Get name
            let name = storage.derived[wallet];

            // Id
            let walletId = parseInt(wallet, 10);

            // Create seed
            const spinner = ora('Loading key "' + name + '"');
            let seed = await mnemonicToHDSeed(storage.mnemonics);
            let derived = await deriveMnemonicsPath(seed, [0, walletId]);
            spinner.succeed('Key "' + name + '" loaded');

            // Print mnemonics
            warn('This key could be used with any TON wallet apps and/or as seed for new vault.');
            printMnemonics(derived);
        }
    }

    // Do not exit
    return false;
}