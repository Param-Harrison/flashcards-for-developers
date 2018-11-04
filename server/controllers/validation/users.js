const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  getGithubUser: {
    code: Joi.string().required(),
  },
  createGithubUser: {
    email: Joi.string()
      .email()
      .required(),
    name: Joi.string().required(),
    avatar_url: Joi.string(),
    github_id: Joi.number().required(),
    email_notification: Joi.boolean(),
  },
  addPinnedDecks: {
    decks: Joi.array()
      .items(Joi.objectId())
      .required(),
  },
  removePinnedDeck: {
    deck: Joi.objectId().required(),
  },
  addStudySessions: {
    dates: Joi.array()
      .items(Joi.string())
      .required(),
  },
  addDeckStudyProgress: {
    card: Joi.objectId().required(),
    reviewedAt: Joi.string().required(),
    isCorrect: Joi.boolean(),
  },
  updateUserProfile: {
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
    username: Joi.string().allow(""),
    email_notification: Joi.boolean(),
  },
};
