const {
    SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const { createRecipeEmbed } = require("../utils/embedBuilder");

// Load database
const items = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../database/items.json"),
        "utf8"
    )
);

module.exports = {

    data: new SlashCommandBuilder()
        .setName("recipe")
        .setDescription("Shows the recipe of an item")
        .addStringOption(option =>
            option
                .setName("item")
                .setDescription("Enter an item name")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    // -----------------------------
    // AUTOCOMPLETE
    // -----------------------------

    async autocomplete(interaction) {

        const focused = interaction.options
            .getFocused()
            .toLowerCase();

        const results = Object.values(items)

            .filter(item =>
                item.name.toLowerCase().includes(focused)
            )

            .slice(0, 25);

        await interaction.respond(

            results.map(item => ({

                name: item.name,

                value: item.name.toLowerCase()

            }))

        );

    },

    // -----------------------------
    // EXECUTE
    // -----------------------------

    async execute(interaction) {

        const search = interaction.options
            .getString("item")
            .toLowerCase();

        // Find item by key or name
        let item = items[search];

        if (!item) {

            item = Object.values(items).find(i =>
                i.name.toLowerCase() === search
            );

        }

        if (!item) {

            return interaction.reply({

                content: "❌ Item not found.",

                ephemeral: true

            });

        }

        const embed = createRecipeEmbed(item);

        await interaction.reply({

            embeds: [embed]

        });

    }

};