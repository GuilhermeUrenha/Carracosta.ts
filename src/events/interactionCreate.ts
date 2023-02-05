import { ExtendedInteraction } from './../typings/Command';
import { CommandInteractionOptionResolver } from 'discord.js';
import { client } from '..';
import { Event } from '../structures/Event';

export default new Event('interactionCreate', async (interaction) =>{
    if(interaction.isCommand()) {
        await interaction.deferReply();
        const command = client.commands.get(interaction.commandName);
        if(!command) return interaction.followUp('Non-existent command.');

        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        })
    }
});