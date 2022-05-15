import { prompt } from 'enquirer';
import { Storage } from "./storage/storage";
import { warn } from './utils/log';
import { keysOps } from './ops/keys';
import { printMnemonics } from './utils/printMnemonics';
import { contactsOps } from './ops/contacts';
import { transferOps } from './ops/transfers';

export async function opts(dir: string, storage: Storage) {
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Select command',
        initial: 0,
        choices: [
            { name: 'Transfers' },
            { name: 'Keys management' },
            { name: 'Contacts management' },
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

    // Transfers
    if (res.command === 'Transfers') {
        if (Object.keys(storage.derived).length === 0) {
            warn('No keys created');
        } else {
            while (true) {
                let exited = await transferOps(dir, storage);
                if (exited) {
                    break;
                }
            }
        }
    }

    // Keys
    if (res.command === 'Keys management') {
        while (true) {
            let exited = await keysOps(dir, storage);
            if (exited) {
                break;
            }
        }
    }

    // Keys
    if (res.command === 'Contacts management') {
        while (true) {
            let exited = await contactsOps(dir, storage);
            if (exited) {
                break;
            }
        }
    }

    // Do not exit
    return false;
}