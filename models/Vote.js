const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  // The elector who cast the vote
  elector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One vote per elector — enforced at DB level
  },
  // The contestant they voted for
  contestant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  castedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vote", voteSchema);