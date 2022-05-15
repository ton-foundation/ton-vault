import { prompt } from 'enquirer';
import ora from 'ora';
import { mnemonicNew, mnemonicValidate } from 'ton-crypto';
import { opts } from './ops';
import { loadStorage, saveStorage } from "./storage/storage";
import { log, warn } from "./utils/log";
const pkg = require('../package.json');

export async function main(dir: string) {
    log('Welcome to TON Valut v' + pkg.version + '!');
    warn('! NOTE: This app stores all keys in plain text and meant to run on protected and always-offline device!');

    //
    // Loading storage
    //

    let storage = loadStorage(dir);
    if (!storage) {
        let res = await prompt<{ command: string }>([{
            type: 'select',
            name: 'command',
            message: 'No storage found in current directory. What do you want to do next?',
            initial: 0,
            choices: [
                { name: 'Create vault' },
                { name: 'Restore vault' }
            ]
        }]);

        // Create vault
        if (res.command === 'Create vault') {

            // Generating new key
            const spinner = ora('Creating secure vault');
            let result = await mnemonicNew();
            spinner.succeed();

            // Create storage
            storage = {
                mnemonics: result,
                derived: {}
            };
            saveStorage(dir, storage);

            // Log
            warn('! Do not forget to backup your vault!');

        } else if (res.command === 'Restore vault') {

            // Importing mnemonics
            let p = await prompt<{ mnemonics: string }>([{
                type: 'input',
                name: 'mnemonics',
                message: 'Provide mnemonics for import',
                validate: (src) => mnemonicValidate(src.split(' '))
            }]);
            let mnemonics = p.mnemonics.split(' ').map((v) => v.trim().toLowerCase());

            // Create storage
            storage = {
                mnemonics,
                derived: {}
            };
            saveStorage(dir, storage);

            // Log
            warn('! Vault restored');
        } else {
            throw Error('Unknown command');
        }
    }

    //
    // Operation loop
    //

    while (true) {
        let exited = await opts(dir, storage);
        if (exited) {
            break;
        }
    }
}