import { flistWebhook, ftopWebhook, vanishedWebhook, vanishedExploitPatchedWebhook } from "../utils/logs.js";
import { flistData, ftopData } from "./createBot.js";
import EasyMatch from "@notlegend/easymatch";
let matcher = new EasyMatch("&", "&");
import fs from "fs";
import yaml from "js-yaml";

let config = yaml.load(fs.readFileSync(`${process.cwd()}/config.yaml`, "utf8"));

export function vanish(bot) {
    let vanished = [];
    bot.tabComplete("/tell", (data, players) => {
        if(players.length === 0) {
            return vanishedExploitPatchedWebhook();
        };
        players.foreach(player => {
            if(bot.players[player] == undefined) {
                if(player != "*" || player != "**") {
                    vanished.push(player);
                };
            };
        });
    });
    if(vanish.length > 0) {
        vanishedWebhook(vanished);
    };
};

export function ftop() {
    let i = 1;
    let ftop = "";
    let ftopMessage = config.layouts.ftop;

    ftopData.forEach(eachLine => {
        let matchResult = matcher.match(eachLine, ftopMessage);
        let foundFtop = true;
        for (let i in matchResult) {
            if(matchResult[i] == null) foundFtop = false;
        };
        if(foundFtop) {
            ftop += `**${i}.** ${matchResult.Faction} ${matchResult.Value} [${matchResult.RisenValue}]\n`;
            i++;
        };
    });
    ftopWebhook(ftop);
};

export function flist() {
    let i = 1;
    let flist = "";
    let flistMessage = config.layouts.flist;

    flistData.forEach(eachLine => {
        let matchResult = matcher.match(eachLine, flistMessage);
        let foundFlist = true;
            for(let i in matchResult) {
                if(matchResult[i] == null) foundFlist = false;
            };
            if(foundFlist) {
                if(!matchResult.Faction.includes("-")) {
                flist += `**${i}.** ${matchResult.Faction} ${matchResult.Online}/${matchResult.Max} online\n`
                i++;
            };
        };
    });
    flistWebhook(flist);
};