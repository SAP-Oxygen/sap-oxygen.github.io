function init(ReactBootstrap, jQuery){
  // shindig will ignore @media definition when merge all css together.
  // Here we use jquery to control the visibility of big size table and small size table as a walkaround.
  var $ = jQuery;
  $(document).ready(function(){
    $(window).resize(function(){
      var width = $(window).width();
      if (width < 320) {
        $(".full-comparison-table").css("display", "none");
        $(".small-comparison-table").css("display", "inline");
      } else {
        $(".full-comparison-table").css("display", "inline");
        $(".small-comparison-table").css("display", "none");
      }
    });
  });

  //var head = document.getElementsByTagName('head')[0];
  //var link = document.createElement('link');
  //link.href = "http://localhost:3007/jam_gadgets/comparison_table/comparison_table.css";
  //link.setAttribute('rel', 'stylesheet');
  //link.setAttribute('type', 'text/css');
  //head.appendChild(link);

  Common.initializeMoment(moment);
  
  var TitleColumn = React.createClass({
    clickHandler: function(){
      var self = this;
      var existingContent = this.props.topicInfo.title;
      gadgets.sapjam.asyncMessage.post(existingContent, function(token) {
        gadgets.views.openGadget(function(result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.props.deleteTopic(self.props.topicInfo);
            } else {
              return self.updateTitle(result.text);
            }
          } else {
            return null;
          }
        }, function(site) {
          return null;
        },
          {
            view: 'dialog-edit_item',
            viewTarget: 'MODALDIALOG',
            viewParams: {type: 'topic', paramsKey: token}
          }
        );
      });
    },

    updateTitle: function(newTopicTitle){
      if (this.props.topicInfo.title != newTopicTitle){
        this.props.updateTitle(newTopicTitle);
      }
    },

    render : function(){
      return (
        <td className="option-data" onClick={this.clickHandler}>
          <span>{this.props.topicInfo.title}</span>
        </td>
      );
    }
  });

  var AddItemBtn = React.createClass({
    clickHandler: function(e){
      e.stopPropagation();

      var self = this;
      gadgets.views.openGadget(function(result) {
        return result ? self.addItem(result.text) : null;
      }, function(site) {
        return null;
      },
        {
          view: 'dialog-add_item',
          viewTarget: 'MODALDIALOG'
        }
      );
    },

    addItem: function(newContent){
      this.props.addItem(newContent, wave.getViewer().id_);
    },

    render: function(){
      return (
        <div className="option" onClick={this.clickHandler}>
          <table className="option-table">
            <tr>
              <td className="full-text"><span className="add-option-text">{getLocale("click_to_add_item")}</span></td>
            </tr>
          </table>
        </div>
      );
    }
  });

  var Item = React.createClass({
    showModal: function(e){
      e.stopPropagation();
      if (this.props.itemInfo.creatorId != wave.getViewer().id_) {
        return;
      }
      var self = this;
      var existingContent = this.props.itemInfo.content;
      gadgets.sapjam.asyncMessage.post(existingContent, function(token){
        gadgets.views.openGadget(function(result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.deleteItem();
            } else {
              return self.updateItem(result.text);
            }
          } else {
            return null;
          }
        }, function(site) {
          return null;
        },
          {
            view: 'dialog-edit_item',
            viewTarget: 'MODALDIALOG',
            viewParams: {type: 'item', paramsKey: token}
          }
        );
      });
    },

    updateItem: function(newProContent){
      if (this.props.itemInfo.content != newProContent){
        this.props.updateItem(this.props.itemInfo.id, newProContent);
      }
    },

    deleteItem: function(){
      this.props.deleteItem(this.props.itemInfo.id);
    },

    render: function(){
      return (
        <div onClick={this.showModal}>
          <table className="option-table">
            <tr className="option-tr">
              <td className='full-text'><span>{this.props.itemInfo.content}</span></td>
            </tr>
          </table>
        </div>
      );
    }
  });

  var BigSizeItemColumn = React.createClass({
    createItemInfo: function(content, creatorId){
      return {type: this.props.columnType, content: content, creatorId: creatorId, createdDate: Date.now(), topicId: this.props.topicId};
    },

    createUserInfo: function(userId, userName){
      return {type: "user", cachedUserName: userName};
    },

    addItem: function(content, creatorId){
      var itemInfo = this.createItemInfo(content, creatorId);
      var delta = {};
      delta[guid()] = itemInfo;
      var userInfo = this.createUserInfo(creatorId, getCreatorFullName(creatorId));
      delta[creatorId] = userInfo;
      this.props.submitDelta(delta);
    },

    updateItem: function(itemId, newItemContent){
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function(itemInfo){
          return itemInfo.id == itemId;
        })[0];
        var oldContent = itemToBeUpdated.content;
        var waveState = wave.getState();
        var itemInfo = waveState.get(itemId);
        itemInfo.content = newItemContent;
        var delta = {};
        delta[itemId] = itemInfo;
        this.props.submitDelta(delta);
      }
    },

    deleteItem: function(itemId){
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function(itemInfo){
          return itemInfo.id == itemId;
        })[0];

        var delta = {};
        delta[itemId] = null;
        this.props.submitDelta(delta);
      }
    },

    render: function(){
      var self = this;
      return (
        <td className="table-data">
          {
            this.props.itemInfos.map(function(itemInfo){
              return <Item peopleInfos={self.props.peopleInfos} key={itemInfo.id} itemInfo={itemInfo} updateItem={self.updateItem} deleteItem={self.deleteItem}/>
            })
          }
          <AddItemBtn addItem={this.addItem}/>
        </td>
      );
    }
  });

  var SmallSizeItemColumn = React.createClass({
    createItemInfo: function(content, creatorId){
      return {type: this.props.columnType, content: content, creatorId: creatorId, createdDate: Date.now(), topicId: this.props.topicId};
    },

    createUserInfo: function(userId, userName){
      return {type: "user", cachedUserName: userName};
    },

    addItem: function(content, creatorId){
      var itemInfo = this.createItemInfo(content, creatorId);
      var delta = {};
      delta[guid()] = itemInfo;
      var userInfo = this.createUserInfo(creatorId, getCreatorFullName(creatorId));
      delta[creatorId] = userInfo;
      this.props.submitDelta(delta);
    },

    updateItem: function(itemId, newItemContent){
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function(itemInfo){
          return itemInfo.id == itemId;
        })[0];
        var oldContent = itemToBeUpdated.content;
        var waveState = wave.getState();
        var itemInfo = waveState.get(itemId);
        itemInfo.content = newItemContent;
        var delta = {};
        delta[itemId] = itemInfo;
        this.props.submitDelta(delta);
      }
    },

    deleteItem: function(itemId){
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function(itemInfo){
          return itemInfo.id == itemId;
        })[0];

        var delta = {};
        delta[itemId] = null;
        this.props.submitDelta(delta);
      }
    },

    headerClicked: function(e){
      e.stopPropagation();
      var self = this;
      gadgets.views.openGadget(function(result) {
        self.setHeaderText(result.text);
      }, function(site) {
        return null;
      },
        {
          view: 'dialog-add_item',
          viewTarget: 'MODALDIALOG',
          viewParams: {type: 'ColumnHeader', existingContent: self.props.headerText}
        }
      );
    },

    setHeaderText: function(text) {
      var delta = {};
      if (this.props.columnType == "col1") {
        delta["col1HeaderText"] = text;
      } else if (this.props.columnType == "col2") {
        delta["col2HeaderText"] = text;
      } else if (this.props.columnType == "col3") {
        delta["col3HeaderText"] = text;
      }
      this.props.submitDelta(delta);
    },

    render: function(){
      var self = this;
      return (
        <tr className="height-44">
          <td className="table-header" onClick={this.headerClicked}>{this.props.headerText}</td>
          <td className="table-data">
            {
              this.props.itemInfos.map(function(itemInfo){
                return <Item peopleInfos={self.props.peopleInfos} key={itemInfo.id} itemInfo={itemInfo} updateItem={self.updateItem} deleteItem={self.deleteItem}/>
              })
            }
            <AddItemBtn addItem={this.addItem}/>
          </td>
        </tr>
      );
    }
  });

  var BigSizeTopicRow = React.createClass({
    updateTitle: function(newTitle){
      var oldTitle = this.props.topicInfo.title;
      this.props.updateTopicTitle(this.props.topicInfo.id, newTitle);
    },
    deleteTopicRow: function(){
      this.props.deleteTopic(this.props.topicInfo);
    },
    render: function(){
      var topicTitle = this.props.topicInfo.title;

      return (
        <tr>
          <TitleColumn topicInfo={this.props.topicInfo} deleteTopic={this.props.deleteTopic} updateTitle={this.updateTitle} />
          <BigSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col1Items} submitDelta={this.props.submitDelta} columnType="col1"/>
          <BigSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col2Items} submitDelta={this.props.submitDelta} columnType="col2"/>
          <BigSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col3Items} submitDelta={this.props.submitDelta} columnType="col3"/>
        </tr>);
    }
  });

  var SmallSizeTopicRow = React.createClass({
    clickHandler: function(){
      var self = this;
      var existingContent = this.props.topicInfo.title;
      gadgets.sapjam.asyncMessage.post(existingContent, function(token) {
        gadgets.views.openGadget(function(result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.props.deleteTopic(self.props.topicInfo);
            } else {
              return self.updateTitle(result.text);
            }
          } else {
            return null;
          }
        }, function(site) {
          return null;
        },
          {
            view: 'dialog-edit_item',
            viewTarget: 'MODALDIALOG',
            viewParams: {type: 'topic', paramsKey: token}
          }
        );
      });
    },

    updateTitle: function(newTitle){
      var oldTitle = this.props.topicInfo.title;
      this.props.updateTopicTitle(this.props.topicInfo.id, newTitle);
    },

    render: function(){
      return (
          <table className="data-table">
            <tr className="height-44" onClick={this.clickHandler}><td className="option-data topic-row-small-mode" colSpan="2">{this.props.topicInfo.title}</td></tr>
            <SmallSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col1Items} submitDelta={this.props.submitDelta} columnType="col1" headerText={this.props.col1HeaderText}/>
            <SmallSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col2Items} submitDelta={this.props.submitDelta} columnType="col2" headerText={this.props.col2HeaderText}/>
            <SmallSizeItemColumn topicTitle={this.props.topicInfo.title} peopleInfos={this.props.peopleInfos} topicId={this.props.topicInfo.id} itemInfos={this.props.topicInfo.col3Items} submitDelta={this.props.submitDelta} columnType="col3" headerText={this.props.col3HeaderText}/>
          </table>
      );
    }
  });
  
  var TopicListMixin = {
    col1HeaderClicked: function(e){
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col1HeaderText, this.setCol1HeaderText);
    },

    col2HeaderClicked: function(e){
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col2HeaderText, this.setCol2HeaderText);
    },

    col3HeaderClicked: function(e){
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col3HeaderText, this.setCol3HeaderText);
    },

    setCol1HeaderText: function(text) {
      var delta = {};
      delta["col1HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    setCol2HeaderText: function(text) {
      var delta = {};
      delta["col2HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    setCol3HeaderText: function(text) {
      var delta = {};
      delta["col3HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    columnHeaderClicked: function(colHeaderText, setTextCallback){
      var self = this;
      gadgets.views.openGadget(function(result) {
        setTextCallback(result.text);
      }, function(site) {
        return null;
      },
        {
          view: 'dialog-add_item',
          viewTarget: 'MODALDIALOG',
          viewParams: {type: 'ColumnHeader', existingContent: colHeaderText}
        }
      );
    }
  };

  var BigSizeTopicList = React.createClass({
    mixins: [TopicListMixin],

    render: function(){
      var deleteTopic = this.props.deleteTopic;
      var updateTopicTitle = this.props.updateTopicTitle;
      var submitDelta = this.props.submitDelta;
      var defaultRowClass = "height-44";
      var peopleInfos = this.props.peopleInfos;
      if (this.props.topicInfos != null && this.props.topicInfos.length != 0){
        defaultRowClass += " no-display";
      }

      return (<tbody>
                <tr>
                  <td className="option-data topic-column-width"></td>
                  <td className="table-header item-column-width" onClick={this.col1HeaderClicked}>{this.props.col1HeaderText}</td>
                  <td className="table-header item-column-width" onClick={this.col2HeaderClicked}>{this.props.col2HeaderText}</td>
                  <td className="table-header item-column-width" onClick={this.col3HeaderClicked}>{this.props.col3HeaderText}</td>
                </tr>
                <tr className={defaultRowClass}>
                  <td className="option-data"></td>
                  <td className="table-data"></td>
                  <td className="table-data"></td>
                  <td className="table-data"></td>
                </tr>
                {
                  this.props.topicInfos != null && this.props.topicInfos.map(function(topicInfo){
                    return <BigSizeTopicRow key={topicInfo.id} topicInfo={topicInfo} peopleInfos={peopleInfos} deleteTopic={deleteTopic} updateTopicTitle={updateTopicTitle} submitDelta={submitDelta}/>
                  })
                }
              </tbody>
              );
    }
  });

  var SmallSizeTopicList = React.createClass({
    mixins: [TopicListMixin],

    render: function(){
      var deleteTopic = this.props.deleteTopic;
      var updateTopicTitle = this.props.updateTopicTitle;
      var submitDelta = this.props.submitDelta;
      var defaultTableClass = "data-table";
      var peopleInfos = this.props.peopleInfos;
      if (this.props.topicInfos != null && this.props.topicInfos.length != 0){
        defaultTableClass += " no-display";
      }
      var self = this;

      return (<div>
                <table className={defaultTableClass}>
                  <tr className="height-44"><td className="option-data" colSpan="2"></td></tr>
                  <tr className="height-44"><td className="table-header">{this.props.col1HeaderText}</td><td className="option-data"></td></tr>
                  <tr className="height-44"><td className="table-header">{this.props.col2HeaderText}</td><td className="option-data"></td></tr>
                  <tr className="height-44"><td className="table-header">{this.props.col3HeaderText}</td><td className="option-data"></td></tr>
                </table>
                {
                  this.props.topicInfos != null && this.props.topicInfos.map(function(topicInfo){
                    return <SmallSizeTopicRow key={topicInfo.id} topicInfo={topicInfo} peopleInfos={peopleInfos} deleteTopic={deleteTopic} updateTopicTitle={updateTopicTitle} submitDelta={submitDelta} col1HeaderText={self.props.col1HeaderText} col2HeaderText={self.props.col2HeaderText} col3HeaderText={self.props.col3HeaderText}/>
                  })
                }
              </div>
              );
    }
  });

  var TopicListContainerMixin = {
    addTopicBtnClicked: function(e){
      e.stopPropagation();

      var self = this;
      gadgets.views.openGadget(function(result) {
        return result ? self.addTopic(result.text) : null;
      }, function(site) {
        return null;
      },
        {
          view: 'dialog-add_item',
          viewTarget: 'MODALDIALOG',
          viewParams: {type: 'topic'}
        }
      );
    },

    addTopic: function(text) {
      this.props.addTopic(text);
    },

    componentDidMount: function() {
      adjustHeight();
      Common.onEvent(window, 'resize', adjustHeight);
    },

    componentDidUpdate: function() {
      adjustHeight();
      // Another call to adjustHeight() is done to account for any latent updates from render
      // Since componentDidUpdate is called after React has accounted for state changes and not
      // Necessarily after the frame is painted. See CUB-20725
      window.setTimeout(adjustHeight, 500);
    },
  };

  var BigSizeTopicListContainer = React.createClass({
    mixins: [TopicListContainerMixin],
    render: function(){
      var Button = ReactBootstrap.Button;
      return (
        <div className="full-comparison-table">
          <table className="data-table">
            <BigSizeTopicList topicInfos={this.props.topicInfos} peopleInfos={this.props.peopleInfos} deleteTopic={this.props.deleteTopic} updateTopicTitle={this.props.updateTopicTitle} submitDelta={this.props.submitDelta} col1HeaderText={this.props.col1HeaderText} col2HeaderText={this.props.col2HeaderText} col3HeaderText={this.props.col3HeaderText}/>
          </table>
          <Button type="button" onClick={this.addTopicBtnClicked} className="margin-top-5">{getLocale("add_topic")}</Button>
        </div>
      );
    }
  });

  var SmallSizeTopicListContainer = React.createClass({
    mixins: [TopicListContainerMixin],
    render: function(){
      var Button = ReactBootstrap.Button;
      var Input = ReactBootstrap.Input;
      var innerButton = <Button type="button" onClick={this.addTopic}>{getLocale("add_topic")}</Button>;
      return (
        <div className="small-comparison-table">
          <SmallSizeTopicList topicInfos={this.props.topicInfos} peopleInfos={this.props.peopleInfos} deleteTopic={this.props.deleteTopic} updateTopicTitle={this.props.updateTopicTitle} submitDelta={this.props.submitDelta} col1HeaderText={this.props.col1HeaderText} col2HeaderText={this.props.col2HeaderText} col3HeaderText={this.props.col3HeaderText}/>
          <Button type="button" onClick={this.addTopicBtnClicked} className="margin-top-5 full-width">{getLocale("add_topic")}</Button>
        </div>
      );
    }
  });

  var ComparisonTable = React.createClass({
    submitDelta: function(delta) {
      var waveData = this.state.waveData;
      for(var key in delta){
        waveData[key] = delta[key];
      }
      this.setState({waveData: waveData});

      wave.getState().submitDelta(delta);
    },

    getInitialState: function() {
      return {waveData: {}};
    },

    createTopicInfo: function(title, id, date) {
      return {title: title, id: id, createdDate: date, col1Items: [], col2Items: [], col3Items: []};
    },

    createTopicWaveDelta: function(title, id) {
      var delta = {};
      delta[id] = {type: "topic", "title": title, createdDate: Date.now()};
      return delta;
    },

    createItemInfo: function(content, id, creatorId, createdDate) {
      return {content: content, id: id, creatorId: creatorId, createdDate: createdDate};
    },

    addTopic: function(title){
      this.submitDelta(this.createTopicWaveDelta(title, guid()));
    },

    deleteTopic: function(topicInfo){
      var delta = {};
      delta[topicInfo.id] = null;
      this.submitDelta(delta);
    },

    updateTopicTitle: function(topicId, newTitle){
      var topicInfo = this.state.waveData[topicId];
      topicInfo.title = newTitle;
      var delta = {};
      delta[topicId] = topicInfo;
      this.submitDelta(delta);
    },

    getTopicInfos: function(waveData) {
      var topicInfos = [];

      for(var key in waveData){
        var item = waveData[key];
        if (item != null && item.type == "topic"){
          var topicInfo = this.createTopicInfo(item.title, key, item.createdDate);
          topicInfos.push(topicInfo);
        }
      }

      for (var key in waveData){
        var item = waveData[key];
        if (item != null && (item.type == "col1" || item.type == "col2" || item.type == "col3")){
          var itemInfo = this.createItemInfo(item.content, key, item.creatorId, item.createdDate);
          var parentTopicId = item.topicId;
          for (var j = 0; j < topicInfos.length; ++j){
            if (topicInfos[j].id == parentTopicId)
            {
              if (item.type == "col1") {
                topicInfos[j].col1Items.push(itemInfo);
              } else if (item.type == "col2") {
                topicInfos[j].col2Items.push(itemInfo);
              } else{
                topicInfos[j].col3Items.push(itemInfo);
              }
            }
          }
        }
      }

      topicInfos.sort(function(a,b){return a.createdDate > b.createdDate ? 1 : -1;});
      return topicInfos;
    },

    getPeopleInfos: function(waveData) {
      var peopleInfos = [];

      for(var key in waveData){
        var item = waveData[key];
        if (item != null && item.type == "user"){
          peopleInfos.push({userId: key, cachedUserName: item.cachedUserName});
        }
      }

      return peopleInfos;
    },
    
    componentDidMount: function() {
      var self = this;
      var onWaveUpdate = function(){
        var waveData = {};
        var waveState = wave.getState();
        waveState.getKeys().forEach(function(key){
          waveData[key] = waveState.get(key);
        });
        self.setState({waveData: waveData});
      };

      wave.setStateCallback(onWaveUpdate);
    },
    
    getCol1HeaderText: function() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col1HeaderText"] != null) {
        text = this.state.waveData["col1HeaderText"];
      }
      return text;
    },

    getCol2HeaderText: function() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col2HeaderText"] != null) {
        text = this.state.waveData["col2HeaderText"];
      }
      return text;
    },

    getCol3HeaderText: function() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col3HeaderText"] != null) {
        text = this.state.waveData["col3HeaderText"];
      }
      return text;
    },

    render: function() {
      return(
        <div className="comparison-table">
          <BigSizeTopicListContainer topicInfos={this.getTopicInfos(this.state.waveData)} peopleInfos={this.getPeopleInfos(this.state.waveData)} deleteTopic={this.deleteTopic} updateTopicTitle={this.updateTopicTitle} addTopic={this.addTopic} col1HeaderText={this.getCol1HeaderText()} col2HeaderText={this.getCol2HeaderText()} col3HeaderText={this.getCol3HeaderText()} submitDelta={this.submitDelta}/>
          <SmallSizeTopicListContainer topicInfos={this.getTopicInfos(this.state.waveData)} peopleInfos={this.getPeopleInfos(this.state.waveData)} deleteTopic={this.deleteTopic} updateTopicTitle={this.updateTopicTitle} addTopic={this.addTopic} col1HeaderText={this.getCol1HeaderText()} col2HeaderText={this.getCol2HeaderText()} col3HeaderText={this.getCol3HeaderText()} submitDelta={this.submitDelta}/>
        </div>
      );
    }
  });

  ReactDOM.render(<ComparisonTable/>, document.getElementById('react-mount'));

  $(window).resize();
}

gadgets.util.registerOnLoadHandler(function() { init(ReactBootstrap, jQuery); });
