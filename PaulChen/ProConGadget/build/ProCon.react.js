function distance_of_time_in_words(from){
    var to = new Date().getTime();
    if (to < from){
        to = from;
    }
    seconds_ago = ((to - from)/1000);
    minutes_ago = Math.floor(seconds_ago/60);
    if (minutes_ago === 0){
        return " less than a minute";
    } else if (minutes_ago === 1){
        return " a minute";
    } else if (minutes_ago < 45){
        return " " + minutes_ago + " minutes";
    } else if (minutes_ago < 90){
        return " about 1 hour";
    } else if (minutes_ago < 1440){
        return " about " + Math.round(minutes_ago/60) + " hours";
    } else if (minutes_ago < 2880){
        return " 1 day";
    } else if (minutes_ago < 43200){
        return " " + Math.round(minutes_ago/1440) + " days";
    } else if (minutes_ago < 86400){
        return " about 1 month";
    } else if (minutes_ago < 525960){
        return " " + Math.round(minutes_ago/43200) + " months";
    } else if (minutes_ago < 1051920){
        return " about 1 year";
    } else {
        return " over " + Math.round(minutes_ago/525960) + " years";
    }
}

function guid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function adjustHeight(){
  var initHeight = 400;
  var height = $("#ProConGadget").height();
  if (height > initHeight) {
    gadgets.window.adjustHeight();
  }
}

function getCreatorFullName(creatorId){
  var fullName = "PLACEHOLDER";
  if (typeof(wave) != "undefined" && wave && wave.getParticipantById(creatorId)) {
    fullName = wave.getParticipantById(creatorId).displayName_;
  }
  return fullName;
}

function createProConData(content, creatorId) {
  return {id: guid(), creatorId: creatorId, createdDate: new Date(), content: content};
}

function init(ReactBootstrap, jQuery){
  var NewItemModal = React.createClass({displayName: "NewItemModal",
    getInitialState() {
      return {content: ""};
    },

    save: function() {
      var newContent = this.state.content.trim();
      this.setState({content: ""});
      if (newContent != "") {
        this.props.saveCB(newContent);
      }
    },

    cancel: function() {
      this.setState({content: ""});
      this.props.cancelCB();
    },

    contentChanged: function(e) {
      this.setState({content: e.target.value});
    },

    render: function() {
      var Modal = ReactBootstrap.Modal;
      var Button = ReactBootstrap.Button;
      return (
        React.createElement(Modal, {bsSize: "small", show: this.props.show, onHide: this.cancel}, 
          React.createElement(Modal.Header, null, 
            React.createElement(Modal.Title, null, this.props.title)
          ), 
          React.createElement(Modal.Body, null, 
            React.createElement("textarea", {style: {width: "100%", resize: "none", height: "100px"}, onChange: this.contentChanged, value: this.state.content})
          ), 
          React.createElement(Modal.Footer, null, 
            React.createElement(Button, {onClick: this.save}, "Save"), 
            React.createElement(Button, {onClick: this.cancel}, "Cancel")
          )
        )
      );
    }
  });

  var EditItemModal = React.createClass({displayName: "EditItemModal",
    getInitialState() {
      return {content: this.props.content};
    },

    save: function() {
      var newContent = this.state.content.trim();
      if (newContent != "") {
        this.props.saveCB(newContent);
      }
    },

    deleteT: function() {
      this.props.deleteCB();
    },

    cancel: function() {
      this.props.cancelCB();
    },

    contentChanged: function(e) {
      this.setState({content: e.target.value});
    },

    render: function() {
      var Modal = ReactBootstrap.Modal;
      var Button = ReactBootstrap.Button;
      return (
        React.createElement(Modal, {bsSize: "small", show: this.props.show, onHide: this.cancel}, 
          React.createElement(Modal.Header, null, 
            React.createElement(Modal.Title, null, this.props.title)
          ), 
          React.createElement(Modal.Body, null, 
            React.createElement("textarea", {style: {width: "100%", resize: "none", height: "100px"}, onChange: this.contentChanged, value: this.state.content})
          ), 
          React.createElement(Modal.Footer, null, 
            React.createElement(Button, {onClick: this.deleteT}, "Delete"), 
            React.createElement(Button, {onClick: this.save}, "Save"), 
            React.createElement(Button, {onClick: this.cancel}, "Cancel")
          )
        )
      );
    }
  });

  var TitleColumn = React.createClass({displayName: "TitleColumn",
    getInitialState: function(){
      return {show: false};
    },

    hideModal: function(){
      this.setState({show: false});
    },

    clickHandler: function(){
      this.setState({show: true});
    },

    deleteTopic: function(){
      var isOk = confirm("Are you sure you want to delete Test and the related pro/con opinions?");
      if (isOk) this.props.deleteTopicCB(this.props.id);
      this.hideModal();
    },

    updateTopic: function(newTopicTitle){
      this.props.updateTitleCB(newTopicTitle.trim());
      this.hideModal();
    },

    render : function(){
      return (
        React.createElement("td", {className: "OptionData", style: {cursor: "pointer"}, onClick: this.clickHandler}, 
          React.createElement("span", null, this.props.title), 
          React.createElement(EditItemModal, {title: "Edit Topic", content: this.props.title, show: this.state.show, saveCB: this.updateTopic, cancelCB: this.hideModal, deleteCB: this.deleteTopic})
        )
      );
    }
  });

  var AddProBtn = React.createClass({displayName: "AddProBtn",
    getInitialState: function(){
      return {opacity: 0, show: false};
    },

    showBtn: function(event){
      this.setState({opacity: 1});
    },

    hideBtn: function(event){
      this.setState({opacity: 0});
    },

    clickHandler: function(){
      this.setState({show: true});
    },

    hideModal: function(){
      this.setState({show: false});
    },

    addPro: function(newContent){
      var creatorId = "";
      if (typeof(wave) != "undefined" && wave && wave.getViewer()) {
        creatorId = wave.getViewer().id_;
      }
      this.props.addProCB(createProConData(newContent, creatorId));
      this.hideModal();
    },

    render: function(){
      return (
        React.createElement("div", {className: "ProConOption", onMouseOver: this.showBtn, onMouseLeave: this.hideBtn, onClick: this.clickHandler, style: {opacity: this.state.opacity}}, 
          React.createElement("table", {style: {width: "100%", tableLayout: "fixed"}}, 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextProCon", title: "Create new Pro Option"}, 
                React.createElement("img", {className: "ProConIcon", src: "http://localhost:8000/image/pro_con_plus_icon.png"}), 
                React.createElement("span", {style: {position: "relative", top: "10px", color: "#A6A6A6", fontSize: "13px"}}, "Click to add a Pro opinion")
              )
            )
          ), 
          React.createElement(NewItemModal, {title: "Create new Pro Opinion", show: this.state.show, saveCB: this.addPro, cancelCB: this.hideModal})
        )
      );
    }
  });

  var ProOption = React.createClass({displayName: "ProOption",
    getInitialState: function(){
      return {show: false};
    },

    showModal: function(){
      if (typeof(wave) == "undefined" || !wave || (this.props.proInfo.creatorId != wave.getViewer().id_)) return;
      this.setState({show: true});
    },

    hideModal: function(){
      this.setState({show: false});
    },

    updatePro: function(newProContent){
      this.props.updateProCB(this.props.proInfo.id, newProContent);
      this.setState({show: false});
    },

    deletePro: function(){
      this.props.deleteProCB(this.props.proInfo.id);
      this.setState({show: false});
    },

    render: function(){
      return (
        React.createElement("div", {className: "ProConOption", onClick: this.showModal}, 
          React.createElement("table", {style: {width: "100%", tableLayout: "fixed"}}, 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextProCon", title: "Edit Option"}, 
                React.createElement("img", {className: "ProConIcon", src: "http://localhost:8000/image/pro_con_plus_icon.png"}), 
                React.createElement("span", {style: {position: "relative", top: "10px"}}, this.props.proInfo.content)
              )
            ), 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextUser"}, getCreatorFullName(this.props.proInfo.creatorId), ", ", distance_of_time_in_words(Date.parse(this.props.proInfo.createdDate)))
            )
          ), 
          React.createElement(EditItemModal, {title: "Edit Pro Opinion", content: this.props.proInfo.content, show: this.state.show, saveCB: this.updatePro, cancelCB: this.hideModal, deleteCB: this.deletePro})
        )
      );
    }
  });

  var ProColumn = React.createClass({displayName: "ProColumn",
    addPro: function(newProInfo){
      var proInfos = this.props.proInfos;
      proInfos.push(newProInfo);
      this.props.updateProsCB(proInfos);
    },

    updatePro: function(proId, newProContent){
      var newProInfos = [];
      if (this.props.proInfos != null) {
        newProInfos = this.props.proInfos.map(function(proInfo){
          if (proInfo.id == proId) {
            proInfo.content = newProContent;
          }
          return proInfo;
        });
      }
      this.props.updateProsCB(newProInfos);
    },

    deletePro: function(proId){
      var newProInfo = [];
      if (this.props.proInfos != null) {
        newProInfos = this.props.proInfos.filter(function(proInfo){
          return proInfo.id != proId;
        });
      }
      this.props.updateProsCB(newProInfos);
    },

    render: function(){
      var updateProCB = this.updatePro;
      var deleteProCB = this.deletePro;
      return (
        React.createElement("td", {className: "ProConData"}, 
          
            this.props.proInfos.map(function(proInfo){
              return React.createElement(ProOption, {key: proInfo.id, proInfo: proInfo, updateProCB: updateProCB, deleteProCB: deleteProCB})
            }), 
          
          React.createElement(AddProBtn, {addProCB: this.addPro})
        )
      );
    }
  });

  var AddConBtn = React.createClass({displayName: "AddConBtn",
    getInitialState: function(){
      return {opacity: 0, show: false};
    },

    showBtn: function(event){
      this.setState({opacity: 1});
    },

    hideBtn: function(event){
      this.setState({opacity: 0});
    },

    clickHandler: function(){
      this.setState({show: true});
    },

    hideModal: function(){
      this.setState({show: false});
    },

    addCon: function(newContent){
      var creatorId = "";
      if (typeof(wave) != "undefined" && wave && wave.getViewer())
      {
        creatorId = wave.getViewer().id_;
      }
      this.props.addConCB(createProConData(newContent, creatorId));
      this.hideModal();
    },

    render: function(){
      return (
        React.createElement("div", {onMouseOver: this.showBtn, onMouseLeave: this.hideBtn, onClick: this.clickHandler, style: {opacity: this.state.opacity}}, 
          React.createElement("table", {style: {width: "100%", tableLayout: "fixed"}}, 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextProCon", title: "Create new Con Option"}, 
                React.createElement("img", {className: "ProConIcon", src: "http://localhost:8000/image/pro_con_x_icon.png"}), 
                React.createElement("span", {style: {position: "relative", top: "10px", color: "#A6A6A6", fontSize: "13px"}}, "Click to add a Con opinion")
              )
            )
          ), 
          React.createElement(NewItemModal, {title: "Create new Con Opinion", show: this.state.show, saveCB: this.addCon, cancelCB: this.hideModal})
        )
      );
    }
  });

  var ConOption = React.createClass({displayName: "ConOption",
    getInitialState: function(){
      return {show: false};
    },

    showModal: function(){
      if (typeof(wave) == "undefined" || !wave || (this.props.conInfo.creatorId != wave.getViewer().id_)) return;
      this.setState({show: true});
    },

    hideModal: function(){
      this.setState({show: false});
    },

    updateCon: function(newConContent){
      this.props.updateConCB(this.props.conInfo.id, newConContent);
      this.setState({show: false});
    },

    deleteCon: function(){
      this.props.deleteConCB(this.props.conInfo.id);
      this.setState({show: false});
    },

    render: function(){
      return (
        React.createElement("div", {className: "ProConOption", onClick: this.showModal}, 
          React.createElement("table", {style: {width: "100%", tableLayout: "fixed"}}, 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextProCon", title: "Edit Option"}, 
                React.createElement("img", {className: "ProConIcon", src: "http://localhost:8000/image/pro_con_x_icon.png"}), 
                React.createElement("span", {style: {position: "relative", top: "10px"}}, this.props.conInfo.content)
              )
            ), 
            React.createElement("tr", null, 
              React.createElement("td", {className: "FullTextUser"}, getCreatorFullName(this.props.conInfo.creatorId), ", ", distance_of_time_in_words(Date.parse(this.props.conInfo.createdDate)))
            )
          ), 
          React.createElement(EditItemModal, {title: "Edit Con Opinion", content: this.props.conInfo.content, show: this.state.show, saveCB: this.updateCon, cancelCB: this.hideModal, deleteCB: this.deleteCon})
        )
      );
    }
  });

  var ConColumn = React.createClass({displayName: "ConColumn",
    addCon: function(newConInfo){
      var conInfos = this.props.conInfos;
      conInfos.push(newConInfo);
      this.props.updateConsCB(conInfos);
    },

    updateCon: function(conId, newConContent){
      var newConInfos = [];
      if (this.props.conInfos != null) {
        newConInfos = this.props.conInfos.map(function(conInfo){
          if (conInfo.id == conId)
          {
            conInfo.content = newConContent;
          }
          return conInfo;
        });
      }
      this.props.updateConsCB(newConInfos);
    },

    deleteCon: function(conId){
      var newConInfos = [];
      if (this.props.conInfos != null) {
        newConInfos = this.props.conInfos.filter(function(conInfo){
          return conInfo.id != conId;
        });
      }
      this.props.updateConsCB(newConInfos);
    },

    render: function(){
      var updateConCB = this.updateCon;
      var deleteConCB = this.deleteCon;
      return (
        React.createElement("td", {className: "ProConData"}, 
          
            this.props.conInfos.map(function(conInfo){
              return React.createElement(ConOption, {key: conInfo.id, conInfo: conInfo, updateConCB: updateConCB, deleteConCB: deleteConCB})
            }), 
          
          React.createElement(AddConBtn, {addConCB: this.addCon})
        )
      );
    }
  });

  var TopicRow = React.createClass({displayName: "TopicRow",
    updateTitle: function(newTitle){
      var topicInfo = this.props.topicInfo;
      topicInfo.title = newTitle;
      this.props.updateTopicInfoCB(this.props.topicInfo.id, topicInfo);
    },
    updatePros: function(proInfos){
      var topicInfo = this.props.topicInfo;
      topicInfo.proInfos = proInfos;
      this.props.updateTopicInfoCB(this.props.topicInfo.id, topicInfo);
    },
    updateCons: function(conInfos){
      var topicInfo = this.props.topicInfo;
      topicInfo.conInfos = conInfos;
      this.props.updateTopicInfoCB(this.props.topicInfo.id, topicInfo);
    },
    render: function(){
      return (React.createElement("tr", null, 
                React.createElement(TitleColumn, {title: this.props.topicInfo.title, deleteTopicCB: this.props.deleteTopicCB, updateTitleCB: this.updateTitle, id: this.props.topicInfo.id}), 
                React.createElement(ProColumn, {proInfos: this.props.topicInfo.proInfos, updateProsCB: this.updatePros}), 
                React.createElement(ConColumn, {conInfos: this.props.topicInfo.conInfos, updateConsCB: this.updateCons})
              ));
    }
  });

  var TopicList = React.createClass({displayName: "TopicList",
    render: function(){
      var deleteTopicCB = this.props.deleteTopicCB;
      var updateTopicInfoCB = this.props.updateTopicInfoCB;
      var style = {height: "37px"};
      if (this.props.topicInfos.length != 0){
        style["display"] = "none";
      }

      return (React.createElement("tbody", null, 
                React.createElement("tr", {style: style}, React.createElement("td", {className: "ProConDataNoCursor"}), React.createElement("td", {className: "ProConDataNoCursor"}), React.createElement("td", {className: "ProConDataNoCursor"})), 
                
                  this.props.topicInfos.map(function(topicInfo){
                    return React.createElement(TopicRow, {key: topicInfo.id, topicInfo: topicInfo, deleteTopicCB: deleteTopicCB, updateTopicInfoCB: updateTopicInfoCB})
                  })
                
              ));
    }
  });

  var TopicListContainer = React.createClass({displayName: "TopicListContainer",
    getInitialState: function() {
      return {isFullText: true};
    },
    componentDidMount: function() {
      adjustHeight();
    },
    componentDidUpdate: function() {
      adjustHeight();
    },
    getFullTextBtnStyle: function() {
      if (this.state.isFullText) {
        return "primary";
      } else {
        return "default";
      }
    },
    getSummaryBtnStyle: function() {
      if (!this.state.isFullText) {
        return "primary";
      } else {
        return "default";
      }
    },
    summaryBtnClickHander: function() {
      this.setState({isFullText: false});
    },
    fullTextBtnClickHander: function() {
      this.setState({isFullText: true});
    },
    render: function(){
      return (
        React.createElement("div", {style: {width: "850px"}}, 
          React.createElement("table", {className: "PCTDataTable"}, 
            React.createElement("thead", null, 
              React.createElement("tr", null, 
                React.createElement("td", {className: "PCTHead"}, "Topic"), 
                React.createElement("td", {className: "PCTHead"}, "Pro"), 
                React.createElement("td", {className: "PCTHead"}, "Con")
              )
            ), 
            React.createElement("tbody", null, 
              React.createElement(TopicList, {topicInfos: this.props.topicInfos, deleteTopicCB: this.props.deleteTopicCB, updateTopicInfoCB: this.props.updateTopicInfoCB})
            ), 
            React.createElement("tfoot", null, 
              React.createElement("tr", null, 
                React.createElement("td", {className: "PCTFoot", colSpan: "3"})
              )
            )
          )
        )
      );
    }
  });

  var ProConGadget = React.createClass({displayName: "ProConGadget",
    updateWaveData: function (newTopicInfos){
      if (typeof(wave) != "undefined" && wave && wave.getState()){
        wave.getState().submitDelta({'initialData': JSON.stringify(newTopicInfos)});
      } else {
        this.setState({topicInfos: newTopicInfos});
      }
    },

    getInitialState: function() {
      return {newTopicContent: "", topicInfos: []};
    },

    createTopicData: function(title) {
      return {title: title, id: guid(), proInfos: [], conInfos: []};
    },

    addTopicBtnClicked: function(){
      var newTopicContent = this.state.newTopicContent.trim();
      if (newTopicContent == ""){
        this.setState({newTopicContent: ""});
        return;
      }
      var topicInfos = this.state.topicInfos;
      if (topicInfos == null) topicInfos = [];
      var topicInfo = this.createTopicData(newTopicContent);
      topicInfos.push(topicInfo);
      this.updateWaveData(topicInfos);
      this.setState({newTopicContent: ""});
    },

    titleInputChanged: function(e){
      this.setState({newTopicContent: e.target.value});
    },

    deleteTopic: function(topicId){
      var topicInfos = this.state.topicInfos;
      var newTopicInfos = topicInfos.filter(function(topicInfo){
        return topicInfo.id != topicId;
      });
      this.updateWaveData(newTopicInfos);
    },

    updateTopicInfo: function(topicId, newTopicInfo){
      var newTopicInfos = this.state.topicInfos.map(function(topicInfo){
        if (topicInfo.id == topicId) {
          return newTopicInfo;
        } else {
          return topicInfo;
        }
      });
      this.updateWaveData(newTopicInfos);
    },

    componentDidMount: function() {
      var self = this;
      var onWaveUpdate = function(){
        var waveData = JSON.parse(wave.getState().get('initialData'));
        self.setState({topicInfos: waveData});
      };

      var onWaveParticipant = function(){
        if (wave.getViewer()) {
          var peoples = [];
          var participants = wave.getParticipants();
          participants.forEach(function(value) {
            peoples.push({id: value.id_, text: value.displayName_, thumbnailUrl: value.thumbnailUrl_});
          });
          self.setState({ peoples: peoples });
        }
      };

      if (typeof(wave) != "undefined" && wave) {
        wave.setStateCallback(onWaveUpdate);
        wave.setParticipantCallback(onWaveParticipant);
      }
    },

    validationState: function(){
      var newTopicContent = this.state.newTopicContent.trim();
      if (newTopicContent != "") {
        return 'success';
      } else {
        return 'warning';
      }
    },

    isBtnDisable: function(){
      var newTopicContent = this.state.newTopicContent.trim();
      if (newTopicContent != "") {
        return false;
      } else {
        return true;
      }
    },

    render: function(){
      var Input = ReactBootstrap.Input;
      var Button = ReactBootstrap.Button;
      var innerBtn = React.createElement(Button, {onClick: this.addTopicBtnClicked, disabled: this.isBtnDisable()}, "Add Topic");
      return(
        React.createElement("div", {style: {width: "850px"}, id: "ProConGadget"}, 
          React.createElement(Input, {type: "text", value: this.state.newTopicContent, onChange: this.titleInputChanged, bsStyle: this.validationState(), buttonAfter: innerBtn}), 
          React.createElement(TopicListContainer, {topicInfos: this.state.topicInfos, deleteTopicCB: this.deleteTopic, updateTopicInfoCB: this.updateTopicInfo})
        )
      );
    }
  });

  React.render(React.createElement(ProConGadget, null), document.body);
}

if (typeof(gadgets) != "undefined" && gadgets) {
  gadgets.util.registerOnLoadHandler(function() { init(ReactBootstrap, jQuery); });
} else {
  init(ReactBootstrap, jQuery);
}
