const express = require("express");
const { check } = require("express-validator");

const messagesController = require("../controllers/messages-controllers");

const router = express.Router();

router.post(
  "/create",
  [check("msgBody").not().isEmpty(), check("owner").not().isEmpty()],
  messagesController.createMessage
);

router.patch(
  "/message",
  [check("msgBody").not().isEmpty()],
  messagesController.updateMessage
);

router.delete("/message", messagesController.deleteMessage);

module.exports = router;
