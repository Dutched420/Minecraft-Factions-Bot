import yaml from "js-yaml";
import fs from "fs";
import mineflayer from "mineflayer";
import { botLoggedOn, botServerChat, botWarped } from "../utils/logs.js";
import { vanish, ftop, flist } from "./commands.js";
import { autoFtop, autoFlist, autoVanish } from "./autoCommands.js";

let config = yaml.load(fs.readFileSync(`${process.cwd()}/config.yaml`, "utf8"));
const wait = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

function startsWithNumber(string) {
    return /^\d/.test(string);
};

export let ftopData = [];
export let flistData = [];

export function startBot(name, version) {
    let bot = mineflayer.createBot({
        auth: "microsoft",
        host: config.minecraft.serverIP,
        port: config.minecraft.serverPort,
        version: config.minecraft.version,
        hideErrors: config.minecraft.hideErrors,
    });

    bot.on("login", async () => {
        bot.settings.viewDistance = "tiny";
        await wait(3000).then(() => {
            bot.chat(config.minecraft.joinCommand);
        });
        botLoggedOn(bot, config, name, version);
        await wait(3000).then(() => {
            bot.chat(config.settings.ftopCommand);
            bot.chat("/f list");
        });
        botWarped(bot, name, version);
    });

    bot.on("message", async (message) => {
        let parsedMessage = `${message}`;

        if(parsedMessage.includes("@") || parsedMessage.includes("`") || parsedMessage.length === 0) return;
        botServerChat(message);

        if(startsWithNumber(parsedMessage)) {
            let cleanParsed = parsedMessage.replace("!", "");
            ftopData.push(cleanParsed);
        };

        flistData.push(parsedMessage);

        let split = parsedMessage.split(/ +/g);
        let usernames = [];
        let user;

        for (let i in bot.players) {
            usernames.push(i)
        };

        for (let i = 0; i < split.length; i++) {
            if (usernames.includes(split[i].replace(/[:<>()+*✯-]+/g, ""))) {
                user = split[i].replace(/[:<>()+*✯-]+/g, "");
                split[i] = split[i].replace(/[:<>()+*✯-]+/g, "");
                break;
            };
        };

        if (user) {
            if(config.whitelist.indexOf(user)) return;

            if(parsedMessage.includes(config.settings.prefix)) {
                let command;
                for (let i = split.indexOf(user); i < split.length; i++) {
                    if (split[i].startsWith(config.settings.prefix)) {
                        command = split.slice(i--);
                        break;
                    };
                };
                if (command) {
                    let args = command;
                    let commandMessage = args[0].slice(config.settings.prefix).toLowerCase();
                    args = args.slice(1);
                    if (!commandMessage) return;
                    const cmd = commandMessage.replace("!", "")

                    switch(cmd) {
                        case "vanish":
                            if(config.settings.vanishCheck) {
                                vanish(bot);
                            } else {
                                bot.chat("/r Vanish checker is disabled")
                            };
                        break;

                        case "ftop":
                            bot.chat(config.settings.ftopCommand);
                            await wait(500).then(() => {
                                ftop();
                            });
                            ftopData = [];
                        break;

                        case "flist":
                            bot.chat("/f list");
                            await wait(500).then(() => {
                                flist();
                            });
                            flistData = [];
                        break;

                        case "say":
                            bot.chat(args.join(" "));
                        break;
                    };
                };
            };
        };
    });
    if(config.settings.vanishCheck) {
        setInterval(() => {
            autoVanish(bot);
        }, config.times.vanishCheck * 60 * 1000)
    };
    setInterval(() => {
        autoFtop(bot);
        ftopData = [];       
    }, config.times.ftop * 60 * 1000);
    setInterval(() => {
        autoFlist(bot);
        flistData = [];        
    }, config.times.flist * 60 * 1000);
};