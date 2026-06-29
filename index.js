require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    createBrowser,
    itemList
} = require("./utils/browser");

const {
    createRecipeEmbed
} = require("./utils/embedBuilder");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// --------------------
// Load Commands
// --------------------

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

    const command = require(path.join(commandsPath, file));

    if ("data" in command && "execute" in command) {

        client.commands.set(command.data.name, command);

        console.log(`Loaded ${command.data.name}`);

    }

}

// --------------------
// Ready
// --------------------

client.once(Events.ClientReady, client => {

    console.log(`✅ Logged in as ${client.user.tag}`);

});

// --------------------
// Interaction
// --------------------

client.on(Events.InteractionCreate, async interaction => {

    // ============================================
    // AUTOCOMPLETE
    // ============================================

    if (interaction.isAutocomplete()) {

        const command = client.commands.get(interaction.commandName);

        if (!command?.autocomplete)
            return;

        return command.autocomplete(interaction);

    }

    // ============================================
    // BUTTONS
    // ============================================

    if (interaction.isButton()) {

        try {

            const id = interaction.customId;

            // Previous Tier

            if (id.startsWith("recipes_prev_")) {

                const page = Number(id.split("_")[2]);

                return interaction.update(
                    createBrowser(page - 1)
                );

            }

            // Next Tier

            if (id.startsWith("recipes_next_")) {

                const page = Number(id.split("_")[2]);

                return interaction.update(
                    createBrowser(page + 1)
                );

            }

            // Back

            if (id.startsWith("recipes_back_")) {

                const page = Number(id.split("_")[2]);

                return interaction.update(
                    createBrowser(page)
                );

            }

        } catch (err) {

            console.error(err);

        }

        return;

    }

    // ============================================
    // SELECT MENU
    // ============================================

    if (interaction.isStringSelectMenu()) {

        try {

            if (!interaction.customId.startsWith("recipes_select_"))
                return;

            const page = Number(
                interaction.customId.split("_")[2]
            );

            const selected = interaction.values[0];

            const item = itemList.find(i =>
                i.name.toLowerCase() === selected
            );

            if (!item) {

                return interaction.reply({

                    content: "❌ Item not found.",

                    ephemeral: true

                });

            }

            const embed = createRecipeEmbed(item);

            const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(`recipes_back_${page}`)

                        .setLabel("⬅ Back to Browser")

                        .setStyle(ButtonStyle.Primary)

                );

            return interaction.update({

                embeds: [embed],

                components: [row]

            });

        } catch (err) {

            console.error(err);

        }

        return;

    }

    // ============================================
    // SLASH COMMANDS
    // ============================================

    if (!interaction.isChatInputCommand())
        return;

    const command = client.commands.get(
        interaction.commandName
    );

    if (!command)
        return;

    try {

        await command.execute(interaction);

    }

    catch (err) {

        console.error(err);

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({

                content: "❌ Error executing command.",

                ephemeral: true

            });

        }

        else {

            await interaction.reply({

                content: "❌ Error executing command.",

                ephemeral: true

            });

        }

    }

});

// --------------------

client.login(process.env.TOKEN);