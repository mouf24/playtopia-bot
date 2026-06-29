require('dotenv').config();

const fs = require('fs');
const path = require('path');

const {
    Client,
    Collection,
    GatewayIntentBits,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Store commands
client.commands = new Collection();

// Load all commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const command = require(path.join(commandsPath, file));

    if ('data' in command && 'execute' in command) {

        client.commands.set(command.data.name, command);

        console.log(`Loaded command: ${command.data.name}`);

    } else {

        console.log(`[WARNING] ${file} is missing data or execute.`);

    }

}

// Bot Ready
client.once(Events.ClientReady, readyClient => {

    console.log(`✅ Logged in as ${readyClient.user.tag}`);

});

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {

    // ------------------------
    // AUTOCOMPLETE
    // ------------------------
    if (interaction.isAutocomplete()) {

        const command = client.commands.get(interaction.commandName);

        if (!command || !command.autocomplete)
            return;

        try {

            await command.autocomplete(interaction);

        } catch (error) {

            console.error("Autocomplete Error:", error);

        }

        return;

    }

    // ------------------------
    // SLASH COMMANDS
    // ------------------------
    if (!interaction.isChatInputCommand())
        return;

    const command = client.commands.get(interaction.commandName);

    if (!command)
        return;

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content: "❌ There was an error while executing this command.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: "❌ There was an error while executing this command.",
                ephemeral: true
            });

        }

    }

});

// Login
client.login(process.env.TOKEN);