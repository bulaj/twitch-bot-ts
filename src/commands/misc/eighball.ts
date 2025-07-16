import { SimpleCommand } from "../command.interface";

const eightBallResponses = [
  "Tak, zdecydowanie!",
  "Nie jestem tego pewien...",
  "Lepiej się nie nastawiaj.",
  "Z pewnością tak!",
  "Może, czas pokaże.",
  "Nie licz na to.",
  "Zapytaj później.",
  "To się wyjaśni samo.",
  "Nie mam zdania.",
  "Sak maj kok.",
];

function handle8BallCommand(message: string, username: string): string {
  const userQuestion = message.replace("!8ball", "");
  if (!userQuestion.replace("!8ball", "").trim()) {
    return "Zadaj pytanie, na które mogę odpowiedzieć!";
  }
  const response =
    eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  return `🎱 @${username}, ${userQuestion}?\n ${response}`;
}
export const EightBallCommand: SimpleCommand = {
  name: "8ball",
  description: "Odpowiada na 8ball!",
  execute(client, channel, userstate, message) {
    client.say(channel, handle8BallCommand(message, userstate.username!));
  },
};
