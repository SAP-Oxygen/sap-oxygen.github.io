'use strict'

var init = function(React, $, moment, gadgets, wave) {
  
  var adjustHeight = function() {
    var initHeight = 400;
    var height = $("#container").height();
    // add height of 65
    if (height > initHeight) {
      gadgets.window.adjustHeight();
    }
  };

  var Agenda = React.createClass({
    getInitialState: function() {
      var setTime = moment();
      return {
        items: [],
        order: [],
        itemsMap: {},
        setTime: setTime,
        people: [],
        dragging: false,
        lastWaveData: {}
      }
    },
    componentDidMount: function() {
      var self = this;

      var onWaveUpdate = function() {
        // currently disabled writing setTime variable in wave
        var waveState = wave.getState();
        var waveData = {};
        $.each(waveState.getKeys(), function(index, key) {
          waveData[key] = waveState.get(key);
        });
        var lastWaveData = self.state.lastWaveData;
        // console.log("waveData: ");
        // console.log(waveData);
        // console.log("lastWaveData: ");
        // console.log(lastWaveData);
        // console.log("dragging: ");
        // console.log(self.state.dragging);

        // if dragging variable of the current state is true,
        // then store the current waveData and do not update the state
        if (self.state.dragging) {
          self.setState({
            lastWaveData: waveData
          });
        } else if (!$.isEmptyObject(waveData)) {
          var order = waveData["order"] || [];
          var setTime = waveData["setTime"];
          delete waveData["order"];
          delete waveData["setTime"];
          // if there is setTime stored in wave, set setTime of 
          // Agenda's state to wave's setTime
          if (setTime) {
            var setTimeMoment = moment(setTime);
            self.setState({
              order: order,
              itemsMap: waveData,
              setTime: setTimeMoment
            });
          } else {
            self.setState({
              order: order,
              itemsMap: waveData
            });
          }
        }
      };

      var onWaveParticipant = function() {
        if (wave.getViewer()) {
          var people = [];
          var participants = wave.getParticipants();
          participants.forEach(function(value) {
            people.push({id: value.id_, text: value.displayName_, thumbnailUrl: value.thumbnailUrl_});
          });
          self.setState({
            people: people
          });
        }
      };

      wave.setStateCallback(onWaveUpdate);
      wave.setParticipantCallback(onWaveParticipant);
    },
    handleTimeChange: function(newTime) {
      this.setState({
        setTime: newTime
      });
      var waveData = {};
      waveData["setTime"] = newTime;
      wave.getState().submitDelta(waveData);
    },
    handleAdd: function() {
      // generate a random number from 0 to 1000 for newItemId
      var getRandomInt = function() {
        return Math.floor(Math.random() * (1000 - 1));
      };
      // generate a timestamp for newItemId
      var getCurrentTime = function() {
        if (!Date.now) {
          return new Date().getTime();
        } else {
          return Date.now(); 
        }
      };
      var newItemId = "item-" + getCurrentTime() + "-" + getRandomInt();
      var newItem = {id: newItemId, topic: "", desc: "", time: 0, owner: "", color: "none"};
      var newOrder = this.state.order.concat([newItemId]);
      var newItemMap = {};
      newItemMap[newItemId] = newItem;
      var newItemsMap = $.extend(this.state.itemsMap, newItemMap);
      this.setState({
        order: newOrder,
        itemsMap: newItemsMap
      });
      var waveData = {};
      waveData[newItemId] = newItem;
      waveData["order"] = newOrder;
      wave.getState().submitDelta(waveData);
    },
    handleRemove: function(itemId) {
      // remove the itemId from order array and create a new
      // items array based on the updated order array
      // do not change the itemsMap for now because it is not
      // possible to remove JSON objects from wave
      var order = this.state.order.slice();
      var index = $.inArray(itemId, order);
      if (index > -1) {
        order.splice(index, 1);
      }
      this.setState({
        order: order
      });
      var waveData = {};
      waveData["order"] = order;
      wave.getState().submitDelta(waveData);
    },
    handleDialogEdit: function(item) {
      var newItemsMap = $.extend({}, this.state.itemsMap);
      newItemsMap[item.id] = item;
      this.setState({
        itemsMap: newItemsMap
      });
      var waveData = {};
      waveData[item.id] = item;
      wave.getState().submitDelta(waveData);
    },
    handleDraggingStatus: function(status) {
      // when current dragging is true and the status passed to this function is false
      // (an item has been dropped) set the state with data in lastWaveData
      // and reset lastWaveData to an empty object
      if (this.state.dragging && !$.isEmptyObject(this.state.waveData) && !status) {
        // make a deep copy of lastWaveData to avoid reference problems
        var lastWaveData = jQuery.extend(true, {}, this.state.lastWaveData);
        this.setState({
          items: lastWaveData.items,
          lastWaveData: {}
        });
      }
      // set dragging to the status passed to this function
      this.setState({
        dragging: status
      });
    },
    handleSort: function(newOrder) {
      this.setState({
        order: newOrder
      });
    },
    handleDragEnd: function(newOrder) {
      var order = this.state.order.slice();
      var waveData = {};
      waveData["order"] = order;
      wave.getState().submitDelta(waveData);
    },
    render: function() {
      var items = [];
      var itemsMap = this.state.itemsMap;
      this.state.order.forEach(function(itemId) {
        items.push(itemsMap[itemId]);
      });
      return (
        <div id="container">
          <DateTimePicker onTimeChange={this.handleTimeChange} />
          <AgendaTable 
            items={items} 
            setTime={this.state.setTime} 
            people={this.state.people} 
            onEdit={this.handleEdit} 
            onRemove={this.handleRemove} 
            onDialogEdit={this.handleDialogEdit} 
            onDraggingStatus={this.handleDraggingStatus}
            order={this.state.order}
            onSort={this.handleSort}
            onDragEnd={this.handleDragEnd} />
          <AddButton onAdd={this.handleAdd} />
        </div>
      );
    }
  });

  var TableHead = React.createClass({
    render: function(){
      return (
        <li className="table-head">
          <div className="div-table-cell th index-col">
            <span className="glyphicon glyphicon-chevron-down index-glyphicon" aria-hidden="true"></span>
          </div>
          <div className="div-table-cell th time-col">Time</div>
          <div className="div-table-cell th duration-col">Duration</div>
          <div className="div-table-cell th main-col">Topic</div>
          <div className="div-table-cell th presenter-col">Presenter</div>
          <div className="div-table-cell th edit-col">
            <span className="glyphicon glyphicon-pencil edit-glyphicon" aria-hidden="true"></span>
            <span className="glyphicon glyphicon-trash delete-glyphicon" aria-hidden="true"></span>
          </div>
        </li>
      );
    }
  });

  // drag and drop pattern referred from http://webcloud.se/truly-reactive-sortable-component/
  var AgendaTable = React.createClass({
    getInitialState: function() {
      return {
        dragging: ""
      }
    },
    componentDidUpdate: function() {
    },
    sort: function(order, dragging) {
      this.setState({dragging: dragging});
      this.props.onSort(order);
    },
    dragEnd: function() {
      this.sort(this.props.order, undefined);
    },
    dragStart: function(e) {
      this.dragged = Number(e.currentTarget.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData("text/html", null)
    },
    dragOver: function(e) {
      e.preventDefault();
      var over = e.currentTarget;
      var dragging = this.state.dragging;
      var from = isFinite(dragging) ? dragging : this.dragged;
      var to = Number(over.dataset.id);

      // Move from 'a' to 'b'
      var order = this.props.order;
      order.splice(to, 0, order.splice(from,1)[0]);
      this.sort(order, to);
    },
    render: function() {
      var self = this;
      var items = [];
      var lastItemEndTime = self.props.setTime.clone();
      this.props.items.forEach(function(item, index, array) {
        var dragging = (index == self.state.dragging) ? "dragging" : "";
        // if (!lastItemEndTime) {
        //   lastItemEndTime = self.props.startTime.clone();
        // }
        items.push(
          <RowItem 
            index={index} 
            item={item} 
            startTime={lastItemEndTime.clone()}
            people={self.props.people} 
            onEdit={self.props.onEdit} 
            onRemove={self.props.onRemove} 
            onDialogEdit={self.props.onDialogEdit}
            onDragEnd={self.dragEnd}
            onDragOver={self.dragOver}
            onDragStart={self.dragStart} />
        );
        // lastItemEndTime.add(item.time, 'm');
      });
      return (
        <div className="agenda-table">
          <ul className="table-list">
            <TableHead />
            {items}
          </ul>
        </div>
      );
    }
  });

  var RowItem = React.createClass({
    enableDialogBox: function() {
      var self = this;
      var id = this.props.item.id;
      var mainId = "main-" + id;
      var durationId = "duration-" + id;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + id;
      var editId = "edit-" + id;
      var editId = "edit-" + id;
      var editData = {
        item: this.props.item,
        people: this.props.people
      };
      // unbind the previous click event first, then bind the new click event
      // with updated data
      $("#" + editId).unbind();
      $("#" + editId).click(function() {
        gadgets.views.openGadget(function(result) {
          if (result) {
            self.props.onDialogEdit(result.item);
          }
        }, 
        function(site){},
        {view: "dialog", viewTarget: "MODALDIALOG", viewParams: editData});
      });
    },
    componentDidMount: function() {
      adjustHeight();
      this.enableDialogBox();
    },
    componentDidUpdate: function() {
      adjustHeight();
      this.enableDialogBox();
    },
    render: function() {
      var index = this.props.index;
      var displayIndex = index + 1;
      var id = this.props.item.id;
      var domId = "row-" + id; 
      var mainId = "main-" + id;
      var durationId = "duration-" + id;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + id;
      var editId = "edit-" + id;
      var topic;
      if (this.props.item.topic === "") {
        topic = "Click to edit";
      } else {
        topic = this.props.item.topic;
      }
      var thumbnail;
      var ownerName;
      if (this.props.item.owner) {
        var thumbnailUrl = wave.getParticipantById(this.props.item.owner).thumbnailUrl_;
        thumbnail = <img className="img-circle" src={thumbnailUrl} />;
        ownerName = wave.getParticipantById(this.props.item.owner).displayName_;
      }
      var color = "row-type-" + this.props.item.color;
      var classString = "list-table-row " + color;
      return (
        <li 
          className={classString} 
          id={domId}
          data-id={this.props.index}
          key={this.props.index}
          draggable="true"
          onDragEnd={this.props.onDragEnd}
          onDragOver={this.props.onDragOver}
          onDragStart={this.props.onDragStart} >
          <div className="div-table-cell index-col">{displayIndex}</div>
          <div className="div-table-cell time-col">{this.props.startTime.format('LT')}</div>
          <div className="div-table-cell duration-col" id={durationId}>{this.props.item.time} min</div>
          <div className="div-table-cell main-col" id={mainId}>
            <div className="topic-cell">{topic}</div>
            <div className="desc-cell">{this.props.item.desc}</div>
          </div>
          <div className="div-table-cell presenter-col" id={ownerId}>{ownerName}</div>
          <div className="div-table-cell edit-col">
            <span className="glyphicon glyphicon-pencil edit-glyphicon" id={editId} aria-hidden="true"></span>
            <span className="glyphicon glyphicon-trash delete-glyphicon" aria-hidden="true"></span>
          </div>
        </li>
      );
    }
  });

  var AddButton = React.createClass({
    handleAdd: function(e) {
      this.props.onAdd();
    },
    render: function() {
      return (
        <li className="table-button">
          <div className="div-table-cell index-col">
          </div>
          <div className="div-table-cell time-col"></div>
          <div className="div-table-cell duration-col"></div>
          <div className="div-table-cell main-col"></div>
          <div className="div-table-cell presenter-col button-col">
            <button type="button" className="btn btn-default" onClick={this.handleAdd}>
              <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add Item
            </button>
          </div>
          <div className="div-table-cell th edit-col">
            <span className="glyphicon glyphicon-pencil edit-glyphicon" aria-hidden="true"></span>
            <span className="glyphicon glyphicon-trash delete-glyphicon" aria-hidden="true"></span>
          </div>
        </li>
      );
    }
  });

  var DateTimePicker = React.createClass({
    componentDidMount: function() {
      var self = this;
      var setTime = this.props.setTime;
      // Datepicker
      $(function () {
          $('#datetimepicker').datetimepicker({
            showClose: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            debug: true
          });
      });
      $('#datetimepicker').on("dp.change", function (e) {
        var newTime = $('#datetimepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      if (setTime) {
        $('#datetimepicker').data("DateTimePicker").defaultDate(setTime);
      }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        <div className="row">
          <div className="col-xs-4">
            <div className='input-group date input-date' id='datetimepicker'>
              <input type='text' className='form-control input-field' placeholder="Click to choose the date" />
              <span className='input-group-addon input-group-addon-custom'>
                <span className='glyphicon glyphicon-calendar'></span>
              </span>
            </div>
          </div>
          <div className="col-xs-8">
          </div>
        </div>
      );
    }
  });

  React.render(<Agenda />, document.body);
};

gadgets.util.registerOnLoadHandler(function() {
  init(React, jQuery, moment, gadgets, wave);
  console.log("gadget initiated");
});
