import { bold, SlashCommandBuilder } from "@discordjs/builders";
import "../db.js";

/**
 * @typedef {import("mariadb").PoolConnection} PoolConnection
 * @typedef {import("discord.js").Interaction} Interaction
 * @typedef {import("discord.js").CommandInteraction} CommandInteraction
 */

export class Todo {
  commands = [
    new SlashCommandBuilder()
      .setName("todo")
      .setDescription("Commands related to managing tasks")
      .addSubcommand((command) =>
        command
          .setName("create")
          .setDescription("Create a new task")
          .addStringOption((option) =>
            option
              .setName("description")
              .setDescription("Todo description")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("due")
              .setDescription(
                "Due date of the task using the format 'YYYY-MM-DD:HH:MM'"
              )
              .setRequired(true)
          )
      )
      .addSubcommand((command) =>
        command.setName("list").setDescription("Display incomplete tasks")
      )
      .addSubcommand((command) =>
        command
          .setName("complete")
          .setDescription("complete and remove a task")
          .addNumberOption((option) =>
            option
              .setName("id")
              .setDescription("ID of task to complete")
              .setRequired(true)
          )
      ),
  ];

  /**
   * @param {PoolConnection} db
   * @param {Interaction} interaction
   * @returns {Promise<boolean>} True if handled, false otherwise.
   */
  async handle(db, interaction) {
    if (!interaction.isCommand() || interaction.commandName !== "todo") {
      return false;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "create":
        await this.#createTodo(db, interaction);
        break;
      case "list":
        await this.#listTodo(db, interaction);
        break;
      case "complete":
        await this.#completeTodo(db, interaction);
        break;
      default:
        return false;
    }

    return true;
  }

  /**
   * @param {PoolConnection} db
   * @param {CommandInteraction} interaction
   */
  async #createTodo(db, interaction) {
    const description = interaction.options.getString("description");
    const due = interaction.options.getString("due");

    if (Date.parse(due) <= Date.now()) {
      return interaction.reply("Invalid due date!");
    }

    const query = `INSERT INTO todo.todos (description, due) VALUES (?, ?)`;
    const values = [description, due];

    await db.query(query, values);
    await interaction.reply(`Recorded todo: ${description}`);
  }

  /**
   * @param {PoolConnection} db
   * @param {CommandInteraction} interaction
   */
  async #listTodo(db, interaction) {
    const query = `SELECT * FROM todo.todos`;
    const result = await db.query(query);

    if (result.length === 0) {
      return await interaction.reply("There are no tasks!");
    }

    const list = result
      .map((task) => ` - [${task.id}] ${task.description}`)
      .join("\n");

    await interaction.reply(`${bold("Task list")}\n${list}`);
  }

  /**
   * @param {PoolConnection} db
   * @param {CommandInteraction} interaction
   */
  async #completeTodo(db, interaction) {
    const id = interaction.options.getNumber("id");
    const query = `DELETE FROM todo.todos WHERE id = ${id}`;

    await db.query(query);
    await interaction.reply(`Task completed`);
  }
}
