const {
  default: makeWASocket,
  BufferJSON,
  initInMemoryKeyStore,
  DisconnectReason,
  MessageType,
  MessageOptions,
  Mimetype,
  makeInMemoryStore,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");

const fs = require("fs");
const pino = require("pino");
const path = "./core/";

exports.gas = function (msg, no, to) {
  const numb = no + ".json";
  console.log(numb);
  connect(numb, msg, to);
};

async function connect(sta, msg, to) {
  const { state, saveState } = useSingleFileAuthState(path.concat(sta));

  const sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    logger: pino({ level: "fatal" }),
    browser: ["WAF"],
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection == "connecting") return;

    if (connection === "close") {
      let statusCode = lastDisconnect.error?.output?.statusCode;

      if (statusCode === DisconnectReason.restartRequired) {
        return;
      } else if (statusCode === DisconnectReason.loggedOut) {
        if (fs.existsSync(path.concat(sta))) {
          fs.unlinkSync(path.concat(sta));
        }
        return;
      }
    } else if (connection === "open") {
      if (msg != null && to != null) {
        const id = to + "@s.whatsapp.net";
        sock.sendMessage(id, {
          text: msg,
        });
        console.log("send");
      }
    }
  });

  sock.ev.on("creds.update", saveState);

  return sock;
}
