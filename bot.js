import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import axios from 'axios';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'time') {
        const habboUsername = interaction.options.getString('habbo_username');
        const apiUrl = `${process.env.PHP_SERVICE_URL}?username=${encodeURIComponent(habboUsername)}`;

        // Defer the reply to ensure the interaction token doesn't expire
        await interaction.deferReply();

        try {
            const response = await axios.get(apiUrl);
            const userDetails = response.data;
            // Make sure to correctly map the JSON fields to the response message
            const replyMessage = `\`\`\`User Details for ${userDetails.username}:\n- Motto: ${userDetails.motto}\n- Member Since: ${userDetails.memberSince}\n- Last Access Time: ${userDetails.lastAccessTime}\n- Online Time: ${userDetails.onlineTime}\n- Online: ${userDetails.online}\n- Total Experience: ${userDetails.totalExperience}\n\`\`\``;
            await interaction.editReply(replyMessage);
            await interaction.editReply(replyMessage);
        } catch (error) {
            console.error('Error fetching Habbo user details:', error);
            await interaction.editReply('Failed to retrieve details. Please ensure the API is reachable.');
        }
    }
});

const commands = [{
    name: 'time',
    description: 'Get Habbo user profile details',
    options: [{
        type: 3, // STRING type indicates it's expecting a string
        name: 'habbo_username',
        description: 'The username of the Habbo user',
        required: true
    }]
}];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log('Started refreshing application (/) commands globally.');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }); // This registers commands globally
        console.log('Successfully reloaded application (/) commands globally.');
    } catch (error) {
        console.error('Error reloading application (/) commands globally:', error);
    }
})();

client.login(process.env.TOKEN);
