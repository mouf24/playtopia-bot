const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

// Load database
const items = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '../database/items.json'),
        'utf8'
    )
);

module.exports = {

    data: new SlashCommandBuilder()
        .setName('recipe')
        .setDescription('Shows the recipe of an item')
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Enter an item name')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {

        const focused = interaction.options.getFocused().toLowerCase();

        const choices = Object.values(items)
            .filter(item =>
                item.name.toLowerCase().includes(focused)
            )
            .slice(0, 25);

        await interaction.respond(
            choices.map(item => ({
                name: item.name,
                value: item.name
            }))
        );

    },

    async execute(interaction) {

        const search = interaction.options
            .getString('item')
            .toLowerCase();

        const item = items[search];

        if (!item) {

            return interaction.reply({
                content: "❌ Item not found.",
                ephemeral: true
            });

        }

        // Required Seeds

        let seedText = "None";

        if (
            item.requiredSeeds &&
            Object.keys(item.requiredSeeds).length > 0
        ) {

            seedText = Object.entries(item.requiredSeeds)
                .map(([seed, amount]) => `• ${seed} ×${amount}`)
                .join("\n");

        }

        // Recipe

        const recipeText =
            item.recipe && item.recipe.length
                ? item.recipe.join(" + ")
                : "None";

        // Craft Tree

        let craftTree = "None";

        if (
            item.craftTree &&
            item.craftTree.length > 0
        ) {

            craftTree =
                "```text\n" +
                item.craftTree.join("\n") +
                "\n```";

        }

        const embed = new EmbedBuilder()

            .setColor(0xff9900)

            .setTitle(item.name)

            .addFields(

                {
                    name: "Category",
                    value: item.category || "Unknown",
                    inline: true
                },

                {
                    name: "Tier",
                    value: String(item.tier ?? "Unknown"),
                    inline: true
                },

                {
                    name: "Recipe",
                    value: recipeText
                },

                {
                    name: "Required Seeds",
                    value: seedText
                },

                {
                    name: "Craft Tree",
                    value: craftTree
                }

            )

            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });

    }

};