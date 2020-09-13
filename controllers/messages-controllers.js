const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Message = require("../models/message");
const User = require("../models/user");
const Reply = require("../models/reply");

const getMessagesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithOwnedMessages;
  try {
    userWithOwnedMessages = await User.findById(userId).populate(
      "ownedMessages"
    );
  } catch (err) {
    const error = new HttpError(
      "Fetching messages failed, please try again later",
      500
    );
    return next(error);
  }

  if (
    !userWithOwnedMessages ||
    userWithOwnedMessages.ownedMessages.length === 0
  ) {
    userWithOwnedMessages = {};
    userWithOwnedMessages.ownedMessages = [];
  }

  res.json({
    ownedMessages: userWithOwnedMessages.ownedMessages.map((message) =>
      message.toObject({ getters: true })
    ),
  });
};

const createMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { msgBody, owner } = req.body;

  // TODO: Get userId from userData.userId
  const createdMessage = new Message({
    msgBody,
    owner,
    creator: req.userData.userId,
  });

  let creatorUser;
  let ownerUser;
  try {
    // TODO: Get userId from userData.userId
    creatorUser = await User.findById(req.userData.userId);
    ownerUser = await User.findById(owner);
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating message failed, please try again.",
      500
    );
    return next(error);
  }

  if (!creatorUser || !ownerUser) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdMessage.save({ session: sess });
    creatorUser.createdMessages.push(createdMessage);
    await creatorUser.save({ session: sess });
    ownerUser.ownedMessages.push(createdMessage);
    await ownerUser.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating message failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ message: createdMessage });
};

const updateMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs", 422);
  }

  const { msgBody, messageId } = req.body;

  let message;
  try {
    message = await Message.findById(messageId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update message",
      500
    );
    return next(error);
  }

  // TODO: Get userId from userData.userId
  if (message.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "Your are not allowed to edit this message",
      401
    );
    return next(error);
  }

  message.msgBody = msgBody;

  try {
    await message.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update message",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: message.toObject({ getters: true }) });
};

const deleteMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const messageId = req.body.messageId;

  let message;
  try {
    message = await Message.findById(messageId).populate("creator owner");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete message",
      500
    );
    return next(error);
  }

  if (!message) {
    const error = new HttpError("Could not find a message for this id", 404);
    return next(error);
  }

  // TODO: Get userId from userData.userId
  if (message.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "Your are not allowed to delete this message",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await message.remove({ session: sess });
    message.creator.createdMessages.pull(message);
    await message.creator.save();
    message.owner.ownedMessages.pull(message);
    await message.owner.save();
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete message",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Message deleted" });
};

const replyToMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { replyBody, messageId } = req.body;

  let message;
  try {
    message = await Message.findById(messageId).populate("reply");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not reply to message",
      500
    );
    return next(error);
  }

  if (!message) {
    const error = new HttpError("Could not find a message for this id", 404);
    return next(error);
  }

  // TODO: Get userId from userData.userId
  if (message.owner.toString() !== req.userData.userId) {
    const error = new HttpError("Your are not allowed to reply", 401);
    return next(error);
  }

  const createdReply = new Reply({
    replyBody,
    creator: req.userData.userId,
    message: message.id,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdReply.save({ session: sess });
    if (!message.owner.replies) {
      message.owner.replies = [createdReply];
    } else {
      message.owner.replies.push(createdReply);
    }
    message.reply.creator = req.userData.userId;
    message.reply.id = createdReply.id;
    await message.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete message",
      500
    );
    return next(error);
  }

  res.status(201).json({ createdReply });
};

exports.getMessagesByUserId = getMessagesByUserId;
exports.createMessage = createMessage;
exports.updateMessage = updateMessage;
exports.deleteMessage = deleteMessage;
exports.replyToMessage = replyToMessage;
