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
    var counter = 0;
    return {
      items: [],
      startTime: startTime,
      counter: counter,
      people: []
    } 
  },
  componentDidMount: function() {
    var self = this;

    var onWaveUpdate = function() {
      console.log("onWaveUpdate");
      var waveState = wave.getState();
      var waveData = waveState.state_;

      if (!$.isEmptyObject(waveData)) {
        // when (items === null) it is supposed to be an empty array
        if (waveData.items) {
          var items = waveData.items;
        } else {
          var items = [];
        }
        // convert string moment representation to an moment object
        var startTime = moment(waveData.startTime);

        // if the local update has already been made for the items, then do not update the items again
        if (JSON.stringify(self.state.items) === JSON.stringify(items)) {
          self.setState({
            startTime: startTime
          });
        } else {
          self.setState({
            items: items,
            startTime: startTime,
            counter: waveData.counter
          });      
        }

      } else {
        // setup wave
        return;
      }
    };

    var onWaveParticipant = function() {
      if (wave.getViewer()) {
        var people = [];  
        var participants = wave.getParticipants();
        participants.forEach(function(val, i, arr) {
          people.push({id: val.id_, text: val.displayName_, thumbnailUrl: val.thumbnailUrl_});
        });
        self.setState({
          people: people
        });
        console.log("updated people");
        console.log(participants);
      } else {
        return;
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
    var newItems = newOrder.map(function(index) {
      return this.state.items[index];
    }.bind(this));
    this.setState({
      items: newItems
    });
    console.log("sorted items");
    console.log(newItems);
    var waveData = {items: newItems};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (sort)");
  },
  handleAdd: function() {
    var newItems = this.state.items.concat([{id: this.state.counter, topic: "", desc: "",time: 0, owner: ""}]);
    var newCounter = this.state.counter + 1;
    this.setState({
      items: newItems,
      counter: newCounter
    });
    console.log("added an item");
    console.log(newItems);
    var waveData = {items: newItems, counter: newCounter};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (add)");
  },
  handleRemove: function(index) {
    var newItems = this.state.items
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
  handleEdit: function(index, type, value) {
    var newItems = this.state.items.slice();
    newItem = newItems[index];
    if (type === 'topic') {
      newItem['topic'] = value;
    } else if (type === 'desc') {
      newItem['desc'] = value;
    } else if (type === 'owner') {
      newItem['owner'] = value;
    } else if (type === 'time') {
      newItem['time'] = value;
    }
    this.setState({
      items: newItems
    });
    console.log("edited an item");
    console.log(newItems);
    var waveData = {items: newItems};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (edit)");
  },
  handleDialogEdit: function(index, item) {
    var newItems = this.state.items.slice();
    newItems[index] = item;
    this.setState({
      items: newItems
    });
    console.log("edited an item");
    console.log(newItems);
    var waveData = {items: newItems};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (dialog edit)");
  },
  handleDialogSubmit: function(result) {
    var newItems = this.state.items.concat([$.extend(result, {id: this.state.counter})]);
    var newCounter = this.state.counter + 1;
    this.setState({
      items: newItems,
      counter: newCounter
    });
    console.log("added an item");
    console.log(newItems);
    var waveData = {items: newItems, counter: newCounter};
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave (dialog add)");
  },
  render: function() {
    return (
      <Grid id="grid">
        <br />
        <Row>
          <DateTimePicker onTimeChange={this.handleTimeChange} />
        </Row>
        <br />
        <AgendaTable items={this.state.items} startTime={this.state.startTime} people={this.state.people} onSort={this.handleSort} onEdit={this.handleEdit} onRemove={this.handleRemove} onDialogEdit={this.handleDialogEdit} />
        <AddButton onAdd={this.handleAdd} />
      </Grid>
    );
  }
});

var AgendaTable = React.createClass({
  componentWillMount: function() {
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editableform.buttons = '<button type="submit" class="btn btn-default btn-sm editable-submit">ok</button>' + 
                                '<button type="button" class="btn btn-default btn-sm editable-cancel">cancel</button>';
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
    var items = this.props.items.map(function(item) {
      return (<tr key={item.id} item={item}></tr>);
    })
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
        <TableBody startTime={this.props.startTime} people={this.props.people} onSort={this.props.onSort} onEdit={this.props.onEdit} onRemove={this.props.onRemove} onDialogEdit={this.props.onDialogEdit} >
          {items}
        </TableBody>
      </Table>
    );
  }
});

// the proxy rendering design pattern borrowed from the following link (gist)
// https://gist.github.com/petehunt/7882164
// https://gist.github.com/fversnel/4aed612b69d3ec196157
var TableBody = React.createClass({
  getDefaultProps: function() {
    return {component: 'tbody', childComponent: 'tr'};
  },
  render: function() {
    var props = $.extend({}, this.props);
    delete props.children;
    return (
      <this.props.component {...props} />
    );
  },
  componentDidMount: function() {
    // Helper function to keep table row from collapsing when being sorted
    // got from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    var fixHelperModified = function(e, tr) {
      var $originals = tr.children();
      var $helper = tr.clone();
      $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
        $(this).height($originals.eq(index).height())
      });
      return $helper;
    };

    // this helper function got from
    // http://www.paulund.co.uk/fixed-width-sortable-tables
    var fixWidthHelper = function(e, ui) {
        ui.children().each(function() {
            $(this).width($(this).width());
        });
        return ui;
    };
    // helper end

    var lastItemEndTime = null;

    $(this.getDOMNode()).sortable({
      axis: 'y',
      helper: fixWidthHelper,
      stop: this.handleDrop,
    });
    this.getChildren().forEach(function(child, i) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = child.props.item;
      var index = i;
      $.extend(item, {startTime: lastItemEndTime.clone()});
      $(this.getDOMNode()).append('<' + this.props.childComponent + ' />');
      var node = $(this.getDOMNode()).children().last()[0];
      node.dataset.reactSortablePos = i;
      React.render(<RowItem index={index} item={child.props.item} people={this.props.people} onEdit={this.props.onEdit} onRemove={this.props.onRemove} onDialogEdit={this.props.onDialogEdit} />, node);
      lastItemEndTime.add(child.props.item.time, 'm');
    }.bind(this));

    adjustHeight();
  },
  componentDidUpdate: function() {
    var childIndex = 0;
    var nodeIndex = 0;
    var children = this.getChildren();
    var nodes = $(this.getDOMNode()).children();
    var numChildren = children.length;
    var numNodes = nodes.length;

    var lastItemEndTime = null;
  
    while (childIndex < numChildren) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = children[childIndex].props.item;
      var index = childIndex;
      $.extend(item, {startTime: lastItemEndTime.clone()});
      if (nodeIndex >= numNodes) {
        $(this.getDOMNode()).append('<' + this.props.childComponent + '/>');
        nodes.push($(this.getDOMNode()).children().last()[0]);
        nodes[numNodes].dataset.reactSortablePos = numNodes;
        numNodes++;
      }
      React.render(<RowItem index={index} item={item} people={this.props.people} onEdit={this.props.onEdit} onRemove={this.props.onRemove} onDialogEdit={this.props.onDialogEdit} />, nodes[nodeIndex]);
      childIndex++;
      nodeIndex++;
      lastItemEndTime.add(item.time, 'm');
    }
  
    while (nodeIndex < numNodes) {
      React.unmountComponentAtNode(nodes[nodeIndex]);
      $(nodes[nodeIndex]).remove();
      nodeIndex++;
    }

    adjustHeight();
  },
  componentWillUnmount: function() {
    $(this.getDOMNode()).children().get().forEach(function(node) {
      React.unmountComponentAtNode(node);
    });
  },
  getChildren: function() {
    // TODO: use mapChildren()
    return this.props.children || [];
  },
  handleDrop: function() {
    var newOrder = $(this.getDOMNode()).children().get().map(function(child, i) {
      var rv = child.dataset.reactSortablePos;
      child.dataset.reactSortablePos = i;
      return rv;
    });
    this.props.onSort(newOrder);
  }
});

var RowItem = React.createClass({
  componentDidMount: function() {
    var self = this;
    var index = this.props.index;
    var topicId = "topic-" + index;
    var notesId = "notes-" + index;
    var timeId = "time-" + index;
    var ownerId = "owner-" + index;
    var editId = "edit-" + index;
    var editData = {
      index: index, 
      topic: this.props.item.topic, 
      desc: this.props.item.desc, 
      time: this.props.item.time, 
      people: this.props.people
    };
    // $('#' + ownerId).editable({
    //   url: function(params) {
    //     var d = new $.Deferred;
    //     var newTopic = params.value;
    //     self.props.onEdit(index, 'owner', newTopic);
    //     d.resolve();
    //     return d.promise();
    //   },
    //   source: self.props.people,
    //   emptytext: 'select a presenter',
    //   select2: {
    //     multiple: true,
    //     maximumSelectionSize: 1,
    //   },
    //   showbuttons: false
    // });
    $('#' + editId).click(function() {
      gadgets.views.openGadget(function(result) {
        if (result) {
          self.props.onDialogEdit(result.index, result.item);
        }
      }, 
      function(site){},
      {view: "dialog", viewTarget: "MODALDIALOG", viewParams: editData});
    });
  },
  handleRemove: function() {
    this.props.onRemove(this.props.index);
  },
  render: function() {
    var index = this.props.index;
    var id = index + 1;
    var topicId = "topic-" + index;
    var notesId = "notes-" + index;
    var timeId = "time-" + index;
    var ownerId = "owner-" + index;
    var editId = "edit-" + index;
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
          <span>{this.props.item.startTime.format('LT')}</span>
        </td>
        <td>
          <span>{this.props.item.time} min</span>
        </td>
        <td>
          <span>{this.props.item.topic}</span>
          <br />
          <span>{this.props.item.desc}</span>
        </td>
        <td className="link-text">
          {thumbnail} <span className="owner">{ownerName}</span>
          <span className="pull-right on-hover">
            <Glyphicon className="editable" id={editId} glyph='edit' />
            <br/>
            <Glyphicon className="editable" glyph='trash' onClick={this.handleRemove} />
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

var DialogButton = React.createClass({
  componentDidMount: function() {
    var self = this;
    $("#dialog-btn").click(function() {
      gadgets.views.openGadget(function(result) {
        if (result) {
          self.props.onDialogSubmit(result);
        }
      }, 
      function(site){},
      {view: "dialog", viewTarget: "MODALDIALOG"});
    });
  },
  render: function() {
    return(
      <Button id="dialog-btn">Open a dialog</Button>
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

gadgets.util.registerOnLoadHandler(function() {
  React.render(<Agenda data={DATA} />, document.body);
});
