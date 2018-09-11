const express = require("express");

const isAuthenticated = require("./middleware/isAuthenticated");
const UsersController = require("./controllers/UsersController");
const CardsController = require("./controllers/CardsController");
const DecksController = require("./controllers/DecksController");
const CollectionsController = require("./controllers/CollectionsController");

const router = express.Router();

router.get("/hello", (req, res) => res.send({ message: "Hello world!" }));

router.get("/api/decks", DecksController.getDecks);

router.get("/api/decks/:deckId", DecksController.getDeck);

router.get("/api/collections/:collectionId", CollectionsController.getCollection);

router.get("/api/cards", CardsController.getCards);

router.post("/auth/github", UsersController.getGithubUser);

router.get("/users/saved_decks", isAuthenticated, UsersController.getSavedDecks);
router.put("/users/saved_decks", isAuthenticated, UsersController.addSavedDeck);
router.delete("/users/saved_decks", isAuthenticated, UsersController.removeSavedDeck);

router.get("/users/study_sessions", isAuthenticated, UsersController.getStudySessions);
router.put("/users/study_sessions", isAuthenticated, UsersController.addStudySession);

router.get("/users/study_progress", isAuthenticated, UsersController.getStudyProgress);
router.get("/users/study_progress/:deckId", isAuthenticated, UsersController.getDeckStudyProgress);
router.put("/users/study_progress/:deckId", isAuthenticated, UsersController.addDeckStudyProgress);
router.delete("/users/study_progress", isAuthenticated, UsersController.deleteStudyProgress);

module.exports = router;
