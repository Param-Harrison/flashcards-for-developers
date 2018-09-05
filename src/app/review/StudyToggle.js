import React from "react";
import Tooltip from "rc-tooltip";

import * as preferences from "../utils/prefs";
import Toggle from "../../components/Toggle";

class StudyToggle extends React.Component {
  state = { isChecked: true };

  componentDidMount() {
    this.setState({ isChecked: preferences.getSRSPref() });
  }

  onChange = () => {
    this.setState({ isChecked: !this.state.isChecked }, () => {
      preferences.setSRSPref(this.state.isChecked);
      this.props.onChange(this.state.isChecked);
    });
  };

  render() {
    const { isChecked } = this.state;

    const tooltip = (
      <span>Hide cards you've seen recently so you only study your weakest cards.</span>
    );

    return (
      <div className="d-flex align-items-center">
        <Toggle onChange={this.onChange} checked={isChecked} />
        <Tooltip placement="bottom" trigger={["click", "hover", "focus"]} overlay={tooltip}>
          <small className="ml-2" style={{ opacity: 0.4 }}>
            Hide familiar cards{" "}
            <span
              className="fa-stack fa-xs"
              style={{ lineHeight: "1.7em", fontSize: ".65em", opacity: 0.6 }}
            >
              <i className="fas fa-circle fa-stack-2x" />
              <i className="fas fa-info fa-stack-1x fa-inverse" />
            </span>
          </small>
        </Tooltip>
      </div>
    );
  }
}

export default StudyToggle;
