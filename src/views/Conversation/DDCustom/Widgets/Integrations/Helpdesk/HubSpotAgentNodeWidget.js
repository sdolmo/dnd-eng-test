import React from "react";
import _ from "lodash";
import "views/Conversation/DDCustom/Widgets/styles-v2.scss";
import HubSpotIcon from "views/Conversation/images/IconHubspot.svg";

export class HubSpotAgentNodeWidget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      editingAttr: false,
    };

    this.removeQuestionPort = this.removeQuestionPort.bind(this);
    this.remove = this.remove.bind(this);
  }

  remove() {
    const { node, diagramEngine } = this.props;
    node.remove();
    diagramEngine.forceUpdate();
  }

  removeQuestionPort(port) {
    const { node, diagramEngine } = this.props;
    const removePort = node.removePortNode;
    removePort(port);
    diagramEngine.forceUpdate();
  }

  getInputPort() {
    const { node } = this.props;

    const port = node.getInPort();
    const showLinkRoute = port.getShowLinkRoute() && !_.isEqual(port.links, {});
    return (
      <div className="agent-port-input">
        <div
          onMouseEnter={() => {
            if (!_.isEqual(port.links, {}) && !port.getShowLinkRoute()) {
              port.setShowLinkRoute(true);
              this.forceUpdate();
            }
          }}
          onMouseLeave={() => {
            if (port.getShowLinkRoute()) {
              port.setShowLinkRoute(false);
              this.forceUpdate();
            }
          }}
          className={`ball port  ${showLinkRoute ? "show-link" : ""}`}
          data-name={port.getID()}
          data-nodeid={node.getID()}
          id={port.getID()}
        >
          {showLinkRoute && <div className="icon icon--arrow-backward" />}
        </div>
      </div>
    );
  }

  render() {
    const { node } = this.props;
    const { agentTag, hubspotEmail, version } = node;

    let label = "";
    if (version === "V2") {
      label = agentTag;
    } else {
      label = hubspotEmail;
    }

    return (
      <div id="agent-node">
        <div className="agent-node--body">
          <img src={HubSpotIcon} id="hubspot-logo" />
          <p>{label}</p>
          {this.getInputPort()}
        </div>
      </div>
    );
  }
}
