import { prompt } from 'enquirer';
import { Storage } from '../storage/storage';

export async function contactsOps(dir: string, storage: Storage) {
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Contacts management',
        initial: 0,
        choices: [
            { name: 'List keys' },
            { name: 'Create new key' },
            { name: 'Reveal key mnemonics' },
            { name: 'Back' }
        ]
    }]);

    // Exit
    if (res.command === 'Back') {
        return true;
    }

    return false;
}