const fs = require("fs");
const path = require("path");

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require("discord.js");

const items = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../database/items.json"),
        "utf8"
    )
);

// --------------------
// GROUP ITEMS BY TIER
// --------------------

const tiers = {};

Object.values(items).forEach(item => {

    if (!tiers[item.tier]) {
        tiers[item.tier] = [];
    }

    tiers[item.tier].push(item);

});

// Sort every tier alphabetically
Object.values(tiers).forEach(list => {

    list.sort((a, b) =>
        a.name.localeCompare(b.name)
    );

});

const tierNumbers = Object.keys(tiers)
    .map(Number)
    .sort((a, b) => a - b);

// Flat list used by /recipe autocomplete
const itemList = Object.values(items).sort((a, b) => {

    if (a.tier !== b.tier)
        return a.tier - b.tier;

    return a.name.localeCompare(b.name);

});

// --------------------

function createBrowser(page = 0) {

    if (page < 0)
        page = 0;

    if (page >= tierNumbers.length)
        page = tierNumbers.length - 1;

    const tier = tierNumbers[page];

    const pageItems = tiers[tier];

    const embed = new EmbedBuilder()

        .setColor(0xff9900)

        .setTitle("📖 Playtopia Recipe Browser")

        .setDescription(

            pageItems

                .map(item => `• **${item.name}**`)

                .join("\n")

        )

        .addFields({

            name: "Tier",

            value: `${tier}`,

            inline: true

        })

        .setFooter({

            text: `Tier ${tier} • Page ${page + 1}/${tierNumbers.length}`

        });

    // --------------------

    const buttonRow = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(`recipes_prev_${page}`)

                .setLabel("⬅ Previous")

                .setStyle(ButtonStyle.Secondary)

                .setDisabled(page === 0),

            new ButtonBuilder()

                .setCustomId("recipes_page")

                .setLabel(`${page + 1}/${tierNumbers.length}`)

                .setDisabled(true)

                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()

                .setCustomId(`recipes_next_${page}`)

                .setLabel("Next ➡")

                .setStyle(ButtonStyle.Primary)

                .setDisabled(page === tierNumbers.length - 1)

        );

    // --------------------

    const menu = new ActionRowBuilder()

        .addComponents(

            new StringSelectMenuBuilder()

                .setCustomId(`recipes_select_${page}`)

                .setPlaceholder("🔍 Jump to Recipe")

                .addOptions(

                    pageItems.map(item => ({

                        label: item.name,

                        description: item.category,

                        value: item.name.toLowerCase()

                    }))

                )

        );

    return {

        embeds: [embed],

        components: [

            buttonRow,

            menu

        ]

    };

}

module.exports = {

    createBrowser,

    itemList,

    tierNumbers

};