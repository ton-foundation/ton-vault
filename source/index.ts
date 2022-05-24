require('dotenv').config();
import { main } from "./main";
(async () => {
    try {
        await main(process.cwd());
    } catch (e) {
        // Ignore
        console.warn(e);
    }
})()
