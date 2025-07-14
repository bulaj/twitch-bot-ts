import { Command } from '../command.interface';

export const PingCommand: Command = {
    name: 'ping',
    description: 'Odpowiada "Pong!"',
    execute(client, channel) {
        client.say(channel, 'Pong!');
    }
};
