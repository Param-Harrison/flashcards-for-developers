const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = {
  getCardsQuery: {
    deck: Joi.objectId(),
    collection: Joi.string(),
    deckIds: [Joi.objectId(), Joi.array().items(Joi.objectId())],
  },
  createCard: {
    deck: Joi.objectId().required(),
    front: Joi.string(),
    back: Joi.string(),
  },
  deleteCard: {
    cardId: Joi.objectId().required(),
  },
};
