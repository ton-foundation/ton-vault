import Table from 'cli-table';
import { prompt } from 'enquirer';
import { loadContacts, saveContacts } from '../storage/contacts';
import { Storage } from '../storage/storage';
import { askAddress } from '../utils/askAddress';
import { askContact } from '../utils/askContact';
import { askText } from '../utils/askText';
import { log, warn } from '../utils/log';

export async function contactsOps(dir: string, storage: Storage) {
    let res = await prompt<{ command: string }>([{
        type: 'select',
        name: 'command',
        message: 'Contacts management',
        initial: 0,
        choices: [
            { name: 'List contacts' },
            { name: 'Add contact' },
            { name: 'Delete contact' },
            { name: 'Back' }
        ]
    }]);

    // Exit
    if (res.command === 'Back') {
        return true;
    }

    // List contacts
    if (res.command === 'List contacts') {
        let contacts = loadContacts(dir);
        if (Object.keys(contacts.contacts).length === 0) {
            warn('No contacts');
        } else {
            var table = new Table({
                colWidths: [50, 64]
            });
            for (let address in contacts.contacts) {
                table.push([address, contacts.contacts[address]]);
            }
            log(table.toString());
        }
    }

    // Add contact
    if (res.command === 'Add contact') {

        // Ask
        let address = await askAddress({ message: 'Contact address' });
        let name = await askText({ message: 'Contact name' });
        let addressKey = address.toFriendly();

        // Check if exists
        let contacts = loadContacts(dir);
        contacts.contacts[addressKey] = name;
        saveContacts(dir, contacts);
    }

    // Delete contact
    if (res.command === 'Delete contact') {
        let contacts = loadContacts(dir);
        if (Object.keys(contacts.contacts).length === 0) {
            warn('No contacts');
        } else {
            let toDelete = await askContact('What contact to delete?', contacts);
            delete contacts.contacts[toDelete];
            saveContacts(dir, contacts);
        }
    }

    return false;
}