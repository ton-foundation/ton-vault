import { prompt } from 'enquirer';
import { Storage } from '../storage/storage';

export async function askKey(message: string, storage: Storage) {

    let wallet = (await prompt<{ wallet: string }>([{
        type: 'select',
        name: 'wallet',
        message: message,
        initial: 0,
        choices: [...Object.keys(storage.derived).map((v) => ({
            name: v,
            message: storage.derived[v]
        })), { name: 'Cancel' }]
    }])).wallet;
    if (wallet === 'Cancel') {
        return null;
    }
    
    let name = storage.derived[wallet];

    return {
        name,
        id: parseInt(wallet, 10),
        tag: wallet
    };
}