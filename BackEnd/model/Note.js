const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  title: { type: String, default: "" }, // Optional: short title (first 50 chars of transcript)
  audioUrl: { type: String, required: true }, // server path or cloud URL
  audioMime: { type: String },
  durationSec: { type: Number, default: 0 },

  transcript: { type: String, default: "" },
  transcriptUpdatedAt: { type: Date, default: null },

  summary: { type: String, default: null },
  summaryGeneratedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NoteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Note", NoteSchema);
