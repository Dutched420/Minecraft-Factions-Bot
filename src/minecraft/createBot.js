import yaml from "js-yaml";
import fs from "fs";
import mineflayer from "mineflayer";
import { botLoggedOn, botServerChat, botWarped, ftopWebhook } from "../utils/logs.js";
import { vanish, ftop, flist } from "./commands.js";
import { autoFtop, autoFlist, autoVanish } from "./autoCommands.js";

let config = yaml.load(fs.readFileSync(`${process.cwd()}/config.yaml`, "utf8"));
const wait = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

export let ftopData = [];
export let flistData = [];

export function startBot(name, version) {
    let bot = mineflayer.createBot({
        email: "",
        auth: "microsoft",
        host: config.minecraft.serverIP,
        port: config.minecraft.serverPort,
        version: config.minecraft.version,
        hideErrors: config.minecraft.hideErrors,
    });

    bot.once("login", async () => {
        bot.settings.viewDistance = "tiny";
        await wait(3000).then(() => {
            bot.chat(config.minecraft.joinCommand);
        });
        botLoggedOn(bot, config, name, version);
        await wait(3000).then(() => {
            bot.chat(config.settings.ftopCommand);
            bot.chat("/f list");
            bot.chat("/f join monke")
        });
        botWarped(bot, name, version);
    });

    bot.on("message", async (message) => {
        let parsedMessage = `${message}`;

        if(parsedMessage.includes("@") || parsedMessage.includes("`") || parsedMessage.length === 0) return;
        botServerChat(message);

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
                            };
                        break;

                        case "ftop":
                            bot.chat(config.settings.ftopCommand);
                            // await wait(500).then(() => {
                            //     ftop();
                            // });
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
    bot.on("end", () => {
        bot = [];
        startBot(name, version);
    });
    bot.on("windowOpen", window => {
        ftopData = [];
        window.slots.forEach((item) => {
            if(item && item.nbt && item.nbt.value.display.value.Lore && item.name === "skull") {
                const factionName = item.nbt.value.display.value.Name.value
                    .replace("§e§l Faction §7", "")
                    .replace("§4")
                    .replace("§4§l", "");
                const factionInfo = item.nbt.value.display.value.Lore.value.value;
                let faction = {
                    name: item.nbt.value.display.value.Name.value.replace("§e§l Faction §7", "").replace("§4§l", ""),
                    place: factionInfo[1].replace("§e§l►§a Place §f#", ""),
                    value: factionInfo[2].replace("§e§l►§b Worth §f$", "").replace("§8", "").replace("§c", "").replace("§2", "")
                };
                if(factionName && factionInfo && !factionName.includes("?")) {
                    ftopData.push(faction);
                };
            };
        });
        ftopWebhook()
    });
    if(config.settings.vanishCheck) {
        setInterval(() => {
            autoVanish(bot);
        }, config.times.vanishCheck * 60 * 1000)
    };
    setInterval(() => {
        bot.chat("/f top");  
    }, config.times.ftop * 60 * 1000);
    setInterval(() => {
        autoFlist(bot);
        flistData = [];        
    }, config.times.flist * 60 * 1000);
};