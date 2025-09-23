# 🎙️ Voice Notes with AI Summarization (MERN + GenAI)

## 📌 Project Overview

Voice Notes Manager is a full-stack MERN application integrated with GenAI APIs (OpenAI) that allows users to:

- Record and save voice notes.
- Automatically transcribe audio to text.
- Edit and delete notes.
- Generate AI-powered summaries for notes.
- Persist notes in MongoDB for future access.

This project demonstrates **CRUD operations in MERN**, **AI API integration**, and **state management in React** with a clean UI.

---

## 🚀 Features

- 🎤 **Record & Transcribe** → Record voice notes and convert them to text.
- 📑 **View Notes** → List all saved notes with transcript.
- ✏️ **Edit Notes** → Update the transcript and reset summary when edited.
- ❌ **Delete Notes** → Remove unwanted notes.
- 🤖 **Summarize Notes** → Generate concise summaries using GenAI APIs.
- 💾 **Persistent Data** → All notes stored in MongoDB.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Hooks, Axios/Fetch)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM), Supabase
- **GenAI APIs**: OpenAI (Speech-to-Text + Summarization)

---

## ⚡ Core Logic

- When a note is created → Transcription is stored in MongoDB.
- When user edits transcript → Previous summary is cleared, "Generate Summary" button reappears.
- Once summary is generated → Button is disabled until note is edited again.
