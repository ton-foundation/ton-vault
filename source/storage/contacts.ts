import fs from 'fs';
import * as t from 'io-ts';

const contactsCodec = t.type({
    version: t.literal(1),
    contacts: t.record(t.string, t.string)
});

type ContactsType = t.TypeOf<typeof contactsCodec>;

export type Contacts = {
    contacts: { [key: string]: string };
};

export function loadContacts(dir: string): Contacts {
    let storageFile = dir + '/contacts.json';
    if (!fs.existsSync(storageFile)) {
        return { contacts: {} };
    }
    let data = fs.readFileSync(storageFile, 'utf-8');
    let parsed = JSON.parse(data);
    if (!contactsCodec.is(parsed)) {
        return { contacts: {} };
    }
    return {
        contacts: parsed.contacts
    };
}

export function saveContacts(dir: string, contacts: Contacts) {
    let storageFile = dir + '/contacts.json';
    let toWrite: ContactsType = {
        version: 1,
        contacts: contacts.contacts
    };
    if (!contactsCodec.is(toWrite)) {
        throw Error('Invalid storage data');
    }
    fs.writeFileSync(storageFile, JSON.stringify(toWrite, null, 2));
}