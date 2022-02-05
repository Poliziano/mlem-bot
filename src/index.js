/**
 * @typedef {import("discord.js").CommandInteraction<import("discord.js").CacheType>} CommandInteraction
 * @typedef {import("discord.js").ButtonInteraction<import("discord.js").CacheType>} ButtonInteraction
 */

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Intents } from "discord.js";
import { Client } from "discord.js";
import { Todo } from "./commands/todo.js";
import { db, initialiseDatabase } from "./db.js";

const TOKEN = "NzM4Nzk3ODkxNjQ0MTYyMDU4.XyRJJw.T4J-3YZORodM6FdUJJ--FipnbUw";
const CLIENT_ID = "738797891644162058";
const GUILD_ID = "738496230300188712";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

const commands = [new Todo()];

(async function main() {
  await initialiseDatabase(db);
  console.log("connected to mysql");

  await client.login(TOKEN);
  console.log("login successful");

  await registerCommands();
  console.log("registered application commands");

  listen();
  console.log("listening for commands");
})();

async function registerCommands() {
  const rest = new REST({ version: "9" }).setToken(TOKEN);

  const slashCommands = commands.reduce((previous, current) => {
    return [...previous, ...current.commands];
  }, []);

  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: slashCommands.map((command) => command.toJSON()),
  });
}

function listen() {
  client.on("interactionCreate", async (interaction) => {
    for (const command of commands) {
      const processed = await command.handle(interaction);

      if (processed) {
        break;
      }
    }
  });
}
