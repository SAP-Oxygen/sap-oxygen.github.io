"use strict";

function init(ReactBootstrap, jQuery) {
  // shindig will ignore @media definition when merge all css together.
  // Here we use jquery to control the visibility of big size table and small size table as a walkaround.
  var $ = jQuery;
  $(document).ready(function () {
    $(window).resize(function () {
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
    displayName: "TitleColumn",

    clickHandler: function clickHandler() {
      var self = this;
      var existingContent = this.props.topicInfo.title;
      gadgets.sapjam.asyncMessage.post(existingContent, function (token) {
        gadgets.views.openGadget(function (result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.props.deleteTopic(self.props.topicInfo);
            } else {
              return self.updateTitle(result.text);
            }
          } else {
            return null;
          }
        }, function (site) {
          return null;
        }, {
          view: 'dialog-edit_item',
          viewTarget: 'MODALDIALOG',
          viewParams: { type: 'topic', paramsKey: token }
        });
      });
    },

    updateTitle: function updateTitle(newTopicTitle) {
      if (this.props.topicInfo.title != newTopicTitle) {
        this.props.updateTitle(newTopicTitle);
      }
    },

    render: function render() {
      return React.createElement(
        "td",
        { className: "option-data", onClick: this.clickHandler },
        React.createElement(
          "span",
          null,
          this.props.topicInfo.title
        )
      );
    }
  });

  var AddItemBtn = React.createClass({
    displayName: "AddItemBtn",

    clickHandler: function clickHandler(e) {
      e.stopPropagation();

      var self = this;
      gadgets.views.openGadget(function (result) {
        return result ? self.addItem(result.text) : null;
      }, function (site) {
        return null;
      }, {
        view: 'dialog-add_item',
        viewTarget: 'MODALDIALOG'
      });
    },

    addItem: function addItem(newContent) {
      this.props.addItem(newContent, wave.getViewer().id_);
    },

    render: function render() {
      return React.createElement(
        "div",
        { className: "option", onClick: this.clickHandler },
        React.createElement(
          "table",
          { className: "option-table" },
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { className: "full-text" },
              React.createElement(
                "span",
                { className: "add-option-text" },
                getLocale("click_to_add_item")
              )
            )
          )
        )
      );
    }
  });

  var Item = React.createClass({
    displayName: "Item",

    showModal: function showModal(e) {
      e.stopPropagation();
      if (this.props.itemInfo.creatorId != wave.getViewer().id_) {
        return;
      }
      var self = this;
      var existingContent = this.props.itemInfo.content;
      gadgets.sapjam.asyncMessage.post(existingContent, function (token) {
        gadgets.views.openGadget(function (result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.deleteItem();
            } else {
              return self.updateItem(result.text);
            }
          } else {
            return null;
          }
        }, function (site) {
          return null;
        }, {
          view: 'dialog-edit_item',
          viewTarget: 'MODALDIALOG',
          viewParams: { type: 'item', paramsKey: token }
        });
      });
    },

    updateItem: function updateItem(newProContent) {
      if (this.props.itemInfo.content != newProContent) {
        this.props.updateItem(this.props.itemInfo.id, newProContent);
      }
    },

    deleteItem: function deleteItem() {
      this.props.deleteItem(this.props.itemInfo.id);
    },

    render: function render() {
      return React.createElement(
        "div",
        { onClick: this.showModal },
        React.createElement(
          "table",
          { className: "option-table" },
          React.createElement(
            "tr",
            { className: "option-tr" },
            React.createElement(
              "td",
              { className: "full-text" },
              React.createElement(
                "span",
                null,
                this.props.itemInfo.content
              )
            )
          )
        )
      );
    }
  });

  var BigSizeItemColumn = React.createClass({
    displayName: "BigSizeItemColumn",

    createItemInfo: function createItemInfo(content, creatorId) {
      return { type: this.props.columnType, content: content, creatorId: creatorId, createdDate: Date.now(), topicId: this.props.topicId };
    },

    createUserInfo: function createUserInfo(userId, userName) {
      return { type: "user", cachedUserName: userName };
    },

    addItem: function addItem(content, creatorId) {
      var itemInfo = this.createItemInfo(content, creatorId);
      var delta = {};
      delta[guid()] = itemInfo;
      var userInfo = this.createUserInfo(creatorId, getCreatorFullName(creatorId));
      delta[creatorId] = userInfo;
      this.props.submitDelta(delta);
    },

    updateItem: function updateItem(itemId, newItemContent) {
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function (itemInfo) {
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

    deleteItem: function deleteItem(itemId) {
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function (itemInfo) {
          return itemInfo.id == itemId;
        })[0];

        var delta = {};
        delta[itemId] = null;
        this.props.submitDelta(delta);
      }
    },

    render: function render() {
      var self = this;
      return React.createElement(
        "td",
        { className: "table-data" },
        this.props.itemInfos.map(function (itemInfo) {
          return React.createElement(Item, { peopleInfos: self.props.peopleInfos, key: itemInfo.id, itemInfo: itemInfo, updateItem: self.updateItem, deleteItem: self.deleteItem });
        }),
        React.createElement(AddItemBtn, { addItem: this.addItem })
      );
    }
  });

  var SmallSizeItemColumn = React.createClass({
    displayName: "SmallSizeItemColumn",

    createItemInfo: function createItemInfo(content, creatorId) {
      return { type: this.props.columnType, content: content, creatorId: creatorId, createdDate: Date.now(), topicId: this.props.topicId };
    },

    createUserInfo: function createUserInfo(userId, userName) {
      return { type: "user", cachedUserName: userName };
    },

    addItem: function addItem(content, creatorId) {
      var itemInfo = this.createItemInfo(content, creatorId);
      var delta = {};
      delta[guid()] = itemInfo;
      var userInfo = this.createUserInfo(creatorId, getCreatorFullName(creatorId));
      delta[creatorId] = userInfo;
      this.props.submitDelta(delta);
    },

    updateItem: function updateItem(itemId, newItemContent) {
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function (itemInfo) {
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

    deleteItem: function deleteItem(itemId) {
      if (this.props.itemInfos != null) {
        var itemToBeUpdated = this.props.itemInfos.filter(function (itemInfo) {
          return itemInfo.id == itemId;
        })[0];

        var delta = {};
        delta[itemId] = null;
        this.props.submitDelta(delta);
      }
    },

    headerClicked: function headerClicked(e) {
      e.stopPropagation();
      var self = this;
      gadgets.views.openGadget(function (result) {
        self.setHeaderText(result.text);
      }, function (site) {
        return null;
      }, {
        view: 'dialog-add_item',
        viewTarget: 'MODALDIALOG',
        viewParams: { type: 'ColumnHeader', existingContent: self.props.headerText }
      });
    },

    setHeaderText: function setHeaderText(text) {
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

    render: function render() {
      var self = this;
      return React.createElement(
        "tr",
        { className: "height-44" },
        React.createElement(
          "td",
          { className: "table-header", onClick: this.headerClicked },
          this.props.headerText
        ),
        React.createElement(
          "td",
          { className: "table-data" },
          this.props.itemInfos.map(function (itemInfo) {
            return React.createElement(Item, { peopleInfos: self.props.peopleInfos, key: itemInfo.id, itemInfo: itemInfo, updateItem: self.updateItem, deleteItem: self.deleteItem });
          }),
          React.createElement(AddItemBtn, { addItem: this.addItem })
        )
      );
    }
  });

  var BigSizeTopicRow = React.createClass({
    displayName: "BigSizeTopicRow",

    updateTitle: function updateTitle(newTitle) {
      var oldTitle = this.props.topicInfo.title;
      this.props.updateTopicTitle(this.props.topicInfo.id, newTitle);
    },
    deleteTopicRow: function deleteTopicRow() {
      this.props.deleteTopic(this.props.topicInfo);
    },
    render: function render() {
      var topicTitle = this.props.topicInfo.title;

      return React.createElement(
        "tr",
        null,
        React.createElement(TitleColumn, { topicInfo: this.props.topicInfo, deleteTopic: this.props.deleteTopic, updateTitle: this.updateTitle }),
        React.createElement(BigSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col1Items, submitDelta: this.props.submitDelta, columnType: "col1" }),
        React.createElement(BigSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col2Items, submitDelta: this.props.submitDelta, columnType: "col2" }),
        React.createElement(BigSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col3Items, submitDelta: this.props.submitDelta, columnType: "col3" })
      );
    }
  });

  var SmallSizeTopicRow = React.createClass({
    displayName: "SmallSizeTopicRow",

    clickHandler: function clickHandler() {
      var self = this;
      var existingContent = this.props.topicInfo.title;
      gadgets.sapjam.asyncMessage.post(existingContent, function (token) {
        gadgets.views.openGadget(function (result) {
          if (result !== null) {
            if (result.shouldDelete) {
              return self.props.deleteTopic(self.props.topicInfo);
            } else {
              return self.updateTitle(result.text);
            }
          } else {
            return null;
          }
        }, function (site) {
          return null;
        }, {
          view: 'dialog-edit_item',
          viewTarget: 'MODALDIALOG',
          viewParams: { type: 'topic', paramsKey: token }
        });
      });
    },

    updateTitle: function updateTitle(newTitle) {
      var oldTitle = this.props.topicInfo.title;
      this.props.updateTopicTitle(this.props.topicInfo.id, newTitle);
    },

    render: function render() {
      return React.createElement(
        "table",
        { className: "data-table" },
        React.createElement(
          "tr",
          { className: "height-44", onClick: this.clickHandler },
          React.createElement(
            "td",
            { className: "option-data topic-row-small-mode", colSpan: "2" },
            this.props.topicInfo.title
          )
        ),
        React.createElement(SmallSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col1Items, submitDelta: this.props.submitDelta, columnType: "col1", headerText: this.props.col1HeaderText }),
        React.createElement(SmallSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col2Items, submitDelta: this.props.submitDelta, columnType: "col2", headerText: this.props.col2HeaderText }),
        React.createElement(SmallSizeItemColumn, { topicTitle: this.props.topicInfo.title, peopleInfos: this.props.peopleInfos, topicId: this.props.topicInfo.id, itemInfos: this.props.topicInfo.col3Items, submitDelta: this.props.submitDelta, columnType: "col3", headerText: this.props.col3HeaderText })
      );
    }
  });

  var TopicListMixin = {
    col1HeaderClicked: function col1HeaderClicked(e) {
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col1HeaderText, this.setCol1HeaderText);
    },

    col2HeaderClicked: function col2HeaderClicked(e) {
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col2HeaderText, this.setCol2HeaderText);
    },

    col3HeaderClicked: function col3HeaderClicked(e) {
      e.stopPropagation();
      this.columnHeaderClicked(this.props.col3HeaderText, this.setCol3HeaderText);
    },

    setCol1HeaderText: function setCol1HeaderText(text) {
      var delta = {};
      delta["col1HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    setCol2HeaderText: function setCol2HeaderText(text) {
      var delta = {};
      delta["col2HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    setCol3HeaderText: function setCol3HeaderText(text) {
      var delta = {};
      delta["col3HeaderText"] = text;
      this.props.submitDelta(delta);
    },

    columnHeaderClicked: function columnHeaderClicked(colHeaderText, setTextCallback) {
      var self = this;
      gadgets.views.openGadget(function (result) {
        setTextCallback(result.text);
      }, function (site) {
        return null;
      }, {
        view: 'dialog-add_item',
        viewTarget: 'MODALDIALOG',
        viewParams: { type: 'ColumnHeader', existingContent: colHeaderText }
      });
    }
  };

  var BigSizeTopicList = React.createClass({
    displayName: "BigSizeTopicList",

    mixins: [TopicListMixin],

    render: function render() {
      var deleteTopic = this.props.deleteTopic;
      var updateTopicTitle = this.props.updateTopicTitle;
      var submitDelta = this.props.submitDelta;
      var defaultRowClass = "height-44";
      var peopleInfos = this.props.peopleInfos;
      if (this.props.topicInfos != null && this.props.topicInfos.length != 0) {
        defaultRowClass += " no-display";
      }

      return React.createElement(
        "tbody",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("td", { className: "option-data topic-column-width" }),
          React.createElement(
            "td",
            { className: "table-header item-column-width", onClick: this.col1HeaderClicked },
            this.props.col1HeaderText
          ),
          React.createElement(
            "td",
            { className: "table-header item-column-width", onClick: this.col2HeaderClicked },
            this.props.col2HeaderText
          ),
          React.createElement(
            "td",
            { className: "table-header item-column-width", onClick: this.col3HeaderClicked },
            this.props.col3HeaderText
          )
        ),
        React.createElement(
          "tr",
          { className: defaultRowClass },
          React.createElement("td", { className: "option-data" }),
          React.createElement("td", { className: "table-data" }),
          React.createElement("td", { className: "table-data" }),
          React.createElement("td", { className: "table-data" })
        ),
        this.props.topicInfos != null && this.props.topicInfos.map(function (topicInfo) {
          return React.createElement(BigSizeTopicRow, { key: topicInfo.id, topicInfo: topicInfo, peopleInfos: peopleInfos, deleteTopic: deleteTopic, updateTopicTitle: updateTopicTitle, submitDelta: submitDelta });
        })
      );
    }
  });

  var SmallSizeTopicList = React.createClass({
    displayName: "SmallSizeTopicList",

    mixins: [TopicListMixin],

    render: function render() {
      var deleteTopic = this.props.deleteTopic;
      var updateTopicTitle = this.props.updateTopicTitle;
      var submitDelta = this.props.submitDelta;
      var defaultTableClass = "data-table";
      var peopleInfos = this.props.peopleInfos;
      if (this.props.topicInfos != null && this.props.topicInfos.length != 0) {
        defaultTableClass += " no-display";
      }
      var self = this;

      return React.createElement(
        "div",
        null,
        React.createElement(
          "table",
          { className: defaultTableClass },
          React.createElement(
            "tr",
            { className: "height-44" },
            React.createElement("td", { className: "option-data", colSpan: "2" })
          ),
          React.createElement(
            "tr",
            { className: "height-44" },
            React.createElement(
              "td",
              { className: "table-header" },
              this.props.col1HeaderText
            ),
            React.createElement("td", { className: "option-data" })
          ),
          React.createElement(
            "tr",
            { className: "height-44" },
            React.createElement(
              "td",
              { className: "table-header" },
              this.props.col2HeaderText
            ),
            React.createElement("td", { className: "option-data" })
          ),
          React.createElement(
            "tr",
            { className: "height-44" },
            React.createElement(
              "td",
              { className: "table-header" },
              this.props.col3HeaderText
            ),
            React.createElement("td", { className: "option-data" })
          )
        ),
        this.props.topicInfos != null && this.props.topicInfos.map(function (topicInfo) {
          return React.createElement(SmallSizeTopicRow, { key: topicInfo.id, topicInfo: topicInfo, peopleInfos: peopleInfos, deleteTopic: deleteTopic, updateTopicTitle: updateTopicTitle, submitDelta: submitDelta, col1HeaderText: self.props.col1HeaderText, col2HeaderText: self.props.col2HeaderText, col3HeaderText: self.props.col3HeaderText });
        })
      );
    }
  });

  var TopicListContainerMixin = {
    addTopicBtnClicked: function addTopicBtnClicked(e) {
      e.stopPropagation();

      var self = this;
      gadgets.views.openGadget(function (result) {
        return result ? self.addTopic(result.text) : null;
      }, function (site) {
        return null;
      }, {
        view: 'dialog-add_item',
        viewTarget: 'MODALDIALOG',
        viewParams: { type: 'topic' }
      });
    },

    addTopic: function addTopic(text) {
      this.props.addTopic(text);
    },

    componentDidMount: function componentDidMount() {
      adjustHeight();
      Common.onEvent(window, 'resize', adjustHeight);
    },

    componentDidUpdate: function componentDidUpdate() {
      adjustHeight();
      // Another call to adjustHeight() is done to account for any latent updates from render
      // Since componentDidUpdate is called after React has accounted for state changes and not
      // Necessarily after the frame is painted. See CUB-20725
      window.setTimeout(adjustHeight, 500);
    }
  };

  var BigSizeTopicListContainer = React.createClass({
    displayName: "BigSizeTopicListContainer",

    mixins: [TopicListContainerMixin],
    render: function render() {
      var Button = ReactBootstrap.Button;
      return React.createElement(
        "div",
        { className: "full-comparison-table" },
        React.createElement(
          "table",
          { className: "data-table" },
          React.createElement(BigSizeTopicList, { topicInfos: this.props.topicInfos, peopleInfos: this.props.peopleInfos, deleteTopic: this.props.deleteTopic, updateTopicTitle: this.props.updateTopicTitle, submitDelta: this.props.submitDelta, col1HeaderText: this.props.col1HeaderText, col2HeaderText: this.props.col2HeaderText, col3HeaderText: this.props.col3HeaderText })
        ),
        React.createElement(
          Button,
          { type: "button", onClick: this.addTopicBtnClicked, className: "margin-top-5" },
          getLocale("add_topic")
        )
      );
    }
  });

  var SmallSizeTopicListContainer = React.createClass({
    displayName: "SmallSizeTopicListContainer",

    mixins: [TopicListContainerMixin],
    render: function render() {
      var Button = ReactBootstrap.Button;
      var Input = ReactBootstrap.Input;
      var innerButton = React.createElement(
        Button,
        { type: "button", onClick: this.addTopic },
        getLocale("add_topic")
      );
      return React.createElement(
        "div",
        { className: "small-comparison-table" },
        React.createElement(SmallSizeTopicList, { topicInfos: this.props.topicInfos, peopleInfos: this.props.peopleInfos, deleteTopic: this.props.deleteTopic, updateTopicTitle: this.props.updateTopicTitle, submitDelta: this.props.submitDelta, col1HeaderText: this.props.col1HeaderText, col2HeaderText: this.props.col2HeaderText, col3HeaderText: this.props.col3HeaderText }),
        React.createElement(
          Button,
          { type: "button", onClick: this.addTopicBtnClicked, className: "margin-top-5 full-width" },
          getLocale("add_topic")
        )
      );
    }
  });

  var ComparisonTable = React.createClass({
    displayName: "ComparisonTable",

    submitDelta: function submitDelta(delta) {
      var waveData = this.state.waveData;
      for (var key in delta) {
        waveData[key] = delta[key];
      }
      this.setState({ waveData: waveData });

      wave.getState().submitDelta(delta);
    },

    getInitialState: function getInitialState() {
      return { waveData: {} };
    },

    createTopicInfo: function createTopicInfo(title, id, date) {
      return { title: title, id: id, createdDate: date, col1Items: [], col2Items: [], col3Items: [] };
    },

    createTopicWaveDelta: function createTopicWaveDelta(title, id) {
      var delta = {};
      delta[id] = { type: "topic", "title": title, createdDate: Date.now() };
      return delta;
    },

    createItemInfo: function createItemInfo(content, id, creatorId, createdDate) {
      return { content: content, id: id, creatorId: creatorId, createdDate: createdDate };
    },

    addTopic: function addTopic(title) {
      this.submitDelta(this.createTopicWaveDelta(title, guid()));
    },

    deleteTopic: function deleteTopic(topicInfo) {
      var delta = {};
      delta[topicInfo.id] = null;
      this.submitDelta(delta);
    },

    updateTopicTitle: function updateTopicTitle(topicId, newTitle) {
      var topicInfo = this.state.waveData[topicId];
      topicInfo.title = newTitle;
      var delta = {};
      delta[topicId] = topicInfo;
      this.submitDelta(delta);
    },

    getTopicInfos: function getTopicInfos(waveData) {
      var topicInfos = [];

      for (var key in waveData) {
        var item = waveData[key];
        if (item != null && item.type == "topic") {
          var topicInfo = this.createTopicInfo(item.title, key, item.createdDate);
          topicInfos.push(topicInfo);
        }
      }

      for (var key in waveData) {
        var item = waveData[key];
        if (item != null && (item.type == "col1" || item.type == "col2" || item.type == "col3")) {
          var itemInfo = this.createItemInfo(item.content, key, item.creatorId, item.createdDate);
          var parentTopicId = item.topicId;
          for (var j = 0; j < topicInfos.length; ++j) {
            if (topicInfos[j].id == parentTopicId) {
              if (item.type == "col1") {
                topicInfos[j].col1Items.push(itemInfo);
              } else if (item.type == "col2") {
                topicInfos[j].col2Items.push(itemInfo);
              } else {
                topicInfos[j].col3Items.push(itemInfo);
              }
            }
          }
        }
      }

      topicInfos.sort(function (a, b) {
        return a.createdDate > b.createdDate ? 1 : -1;
      });
      return topicInfos;
    },

    getPeopleInfos: function getPeopleInfos(waveData) {
      var peopleInfos = [];

      for (var key in waveData) {
        var item = waveData[key];
        if (item != null && item.type == "user") {
          peopleInfos.push({ userId: key, cachedUserName: item.cachedUserName });
        }
      }

      return peopleInfos;
    },

    componentDidMount: function componentDidMount() {
      var self = this;
      var onWaveUpdate = function onWaveUpdate() {
        var waveData = {};
        var waveState = wave.getState();
        waveState.getKeys().forEach(function (key) {
          waveData[key] = waveState.get(key);
        });
        self.setState({ waveData: waveData });
      };

      wave.setStateCallback(onWaveUpdate);
    },

    getCol1HeaderText: function getCol1HeaderText() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col1HeaderText"] != null) {
        text = this.state.waveData["col1HeaderText"];
      }
      return text;
    },

    getCol2HeaderText: function getCol2HeaderText() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col2HeaderText"] != null) {
        text = this.state.waveData["col2HeaderText"];
      }
      return text;
    },

    getCol3HeaderText: function getCol3HeaderText() {
      text = getLocale("click_to_edit_title");
      if (this.state.waveData["col3HeaderText"] != null) {
        text = this.state.waveData["col3HeaderText"];
      }
      return text;
    },

    render: function render() {
      return React.createElement(
        "div",
        { className: "comparison-table" },
        React.createElement(BigSizeTopicListContainer, { topicInfos: this.getTopicInfos(this.state.waveData), peopleInfos: this.getPeopleInfos(this.state.waveData), deleteTopic: this.deleteTopic, updateTopicTitle: this.updateTopicTitle, addTopic: this.addTopic, col1HeaderText: this.getCol1HeaderText(), col2HeaderText: this.getCol2HeaderText(), col3HeaderText: this.getCol3HeaderText(), submitDelta: this.submitDelta }),
        React.createElement(SmallSizeTopicListContainer, { topicInfos: this.getTopicInfos(this.state.waveData), peopleInfos: this.getPeopleInfos(this.state.waveData), deleteTopic: this.deleteTopic, updateTopicTitle: this.updateTopicTitle, addTopic: this.addTopic, col1HeaderText: this.getCol1HeaderText(), col2HeaderText: this.getCol2HeaderText(), col3HeaderText: this.getCol3HeaderText(), submitDelta: this.submitDelta })
      );
    }
  });

  ReactDOM.render(React.createElement(ComparisonTable, null), document.getElementById('react-mount'));

  $(window).resize();
}

gadgets.util.registerOnLoadHandler(function () {
  init(ReactBootstrap, jQuery);
});