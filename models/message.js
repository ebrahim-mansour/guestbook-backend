const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  msgBody: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  reply: { type: String },
});

module.exports = mongoose.model("Message", messageSchema);
