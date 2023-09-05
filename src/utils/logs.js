import fs from "fs";
import chalk from "chalk";
import yaml from "js-yaml";
// I don't recommend using the "minimal-discord-webhook-node" package, gave me schizophrenia
import { Webhook, MessageBuilder } from "discord-webhook-node";
import { ftopData } from "../minecraft/createBot.js";

let config = yaml.load(fs.readFileSync(`${process.cwd()}/config.yaml`, "utf8"));

const logo = `https://api.minetools.eu/favicon/${config.minecraft.serverIP}`;

function createHook(url) {
    return new Webhook(url)
        .setAvatar(config.discord.webhookUrl)
        .setUsername("Dutched's Factions Bot")
};

export function startMessage(name, version) {
    console.log(
        chalk.white(" ────────────────────────────────────────────────────────────\n"),
        chalk.white(`  [${chalk.greenBright("+")}] ${name} ${chalk.magentaBright(version)}\n`),
        chalk.white(`  [${chalk.greenBright("+")}] Discord: ${chalk.magentaBright(`https://discord.gg/KhHSVVARuC`)}\n`),
        chalk.white(`  [${chalk.redBright("*")}] Pika-Network version\n`),
        chalk.white(" ────────────────────────────────────────────────────────────")
    );
};

export function botLoggedOn(bot) {
    console.log(`  [${chalk.magentaBright("Minecraft")}]: ${bot.username} logged on: ${config.minecraft.serverIP}`);
};

export function botWarped(bot, name, version) {
    console.log(`  [${chalk.magentaBright("Minecraft")}]: ${bot.username} warped to: ${(config.minecraft.joinCommand).replace("/", "").replace("server ", "")} `);
    const embed = new MessageBuilder()
        .setAuthor(`${name}`, config.discord.webhookUrl, 'https://discord.com/invite/KhHSVVARuC')
        .setDescription(`**${bot.username}** is online\nWhitelisted **${config.whitelist.length}** IGN(s)\nThere are **${Object.keys(bot.players).length}** players online\nServer Jar: **${bot.game.serverBrand}**`)
        .setFooter(`Version: ${version}`)
        // For some reason these have to be hardcoded
        .setURL('https://discord.com/invite/KhHSVVARuC')
        .setColor("#" + config.discord.webhookColor)
        // Bruh
        .setTimestamp();

    createHook(config.discord.botLogs).send(embed);
};

export function botServerChat(serverChat) {
    console.log(serverChat.toAnsi());
    createHook(config.discord.serverChat).send(`\`\`\`ansi\n${serverChat.toAnsi()}\`\`\``);
};

export function vanishedWebhook(players) {
    const embed = new MessageBuilder()
        .setAuthor("Vanish Checker", logo)
        .setTimestamp()
        .setColor("#" + config.discord.webhookColor);

    if(players.length === 0) {
        embed.setDescription("🐒 **No staff in vanish!**");
    } else {
        embed.setDescription("🚨 " + players.join(", "));
    };
    createHook(config.discord.vanishedLogs).send(embed);
};

export function vanishedExploitPatchedWebhook() {
    const embed = new MessageBuilder()
        .setAuthor("Vanish Checker", logo)
        .setTimestamp()
        .setFooter(config.minecraft.serverIP)
        .setDescription("**🤓 The vanish exploit has been patched on this server.**\nDisable vanishCheck in the config.")
        .setColor("#" + config.discord.webhookColor);
    createHook(config.discord.vanishedLogs).send(embed);
};

export function ftopWebhook() {
    let factionNames = "";
    let factionValues = "";

    ftopData.map(faction => {
        factionNames += `**${faction.place}**. ${faction.name}\n`;
        factionValues += `${faction.value.replace("§8", "")}\n`;
    });

    const embed = new MessageBuilder()
        .setAuthor("Factions Top", logo)
        .setColor("#" + config.discord.webhookColor)
        .setFooter(config.minecraft.serverIP)
        .addField("Faction", factionNames, true)
        .addField("Value", factionValues, true )
        .setTimestamp();
    createHook(config.discord.ftop).send(embed);
};

export function flistWebhook(flist) {
    let factionNames = "";
    let factionOnline = "";
    let factionClaims = "";

    flist.map(faction => {
        factionNames += faction.name;
        factionOnline += faction.online;
        factionClaims += faction.claims;
    });

    const embed = new MessageBuilder()
        .setAuthor("Factions List", logo)
        .setColor("#" + config.discord.webhookColor)
        .addField("Faction", factionNames, true)
        .addField("Online", factionOnline, true)
        .addField("Claims", factionClaims, true)
        .setFooter(config.minecraft.serverIP)
        .setTimestamp();
    createHook(config.discord.flist).send(embed);
};