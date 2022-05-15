import { log } from "./log";
import Table from 'cli-table';

export function printMnemonics(mnemonics: string[]) {
    var table = new Table({
        colWidths: [16, 16, 16]
    });
    for (let i = 0; i < 8; i++) {
        table.push([(i + 1) + '. ' + mnemonics[i], (i + 9) + '. ' + mnemonics[i + 8], (i + 17) + '. ' + mnemonics[i + 16]]);
    }
    log(table.toString());
}