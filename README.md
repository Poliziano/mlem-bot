# mlem-bot
A discord bot for basic task management written in nodejs that uses docker, MySQL, [discord.js](https://discord.js.org/#/).

## Setup
### Creating your bot
Create a new application, following the instructions on [setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot), and then [adding your bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links).

### Setting up env variables
There are three environment variables required:
- `MLEM_BOT_TOKEN` should be set to the bot token.
- `MLEM_BOT_APPLICATION_ID` should be set to the bot application ID.
- `MLEM_BOT_GUILD_ID` should be set to the target channel ID.

### Running the bot
- Build the nodejs application using `docker build -t mlem-bot .`.
- Run both the nodejs and MySQL containers uses `docker compose up -d`. It may take 30 seconds for MySQL to initialise and the bot to connect.

### Commands
There are currently 3 supported commands:
- `/todo create` to create a task.
- `/todo list` to list all tasks.
- `/todo complete` to delete a task.
