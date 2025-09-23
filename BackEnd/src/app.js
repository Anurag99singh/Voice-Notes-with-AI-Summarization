const express = require("express");
const noteRouter = require("../routes/NoteRoute");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
// app.use("/uploads", express.static("uploads"));
// app.use("/api", limiter);
app.use("/api/notes", noteRouter);
module.exports = app;
