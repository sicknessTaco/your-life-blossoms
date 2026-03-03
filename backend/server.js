const path = require("path");
const express = require("./backend/node_modules/express");
const app = require("./backend/api");
const port = Number(process.env.PORT || 4242);
const frontendDir = path.join(__dirname, "frontendd");

app.use(express.static(frontendDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDir, "main.html"));
});

app.listen(port, () => {
  console.log(`Servidor web + API ejecutandose en http://localhost:${port}`);
});
