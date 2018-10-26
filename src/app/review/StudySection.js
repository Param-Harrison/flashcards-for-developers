import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import cx from "classnames";
import marked from "marked";

import config from "../../config";

import StudyToggle from "./StudyToggle";
import StudyProgress from "./StudyProgress";
import ReviewResults from "./ReviewResults";
import DeckFeedback from "./DeckFeedback";

import * as analytics from "../../components/GoogleAnalytics";
import * as chance from "../utils/chance";
import * as leitner from "../../spaced/leitner";
import * as localStorage from "../utils/localStorage";

import "./Review.css";

const SELF_GRADE_CORRECT = "I was right";
const SELF_GRADE_INCORRECT = "I was wrong";

const ReviewType = ({ type }) => (
  <div
    className="badge badge-pill badge-light text-secondary position-absolute mr-4"
    style={{ top: "12px", right: "0" }}
  >
    {type}
  </div>
);

const ReportLink = ({ content }) => (
  <a
    href={config.airtableReportUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-reset position-absolute d-flex align-items-center"
    style={{ right: 0, bottom: 0 }}
  >
    <small className="text-muted">{content}</small>
  </a>
);

const filterExpiredCards = (cards, cardProgress) => {
  return cards.filter(card => {
    const cardObj = cardProgress.find(el => el.card === card.id);
    return !!cardObj ? leitner.isExpired(cardObj.leitnerBox, cardObj.reviewedAt) : true;
  });
};

class StudySection extends Component {
  state = {
    index: 0,
    cards: [],
    correctness: [],
    isWrong: false,
    isReversed: false,
    isRevealed: false,
    pageSize: 6,
    page: 0,
    numCorrect: 0,
    numIncorrect: 0,
    selected: {},
    options: [],
  };

  // Lifecycle methods
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.cards !== this.props.cards) {
      const { index } = this.state;
      const { cards, cardProgress } = this.props;
      const isSRS = localStorage.getSRSPref();
      const filteredCards = isSRS ? filterExpiredCards(cards, cardProgress) : cards;
      const shuffledCards = chance.shuffle(filteredCards);
      const options = this.getOptions(index, shuffledCards);

      this.setState({ cards: shuffledCards, options });
    }
  }

  // Key Listeners
  onKeyUp = e => {
    e.preventDefault();
    switch (e.key) {
      case " ": // spacebar key
        return this.onSpaceBarPress();
      case (e.key.match(/^[0-9]$/) || {}).input: // number key
        return this.onOptionPress(e.key);
      default:
        return;
    }
  };

  onKeyDown = e => {
    if (e.key === " ") {
      e.preventDefault();
      return false;
    }
  };

  onOptionPress = key => {
    const index = parseInt(key, 10) - 1;
    if (!this.isStageFinished()) {
      if (index >= 0 && index < this.state.options.length) {
        const answer = this.state.options[index];
        this.onSelectAnswer(answer);
      }
    }
  };

  onSpaceBarPress = () => {
    if (this.isStageFinished()) {
      this.onKeepGoing();
      // stage is finished, Reset correctness array
      this.setState({ correctness: [] });
    } else if (this.isSelfGraded() && !this.state.isRevealed) {
      this.onToggleReveal();
    }
  };

  // Event listeners
  onSelectAnswer = answer => {
    const isSelfGraded = this.isSelfGraded();

    if (isSelfGraded) {
      this.handleSelfGradedAnswer(answer);
    } else {
      this.handleMultipleChoiceAnswer(answer);
    }
  };

  onToggleReveal = () => {
    const { isRevealed, index, cards } = this.state;
    this.setState({ isRevealed: !isRevealed, options: this.getOptions(index, cards) });
  };

  onKeepGoing = () => {
    analytics.logKeepGoingEvent(this.props.deck.id);
    this.setState({ page: this.state.page + 1 });
  };

  onGoBack = () => this.props.history.goBack();

  // Helper methods
  handleMultipleChoiceAnswer = answer => {
    const card = this.getCurrentCard();
    const isCorrect = this.isCorrectAnswer(answer, card);
    this.setState({ selected: answer });

    this.props.onUpdateProgress(card, isCorrect);

    if (isCorrect) {
      this.setState({ correctness: [...this.state.correctness, isCorrect] });
      analytics.logReviewEvent(card.id);
      this.timeout = setTimeout(() => this.handleCorrectAnswer(), 300);
    } else {
      this.handleIncorrectAnswer(card);
    }
  };

  handleSelfGradedAnswer = answer => {
    if (!this.state.isRevealed) {
      return;
    }

    const isCorrect = answer === SELF_GRADE_CORRECT;
    const card = this.getCurrentCard();
    analytics.logReviewEvent(card.id);

    this.props.onUpdateProgress(card, isCorrect);

    this.setState({ correctness: [...this.state.correctness, isCorrect] });

    if (!isCorrect) {
      const numCorrect = this.state.numCorrect - 1;
      const numIncorrect = this.state.numIncorrect + 1;
      this.setState({ numCorrect, numIncorrect });
    }

    this.setState({ selected: answer });
    this.timeout = setTimeout(() => this.handleCorrectAnswer(), 300);
  };

  handleCorrectAnswer = () => {
    const index = Math.min(this.state.index + 1, this.state.cards.length);

    if (this.isStageFinished(index)) {
      this.logReviewEvent(index);
      this.props.onUpdateSession();
    }

    this.setState({
      index,
      selected: {},
      isRevealed: false,
      options: this.getOptions(index, this.state.cards),
      isReversed: this.isReversible(this.props.deck) && chance.bool(),
      numCorrect: this.state.numCorrect + 1,
    });
  };

  handleIncorrectAnswer = card => {
    const numIncorrect = this.state.numIncorrect + 1;
    this.setState({ isWrong: true, numIncorrect }, () => {
      this.timeout = setTimeout(() => this.setState({ isWrong: false }), 500);
    });
  };

  logReviewEvent = index => {
    if (this.isDeckCompleted(index)) {
      analytics.logCompletedEvent(this.props.deck.id);
    } else {
      analytics.logFinishedEvent(this.props.deck.id);
    }
  };

  getOptions = (index, cards) => {
    if (this.isSelfGraded()) {
      return [SELF_GRADE_CORRECT, SELF_GRADE_INCORRECT];
    } else if (this.isMultiple()) {
      return [...new Set(cards.map(el => el.back))].map((el, i) => ({ id: i, back: el }));
    } else {
      const numOptions = Math.min(3, cards.length);
      const shuffledCards = chance.shuffle(cards).slice(0, numOptions);
      const uniqueCards = [...new Set([...shuffledCards, cards[index]])];
      return chance.shuffle(uniqueCards);
    }
  };

  // State helper methods
  getCurrentCard = () => this.state.cards[this.state.index] || {};
  getCardHTML = card => marked(this.state.isReversed ? card.back : card.front);
  getOptionHTML = option => marked(this.state.isReversed ? option.front : option.back || option);
  getPageStart = () => Math.max(Math.floor(this.state.page * this.state.pageSize), 0);
  getPageEnd = () =>
    Math.min(Math.floor((this.state.page + 1) * this.state.pageSize), this.state.cards.length);

  isCollectionPage = () => this.props.match.path === "/collections/:collectionId/review";
  isStageFinished = index =>
    (index || this.state.index) >= Math.min(this.getPageEnd(), this.state.cards.length);
  isDeckCompleted = index => (index || this.state.index) > this.state.cards.length - 1;
  isSelected = option =>
    option.id ? this.state.selected.id === option.id : this.state.selected === option;

  // TODO: MOVE TO OBJECT
  getDeckType = () => (this.isSelfGraded() ? "Self graded" : "Multiple choice");
  isReversible = deck => (deck || this.props.deck).type === "Reversible select";
  isSelfGraded = deck => (deck || this.props.deck).type === "Self graded";
  isImageSelect = deck => (deck || this.props.deck).type === "Image select";
  isMultiple = deck => (deck || this.props.deck).type === "Multiple select";

  isCorrectAnswer = (option, card) => {
    if (this.isSelfGraded()) {
      return option === SELF_GRADE_CORRECT;
    } else if (this.isMultiple()) {
      return option.back === card.back;
    } else {
      return option.id === card.id;
    }
  };

  render() {
    const { pageSize, index, correctness, options, isWrong } = this.state;
    const { deck, cards, isLoading } = this.props;

    const currentCard = this.getCurrentCard();
    const pageEnd = this.getPageEnd();
    const pageStart = this.getPageStart();
    const isStageFinished = this.isStageFinished();
    const isImageSelect = (currentCard.deck || {}).type
      ? this.isImageSelect(currentCard.deck)
      : this.isImageSelect(deck);

    return (
      <div className="container container--narrow py-4">
        <div className="flashcard-container row px-3">
          <div className="d-flex justify-content-between w-100 m-2">
            <StudyToggle onChange={this.props.onSRSToggle} />
            <StudyProgress
              index={index}
              items={cards}
              pageSize={pageSize}
              pageEnd={pageEnd}
              pageStart={pageStart}
              isFinished={isStageFinished}
              correctness={correctness}
            />
          </div>
          <div
            className={cx(
              "wrapper col-12 border border-dark rounded mb-4 py-5 d-flex align-items-stretch",
              {
                shake: isWrong,
              },
            )}
          >
            {!isLoading && (
              <div className="row w-100 mx-0">
                {!isStageFinished ? (
                  <div className="row w-100 mx-0">
                    <ReviewType type={this.getDeckType()} />
                    <div className="col-12 col-lg-6 d-flex align-items-center px-1 pb-2">
                      {isImageSelect ? (
                        <div className="flashcard-body d-flex flex-column border rounded px-3 py-2 w-100 h-100">
                          {this.isCollectionPage() && (
                            <small style={{ opacity: 0.85 }}>{currentCard.deck.name}</small>
                          )}
                          <img
                            className="img-fluid my-2 px-3 mx-auto"
                            alt=""
                            src={currentCard.front}
                          />
                          {this.state.isRevealed && (
                            <div
                              className="markdown-body text-left d-flex align-items-center justify-content-center flex-column mt-3 pt-3"
                              style={{ borderTop: "1px solid #f5f5f5" }}
                              dangerouslySetInnerHTML={{
                                __html: marked(currentCard.back),
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flashcard-body border rounded px-3 py-2 w-100 h-100">
                          {this.isCollectionPage() && (
                            <small style={{ opacity: 0.85 }}>{currentCard.deck.name}</small>
                          )}
                          <div
                            className="markdown-body text-left d-flex align-items-center justify-content-center flex-column my-2"
                            dangerouslySetInnerHTML={{
                              __html: this.getCardHTML(currentCard),
                            }}
                          />
                          {this.state.isRevealed && (
                            <div
                              className="markdown-body text-left d-flex align-items-center justify-content-center flex-column mt-3 pt-3"
                              style={{ borderTop: "1px solid #f5f5f5" }}
                              dangerouslySetInnerHTML={{
                                __html: marked(currentCard.back),
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-lg-6 d-flex flex-column align-items-stretch px-1 pb-1">
                      {options.map((option, key) => (
                        <div
                          key={option.id || option}
                          onClick={() => this.onSelectAnswer(option)}
                          className={cx(
                            "flashcard-option border rounded d-flex align-items-start p-3 w-100",
                            {
                              "flashcard-option--disabled":
                                this.isSelfGraded() && !this.state.isRevealed,
                              "border-success text-success":
                                this.isSelected(option) &&
                                this.isCorrectAnswer(option, currentCard),
                              "border-danger text-danger":
                                this.isSelected(option) &&
                                !this.isCorrectAnswer(option, currentCard),
                            },
                          )}
                        >
                          <div className="border rounded mr-3 px-2" style={{ fontSize: ".9em" }}>
                            {key + 1}
                          </div>
                          <div
                            className="markdown-body text-left bg-white w-100"
                            dangerouslySetInnerHTML={{
                              __html: this.getOptionHTML(option),
                            }}
                          />
                        </div>
                      ))}
                      {this.isSelfGraded() &&
                        !this.state.isRevealed && (
                          <button
                            className="btn btn-reset border rounded"
                            onClick={this.onToggleReveal}
                          >
                            Press space to show answer
                          </button>
                        )}
                    </div>
                    <ReportLink content="Report a problem" />
                  </div>
                ) : (
                  <ReviewResults
                    index={this.state.index}
                    cards={this.state.cards}
                    numCorrect={this.state.numCorrect}
                    numIncorrect={this.state.numIncorrect}
                    cardProgress={this.props.cardProgress}
                    onKeepGoing={this.onKeepGoing}
                    onGoBack={this.onGoBack}
                  />
                )}
              </div>
            )}
            {isLoading && (
              <div className="text-center w-100">
                <h6 className="text-center text-secondary">
                  <i className="fas fa-spinner fa-spin mr-1" />
                  Loading cards...
                </h6>
              </div>
            )}
          </div>
          {!isLoading && (
            <div className="w-100">
              <DeckFeedback deck={deck} isCompleted={this.isDeckCompleted()} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(StudySection);
