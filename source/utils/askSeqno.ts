import { prompt } from 'enquirer';
import { Address } from 'ton';
import { log } from './log';
import { printQR } from './printQR';

export async function askSeqno(address: Address) {
    log('You can find current seqno by scanning this code. If seqno is unknown then put zero.')
    printQR('https://tonwhales.com/tools/state', { address: address.toFriendly() });
    let p = await prompt<{ seqno: string }>([{
        type: 'input',
        name: 'seqno',
        message: 'Current Wallet\'s seqno',
        validate: (v) => parseInt(v).toString() === v
    }]);
    return parseInt(p.seqno);
}