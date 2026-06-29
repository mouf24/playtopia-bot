const {
    SlashCommandBuilder
} = require("discord.js");

const {
    createBrowser
} = require("../utils/browser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Browse every Playtopia recipe"),

    async execute(interaction) {

        await interaction.reply(
            createBrowser(0)
        );

    }

}; 
