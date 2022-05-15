import qr from 'qrcode-terminal';
import { log } from './log';

export async function printQR(link: string, qs: any) {
    let url = link + '?' + new URLSearchParams(qs);
    let res = await new Promise<string>((r) => qr.generate(url, { small: true }, (qr) => r(qr)));
    log('Link: ' + url);
    log(res);
}