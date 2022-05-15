import { deriveMnemonicsPath, mnemonicToHDSeed } from "ton-crypto";
import { Storage } from "../storage/storage";
import { contractFromMnemonics } from "./contractFromMnemonics";

export async function deriveWallet(storage: Storage, walletId: number) {
    let seed = await mnemonicToHDSeed(storage.mnemonics);
    let derived = await deriveMnemonicsPath(seed, [0, walletId]);
    let contract = await contractFromMnemonics(derived);
    return { ...contract, mnemonics: derived };
}