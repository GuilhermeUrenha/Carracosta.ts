import { ApplicationCommandDataResolvable, Client, Collection, ClientEvents } from 'discord.js';
import { CommandType } from '../typings/Command';
import glob from 'glob';
import { promisify } from 'util';
import { RegisterCommandOptions } from '../typings/Client';
import { Event } from './Event';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    constructor() {
        super({ intents: 8 })
    }

    start() {
        this.registerModules();
        this.login(process.env.botToken);
    }
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({commands, guildId}:RegisterCommandOptions) {
        if(guildId){
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registered commands to ${guildId}.`);
        } else {
            this.application.commands.set(commands);
            console.log(`Registered global commands.`);
        }
    }

    async registerModules() {
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*{.ts,.js}`);
        console.log({ commandFiles });
        commandFiles.forEach(async filePath => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) return;
            //console.log(command);

            this.commands.set(command.name, command);
            slashCommands.push(command);
        });

        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async filePath =>{
            const event:Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        });
    }
}