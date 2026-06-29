const {
    EmbedBuilder
} = require("discord.js");

function createRecipeEmbed(item) {

    // -------------------------
    // Recipe
    // -------------------------

    const recipe = item.recipe?.length
        ? item.recipe.join(" + ")
        : "None";

    // -------------------------
    // Required Seeds
    // -------------------------

    let requiredSeeds = "None";

    if (
        item.requiredSeeds &&
        Object.keys(item.requiredSeeds).length
    ) {

        requiredSeeds = Object.entries(item.requiredSeeds)

            .map(([seed, amount]) =>
                `• ${seed} ×${amount}`
            )

            .join("\n");

    }

    // -------------------------
    // Craft Tree
    // -------------------------

    let craftTree = "None";

    if (
        item.craftTree &&
        item.craftTree.length
    ) {

        craftTree =
            "```text\n" +
            item.craftTree.join("\n") +
            "\n```";

    }

    // -------------------------
    // Embed
    // -------------------------

    return new EmbedBuilder()

        .setColor(0xff9900)

        .setTitle(`📦 ${item.name}`)

        .setDescription(
            `Recipe information for **${item.name}**`
        )

        .addFields(

            {
                name: "🏷 Category",
                value: item.category || "Unknown",
                inline: true
            },

            {
                name: "⭐ Tier",
                value: `${item.tier}`,
                inline: true
            },

            {
                name: "\u200b",
                value: "\u200b",
                inline: true
            },

            {
                name: "🧪 Recipe",

                value:
                    "```text\n" +
                    recipe +
                    "\n```"
            },

            {
                name: "🌱 Required Seeds",

                value:
                    "```text\n" +
                    requiredSeeds +
                    "\n```"
            },

            {
                name: "🌳 Craft Tree",

                value: craftTree
            }

        )

        .setFooter({

            text: "Playtopia Recipe Browser"

        })

        .setTimestamp();

}

module.exports = {

    createRecipeEmbed

};