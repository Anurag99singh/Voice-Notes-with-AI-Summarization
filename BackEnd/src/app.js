const express = require("express");
const noteRouter = require("../routes/NoteRoute");
const cors = require("cors");
const app = express();
app.set("trust proxy", 1); //this is to make the express trust the proxy like render which forward the user's ip
app.use(
  cors({
    origin: "https://voice-notes-with-ai-summarization.netlify.app",
    credentials: true,
  })
);

app.use(express.json());
// app.use("/uploads", express.static("uploads"));
// app.use("/api", limiter);
app.use("/api/notes", noteRouter);
module.exports = app;
// "start": "nodemon --env-file=config.env  src/server.js"
