const express = require("express");
const app = express();
const port = 3005;
const fs = require("fs");
const path = require("path");
const os = require("os");

const setAllowCrossDomainAccess = (app) => {
  app.all("*", (req, res, next) => {
    const { origin, Origin, referer, Referer } = req.headers;
    const allowOrigin = origin || Origin || referer || Referer || "*" || "null";
    res.header("Access-Control-Allow-Origin", allowOrigin);
    res.header(
      "Access-Control-Allow-Headers",
      "traceparent, Content-Type, Authorization, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Accept-Ranges,Content-Range"
    );
    res.header("X-Powered-By", "Express");
    res.header("Accept-Ranges", 65536 * 4);
    if (req.method == "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });
};

setAllowCrossDomainAccess(app);
const CHUNK_SIZE = 1024 * 1024; // 1MB

app.get("/getPdf", (req, res) => {
  console.log("request received", req.headers);

  const filePath = path.join(__dirname, "../src/assets/JavaScript.pdf");
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "application/octet-stream",
    });

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
      "Content-Type": "application/octet-stream",
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return "localhost";
}

function startServer(port) {
  const server = app.listen(port, () => {
    const ipAddress = getLocalIpAddress();
    console.log(`Server running at http://${ipAddress}:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Trying the next port...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(port);
