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
      // if (this.props.data.startTime) {
      //   var startTime = moment(this.props.data.startTime);
      // } else {
      //   var startTime = moment();
      // }
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
          // when (items === null) it is supposed to be an empty array
          var items = [];
          var order = waveData["order"] || [];
          var startTime = waveData["startTime"];
          order.forEach(function(itemId, index) {
            items.push(waveData[itemId]);
          });
          // }
          // // convert string moment representation to an moment object
          // // var startTime = moment(waveData.startTime);
          // // if the local update has already been made for the items, then do not update the items again
          // if (JSON.stringify(self.state.items) === JSON.stringify(items)) {
          //   self.setState({
          //     startTime: startTime
          //   });
          self.setState({
            items: items,
            order: order
          });
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
      var waveData = {startTime: newTime};
      wave.getState().submitDelta(waveData);
      console.log("sent startTime to wave");
    },
    handleSort: function(newOrder) {
      // var newItems = newOrder.map(function(index) {
      //   return this.state.items[index];
      // }.bind(this));
      // this.setState({
      //   items: newItems
      // });
      // console.log("sorted items");
      // console.log(newItems);
      // var waveData = {items: newItems};
      // wave.getState().submitDelta(waveData);
      // console.log("sent updated items to wave (sort)");
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
      // var newItems = this.state.items.concat([{id: this.state.counter, topic: "", desc: "",time: 0, owner: ""}]);
      // var newCounter = this.state.counter + 1;
      // this.setState({
      //   items: newItems,
      //   counter: newCounter
      // });
      // console.log("added an item");
      // console.log(newItems);
      // var waveData = {items: newItems, counter: newCounter};
      // wave.getState().submitDelta(waveData);
      // console.log("sent updated items to wave (add)");

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
      var newItem = {id: newItemId, topic: "", desc: "", time: 0, owner: ""};
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
    handleRemove: function(index) {
      var newItems = this.state.items;
      newItems.splice(index, 1);
      this.setState({
        items: newItems
      });
      console.log("removed an item");
      console.log(newItems);
      var waveData = {items: newItems};
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
    handleDialogSubmit: function(result) {
      var newItems = this.state.items.concat([result]);
      this.setState({
        items: newItems
      });
      console.log("added an item");
      console.log(newItems);
      var waveData = {items: newItems};
      wave.getState().submitDelta(waveData);
      console.log("sent updated items to wave (dialog add)");
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
    render: function() {
      return (
        <Grid className="container-fluid" id="grid">
          <br />
          <Row className="show-grid">
            <DateTimePicker onTimeChange={this.handleTimeChange} />
          </Row>
          <br />
          <Row className="show-grid">
            <Col xs={1}>
              <DragBar order={this.state.order} onSort={this.handleSort} />
            </Col>
            <Col xs={11}>
              <AgendaTable items={this.state.items} 
                startTime={this.state.startTime} 
                people={this.state.people} 
                onSort={this.handleSort} 
                onEdit={this.handleEdit} 
                onRemove={this.handleRemove} 
                onDialogEdit={this.handleDialogEdit} 
                onDraggingStatus={this.handleDraggingStatus} />
              <AddButton onAdd={this.handleAdd} />
            </Col>
          </Row>
        </Grid>
      );
    }
  });

  var AgendaTable = React.createClass({
    componentWillMount: function() {
    },
    componentDidMount: function() {
    },
    componentDidUpdate: function() {
    },
    render: function() {
      var self = this;
      var rowsArr = [];
      var itemId = null;
      var lastItemEndTime = null;
      return (
        <Table className="agenda-table" responsive >
          <thead>
            <tr>
              <th className='index'>#</th>
              <th className='short'>Start Time</th>
              <th className='short'>Duration</th>
              <th className='med'>Topic</th>
              <th className='short'>Presenter</th>
            </tr>
          </thead>
          <TableBody 
            items = {this.props.items}
            startTime={this.props.startTime} 
            people={this.props.people} 
            onEdit={this.props.onEdit} 
            onRemove={this.props.onRemove} 
            onDialogEdit={this.props.onDialogEdit}>
          </TableBody>
        </Table>
      );
    }
  });

  var TableBody = React.createClass({
    render: function() {
      var self = this;
      var items = this.props.items.map(function(item, index, array) {
        return(
          <RowItem 
            index={index} 
            item={item} 
            people={self.props.people} 
            onEdit={self.props.onEdit} 
            onRemove={self.props.onRemove} 
            onDialogEdit={self.props.onDialogEdit} />
        );
      });
      return (
        <tbody>
          {items}
        </tbody>
      );
    },
  });

  var RowItem = React.createClass({
    componentDidMount: function() {
      adjustHeight();

      var self = this;
      var index = this.props.index;
      var topicId = "topic-" + index;
      var timeId = "time-" + index;
      // onwerId here is not the real id of own
      var ownerId = "owner-" + index;
      var editId = "edit-" + index;
      var editData = {
        item: this.props.item,
        people: this.props.people
      };
      $("#" + editId + ", #" + topicId + ", #" + timeId + ", #" + ownerId).click(function() {
        gadgets.views.openGadget(function(result) {
          if (result) {
            self.props.onDialogEdit(result.item);
          }
        }, 
        function(site){},
        {view: "dialog", viewTarget: "MODALDIALOG", viewParams: editData});
      });

      if ($("#" + self.props.item.id).length == 0) {
        $("<li/>", {
            id: self.props.item.id,
            text: "[]"
        }).appendTo("#sortable-list");
      }
    },
    handleRemove: function() {
      this.props.onRemove(this.props.index);
    },
    render: function() {
      var index = this.props.index;
      var id = index + 1;
      var topicId = "topic-" + index;
      var timeId = "time-" + index;
      // onwerId here is not the real id of owner
      var ownerId = "owner-" + index;
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
      return (
        <tr>
          <td className="index">
            <span className="off-hover">{id}</span>
            <span className="glyphicon glyphicon-menu-hamburger on-hover"></span>
          </td>
          <td>
            <span>11:11PM</span>
          </td>
          <td className="cursor-pointer" id={timeId}>
            <span>{this.props.item.time} min</span>
          </td>
          <td className="cursor-pointer" id={topicId}>
            <span>{topic}</span>
            <br />
            <span>{this.props.item.desc}</span>
          </td>
          <td className="link-text cursor-pointer" id={ownerId}>
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
      // $('#datepicker').on("dp.show", function (e) {
      //   $('#timepicker').data("DateTimePicker").hide();
      // });
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

  var DatePicker = React.createClass({
    componentDidMount: function() {
      var self = this;
      var startTime = this.props.startTime;
      // Datepicker
      $(function () {
          $('#datepicker').datetimepicker({
            format: 'll',
            showClose: true,
            showTodayButton: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            debug: true
          });
      });
      $('#datepicker').on("dp.change", function (e) {
        var newTime = $('#datepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // $('#datepicker').on("dp.show", function (e) {
      //   $('#timepicker').data("DateTimePicker").hide();
      // });
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
          <div className='input-group date' id='datepicker'>
            <input type='text' className='form-control' />
            <span className='input-group-addon'>
              <span className='glyphicon glyphicon-calendar'></span>
            </span>
          </div>
        </Col>
      );
    }
  });

  var TimePicker = React.createClass({
    componentDidMount: function() {
      var self = this;
      // Datepicker
      $(function () {
          $('#timepicker').datetimepicker({
            format: 'LT',
            extraFormats: ['LT'],
            showClose: true,
            showTodayButton: true,
            allowInputToggle: true,
            toolbarPlacement: 'bottom',
            useCurrent: false,
            debug: true
          });
      });
      $('#timepicker').on("dp.change", function (e) {
        var newTime = $('#timepicker').data("DateTimePicker").viewDate();
        self.onTimeChange(newTime);
      });
      // $('#timepicker').on("dp.show", function (e) {
      //   $('#datepicker').data("DateTimePicker").hide();
      // });
      if (this.props.startTime) {
        $('#timepicker input').attr('placeholder', this.props.startTime.format('LT'));
      }
    },
    onTimeChange: function(time) {
      this.props.onTimeChange(time);
    },
    render: function() {
      return (
        <Col xs={3} id='time'>
          <div className='input-group date' id='timepicker'>
            <input type='text' className='form-control' />
            <span className='input-group-addon'>
              <span className='glyphicon glyphicon-time'></span>
            </span>
          </div>
        </Col>
      );
    }
  });

  var DragBar = React.createClass({
    componentDidMount: function() {
      var self = this;

      var onSortableStop = function(event, ui) {
        var sortedIds = $( "#sortable-list" ).sortable( "toArray" );
        self.props.onSort(sortedIds);
      };

      $("#sortable-list").sortable({
        axis: 'y',
        stop: onSortableStop
      });
    },
    render: function() {
      var bar = this.props.order.map(function(itemId) {
        return(
          <li id={itemId} key={itemId}>
            <button type="button" className="btn btn-default btn-lg">
              <span className="glyphicon glyphicon-sort" aria-hidden="true"></span>
            </button>
          </li>
        );
      });
      return(
        <div>
          <li>
            <button type="button" className="btn btn-default btn-lg">
              P
            </button>
          </li>
          <ul id="sortable-list">
          </ul>
        </div>
      );
    }
  });

  // example data
  var DATA = {
    "items": [
        {
            "id": "1",
            "topic": "A",
            "desc": "A",
            "time": 5,
            "owner": "Android"
        },
        {
            "id": "2",
            "topic": "B",
            "desc": "B",
            "time": 10,
            "owner": "Bond"
        },
        {
            "id": "3",
            "topic": "C",
            "desc": "C",
            "time": 15,
            "owner": "Captain America"
        },
        {
            "id": "4",
            "topic": "D",
            "desc": "D",
            "time": 20,
            "owner": "DB"
        },
        {
            "id": "5",
            "topic": "E",
            "desc": "E",
            "time": 60,
            "owner": "EA"
        },
        {
            "id": "6",
            "topic": "F",
            "desc": "F",
            "time": 120,
            "owner": "Function"
        },
        {
            "id": "7",
            "topic": "G",
            "desc": "G",
            "time": 1,
            "owner": "Gnome"
        },
        {
            "id": "8",
            "topic": "H",
            "desc": "H",
            "time": 2,
            "owner": "Hulk"
        }
    ],
    "startTime": 1433923200000,
    "people": [{ id: 0, text: 'enhancement' }, { id: 1, text: 'bug' }, { id: 2, text: 'duplicate' }, { id: 3, text: 'invalid' }, { id: 4, text: 'wontfix' },
    { id: 5, text: 'enhancement' }, { id: 6, text: 'bug' }, { id: 7, text: 'duplicate' }, { id: 8, text: 'invalid' }, { id: 9, text: 'wontfix' }]
  }

  React.render(<Agenda data={DATA} />, document.body);
};

gadgets.util.registerOnLoadHandler(function() {
  init(React, ReactBootstrap, jQuery, moment, gadgets, wave);
});
