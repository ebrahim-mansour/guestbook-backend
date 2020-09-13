const express = require("express");
const { check } = require("express-validator");

const messagesController = require("../controllers/messages-controllers");

const router = express.Router();

router.get("/user/:uid", messagesController.getMessagesByUserId);

router.post(
  "/create",
  [check("msgBody").not().isEmpty(), check("owner").not().isEmpty()],
  messagesController.createMessage
);

router.patch(
  "/message",
  [check("msgBody").not().isEmpty(), check("messageId").not().isEmpty()],
  messagesController.updateMessage
);

router.delete(
  "/message",
  [check("messageId").not().isEmpty()],
  messagesController.deleteMessage
);

router.post(
  "/reply",
  [check("replyBody").not().isEmpty(), check("messageId").not().isEmpty()],
  messagesController.replyToMessage
);

module.exports = router;
