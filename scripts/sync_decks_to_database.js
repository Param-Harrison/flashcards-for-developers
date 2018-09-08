process.env.NODE_ENV = "development";

const Airtable = require("airtable");
const mongoose = require("mongoose");

const Deck = require("../server/models/Deck");
const config = require("../config/index");

const base = new Airtable({ apiKey: config.airtableApiKey }).base(config.airtableApiId);

mongoose.set("useFindAndModify", false);

const getDeckFromRecord = record => ({
  airtableId: record.id,
  name: record.get("Name"),
  description: record.get("Description"),
  type: record.get("Type"),
  source: record.get("Source"),
  difficulty: record.get("Difficulty"),
  stars: record.get("Stars"),
  createdTime: record.get("Created time"),
  upvotes: record.get("Upvotes"),
  downvotes: record.get("Downvotes"),
  new: record.get("New") || false,
});

// Fetches 'Deck' records from Airtable
const fetchDecks = async () => {
  const results = [];
  await base("Decks")
    .select()
    .eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        results.push(getDeckFromRecord(record));
      });
      fetchNextPage();
    });
  return results;
};

// Creates copy of record in the database
const writeDecksToDatabase = async decks => {
  decks.forEach(async deck => {
    await Deck.findOneAndUpdate({ airtableId: deck.airtableId }, { ...deck }, { upsert: true });
  });

  return await Deck.countDocuments();
};

async function sync_decks_to_database() {
  try {
    const decks = await fetchDecks();

    const deckCount = await writeDecksToDatabase(decks);

    console.log("Success! Number of decks written: ", deckCount);
  } catch (error) {
    console.log(error);
  }
}

sync_decks_to_database();
