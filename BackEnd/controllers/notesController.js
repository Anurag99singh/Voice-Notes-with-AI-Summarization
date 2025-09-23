const multer = require("multer");
// const fs = require("fs");
const Note = require("../model/Note");
// const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../supabase");

// initalizion of  Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 100);
//     cb(null, unique + "-" + file.originalname);
//   },
// });

const storage = multer.memoryStorage();
exports.upload = multer({ storage });
// filePath
async function transcribeLocalFile(buffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // const fileBuffer = fs.readFileSync(filePath);
    // const base64Data = fileBuffer.toString("base64");
    const base64Data = buffer.toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "audio/webm",
        },
      },
      { text: "Please transcribe this audio into text." },
    ]);

    return result?.response?.text() || null;
  } catch (err) {
    console.error("Transcription error", err);
    throw err;
  }
}

async function summarizeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the following note into 4 concise bullet points (or fewer if short). Be factual and do not add new information and give some human touch:\n\n${text}`;

    const result = await model.generateContent(prompt);
    return result?.response?.text()?.trim() || null;
  } catch (err) {
    console.error("Summarization error", err);
    throw err;
  }
}

exports.createNote = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No audio file uploaded" });
    const uniqueName = Date.now() + "-" + req.file.originalname;

    // Uploading the audio file to Supabase bucket
    const { data, error } = await supabase.storage
      .from("voice-notes")
      .upload(uniqueName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (error) throw error;

    // Getting the  public URL from supabase
    const { data: publicData } = supabase.storage
      .from("voice-notes")
      .getPublicUrl(uniqueName);
    // const filePath = req.file.path;
    // const note = new Note({
    //   audioPath: filePath,
    //   audioMime: req.file.mimetype,
    //   title: "",
    // });
    // await note.save();
    const note = new Note({
      audioUrl: publicData.publicUrl,
      audioMime: req.file.mimetype,
      title: "",
    });
    await note.save();

    // transcribe with Gemini
    // const transcript = await transcribeLocalFile(filePath, req.file.mimetype);
    const transcript = await transcribeLocalFile(
      req.file.buffer,
      req.file.mimetype
    );

    note.transcript = transcript || "";
    note.transcriptUpdatedAt = new Date();
    note.title = transcript || "";
    await note.save();

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during note creation" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notes" });
  }
};

exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { transcript, title } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (typeof transcript === "string") {
      note.transcript = transcript;
      note.transcriptUpdatedAt = new Date();
      note.summary = null;
      note.summaryGeneratedAt = null;
      note.title = transcript || "";
    }
    // if (typeof title === "string") note.title = title;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // if (note.audioPath) {
    //   fs.unlink(note.audioPath, (err) => {
    //     if (err) console.warn("File delete error", err);
    //   });
    // }

    if (note.audioUrl) {
      const fileName = note.audioUrl.split("/").pop();
      await supabase.storage.from("voice-notes").remove([fileName]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.summarizeNote = async (req, res) => {
  try {
    const id = req.params.id;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (!note.transcript)
      return res.status(400).json({ error: "No transcript to summarize" });

    if (
      note.summary &&
      note.summaryGeneratedAt &&
      (!note.transcriptUpdatedAt ||
        note.summaryGeneratedAt >= note.transcriptUpdatedAt)
    ) {
      return res.json({ summary: note.summary });
    }

    const summary = await summarizeText(note.transcript || "");
    note.summary = summary;
    note.summaryGeneratedAt = new Date();
    await note.save();

    res.json({ summary: note.summary, note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarize failed" });
  }
};
