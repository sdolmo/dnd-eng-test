import React, { useEffect, useState } from "react";
import getLanguage from "getLanguage.js";
import languages from "./languages";
import constants from "../../assets/constants";
import { CAMPAIGN_GOAL_OPTIONS, TARGET_EVENT_OPTIONS } from "./mappers";
import "./HSMX2Modal.scss";
import { Modal, Slider } from "antd";
import * as linkify from "linkifyjs";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import SelectDropdown from "Components/SelectDropdown";
import TextInput from "Components/TextInput";
import NewComponentPill from "Components/NewComponentPill";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { operations } from "views/Conversation/duck";
import { HSMNodeModel } from "views/Conversation/DDCustom/main";
import { DefaultNodeModel } from "../../DDCanvas/main";
import events from "utils/events";

const language = languages[getLanguage()];

const HSMX2Modal = (props) => {
  const initialState = {
    timeIntervalUnit: "",
    timeIntervalNumber: "",
    searchbarHsm: "",
    selectedHsm: "",
  };

  const [state, setState] = useState(initialState);
  const dispatch = useDispatch();

  useEffect(() => {
    const currentGoalMeasurement = props.node.getGoalMeasurement();

    if (props.configured) {
      setState({
        ...state,
        selectedHsm: currentGoalMeasurement.selectedHsm,
        targetEvents: currentGoalMeasurement.targetEvents,
      });
    } else if (props.node.hsm && props.node.hasButtonLink()) {
      setState({
        ...state,
        targetEvents: [
          {
            type: constants.TARGET_EVENT_BUTTON_LINK,
            url: props.node.hsm.buttons.options[0].target_url,
            expectationValue: 80,
          },
        ],
      });
    }

    return () => {
      setState({
        ...state,
        ...initialState,
      });
    };
  }, [props.show]);

  const addNode = (NodeClass, ...params) => {
    let diagramModel = props.diagramEngine.getDiagramModel();

    let nodeModel = new NodeClass(...params);
    nodeModel.x = -(diagramModel.offsetX - 500);
    nodeModel.y = -(diagramModel.offsetY - 200);

    diagramModel.addNode(nodeModel);

    return nodeModel;
  };

  const validForm =
    state.selectedHsm && state.timeIntervalUnit && state.timeIntervalNumber;

  const createNewHSM = () => {
    const filteredHsms = props.hsmList.filter(
      (hsm) => hsm.id === state.selectedHsm
    );
    const hsm = filteredHsms[0];

    addNode(HSMNodeModel, hsm);

    props.diagramEngine.forceUpdate();
    props.setConfigured();
  };

  const renderTriggerComponent = (value, content, defaultValue) => {
    return (
      <button className={`${value ? "selected" : ""}`}>
        <p className="r">{value || defaultValue}</p>
        {value ? <p>{content}</p> : null}
        <div className="dropdown-arrow" />
      </button>
    );
  };

  const renderSearchbar = () => {
    return (
      <div className="searchbar">
        <p className="control has-icons-left has-icons-right">
          <TextInput
            className="input"
            type="text"
            onChange={({ target: { value } }) => {
              setState({ searchbarHsm: value });
            }}
            value={state.searchbarHsm}
            trackMessage="Search HSM to add"
            placeholder={language.hsmPH}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-search"></i>
          </span>
        </p>
      </div>
    );
  };

  const renderDropdownItemHSM = (itemName, itemContent, selectedValue) => {
    return (
      <>
        <p className="r lh-22">
          {itemName}
          <br />
          {itemContent}
        </p>
      </>
    );
  };

  const getModalBody = () => {
    return (
      <div className="new-hsmx2-body">
        <div className="hsmx2-instruction">{language.instructionHSMx2}</div>
        <div className="choice-hsmx2-template-container">
          <p>{language.selectHSMx2Template}</p>
          <SelectDropdown
            options={props.hsmList}
            display={(item) => renderDropdownItemHSM(item.name, item.content)}
            onSelect={(target) => {
              setState({ ...state, selectedHsm: target.id });
            }}
            triggerComponent={renderTriggerComponent(
              props.hsmList.filter((e) => e.id == state.selectedHsm)[0]?.name,
              props.hsmList.filter((e) => e.id == state.selectedHsm)[0]
                ?.content,
              language.selectHSMx2Option
            )}
          ></SelectDropdown>
        </div>
        <div className="dashed-divider"></div>
        <div className="define-hsmx2-interval-container">
          <p className="define-variables-title">
            {language.defineHSMx2Interval}
          </p>
          <div className="hsmx2-interval-container">
            <p>La segunda plantilla HSM se enviará después de:</p>
            <TextInput
              className="time"
              placeholder={`10`}
              type="text"
              onChange={(e) => {
                setState({ ...state, timeIntervalNumber: e.target.value });
              }}
              value={state.timeIntervalNumber}
            />
            <SelectDropdown
              options={["Minutos", "Horas"]}
              display={(item) => <div>{item}</div>}
              onSelect={(target) => {
                setState({ ...state, timeIntervalUnit: target });
              }}
            ></SelectDropdown>
          </div>
        </div>
      </div>
    );
  };
  const renderFooter = () => {
    return (
      <div className="create-buttons-container">
        <button
          className={`create-goal-now ${validForm && "is-valid"}`}
          onClick={createNewHSM}
          disabled={!validForm}
        >
          <p>{language.createHSMx2}</p>
        </button>
        <a className="cancel">{language.cancel}</a>
      </div>
    );
  };

  return (
    <Modal
      title={"HSM x2"}
      wrapClassName="create-hsmx2-modal"
      footer={renderFooter()}
      visible={props.show}
      onCancel={props.closeModal}
      closeIcon={<div className="close-icon"></div>}
      maskClosable={false}
      centered
      closable={
        props.configured || !props.node.hsm || !props.node.hasButtonLink()
      }
    >
      {getModalBody()}
    </Modal>
  );
};

export default HSMX2Modal;
