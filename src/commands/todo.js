/**
 * @typedef {import("discord.js").Interaction<import("discord.js").CacheType>} Interaction
 * @typedef {import("discord.js").CommandInteraction<import("discord.js").CacheType>} CommandInteraction
 */

import { bold, SlashCommandBuilder } from "@discordjs/builders";
import "../db.js";
import { asyncQuery, db } from "../db.js";

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
   * @param {Interaction} interaction
   * @returns {Promise<boolean>} True if handled, false otherwise.
   */
  async handle(interaction) {
    if (interaction.isCommand() && interaction.commandName === "todo") {
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case "create":
          await this.#createTodo(interaction);
          return true;
        case "list":
          await this.#listTodo(interaction);
          return true;
        case "complete":
          await this.#completeTodo(interaction);
          return true;
      }
    }
    return false;
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async #createTodo(interaction) {
    const description = interaction.options.getString("description");
    const query = `INSERT INTO todo.todos (description) VALUES ("${description}")`;

    await asyncQuery(db, query);
    await interaction.reply(`Recorded todo: ${description}`);
  }

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async #listTodo(interaction) {
    const query = `SELECT * FROM todo.todos`;
    const result = await asyncQuery(db, query);

    if (result.length === 0) {
      return await interaction.reply("There are no tasks!");
    }

    const list = result
      .map((task) => ` - [${task.id}] ${task.description}`)
      .join("\n");

    await interaction.reply(`${bold("Task list")}\n${list}`);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async #completeTodo(interaction) {
    const id = interaction.options.getNumber("id");
    const query = `DELETE FROM todo.todos WHERE id = ${id}`;

    await asyncQuery(db, query);
    await interaction.reply(`Task completed`);
  }
}
