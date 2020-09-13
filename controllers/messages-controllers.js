const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Message = require("../models/message");
const User = require("../models/user");

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
    creator: "5f5df4a1b7d59737d0bb07ca",
  });

  let creatorUser;
  let ownerUser;
  try {
    // TODO: Get userId from userData.userId
    creatorUser = await User.findById("5f5df4a1b7d59737d0bb07ca");
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

exports.createMessage = createMessage;
