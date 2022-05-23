import qr from 'qrcode-terminal';
import { log } from './log';

export async function printQR(link: string, qs: any) {
    let url = link + (Object.keys(qs).length > 0 ? ('?' + new URLSearchParams(qs)) : '');
    let res = await new Promise<string>((r) => qr.generate(url, { small: true }, (qr) => r(qr)));
    log('Link: ' + url);
    log(res);
}