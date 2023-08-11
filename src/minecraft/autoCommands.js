import { flist, ftop, vanish } from "./commands.js";
const wait = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

export async function autoVanish(bot) {
    vanish(bot);
};

export async function autoFtop(bot) {
    bot.chat("/f top");
    await wait(500).then(() => {
        ftop();
    });
};

export async function autoFlist(bot) {
    bot.chat("/f list");
    await wait(500).then(() => {
        flist();
    });
};