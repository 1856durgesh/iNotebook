const express = require("express");
const router = express.Router();
const fetchUser = require("../middleWare/getUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route 1: fetching the all the notes of the login user using :GET
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

// Route:2 Add the notes Post:"/api/notes/addnotes" login required
router.post(
  "/addnotes",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast five characters").isLength(
      { min: 5 }
    ),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are the error return the bad request and the error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title: title,
        description: description,
        tag: tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
// Route 3: Updating an existing notes using :Put"api/notes/update" Login is required
router.put("/updatenotes/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // creating a new notes
    const newNotes = {};
    if (title) {
      newNotes.title = title;
    }
    if (description) {
      newNotes.description = description;
    }
    if (tag) {
      newNotes.tag = tag;
    }
    // Find the note to be updated and update it
    const paramsId = req.params.id.slice(1);

    let note = await Notes.findById(paramsId); // params.id means updatenotes/:id <= yaa wali id
    if (!note) {
      res.status(404).send(" Note not found");
    }
    if (note.user.toString() != req.user.id) {
      return res.status(401).send("Not Authorized");
    }
    note = await Notes.findByIdAndUpdate(
      paramsId,
      { $set: newNotes },
      { new: true }
    );
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Route4: Delete the note using DELETE:"api/notes/deletenotes" Login required.
router.delete("/deletenotes/:id", fetchUser, async (req, res) => {
  try {
    // Find the note by id and delete it
    const paramsId = req.params.id.slice(1);
    const note = await Notes.findById(paramsId);
    // if note not found at that id give the error
    if (!note) {
      return res.status(404).send("Note not found");
    }
    // Ensure the user is authorized to delete the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized");
    }
    // Delete the note from the database.
    await Notes.findByIdAndDelete(paramsId);
    res.json({ msg: "Note removed" });
  } catch (err) {
    console.error(err.message);
    res.status(401).send("Server Error");
  }
});
module.exports = router;
