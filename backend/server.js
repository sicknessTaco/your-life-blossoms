const path = require("path");
const express = require("express");
const app = require("./api");

const port = Number(process.env.PORT || 4242);
const frontendDir = path.resolve(__dirname, "../frontendd");

if (require("fs").existsSync(frontendDir)) {
  app.use(express.static(frontendDir));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(frontendDir, "main.html"));
  });
}

app.listen(port, () => {
  console.log(`Servidor backend + frontend en http://localhost:${port}`);
});
