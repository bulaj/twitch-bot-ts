import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { config } from "../config";
import { logger } from "../services/logger.service";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  logger.info("New connection to local chat server.");

  socket.on("pass", (pass) => logger.info("Bot Auth received."));
  socket.on("nick", (nick) => logger.info(`Bot Nick: ${nick}`));
  socket.on("join", (channel) => {
    logger.info(`Bot joined ${channel}`);
    socket.join(channel);
    socket.emit(
      "message",
      `:tmi.twitch.tv 001 ${config.twitch.username} :Welcome to local chat`,
    );
    socket.emit("message", `:tmi.twitch.tv 376 ${config.twitch.username} :>`);
  });

  socket.on("chat-message", (data) => {
    const { channel, username, message } = data;
    const tmiMessage = `@display-name=${username};user-id=123;username=${username} :${username}!${username}@${username}.tmi.twitch.tv PRIVMSG ${channel} :${message}`;
    io.to(channel).emit("message", tmiMessage);
  });

  socket.on("privmsg", (msg) => {
    const [channel, ...messageParts] = msg.split(" ");
    const message = messageParts.join(" ").slice(1);
    io.to(channel).emit("bot-message", {
      username: config.twitch.username,
      message,
    });
  });
});

server.listen(config.localChat.port, () => {
  console.log(config);
  logger.info(
    `Local chat server listening on http://${config.localChat.host}:${config.localChat.port}`,
  );
});
