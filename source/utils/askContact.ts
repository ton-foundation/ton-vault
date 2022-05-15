import { prompt } from 'enquirer';
import { Contacts } from "../storage/contacts";

export async function askContact(message: string, contacts: Contacts) {
    let p = await prompt<{ contact: string }>([{
        type: 'select',
        name: 'contact',
        message: message,
        initial: 0,
        choices: Object.keys(contacts.contacts).map((k) => ({
            name: k,
            message: contacts.contacts[k],
            hint: k
        }))
    }]);
    return p.contact;
}