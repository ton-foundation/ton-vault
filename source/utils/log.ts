import chalk from 'chalk';
import { format } from 'date-fns';

export function log(src: any) {
    console.log(src);
}

export function warn(src: any) {
    console.warn(chalk.yellow(src));
}