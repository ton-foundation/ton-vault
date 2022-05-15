import { prompt } from 'enquirer';
import { toNano } from 'ton';

export async function askAmount() {
    let conf = await prompt<{ amount: number }>([{
        type: 'numeral',
        name: 'amount',
        message: 'Amount',
        initial: 0
    }]);
    return toNano(conf.amount);
}