const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  getDecksQuery: {
    collection: Joi.objectId(),
    ids: Joi.string(),
  },
  createDeck: {
    name: Joi.string().required(),
    description: Joi.string().allow(""),
  },
  getDeckParams: {
    deckId: Joi.objectId().required(),
  },
  getDecksIds: Joi.array().items(Joi.objectId()),
  updateDeck: {
    name: Joi.string().required(),
    description: Joi.string().allow(""),
  },
};
