import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import cookie from "js-cookie";
import Tooltip from "rc-tooltip";

import * as analytics from "../components/GoogleAnalytics";
import isAuthenticated from "./utils/isAuthenticated";
import Octicon from "../components/Octicon";
import LoginModal from "./auth/LoginModal";

const title = "Ridiculously helpful collection of flashcards for developers ";

const LogoutTooltip = () => (
  <Link
    className="bg-light text-secondary"
    onClick={() => analytics.logUserAction("Clicked 'Logout'")}
    to="/logout"
  >
    Logout
  </Link>
);

class Header extends Component {
  state = { showModal: false };

  onToggleModal = () => this.setState({ showModal: !this.state.showModal });

  render() {
    const authenticated = isAuthenticated();
    const user = authenticated ? JSON.parse(cookie.get("user")) : {};
    const isHomePage = this.props.location.pathname === "/";

    return (
      <div className="header">
        <LoginModal isOpen={this.state.showModal} onClose={this.onToggleModal} />
        <div className="container container--full d-flex justify-content-between align-items-center py-2 w-100">
          <div>
            {!isHomePage && (
              <Link
                to={{ pathname: "/", search: this.props.location.search }}
                className="d-flex align-items-center font-weight-medium text-dark p-2"
              >
                <Octicon name="chevron-left" className="d-flex mr-1" />
                <span className="d-none d-sm-inline">Flashcards for Developers</span>
              </Link>
            )}
          </div>
          <ul className="p-0 m-0">
            <li className="list-inline-item">
              <FacebookShareButton
                className="share-button p-2"
                url="http://www.flashcardsfordevelopers.com"
                quote={title}
                onShareWindowClose={() => analytics.logFacebookShare()}
                style={{ cursor: "pointer" }}
              >
                <i className="fab fa-facebook" />
              </FacebookShareButton>
            </li>
            <li className="list-inline-item">
              <TwitterShareButton
                className="share-button p-2"
                url="http://www.flashcardsfordevelopers.com"
                title={title}
                onShareWindowClose={() => analytics.logTwitterShare()}
                style={{ cursor: "pointer" }}
              >
                <i className="fab fa-twitter" />
              </TwitterShareButton>
            </li>
            <li className="header-login list-inline-item ml-2">
              {authenticated ? (
                <Tooltip
                  placement="bottomRight"
                  trigger={["click"]}
                  overlay={<LogoutTooltip />}
                  id="header-logout"
                >
                  <img
                    src={user.avatar_url}
                    alt="User profile"
                    className="rounded rounded-circle"
                  />
                </Tooltip>
              ) : (
                <button
                  className="btn btn-sm btn-outline-dark d-flex px-3 py-2"
                  onClick={this.onToggleModal}
                >
                  <small className="font-weight-bold">LOGIN</small>
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
