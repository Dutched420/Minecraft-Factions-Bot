import { startMessage } from "./src/utils/logs.js";
import { startBot } from "./src/minecraft/createBot.js";

const name = "Dutched's Factions Bot";
const version = "1.0.0";

process.title = `${name} ${version}`;

startMessage(name, version);
startBot(name, version);