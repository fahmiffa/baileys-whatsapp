const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");

const pino = require("pino");
const fs = require("fs");
const path = "./core/";
let x;

exports.gas = function (msg, no, to) {
  const numb = no + ".json";
  connect(numb, msg, to);
};

async function connect(sta, msg, to) {
  const { state, saveState } = useSingleFileAuthState(path.concat(sta));

  const sock = makeWASocket({
    auth: state,
    defaultQueryTimeoutMs: undefined,
    logger: pino({ level: "fatal" }),
    browser: ["FFA", "EDGE", "1.0"],
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
        for (let x in to) {
          const id = to[x] + "@s.whatsapp.net";
          sock.sendMessage(id, {
            text: msg,
          });
        }
      }
    }
  });

  sock.ev.on("creds.update", saveState);

  return sock;
}
