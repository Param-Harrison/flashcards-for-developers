const Joi = require("joi");

module.exports = {
  signupUser: {
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
  loginUser: {
    body: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
  githubUser: {
    body: Joi.object().keys({
      code: Joi.string().required(),
    }),
  },
  setSavedDecks: {
    body: Joi.object().keys({
      decks: Joi.array().items(Joi.string()),
    }),
  },
  setStudyHistory: {
    body: Joi.object().keys({
      date: Joi.string().required(),
    }),
  },
};
