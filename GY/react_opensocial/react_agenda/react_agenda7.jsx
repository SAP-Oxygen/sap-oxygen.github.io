'use strict'

var init = function(React, ReactBootstrap, $, moment, gadgets, wave) {

  // variables for using React-Bootstrap
  var Table = ReactBootstrap.Table;
  var Button = ReactBootstrap.Button;
  var Grid = ReactBootstrap.Grid;
  var Row = ReactBootstrap.Row;
  var Col = ReactBootstrap.Col;
  var Glyphicon = ReactBootstrap.Glyphicon;
  var initHeight = 400;

  var adjustHeight = function() {
    var height = $("#grid").height();
    if (height > initHeight) {
      gadgets.window.adjustHeight();
    }
  };

  var Agenda = React.createClass({
    getInitialState: function() {
      var startTime = moment();
      return {
        items: [],
        order: [],
        itemsMap: {},
        startTime: startTime,
        people: [],
        dragging: false,
        lastWaveData: {}
      }
    },
    componentDidMount: function() {
      var self = this;

      var onWaveUpdate = function() {
        // currently disabled writing startTime variable in wave
        console.log("onWaveUpdate has been called");
        var waveState = wave.getState();
        var waveData = {};
        $.each(waveState.getKeys(), function(index, key) {
          waveData[key] = waveState.get(key);
        });
        var lastWaveData = self.state.lastWaveData;
        console.log("waveData: ");
        console.log(waveData);
        console.log("lastWaveData: ");
        console.log(lastWaveData);
        console.log("dragging: ");
        console.log(self.state.dragging);

        // if dragging variable of the current state is true,
        // then store the current waveData and do not update the state
        if (self.state.dragging) {
          self.setState({
            lastWaveData: waveData
          });
        } else if (!$.isEmptyObject(waveData)) {
          var items = [];
          var order = waveData["order"] || [];
          var startTime = waveData["startTime"];
          delete waveData["order"];
          delete waveData["startTime"];
          order.forEach(function(itemId, index) {
            items.push(waveData[itemId]);
          });
          // if there is startTime stored in wave, set startTime of 
          // Agenda's state to wave's startTime
          if (startTime) {
            var startTimeMoment = moment(startTime);
            self.setState({
              items: items,
              order: order,
              itemsMap: waveData,
              startTime: startTimeMoment
            });
          } else {
            self.setState({
              items: items,
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
          console.log("updated people");
          console.log(participants);
        }
      };

      wave.setStateCallback(onWaveUpdate);
      wave.setParticipantCallback(onWaveParticipant);
    },
    handleTimeChange: function(newTime) {
      this.setState({
        startTime: newTime
      });
      console.log("changed startTime: ");
      console.log(newTime);
      var waveData = {};
      waveData["startTime"] = newTime;
      wave.getState().submitDelta(waveData);
      console.log("sent startTime to wave");
    },
    handleSort: function(newOrder) {
      var newItems = [];
      var itemsMap = this.state.itemsMap;
      newOrder.forEach(function(itemId, index) {
        newItems.push(itemsMap[itemId]);
      });
      this.setState({
        items: newItems,
        order: newOrder
      });
      console.log("sorted items");
      console.log(newItems);
      var waveData = {};
      waveData["order"] = newOrder;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (sort)");
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
      var newItems = this.state.items.concat([newItem]);
      var newOrder = this.state.order.concat([newItemId]);
      var newItemMap = {};
      newItemMap[newItemId] = newItem;
      var newItemsMap = $.extend(this.state.itemsMap, newItemMap);
      this.setState({
        items: newItems,
        order: newOrder,
        itemsMap: newItemsMap
      });
      console.log("added an item");
      console.log(newItems);
      var waveData = {};
      waveData[newItemId] = newItem;
      waveData["order"] = newOrder;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (add)");
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
      var newItems = [];
      var itemsMap = $.extend({}, this.state.itemsMap);
      this.state.order.forEach(function(itemId) {
        newItems.push(itemsMap[itemId]);
      });
      this.setState({
        items: newItems,
        order: order
      });
      console.log("removed an item");
      console.log(newItems);
      var waveData = {};
      waveData["order"] = order;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (remove)");
    },
    handleDialogEdit: function(item) {
      var newItems = [];
      var newItemsMap = $.extend({}, this.state.itemsMap);
      newItemsMap[item.id] = item;
      this.state.order.forEach(function(itemId) {
        newItems.push(newItemsMap[itemId]);
      });
      this.setState({
        items: newItems,
        itemsMap: newItemsMap
      });
      console.log("edited an item");
      console.log(newItems);
      var waveData = {};
      waveData[item.id] = item;
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (dialog edit)");
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
    handleSort2: function(newOrder) {
      // TODO: implement wave
      var newItems = [];
      var itemsMap = this.state.itemsMap;
      newOrder.forEach(function(itemId, index) {
        newItems.push(itemsMap[itemId]);
      });
      this.setState({
        items: newItems,
        order: newOrder
      });
    },
    render: function() {
      return (
        <Grid className="container-fluid" id="grid">
          <br />
          <Row className="show-grid">
            <DateTimePicker onTimeChange={this.handleTimeChange} />
          </Row>
          <br />
          <AgendaTable 
            items={this.state.items} 
            startTime={this.state.startTime} 
            people={this.state.people} 
            onEdit={this.handleEdit} 
            onRemove={this.handleRemove} 
            onDialogEdit={this.handleDialogEdit} 
            onDraggingStatus={this.handleDraggingStatus}
            order={this.state.order}
            onSort={this.handleSort2} />
          <AddButton onAdd={this.handleAdd} />
        </Grid>
      );
    }
  });

  var AgendaTable = React.createClass({
    render: function() {
      var self = this;
      var rowsArr = [];
      var itemId = null;
      var lastItemEndTime = null;
      return (
        <div id="table">
          <ul>
            <TableHead />
          </ul>
          <TableBody2 
            items = {this.props.items}
            startTime={this.props.startTime} 
            people={this.props.people} 
            onEdit={this.props.onEdit} 
            onRemove={this.props.onRemove} 
            onDialogEdit={this.props.onDialogEdit}
            order={this.props.order}
            onSort={this.props.onSort} />
        </div>
      );
    }
  });

  var TableHead = React.createClass({
    render: function(){
      return (
        <li className="list-table-row" id="table-head">
          <div className="div-table-cell th move-col"> + </div>
          <div className="div-table-cell th index-col">#</div>
          <div className="div-table-cell th time-col">Time</div>
          <div className="div-table-cell th duration-col">Duration</div>
          <div className="div-table-cell th main-col">Topic</div>
          <div className="div-table-cell th presenter-col">Presenter</div>
          <div className="div-table-cell th trash-col"> - </div>
        </li>
      );
    }
  });

  var TableBody2 = React.createClass({
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
      var lastItemEndTime = null;
      this.props.items.forEach(function(item, index, array) {
        var dragging = (index == self.state.dragging) ? "dragging" : "";
        if (!lastItemEndTime) {
          lastItemEndTime = self.props.startTime.clone();
        }
        items.push(
          <RowItem2 
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
        lastItemEndTime.add(item.time, 'm');
      });
      return (
        <ul>
          {items}
        </ul>
      );
    }
  });

  var RowItem2 = React.createClass({
    enableDialogBox: function() {
      var self = this;
      var id = this.props.item.id;
      var mainId = "main-" + id;
      var durationId = "duration-" + id;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + id;
      var editId = "edit-" + id;
      var editData = {
        item: this.props.item,
        people: this.props.people
      };
      // unbind the previous click event first, then bind the new click event
      // with updated data
      $("#" + editId + ", #" + mainId + ", #" + durationId).unbind();
      $("#" + editId + ", #" + mainId + ", #" + durationId).click(function() {
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
          <div className="div-table-cell move-col"> + </div>
          <div className="div-table-cell index-col">{displayIndex}</div>
          <div className="div-table-cell time-col">{this.props.startTime.format('LT')}</div>
          <div className="div-table-cell duration-col" id={durationId}>{this.props.item.time} min</div>
          <div className="div-table-cell main-col" id={mainId}>
            <div className="topic-cell">{topic}</div>
            <div className="desc-cell">{this.props.item.desc}</div>
          </div>
          <div className="div-table-cell presenter-col" id={ownerId}>{ownerName}</div>
          <div className="div-table-cell trash-col"> - </div>
        </li>
      );
    }
  });

  // drag and drop pattern referred from http://webcloud.se/truly-reactive-sortable-component/
  var TableBody = React.createClass({
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
      var lastItemEndTime = null;
      this.props.items.forEach(function(item, index, array) {
        var dragging = (index == self.state.dragging) ? "dragging" : "";
        if (!lastItemEndTime) {
          lastItemEndTime = self.props.startTime.clone();
        }
        items.push(
          <RowItem 
            index={index} 
            item={item} 
            startTime={lastItemEndTime.clone()}
            people={self.props.people} 
            onEdit={self.props.onEdit} 
            onRemove={self.props.onRemove} 
            onDialogEdit={self.props.onDialogEdit}
            draggable="true"
            onDragEnd={self.dragEnd}
            onDragOver={self.dragOver}
            onDragStart={self.dragStart} />
        );
        lastItemEndTime.add(item.time, 'm');
      });
      return (
        <tbody>
          {items}
        </tbody>
      );
    }
  });

  var RowItem = React.createClass({
    componentDidUpdate: function() {
      var self = this;
      var id = this.props.item.id;
      var mainId = "main-" + id;
      var durationId = "duration-" + id;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + id;
      var editId = "edit-" + id;
      var editData = {
        item: this.props.item,
        people: this.props.people
      };
      // unbind the previous click event first, then bind the new click event
      // with updated data
      $("#" + editId + ", #" + mainId + ", #" + durationId).unbind();
      $("#" + editId + ", #" + mainId + ", #" + durationId).click(function() {
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
      var self = this;
      var id = this.props.item.id;
      var mainId = "main-" + id;
      var durationId = "duration-" + id;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + id;
      var editId = "edit-" + id;
      var editData = {
        item: this.props.item,
        people: this.props.people
      };
      $("#" + editId + ", #" + mainId + ", #" + durationId).click(function() {
        gadgets.views.openGadget(function(result) {
          if (result) {
            self.props.onDialogEdit(result.item);
          }
        }, 
        function(site){},
        {view: "dialog", viewTarget: "MODALDIALOG", viewParams: editData});
      });
    },
    handleRemove: function() {
      this.props.onRemove(this.props.item.id);
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
      return (
        <tr 
          className={color} 
          id={domId}
          data-id={this.props.index}
          key={this.props.index}
          draggable={this.props.draggable}
          onDragEnd={this.props.onDragEnd}
          onDragOver={this.props.onDragOver}
          onDragStart={this.props.onDragStart} >
          <td className="index">
            <span>{displayIndex}</span>
          </td>
          <td className="startTime">
            <span>{this.props.startTime.format('LT')}</span>
          </td>
          <td className="duration cursor-pointer" id={durationId}>
            <span>{this.props.item.time} min</span>
          </td>
          <td className="topic cursor-pointer" id={mainId}>
            <span>{topic}</span>
            <br />
            <span>{this.props.item.desc}</span>
          </td>
          <td className="owner link-text cursor-pointer" id={ownerId}>
            {thumbnail} <span className="owner">{ownerName}</span>
            <span className="pull-right on-hover">
              <Glyphicon className="cursor-pointer" glyph='trash' onClick={this.handleRemove} />
            </span>
          </td>
        </tr>
      );
    }
  });

  var AddButton = React.createClass({
    handleAdd: function() {
      this.props.onAdd();
    },
    render: function() {
      return (
        <Button onClick={this.handleAdd}>Add a new Topic</Button>
      );
    }
  });

  var DateTimePicker = React.createClass({
    componentDidMount: function() {
      var self = this;
      var startTime = this.props.startTime;
      // Datepicker
      $(function () {
          $('#datetimepicker').datetimepicker({
            showClose: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            defaultDate: startTime,
            debug: true
          });
      });
      $('#datetimepicker').on("dp.change", function (e) {
        var newTime = $('#datetimepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // if (startTime) {
      //   $('#datepicker').datetimepicker({
      //     defaultDate: startTime
      //   });
      // }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        <Col xs={4} id='date'>
          <div className='input-group date' id='datetimepicker'>
            <input type='text' className='form-control' />
            <span className='input-group-addon'>
              <span className='glyphicon glyphicon-calendar'></span>
            </span>
          </div>
        </Col>
      );
    }
  });

  React.render(<Agenda />, document.body);
};

gadgets.util.registerOnLoadHandler(function() {
  init(React, ReactBootstrap, jQuery, moment, gadgets, wave);
});
