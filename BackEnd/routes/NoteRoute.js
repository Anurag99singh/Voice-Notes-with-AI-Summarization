const express = require("express");
const notesCtrl = require("../controllers/notesController");
const limiter = require("../controllers/limiter");
const router = express.Router();

router
  .route("/")
  .post(limiter, notesCtrl.upload.single("audio"), notesCtrl.createNote)
  .get(notesCtrl.getNotes);
router
  .route("/:id")
  .get(notesCtrl.getNote)
  .put(notesCtrl.updateNote)
  .delete(notesCtrl.deleteNote);

router.post("/:id/summarize", limiter, notesCtrl.summarizeNote);

module.exports = router;
