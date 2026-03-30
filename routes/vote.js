const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Vote = require("../models/Vote");

// Middleware: only logged-in electors can vote
function requireElector(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "You must be logged in." });
  }
  if (req.session.user.role !== "elector") {
    return res.status(403).json({ error: "Only electors can vote." });
  }
  next();
}

// GET /vote/contestants — list all contestants
router.get("/contestants", async (req, res) => {
  try {
    const contestants = await User.find({ role: "contestant" }, "name email _id");
    res.json(contestants);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /vote/cast — cast a vote
router.post("/cast", requireElector, async (req, res) => {
  const { contestantId } = req.body;
  const electorId = req.session.user.id;

  if (!contestantId) {
    return res.status(400).json({ error: "Please select a contestant." });
  }

  try {
    // Check contestant exists
    const contestant = await User.findOne({ _id: contestantId, role: "contestant" });
    if (!contestant) {
      return res.status(404).json({ error: "Contestant not found." });
    }

    // Check if elector already voted (unique index on elector field handles this too)
    const alreadyVoted = await Vote.findOne({ elector: electorId });
    if (alreadyVoted) {
      return res.status(409).json({ error: "You have already cast your vote." });
    }

    // Save the vote
    const vote = new Vote({ elector: electorId, contestant: contestantId });
    await vote.save();

    res.json({ message: `✅ Vote cast for ${contestant.name}!` });
  } catch (err) {
    // Handle duplicate key error from MongoDB unique index
    if (err.code === 11000) {
      return res.status(409).json({ error: "You have already cast your vote." });
    }
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// GET /vote/results — get vote counts per contestant
router.get("/results", async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $group: {
          _id: "$contestant",
          voteCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contestantInfo",
        },
      },
      { $unwind: "$contestantInfo" },
      {
        $project: {
          name: "$contestantInfo.name",
          email: "$contestantInfo.email",
          voteCount: 1,
        },
      },
      { $sort: { voteCount: -1 } }, // highest votes first
    ]);

    // Also include contestants with 0 votes
    const allContestants = await User.find({ role: "contestant" }, "name email _id");
    const resultIds = results.map((r) => r._id.toString());

    const zeroVote = allContestants
      .filter((c) => !resultIds.includes(c._id.toString()))
      .map((c) => ({ _id: c._id, name: c.name, email: c.email, voteCount: 0 }));

    res.json([...results, ...zeroVote]);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// GET /vote/my-vote — check if current elector has voted
router.get("/my-vote", requireElector, async (req, res) => {
  try {
    const vote = await Vote.findOne({ elector: req.session.user.id }).populate(
      "contestant",
      "name email"
    );
    if (!vote) return res.json({ voted: false });
    res.json({ voted: true, contestant: vote.contestant });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;