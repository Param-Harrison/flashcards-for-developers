import React from "react";
import { Link } from "react-router-dom";

import * as analytics from "../components/GoogleAnalytics";
import * as api from "../app/apiActions";
import isAuthenticated from "../app/utils/isAuthenticated";
import LoginModal from "../app/auth/LoginModal";

const CheckMark = ({ hidden }) => (
  <i
    className="fas fa-check fa-lg text-success mr-2"
    style={{ visibility: hidden ? "hidden" : "visible" }}
  />
);

class Membership extends React.Component {
  state = { showModal: false, isSubmitted: false };

  onOpenModal = () => {
    analytics.logMembershipAction("Click 'Upgrade' button");
    this.setState({ showModal: true });
  };

  onCloseModal = () => {
    if (!this.state.isSubmitted) {
      analytics.logMembershipAction("Closed 'Upgrade' modal");
    }
    this.setState({ showModal: false });
  };

  onSubmitModal = event => {
    event.preventDefault();
    const { value } = event.target.querySelector("input");

    api
      .subscribeUser(value)
      .then(response => {
        analytics.logMembershipAction("Submitted 'Upgrade' email");
        this.setState({ isSubmitted: true });
      })
      .catch(error => {
        analytics.logMembershipAction("Error on subscription");
        this.setState({ showModal: false });
      });
  };

  render() {
    const authenticated = isAuthenticated();

    return (
      <div className="bg-light" style={{ borderBottom: "1px solid #e9ecef" }}>
        <LoginModal isOpen={this.state.showModal} onClose={this.onCloseModal} />

        <div className="bg-white border border-muted">
          <div className="container container--full py-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center my-4">
              <div style={{ fontSize: "28px" }}>
                <h1 className="font-weight-bold m-0">Level Up Your Developer Career</h1>
                <p
                  className="text-muted font-weight-light"
                  style={{ fontSize: "18px", lineHeight: "1.2em" }}
                >
                  Pro features give you unlimited access to content and more features.
                </p>
              </div>

              <div className="bg-light border border-muted px-4 py-4 rounded m-3 ">
                <div className="d-flex justify-content-center align-items-center">
                  <div className="text-dark font-weight-bold" style={{ fontSize: "3em" }}>
                    $6
                  </div>
                  <div className="d-flex flex-column ml-2">
                    <div className="text-primary font-weight-medium" style={{ lineHeight: "1em" }}>
                      Per Month
                    </div>
                    <small className="text-muted font-weight-medium">BILLED MONTHLY</small>
                  </div>
                </div>
                {authenticated ? (
                  <Link
                    to="/pages/membership/new"
                    className="bg-primary text-white btn text-center font-weight-medium py-2 px-5"
                  >
                    Upgrade to Pro
                  </Link>
                ) : (
                  <div className="text-center" style={{ lineHeight: "1em", maxWidth: "350px" }}>
                    <small className="text-muted">
                      <strong className="text-dark">
                        Pro subscriptions are only available to logged in users.
                      </strong>{" "}
                      <span
                        className="text-primary font-weight-medium"
                        onClick={this.onOpenModal}
                        style={{ cursor: "pointer" }}
                      >
                        Sign up now
                      </span>{" "}
                      to get started.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container container--full">
          <div className="row mt-5">
            <div className="col-md-6 col-lg-4 offset-lg-2 my-3">
              <div className="bg-white rounded p-5 border border-muted bg-shadow">
                <div className="text-center mb-4">
                  <span
                    className="border border-muted text-muted rounded px-4 py-2 font-weight-medium"
                    style={{ fontSize: "1.5em" }}
                  >
                    BASIC
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-tier">
                    <CheckMark />
                    <span>Spaced repetition</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Pinned decks</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Review history</span>
                  </div>
                  <div className="text-tier text-faded">
                    <CheckMark hidden />
                    <span>Create your own decks</span>
                  </div>
                  <div className="text-tier text-faded">
                    <CheckMark hidden />
                    <span>Pro-only decks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 my-3">
              <div
                className="bg-blueLight rounded p-5 bg-shadow"
                style={{ border: "1px solid #c0ddff" }}
              >
                <div className="text-center mb-4">
                  <span
                    className="bg-primary text-white rounded px-4 py-2 font-weight-medium"
                    style={{ fontSize: "1.5em" }}
                  >
                    PRO
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-tier">
                    <CheckMark />
                    <span>Spaced repetition</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Pinned decks</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Review history</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Create your own decks</span>
                  </div>
                  <div className="text-tier">
                    <CheckMark />
                    <span>Pro-only decks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-md-5 row mt-5">
            <div className="col-12">
              <div className="d-flex mt-5" style={{ fontSize: "25px" }}>
                <span className="mt-2 mr-3" style={{ fontSize: "40px" }}>
                  <i className="far fa-gem" />
                </span>
                <h1 className="font-weight-bold">
                  Level up your programming skills for the cost of a lunch per month
                </h1>
              </div>
              <div className="col-12">
                <div className="bg-white rounded border bg-shadow py-3 px-5 mt-3">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="text-dark font-weight-bold" style={{ fontSize: "3em" }}>
                        $6
                      </div>
                      <div className="d-flex flex-column ml-2">
                        <div
                          className="text-primary font-weight-medium"
                          style={{ lineHeight: "1em" }}
                        >
                          Per Month
                        </div>
                        <small className="text-muted font-weight-medium">BILLED MONTHLY</small>
                      </div>
                    </div>
                    {authenticated ? (
                      <Link
                        to="/pages/membership/new"
                        className="bg-primary text-white btn text-center font-weight-medium py-2 px-3"
                      >
                        Upgrade to Pro
                      </Link>
                    ) : (
                      <div className="text-center" style={{ lineHeight: "1em", maxWidth: "350px" }}>
                        <small className="text-muted">
                          <strong className="text-dark">
                            Pro subscriptions are only available to logged in users.
                          </strong>{" "}
                          <span
                            className="text-primary font-weight-medium"
                            onClick={this.onOpenModal}
                            style={{ cursor: "pointer" }}
                          >
                            Sign up now
                          </span>{" "}
                          to get started.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row my-5 py-5">
            <div className="col-12 my-5">
              <div className="text-center text-uppercase text-muted font-weight-medium">
                Frequently Asked Questions
              </div>
              <div className="text-center text-muted font-weight-medium">
                Questions? <a href="mailto:hello@flashcardsfordevelopers.com">Contact us</a>
              </div>
            </div>
            <div className="col-sm-4 mb-3">
              <h5>What is a deck?</h5>
              <p>
                A deck is a collection of related flashcards. They often represent a single subject
                that you can study. For example, you could study our Big-O notation deck.
              </p>
            </div>
            <div className="col-sm-4 mb-3">
              <h5>What is spaced repetition?</h5>
              <p>
                Flashcards are scheduled at increasing intervals to improve your ability to recall
                and reduce the effort learning them. This technique, called spaced repetition, is a
                proven way to study effectively.
              </p>
            </div>
            <div className="col-sm-4 mb-3">
              <h5>What is review history?</h5>
              <p>
                Your review history is a snapshot of your study activity. You can view a living
                history of your study habits. We provide a limited history for free plans, with
                extended histories for our Pro plan.
              </p>
            </div>
            <div className="col-sm-4 mb-3">
              <h5>What are pinned decks?</h5>
              <p>
                Pinned decks are favorite decks you want to keep studying. They are easier to find
                and can be studied all at once.
              </p>
            </div>
            <div className="col-sm-4 mb-3">
              <h5>What are Pro-only decks?</h5>
              <p>
                Pro-only decks are collections of pre-made flashcards that are only visible to Pro
                members. These decks contain higher quality custom-made concepts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Membership;
