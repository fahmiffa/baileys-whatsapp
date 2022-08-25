const {
  default: makeWASocket,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");

process.setMaxListeners(0);

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const port = 9000;
const fs = require("fs");
const qrcode = require("qrcode");
const pino = require("pino");
const socketIO = require("socket.io");

const con = require("./core/core.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// config cors
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "https://stiker-label.com",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

let x;

const path = "./core/";

const { body, validationResult } = require("express-validator");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

io.on("connection", (socket) => {
  socket.on("StartConnection", async (device) => {
    if (fs.existsSync(path.concat(device) + ".json")) {
      socket.emit("message", "Whatsapp connected");
      socket.emit("ready", device);
    } else {
      const { state, saveState } = useSingleFileAuthState(
        path.concat(device) + ".json"
      );

      const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        logger: pino({ level: "fatal" }),
        browser: ["FFA", "EDGE", "1.0"],
      });
      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr, isNewLogin } = update;

        if (qr) {
          qrcode.toDataURL(qr, (err, url) => {
            socket.emit("qr", url);
            socket.emit("message", "QR Code received, scan please!");
          });
        }

        if (connection == "close") {
          con.gas(null, device);
          console.log(device);
          socket.emit("message", "Whatsapp connected");
          socket.emit("ready", device);
        }
        console.log(connection);
      });
      sock.ev.on("creds.update", saveState);
    }
  });

  socket.on("LogoutDevice", (device) => {
    if (fs.existsSync(path.concat(device) + ".json")) {
      fs.unlinkSync(path.concat(device) + ".json");
      console.log("logout device " + device);

      socket.emit("message", "logout device " + device);
    }
    return;
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/core/home.html");
});

app.get("/device", (req, res) => {
  res.sendFile(__dirname + "/core//device.html");
});

app.get("/scan/:id", (req, res) => {
  res.sendFile(__dirname + "/core//index.html");
});

app.post(
  "/send",
  [
    body("number").notEmpty(),
    body("message").notEmpty(),
    body("to").notEmpty(),
    body("type").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      });
    } else {
      var number = req.body.number;
      var to = req.body.to;
      var type = req.body.type;
      var msg = req.body.message;

      if (fs.existsSync(path.concat(number) + ".json")) {
        if (Array.isArray(to)) {
          try {
            for (let x in to) {
              if (to[x].length < 12) {
                throw "value number invalid, must be greater than 12 digit";
              }
            }

            con.gas(msg, number, to, type);
            res.writeHead(200, {
              "Content-Type": "application/json",
            });
            res.end(
              JSON.stringify({
                status: true,
                message: "success",
              })
            );
          } catch (error) {
            res.writeHead(401, {
              "Content-Type": "application/json",
            });
            res.end(
              JSON.stringify({
                status: false,
                message: error,
              })
            );
          }
        } else {
          res.writeHead(401, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({
              status: false,
              message: "input type to is not array value",
            })
          );
        }
      } else {
        res.writeHead(401, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            status: false,
            message: "Please scan the QR before use the API",
          })
        );
      }
    }
  }
);

app.post("/device", (req, res) => {
  const no = req.body.device;
  res.redirect("/scan/" + no);
});

server.listen(port, function () {
  console.log("App running on : " + port);
});
