import { Storage } from "../storage/storage";
import { askKey } from "../utils/askKey";
import { askConfirm } from '../utils/askConfirm';
import { prompt } from 'enquirer';
import { log, warn } from "../utils/log";
import { deriveWallet } from "../utils/deriveWallet";
import { printQR } from "../utils/printQR";
import { Address, Cell, CellMessage, CommentMessage, CommonMessageInfo, ExternalMessage, InternalMessage, SendMode, StateInit } from "ton";
import { WalletV4Contract } from "ton-contracts";
import { KeyPair } from "ton-crypto";
import { askContact } from "../utils/askContact";
import { loadContacts } from "../storage/contacts";
import { askBounce } from "../utils/askBounce";
import { askSeqno } from '../utils/askSeqno';
import { askText } from "../utils/askText";
import { askAmount } from '../utils/askAmount';

async function createTrasfer(order: InternalMessage | null, seqno: number, derived: { contract: WalletV4Contract, keyPair: KeyPair }) {
    let transfer = await derived.contract.createTransfer({
        seqno,
        walletId: derived.contract.source.walletId,
        secretKey: derived.keyPair.secretKey,
        sendMode: SendMode.IGNORE_ERRORS | SendMode.PAY_GAS_SEPARATLY,
        order: order
    });
    const message = new ExternalMessage({
        to: derived.contract.address,
        body: new CommonMessageInfo({
            stateInit: seqno === 0 ? new StateInit({ code: derived.contract.source.initialCode, data: derived.contract.source.initialData }) : null,
            body: new CellMessage(transfer)
        })
    });
    let boc = new Cell();
    message.writeTo(boc);
    return boc;
}

async function createDeploy(derived: { contract: WalletV4Contract, keyPair: KeyPair }) {
    let transfer = await derived.contract.createTransfer({
        seqno: 0,
        walletId: derived.contract.source.walletId,
        secretKey: derived.keyPair.secretKey,
        sendMode: SendMode.IGNORE_ERRORS | SendMode.PAY_GAS_SEPARATLY,
        order: null
    });
    return transfer;
}

export async function transferOps(dir: string, storage: Storage) {
    let wallet = await askKey('Pick key', storage);
    if (!wallet) {
        return true;
    }

    // Prepare
    let derived = await deriveWallet(storage, wallet.id);

    // Command
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Transfers',
        initial: 0,
        choices: [
            { name: 'Deploy' },
            { name: 'Simple Transfer' },
            { name: 'Back' }
        ]
    }]);

    // Exit
    if (res.command === 'Back') {
        return true;
    }

    // Deploy
    if (res.command === 'Deploy') {

        // Ask for transfer
        log('You about to deploy a contract, please transfer 1 TON to the address');
        warn(derived.contract.address.toFriendly());
        await printQR('ton://transfer/' + derived.contract.address.toFriendly({ urlSafe: true }), { amount: '1000000000' });
        if (!await askConfirm('Yes, i transfered 1 TON to this address')) {
            return false;
        }

        // Create signed message
        let boc = await createDeploy(derived);

        // Send boc
        warn('Scan this qr with your phone to send this transaction. Transaction valid only for 60 seconds!.');
        printQR('https://tonwhales.com/tools/deploy-v4', {
            pk: derived.keyPair.publicKey.toString('base64url'),
            data: boc.toBoc({ idx: false }).toString('base64url'),
            exp: (Math.floor(Date.now() / 1000) + 60).toString()
        });
    }

    // Simple transfer
    if (res.command === 'Simple Transfer') {
        let contacts = loadContacts(dir);
        if (Object.keys(contacts.contacts).length === 0) {
            warn('No contracts');
            return false;
        }

        // Collect transaction information
        let contact = await askContact('Destination?', contacts);
        let amount = await askAmount();
        let destination = Address.parse(contact)
        let comment = await askText({ message: 'Comment' });
        let seqno = await askSeqno(derived.contract.address);
        let bounce = await askBounce();

        // Create transfer
        let boc = await createTrasfer(new InternalMessage({
            to: destination,
            value: amount,
            bounce,
            body: new CommonMessageInfo({
                body: new CommentMessage(comment)
            })
        }), seqno, derived);

        // Send boc
        warn('Scan this qr with your phone to send this transaction. Transaction valid only for 60 seconds!.');
        printQR('https://tonwhales.com/tools/send', { data: boc.toBoc({ idx: false }).toString('base64url'), exp: (Math.floor(Date.now() / 1000) + 60).toString() });

        // Exit transfers
        return true;
    }

    return false;
}