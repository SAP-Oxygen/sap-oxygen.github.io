function getLocale(msg){
  if (typeof(gadgets) != "undefined" && gadgets) {
    var prefs = new gadgets.Prefs();
    return prefs.getMsg(msg);
  } else {
    return msg;
  }
}

function distance_of_time_in_words(from){
    var to = new Date().getTime();
    if (to < from){
        to = from;
    }
    var seconds_ago = ((to - from)/1000);
    var minutes_ago = Math.floor(seconds_ago/60);
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
    gadgets.window.adjustHeight();
}

function getCreatorFullName(creatorId){
  var fullName = "PLACEHOLDER";
  if (typeof(wave) != "undefined" && wave && wave.getParticipantById(creatorId)) {
    fullName = wave.getParticipantById(creatorId).displayName_;
  }
  return fullName;
}

function getCurrentUserFullName() {
  if (typeof(wave) != "undefined" && wave && wave.getViewer()) {
    return getCreatorFullName(wave.getViewer().id_);
  }

  return "";
}

function createProConData(content, creatorId) {
  return {id: guid(), creatorId: creatorId, createdDate: new Date(), content: content};
}

function init(ReactBootstrap, jQuery){
  var ConfirmModal = React.createClass({
    render: function() {
      var Modal = ReactBootstrap.Modal;
      var Button = ReactBootstrap.Button;
      return (
        <Modal bsSize="small" show={this.props.show} onHide={this.props.cancel}>
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table style={{border: 0}}><tr><td style={{wordBreak: "break-all", wordWrap: "break-word"}}>{this.props.content}</td></tr></table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.cancel}>{getLocale("Cancel")}</Button>
            <Button onClick={this.props.ok}>{getLocale("Ok")}</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  });

  var NewItemModal = React.createClass({
    getInitialState: function() {
      return {content: this.props.content == null ? "" : this.props.content, validationText: ""};
    },

    save: function() {
      var newContent = this.state.content.trim();
      this.setState({content: ""});
      if (newContent != "") {
        this.props.saveCB(newContent);
      }
      else
      {
        this.setState({validationText: getLocale("BlankTextNotAllowed")});
      }
    },

    cancel: function() {
      this.setState({content: ""});
      this.setState({validationText: ""});
      this.props.cancelCB();
    },

    contentChanged: function(e) {
      this.setState({content: e.target.value});
      this.setState({validationText: ""});
    },

    validationState: function() {
      var length = this.state.content.trim().length;
      if (length == 0) {
        return "error";
      } else {
        return "success";
      }
    },

    render: function() {
      var Modal = ReactBootstrap.Modal;
      var Button = ReactBootstrap.Button;
      var Input = ReactBootstrap.Input;
      return (
        <Modal bsSize="small" show={this.props.show} onHide={this.cancel}>
          <Modal.Header>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input type="textarea" help={this.state.validationText} bsStyle={this.validationState()} style={{width: "100%", resize: "none", height: "100px"}} onChange={this.contentChanged} value={this.state.content}/>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.save}>{getLocale("Save")}</Button>
            <Button onClick={this.cancel}>{getLocale("Cancel")}</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  });

  var EditItemModal = React.createClass({
    getInitialState: function() {
      return {content: this.props.content == null ? "" : this.props.content, validationText: ""};
    },

    save: function() {
      var newContent = this.state.content.trim();
      if (newContent != "") {
        this.props.saveCB(newContent);
      } else {
        this.setState({validationText: getLocale("BlankTextNotAllowed")});
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
      this.setState({validationText: ""});
    },

    validationState: function() {
      var length = this.state.content.trim().length;
      if (length == 0) {
        return "error";
      } else {
        return "success";
      }
    },

    render: function() {
      var Modal = ReactBootstrap.Modal;
      var Button = ReactBootstrap.Button;
      var Input = ReactBootstrap.Input;
      if (this.props.showDelete) {
        return (
          <Modal bsSize="small" show={this.props.show} onHide={this.cancel}>
            <Modal.Header>
              <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Input type="textarea" help={this.state.validationText} bsStyle={this.validationState()} style={{width: "100%", resize: "none", height: "100px"}} onChange={this.contentChanged} value={this.state.content}/>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.deleteT}>{getLocale("Delete")}</Button>
              <Button onClick={this.save}>{getLocale("Save")}</Button>
              <Button onClick={this.cancel}>{getLocale("Cancel")}</Button>
            </Modal.Footer>
          </Modal>
        );
      } else {
        return (
          <Modal bsSize="small" show={this.props.show} onHide={this.cancel}>
            <Modal.Header>
              <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Input type="textarea" help={this.state.validationText} bsStyle={this.validationState()} style={{width: "100%", resize: "none", height: "100px"}} onChange={this.contentChanged} value={this.state.content}/>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.save}>{getLocale("Save")}</Button>
              <Button onClick={this.cancel}>{getLocale("Cancel")}</Button>
            </Modal.Footer>
          </Modal>
        );
      }
    }
  });

  var TitleColumn = React.createClass({
    getInitialState: function(){
      return {show: false};
    },

    hideModal: function(){
      this.setState({show: false});
    },

    clickHandler: function(){
      this.setState({show: true});
    },

    updateTopic: function(newTopicTitle){
      this.props.updateTitleCB(newTopicTitle.trim());
      this.hideModal();
    },

    render : function(){
      return (
        <td className="OptionData" onClick={this.clickHandler}>
          <span>{this.props.title}</span>
          <EditItemModal title={getLocale("EditTopic")} content={this.props.title} show={this.state.show} saveCB={this.updateTopic} cancelCB={this.hideModal} showDelete={false}/>
        </td>
      );
    }
  });

  var AddProBtn = React.createClass({
    getInitialState: function(){
      return {hideClass: "ProConHide", show: false};
    },

    showBtn: function(event){
      this.setState({hideClass: ""});
    },

    hideBtn: function(event){
      this.setState({hideClass: "ProConHide"});
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
      if (this.props.isSummaryMode) {
        var className = "fa fa-plus fa-2x ";
        className = className + this.state.hideClass;
        return (
          <i className={className} style={{color: "Green"}} onMouseOver={this.showBtn} onMouseLeave={this.hideBtn} onClick={this.clickHandler}><NewItemModal title={getLocale("CreateNewProOpinion")} show={this.state.show} saveCB={this.addPro} cancelCB={this.hideModal}/></i>
        );
      } else {
        var className = "ProConOption ";
        className = className + this.state.hideClass;
        return (
          <div className={className} onMouseOver={this.showBtn} onMouseLeave={this.hideBtn} onClick={this.clickHandler}>
            <table  style={{width: "100%", tableLayout: "fixed"}}>
              <tr>
                <td title={getLocale("CreateNewProOpinion")} style={{width: "35px"}}>
                  <i className="fa fa-plus fa-2x" style={{color: "Green"}}></i>
                </td>
                <td className="FullTextProCon">
                  <span style={{top: "10px", color: "#A6A6A6", fontSize: "13px"}}>{getLocale("ClickToAddProOpinion")}</span>
                </td>
              </tr>
            </table>
            <NewItemModal title={getLocale("CreateNewProOpinion")} show={this.state.show} saveCB={this.addPro} cancelCB={this.hideModal}/>
          </div>
        );
      }
    }
  });

  var ProOption = React.createClass({
    getInitialState: function(){
      return {show: false, style: {}};
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

    mouseOverHandler: function(){
      this.setState({style: {backgroundColor: "#cccccc"}});
    },

    mouseLeaveHandler: function(){
      this.setState({style: {}});
    },
    render: function(){
      if (this.props.isSummaryMode){
        var Popover = ReactBootstrap.Popover;
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var title = getCreatorFullName(this.props.proInfo.creatorId) + "," + distance_of_time_in_words(Date.parse(this.props.proInfo.createdDate));
        var popover = (<Popover bsSize="xsmall" title={title}>
                         <table style={{border: 0}}>
                           <tr>
                             <td style={{wordBreak: "break-all", wordWrap: "break-word"}}>{this.props.proInfo.content}</td>
                           </tr>
                         </table>
                       </Popover>);
        return (
          <OverlayTrigger trigger='hover' placement='bottom' overlay={popover}>
          <i className="fa fa-plus fa-2x" style={{color: "Green", width: "30px"}} onClick={this.showModal}><EditItemModal title={getLocale("EditProOpinion")} content={this.props.proInfo.content} show={this.state.show} saveCB={this.updatePro} cancelCB={this.hideModal} deleteCB={this.deletePro} showDelete={true}/></i>
          </OverlayTrigger>
        );
      } else {
        return (
          <div onClick={this.showModal} onMouseOver={this.mouseOverHandler} onMouseLeave={this.mouseLeaveHandler}>
            <table  style={{width: "100%", tableLayout: "fixed"}}>
              <tr style={this.state.style}>
                <td title={getLocale("EditOpinion")} style={{width: "35px"}}>
                  <i className="fa fa-plus fa-2x" style={{color: "Green", width: "30px"}}></i>
                </td>
                <td className='FullTextProCon'>
                  <span>{this.props.proInfo.content}</span>
                </td>
              </tr>
              <tr>
                <td/><td className='FullTextUser'>{getCreatorFullName(this.props.proInfo.creatorId)}, {distance_of_time_in_words(Date.parse(this.props.proInfo.createdDate))}</td>
              </tr>
            </table>
            <EditItemModal title={getLocale("EditProOpinion")} content={this.props.proInfo.content} show={this.state.show} saveCB={this.updatePro} cancelCB={this.hideModal} deleteCB={this.deletePro} showDelete={true}/>
          </div>
        );
      }
    }
  });

  var ProColumn = React.createClass({
    addPro: function(newProInfo){
      var proInfos = this.props.proInfos;
      proInfos.push(newProInfo);
      this.props.updateProsCB(proInfos);

      typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
        activity: {
          title: "#{addProFeed}",
          object: {
            displayName: newProInfo.content,
            attachments: [{ displayName: this.props.topicTitle }]
          }
        }
      }).execute(function(result){});
    },

    updatePro: function(proId, newProContent){
      var newProInfos = [];
      if (this.props.proInfos != null) {
        var proToBeUpdated = this.props.proInfos.filter(function(proInfo){
          return proInfo.id == proId;
        })[0];
        var oldContent = proToBeUpdated.content;

        newProInfos = this.props.proInfos.map(function(proInfo){
          if (proInfo.id == proId) {
            proInfo.content = newProContent;
          }
          return proInfo;
        });

        typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
          activity: {
            title: "#{updateProFeedTitle}",
            content: "#{updateProFeedContent}",
            object: {
              displayName: oldContent,
              attachments: [{displayName: newProContent}, {displayName: this.props.topicTitle}]
            }
          }
        }).execute(function(result){});
      }
      this.props.updateProsCB(newProInfos);
    },

    deletePro: function(proId){
      var newProInfo = [];
      if (this.props.proInfos != null) {
        newProInfos = this.props.proInfos.filter(function(proInfo){
          return proInfo.id != proId;
        });
        var proToBeDeleted = this.props.proInfos.filter(function(proInfo){
          return proInfo.id == proId;
        })[0];

        typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
          activity: {
            title: "#{deleteProFeed}",
            object: {
              displayName: proToBeDeleted.content,
              attachments: [{ displayName: this.props.topicTitle }]
            }
          }
        }).execute(function(result){});
      }
      this.props.updateProsCB(newProInfos);
    },

    render: function(){
      var updateProCB = this.updatePro;
      var deleteProCB = this.deletePro;
      var isSummaryMode  = this.props.isSummaryMode;
      return (
        <td className="ProConData">
          {
            this.props.proInfos.map(function(proInfo){
              return <ProOption isSummaryMode={isSummaryMode} key={proInfo.id} proInfo={proInfo} updateProCB={updateProCB} deleteProCB={deleteProCB}/>
            })
          }
          <AddProBtn  isSummaryMode={isSummaryMode} addProCB={this.addPro}/>
        </td>
      );
    }
  });

  var AddConBtn = React.createClass({
    getInitialState: function(){
      return {hideClass: "ProConHide", show: false};
    },

    showBtn: function(event){
      this.setState({hideClass: ""});
    },

    hideBtn: function(event){
      this.setState({hideClass: "ProConHide"});
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
      if (this.props.isSummaryMode){
        var className = "fa fa-minus fa-2x ";
        className = className + this.state.hideClass;
        return (<i className={className} style={{color: "Brown", opacity: this.state.opacity}} onMouseOver={this.showBtn} onMouseLeave={this.hideBtn} onClick={this.clickHandler}>
                  <NewItemModal title={getLocale("CreateNewConOpinion")} show={this.state.show} saveCB={this.addCon} cancelCB={this.hideModal}/>
                </i>);
      } else {
        var className = "ProConOption ";
        className = className + this.state.hideClass;
        return (
          <div className={className} onMouseOver={this.showBtn} onMouseLeave={this.hideBtn} onClick={this.clickHandler}>
            <table style={{width: "100%", tableLayout: "fixed"}}>
              <tr>
                <td title={getLocale("CreateNewConOpinion")} style={{width: "35px"}}>
                  <i className="fa fa-minus fa-2x" style={{color: "Brown"}}></i>
                </td>
                <td className="FullTextProCon">
                  <span style={{color: "#A6A6A6", fontSize: "13px"}}>{getLocale("ClickToAddConOpinion")}</span>
                </td>
              </tr>
            </table>
            <NewItemModal title={getLocale("CreateNewConOpinion")} show={this.state.show} saveCB={this.addCon} cancelCB={this.hideModal}/>
          </div>
        );
      }
    }
  });

  var ConOption = React.createClass({
    getInitialState: function(){
      return {show: false, style: {}};
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

    mouseOverHandler: function(){
      this.setState({style: {backgroundColor: "#cccccc"}});
    },

    mouseLeaveHandler: function(){
      this.setState({style: {}});
    },

    render: function(){
      if (this.props.isSummaryMode){
        var Popover = ReactBootstrap.Popover;
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var title = getCreatorFullName(this.props.conInfo.creatorId) + "," + distance_of_time_in_words(Date.parse(this.props.conInfo.createdDate));
        var popover = (<Popover bsSize="xsmall" title={title}>
                         <table style={{border: 0}}>
                           <tr>
                             <td style={{wordBreak: "break-all", wordWrap: "break-word"}}>{this.props.conInfo.content}</td>
                           </tr>
                         </table>
                       </Popover>);
        return (<OverlayTrigger trigger='hover' placement='bottom' overlay={popover}>
                  <i className="fa fa-minus fa-2x" style={{color: "Brown", width: "30px"}} onClick={this.showModal}>
                  <EditItemModal title="Edit Con Opinion" content={this.props.conInfo.content} show={this.state.show} saveCB={this.updateCon} cancelCB={this.hideModal} deleteCB={this.deleteCon} showDelete={true}/>
                  </i>
                </OverlayTrigger>);
      } else {
        return (
          <div className="ProConOption" onClick={this.showModal} onMouseOver={this.mouseOverHandler} onMouseLeave={this.mouseLeaveHandler}>
            <table  style={{width: "100%", tableLayout: "fixed"}}>
              <tr style={this.state.style}>
                <td title='Edit Option' style={{width: "35px"}}>
                  <i className="fa fa-minus fa-2x" style={{color: "Brown"}}></i>
                </td>
                <td className='FullTextProCon'>
                  <span style={{top: "10px"}}>{this.props.conInfo.content}</span>
                </td>
              </tr>
              <tr>
                <td/><td className='FullTextUser'>{getCreatorFullName(this.props.conInfo.creatorId)}, {distance_of_time_in_words(Date.parse(this.props.conInfo.createdDate))}</td>
              </tr>
            </table>
            <EditItemModal title="Edit Con Opinion" content={this.props.conInfo.content} show={this.state.show} saveCB={this.updateCon} cancelCB={this.hideModal} deleteCB={this.deleteCon} showDelete={true}/>
          </div>
        );
      }
    }
  });

  var ConColumn = React.createClass({
    addCon: function(newConInfo){
      var conInfos = this.props.conInfos;
      conInfos.push(newConInfo);
      this.props.updateConsCB(conInfos);

      typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
        activity: {
          title: "#{addConFeed}",
          object: {
            displayName: newConInfo.content,
            attachments: [{ displayName: this.props.topicTitle }]
          }
        }
      }).execute(function(result){});
    },

    updateCon: function(conId, newConContent){
      var newConInfos = [];
      if (this.props.conInfos != null) {
        var conToBeUpdated = this.props.conInfos.filter(function(conInfo){
          return conInfo.id == conId;
        })[0];
        var oldContent = conToBeUpdated.content;

        newConInfos = this.props.conInfos.map(function(conInfo){
          if (conInfo.id == conId)
          {
            conInfo.content = newConContent;
          }
          return conInfo;
        });

        typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
          activity: {
            title: "#{updateConFeedTitle}",
            content: "#{updateConFeedContent}",
            object: {
              displayName: oldContent,
              attachments: [{displayName: newConContent}, {displayName: this.props.topicTitle}]
            }
          }
        }).execute(function(result){});
      }
      this.props.updateConsCB(newConInfos);
    },

    deleteCon: function(conId){
      var newConInfos = [];
      if (this.props.conInfos != null) {
        newConInfos = this.props.conInfos.filter(function(conInfo){
          return conInfo.id != conId;
        });

        var conToBeDeleted = this.props.conInfos.filter(function(conInfo){
          return conInfo.id == conId;
        })[0];

        typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
          activity: {
            title: "#{deleteConFeed}",
            object: {
              displayName: conToBeDeleted.content,
              attachments: [{ displayName: this.props.topicTitle }]
            }
          }
        }).execute(function(result){});
      }
      this.props.updateConsCB(newConInfos);
    },

    render: function(){
      var updateConCB = this.updateCon;
      var deleteConCB = this.deleteCon;
      var isSummaryMode = this.props.isSummaryMode;
      return (
        <td className="ProConData">
          {
            this.props.conInfos.map(function(conInfo){
              return <ConOption key={conInfo.id} isSummaryMode={isSummaryMode} conInfo={conInfo} updateConCB={updateConCB} deleteConCB={deleteConCB}/>
            })
          }
          <AddConBtn isSummaryMode={isSummaryMode} addConCB={this.addCon}/>
        </td>
      );
    }
  });

  var TopicRow = React.createClass({
    getInitialState: function() {
      return {show: false, style: {visibility: "hidden"}};
    },
    updateTitle: function(newTitle){
      var topicInfo = this.props.topicInfo;
      var oldTopicTitle = topicInfo.title;
      topicInfo.title = newTitle;
      this.props.updateTopicInfoCB(this.props.topicInfo.id, topicInfo);

      typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
        activity: {
          title: "#{updateTopicFeed}",
          object: {
            displayName: oldTopicTitle,
            attachments: [{ displayName: newTitle }]
          }
        }
      }).execute(function(result){});
    },
    showModal: function() {
      this.setState({show: true});
    },
    hideModal: function() {
      this.setState({show: false});
    },
    deleteTopic: function(){
      this.setState({show: false});
      this.props.deleteTopicCB(this.props.topicInfo.id);
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
    showTrash: function(){
      this.setState({style: {}});
    },
    hideTrash: function(){
      this.setState({style: {visibility: "hidden"}});
    },
    render: function(){
      var Glyphicon = ReactBootstrap.Glyphicon;
      var topicTitle = this.props.topicInfo.title;
      var topicContent = getLocale("DeleteTopicContent");
      if (topicContent.indexOf("PLACEHOLDER", 0) != -1) {
        topicContent = topicContent.replace(/PLACEHOLDER/, this.props.topicInfo.title);
      }

      return (
        <tr onMouseEnter={this.showTrash} onMouseLeave={this.hideTrash}>
          <TitleColumn title={this.props.topicInfo.title} deleteTopicCB={this.props.deleteTopicCB} updateTitleCB={this.updateTitle} id={this.props.topicInfo.id} />
          <ProColumn topicTitle={this.props.topicInfo.title} proInfos={this.props.topicInfo.proInfos} isSummaryMode={this.props.isSummaryMode} updateProsCB={this.updatePros} />
          <ConColumn topicTitle={this.props.topicInfo.title} conInfos={this.props.topicInfo.conInfos} isSummaryMode={this.props.isSummaryMode} updateConsCB={this.updateCons} />
          <td style={{border: "none", paddingLeft: "10px", cursor: "pointer", width: "30px"}} onClick={this.showModal}><Glyphicon glyph='trash' style={this.state.style}/>
            <ConfirmModal title={getLocale("DeleteTopic")} content={topicContent} show={this.state.show} ok={this.deleteTopic} cancel={this.hideModal}/>
          </td>
        </tr>);
    }
  });

  var TopicList = React.createClass({
    getInitialState: function() {
      return {defaultRowClass: "PCTDefaultRow"};
    },

    darkens: function() {
      this.setState({defaultRowClass: "PCTDefaultRowMouseOver"});
    },

    un_darkens: function() {
      this.setState({defaultRowClass: "PCTDefaultRow"});
    },

    render: function(){
      var deleteTopicCB = this.props.deleteTopicCB;
      var updateTopicInfoCB = this.props.updateTopicInfoCB;
      var defaultRowStyle = {height: "37px"};
      var isSummaryMode = this.props.isSummaryMode;
      if (this.props.topicInfos != null && this.props.topicInfos.length != 0){
        defaultRowStyle["display"] = "none";
      }

      return (<tbody>
                <tr style={defaultRowStyle}>
                  <td className={this.state.defaultRowClass} colSpan="3" onMouseOver={this.darkens} onMouseLeave={this.un_darkens} onClick={this.props.addTopicCB}>{getLocale("ClickToAddItem")}</td>
                  <td></td>
                </tr>
                {
                  this.props.topicInfos != null && this.props.topicInfos.map(function(topicInfo){
                    return <TopicRow key={topicInfo.id} topicInfo={topicInfo} isSummaryMode={isSummaryMode} deleteTopicCB={deleteTopicCB} updateTopicInfoCB={updateTopicInfoCB}/>
                  })
                }
              </tbody>
              );
    }
  });

  var TopicListContainer = React.createClass({
    getInitialState: function() {
      return {show: false, isSummaryMode: false};
    },

    getIconClass: function()
    {
      if (this.state.isSummaryMode) {
        return "fa fa-lg fa-angle-double-right";
      } else {
        return "fa fa-lg fa-angle-double-down";
      }
    },

    changeMode: function(){
      this.setState({isSummaryMode: !this.state.isSummaryMode});
    },

    addTopic: function(content) {
      this.props.addTopicCB(content);
      this.setState({show: false});
    },

    hideModal: function() {
      this.setState({show: false});
    },
    showModal: function() {
      this.setState({show: true});
    },

    componentDidMount: function() {
      adjustHeight();
    },

    componentDidUpdate: function() {
      adjustHeight();
    },

    addTopicBtnStyle: function(){
      if (this.props.topicInfos == null || this.props.topicInfos.length == 0){
        return {display: "none"};
      } else {
        return {paddingTop: "10px"};
      }
    },

    render: function(){
      var Button = ReactBootstrap.Button;
      var Glyphicon = ReactBootstrap.Glyphicon;
      return (
        <div style={{width: "100%"}}>
          <table className="PCTDataTable">
            <thead>
              <tr>
                <td className="PCTHead" style={{width: "auto", paddingLeft: "5px"}}>
                  <i className={this.getIconClass()} style={{width: "20px", cursor: "Pointer"}} onClick={this.changeMode}></i>{getLocale("Topic")}
                </td>
                <td className="PCTHead" style={{width: "33%"}}>{getLocale("Pro")}</td>
                <td className="PCTHead" style={{width: "33%"}}>{getLocale("Con")}</td>
                <td style={{width: "40px", visibility: "hidden"}}></td>
              </tr>
            </thead>
            <TopicList topicInfos={this.props.topicInfos} isSummaryMode={this.state.isSummaryMode} deleteTopicCB={this.props.deleteTopicCB} updateTopicInfoCB={this.props.updateTopicInfoCB} addTopicCB={this.showModal}/>
          </table>
          <div style={this.addTopicBtnStyle()}><Button type="button" onClick={this.showModal}><Glyphicon glyph='plus'/>{getLocale("AddTopic")}</Button></div>
          <NewItemModal title={getLocale("AddNewTopic")} show={this.state.show} saveCB={this.addTopic} cancelCB={this.hideModal}/>
        </div>
      );
    }
  });

  var ProConGadget = React.createClass({
    updateWaveData: function (newTopicInfos){
      if (typeof(wave) != "undefined" && wave && wave.getState()){
        wave.getState().submitDelta({'initialData': JSON.stringify(newTopicInfos)});
      } else {
        this.setState({topicInfos: newTopicInfos});
      }
    },

    getInitialState: function() {
      return {topicInfos: []};
    },

    createTopicData: function(title) {
      return {title: title, id: guid(), proInfos: [], conInfos: []};
    },

    addTopic: function(content){
      var topicInfos = this.state.topicInfos;
      if (topicInfos == null) topicInfos = [];
      var topicInfo = this.createTopicData(content);
      topicInfos.push(topicInfo);
      this.updateWaveData(topicInfos);

      typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
        activity: {
          title: "#{addTopicFeed}",
          object: {displayName: content}
        }
      }).execute(function(result){});
    },

    deleteTopic: function(topicId){
      var topicInfos = this.state.topicInfos;
      var topicInfoToBeDeleted = topicInfos.filter(function(topicInfo){
        return topicInfo.id == topicId;
      });
      var newTopicInfos = topicInfos.filter(function(topicInfo){
        return topicInfo.id != topicId;
      });
      this.updateWaveData(newTopicInfos);

      typeof(osapi) != "undefined" && osapi && osapi.activitystreams.create({
        activity: {
          title: "#{deleteTopicFeed}",
          object: {displayName: topicInfoToBeDeleted[0].title}
        }
      }).execute(function(result){});
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

    render: function(){
      return(
        <div style={{width: "800px", margin: "auto", minHeight: "400px"}} id="ProConGadget">
          <TopicListContainer topicInfos={this.state.topicInfos} deleteTopicCB={this.deleteTopic} updateTopicInfoCB={this.updateTopicInfo} addTopicCB={this.addTopic}/>
        </div>
      );
    }
  });

  React.render(<ProConGadget/>, document.body);
}

if (typeof(gadgets) != "undefined" && gadgets) {
  gadgets.util.registerOnLoadHandler(function() { init(ReactBootstrap, jQuery); });
} else {
  init(ReactBootstrap, jQuery);
}
