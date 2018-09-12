import React, { Component } from "react";
import queryString from "query-string";

import config from "../../config";
import isAuthenticated from "../utils/isAuthenticated";
import * as api from "../apiActions";
import * as analytics from "../../components/GoogleAnalytics";
import * as localStorage from "../utils/localStorage";

import Octicon from "../../components/Octicon";
import SkillProgress from "./SkillProgress";
import HabitTracker from "./HabitTracker";
import FeedbackForm from "./FeedbackForm";
import DeckItem from "./DeckItem";

const HOMEPAGE_COLLECTION_ID = "5b92fc84695afe81b2ed6914";

const TABS = { ALL: "all", USER: "user" };

class Decks extends Component {
  state = {
    collection: {},
    decks: [],
    isLoading: true,
    isError: false,
    activeTab: TABS.ALL,
    savedDecks: [],
    studyProgress: [],
  };

  componentWillMount() {
    document.title = "Flashcards for Developers";
    const searchParams = queryString.parse(this.props.location.search);

    if (searchParams.beta) {
      this.fetchDecks();
    } else {
      this.fetchCollection(HOMEPAGE_COLLECTION_ID);
    }

    this.fetchSavedDecks();
    this.fetchStudyProgress();
  }

  onToggleSave = (event, deck) => {
    event.preventDefault();
    const isSaved = this.isSaved(deck.id);

    analytics.logSaveDeckAction(deck.name, isSaved);

    this.saveDeck(deck, isSaved);
  };

  sortDecks = decks => [...decks].sort((a, b) => b.new - a.new);

  fetchCollection = id => {
    api.fetchCollection(id).then(({ data }) => {
      this.setState({ collection: data }, () => this.fetchDecks(data));
    });
  };

  fetchDecks = collection => {
    api.fetchDecks(collection.id).then(
      ({ data }) => {
        this.setState({ decks: this.sortDecks(data), isLoading: false });
      },
      error => this.setState({ isError: true, isLoading: false }),
    );
  };

  fetchSavedDecks = () => {
    if (isAuthenticated()) {
      api.fetchSavedDecks().then(({ data }) => {
        this.setState({ savedDecks: data });
      });
    } else {
      this.setState({ savedDecks: localStorage.getSavedDecks() });
    }
  };

  fetchStudyProgress = () => {
    if (isAuthenticated()) {
      api
        .fetchStudyProgress()
        .then(response => this.setState({ studyProgress: response.data }))
        .catch(this.handleError);
    } else {
      this.setState({ studyProgress: localStorage.getStudyProgress() });
    }
  };

  saveDeck = (deck, isSaved) => {
    if (isAuthenticated()) {
      api
        .toggleSavedDeck(deck.id, isSaved)
        .then(response => this.setState({ savedDecks: response.data }))
        .catch(this.handleError);
    } else {
      this.setState({ savedDecks: localStorage.toggleSavedDeck(deck.id, isSaved) });
    }
  };

  handleError = error => console.error(error);

  isSaved = id => this.state.savedDecks.includes(id);
  getDeckProgress = id => this.state.studyProgress.find(el => el.deck === id);

  render() {
    const { location } = this.props;
    const { decks, isLoading, isError, savedDecks, studyProgress, activeTab } = this.state;

    if (isLoading) {
      return (
        <div className="container p-4 my-5">
          <div className="mb-5">
            <h1 className="m-0">Flashcards for Developers</h1>
            <p>A curated list of flashcards to boost your professional skills</p>
          </div>
          <h1 className="text-secondary">Loading decks...</h1>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="container p-4 my-5">
          <div className="mb-5">
            <h1 className="m-0">Flashcards for Developers</h1>
            <p>A curated list of flashcards to boost your professional skills</p>
          </div>
          <div className="text-center mt-3">
            <h1 className="text-dark">Unable to load request</h1>
            <p>Please try again or contact us.</p>
          </div>
        </div>
      );
    }

    const filteredDecks =
      activeTab === TABS.USER ? decks.filter(el => savedDecks.includes(el.id)) : decks;

    return (
      <div className="container container--full px-4 my-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
          <div className="mb-3">
            <h1 className="m-0">Flashcards for Developers</h1>
            <p className="m-0">A curated list of flashcards to boost your professional skills</p>
          </div>
          <div
            className="bg-light rounded p-3 mb-2 border border-secondary d-flex align-items-center"
            style={{ minWidth: "260px", minHeight: "90px" }}
          >
            {activeTab === TABS.USER ? (
              <SkillProgress decks={filteredDecks} studyProgress={studyProgress} />
            ) : (
              <HabitTracker />
            )}
          </div>
        </div>
        <div className="d-flex mx-2">
          <div
            className="btn btn-reset px-2 py-1 m-1 rounded-0"
            onClick={() => this.setState({ activeTab: TABS.ALL })}
          >
            <small
              className="text-uppercase font-weight-medium"
              style={{ opacity: activeTab === TABS.ALL ? 1 : 0.5 }}
            >
              All Decks
            </small>
          </div>
          <div
            className="btn btn-reset px-2 py-1 m-1 rounded-0"
            onClick={() => this.setState({ activeTab: TABS.USER })}
          >
            <small
              className="text-uppercase font-weight-medium"
              style={{ opacity: activeTab === TABS.USER ? 1 : savedDecks.length > 0 ? 0.5 : 0.2 }}
            >
              My Decks {savedDecks.length > 0 && <span>{savedDecks.length}</span>}
            </small>
          </div>
        </div>
        <hr className="mb-2 mt-0" />
        {filteredDecks.length > 0 ? (
          <div className="row pt-1">
            {filteredDecks.map(deck => (
              <DeckItem
                deck={deck}
                deckProgress={this.getDeckProgress(deck.id)}
                key={deck.id}
                location={location}
                isSaved={this.isSaved(deck.id)}
                onToggleSave={this.onToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="w-100 text-center my-5 pb-5" style={{ minHeight: "30vh" }}>
            <span className="pb-5" style={{ opacity: 0.3 }}>
              No currently saved decks
            </span>
          </div>
        )}
        {activeTab === TABS.ALL && (
          <div className="row d-flex justify-content-center mt-2 mb-5">
            <a
              className="text-dark d-flex align-items-center btn btn-outline-dark"
              href={config.airtableSuggestionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderRadius: "999px" }}
            >
              <Octicon className="d-flex mr-2" name="plus" />
              <span>Suggest a deck</span>
            </a>
          </div>
        )}
        <div className="row">
          <div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2 mt-5">
            <FeedbackForm />
          </div>
        </div>
      </div>
    );
  }
}

export default Decks;
