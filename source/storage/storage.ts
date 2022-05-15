import fs from 'fs';
import * as t from 'io-ts';

const storageCodec = t.type({
    version: t.literal(1),
    mnemonics: t.array(t.string),
    derived: t.union([t.undefined, t.record(t.string, t.string)])
});

type StorageType = t.TypeOf<typeof storageCodec>;

export type Storage = {
    mnemonics: string[];
    derived: { [key: string]: string };
};

export function loadStorage(dir: string): Storage | null {
    let storageFile = dir + '/vault.json';
    if (!fs.existsSync(storageFile)) {
        return null;
    }
    let data = fs.readFileSync(storageFile, 'utf-8');
    let parsed = JSON.parse(data);
    if (!storageCodec.is(parsed)) {
        return null;
    }
    return {
        mnemonics: parsed.mnemonics,
        derived: parsed.derived || {}
    };
}

export function saveStorage(dir: string, storage: Storage) {
    let storageFile = dir + '/vault.json';
    let toWrite: StorageType = {
        version: 1,
        mnemonics: storage.mnemonics,
        derived: storage.derived
    };
    if (!storageCodec.is(toWrite)) {
        throw Error('Invalid storage data');
    }
    fs.writeFileSync(storageFile, JSON.stringify(toWrite, null, 2));
}