const Event = require("../models/Event");

const add = async (req, res) => {
  try {
    const { title, description, photoUrl, visibility } = req.body;

    if (!title || !description ) {
      return res
        .status(400)
        .json({ message: "Title and Description are required" });
    }

    const user = new Event({ title, description, photoUrl, visibility });
    await user.save();

    res.status(201).json({ message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  add,
};
