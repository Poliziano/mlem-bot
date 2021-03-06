import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { Intents } from "discord.js";
import { Client } from "discord.js";
import { Todo } from "./commands/todo.js";
import { db, initialiseDatabase } from "./db.js";

const TOKEN = process.env.MLEM_BOT_TOKEN;
const APPLICATION_ID = process.env.MLEM_BOT_APPLICATION_ID;

if (!TOKEN || !APPLICATION_ID) {
  console.error(
    `Please ensure the required environment variables are set:
      - MLEM_BOT_TOKEN            should be set to the bot token
      - MLEM_BOT_APPLICATION_ID   should be set to the bot application ID`.trim()
  );

  process.exit();
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

const commands = [new Todo()];

(async function main() {
  await initialiseDatabase(db);
  console.log("connected to db");

  await client.login(TOKEN);
  console.log("discord login successful");

  await registerCommands();
  console.log("registered discord application commands");

  listen();
  console.log("listening for commands");
})();

async function registerCommands() {
  const rest = new REST({ version: "9" }).setToken(TOKEN);

  const slashCommands = commands.reduce((previous, current) => {
    return [...previous, ...current.commands];
  }, []);

  await rest.put(Routes.applicationCommands(APPLICATION_ID), {
    body: slashCommands.map((command) => command.toJSON()),
  });
}

function listen() {
  client.on("interactionCreate", async (interaction) => {
    for (const command of commands) {
      const processed = await command.handle(
        await db.getConnection(),
        interaction
      );

      if (processed) {
        break;
      }
    }
  });
}
