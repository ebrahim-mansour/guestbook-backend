const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const replySchema = new Schema({
  replyBody: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  message: { type: mongoose.Types.ObjectId, required: true, ref: "Message" },
});

module.exports = mongoose.model("Reply", replySchema);
