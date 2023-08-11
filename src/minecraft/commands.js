import { flistWebhook, ftopWebhook, vanishedWebhook, vanishedExploitPatchedWebhook } from "../utils/logs.js";
import { flistData, ftopData } from "./createBot.js";
import EasyMatch from "@notlegend/easymatch";
let matcher = new EasyMatch("[", "]");
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
    vanishedWebhook(vanished)
};

export function ftop() {
    let ftop = "";    
    for (let eachLine of ftopData) {
        if(eachLine .includes("$")) {
            let newIndex = eachLine .indexOf("$");
            let moneyValue = eachLine .substring(newIndex);
            if(moneyValue.indexOf(" ") != -1) {
                moneyValue = moneyValue.substring(0, moneyValue.indexOf(" "));
            };
            eachLine  = eachLine .replace(/[^a-zA-Z0-9]/g, "");
            eachLine  = eachLine 
                .replace(/(\d)([a-z])/gi, "$1 $2")
                .replace(/([a-z])(\d)/gi, "$1 $2");
            let splitText = eachLine .split(" ");

            ftop += `**${splitText[0]}.** ${splitText[1]} ${moneyValue}\n`
        };
    };
    ftopWebhook(ftop);
};

export function flist() {
    let i = 1;
    let flist = "";

    flistData.forEach(eachLine => {
        let flistMessage = config.layouts.flist;
        let matchResult = matcher.match(eachLine, flistMessage);
        let foundFlist = true;
            for(let i in matchResult) {
                if(matchResult[i] == null) foundFlist = false;
            };
            if(foundFlist) {
                flist += `**${i}.** ${matchResult.Faction} ${matchResult.Online}/${matchResult.Max}\n`
                i++;
        };
    });
    flistWebhook(flist);
};
