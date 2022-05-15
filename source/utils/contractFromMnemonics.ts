import { WalletV4Source, WalletV4Contract } from 'ton-contracts';
import { mnemonicToPrivateKey, mnemonicValidate } from 'ton-crypto';

export async function contractFromMnemonics(mnemonics: string[]) {

    // Create key
    let valid = await mnemonicValidate(mnemonics);
    if (!valid) {
        throw Error('Invalid mnemonics!');
    }
    let keyPair = await mnemonicToPrivateKey(mnemonics);

    // Create contract
    const source = WalletV4Source.create({ workchain: 0, publicKey: keyPair.publicKey });
    const contract = WalletV4Contract.create(source);
    return { contract, keyPair };
}