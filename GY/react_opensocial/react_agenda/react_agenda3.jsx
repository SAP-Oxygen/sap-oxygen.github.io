// variables for using React-Bootstrap
var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

var Agenda = React.createClass({
  getInitialState: function() {
    // if (this.props.data.startTime) {
    //   var startTime = moment(this.props.data.startTime);
    // } else {
    //   var startTime = moment();
    // }
    var startTime = moment();
    var counter = 0;
    debugger;
    return {
      items: [],
      startTime: startTime,
      counter: counter
    } 
  },
  componentDidMount: function() {
    var self = this;
    
    var onWaveUpdate = function() {
      console.log("onWaveUpdate");
      var waveState = wave.getState();
      var waveData = waveState.state_;

      if (!$.isEmptyObject(waveData)) {
        if (!(waveData.items.length === 0)) {
          self.setState({
            items: waveData.items,
            startTime: waveData.startTime,
            counter: waveData.counter
          }); 
        } else {
          self.handleAdd();
        }
      } else {
        // setup wave
        var newData = {items: self.state.items, startTime: self.state.startTime, counter: self.state.counter};
        waveState.submitDelta(newData);
      }
    };

    wave.setStateCallback(onWaveUpdate);
  },
  handleTimeChange: function(newTime) {
    this.setState({
      startTime: newTime
    });
    console.log("changed startTime: ");
    console.log(newTime);
    var time = {};
    time['startTime'] = newTime;
    wave.getState().submitDelta(newTime);
    console.log("sent startTime to wave");
  },
  handleSort: function(newOrder) {
    var newItems = newOrder.map(function(index) {
      return this.state.items[index];
    }.bind(this));
    this.setState({
      items: newItems
    });

    console.log(this.state.items);
  },
  handleAdd: function() {
    var newItems = this.state.items.concat([{id: this.state.counter, topic: "", desc: "",time: 0, owner: ""}]);
    var newCounter = this.state.counter + 1;
    this.setState({
      items: newItems,
      counter: newCounter
    });
    console.log("added a topic");
    console.log(newItems);
    var waveData = {};
    waveData['items'] = newItems;
    wave.getState().submitDelta(waveData);
    console.log("sent updated items to wave");
  },
  handleRemove: function() {
    // TODO
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
  },
  render: function() {
    return (
      <Grid>
        <br />
        <Row>
        </Row>
        <br />
        <AgendaTable items={this.state.items} startTime={this.state.startTime} people={this.props.data.people} onSort={this.handleSort} onEdit={this.handleEdit} />
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
      <Table responsive>
        <thead>
          <tr>
            <th className='index'>#</th>
            <th className='short'>Start Time</th>
            <th className='short'>Duration</th>
            <th className='med'>Topic</th>
            <th className='short'>Presenter</th>
            <th>Notes</th>
          </tr>
        </thead>
        <TableBody startTime={this.props.startTime} people={this.props.people} onSort={this.props.onSort} onEdit={this.props.onEdit} >
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
      React.render(<RowItem index={index} item={child.props.item} people={this.props.people} onEdit={this.props.onEdit} />, node);
      lastItemEndTime.add(child.props.item.time, 'm');
    }.bind(this));

    // gadgets.window.adjustHeight();
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
      React.render(<RowItem index={index} item={item} people={this.props.people} onEdit={this.props.onEdit} />, nodes[nodeIndex]);
      childIndex++;
      nodeIndex++;
      lastItemEndTime.add(item.time, 'm');
    }
  
    while (nodeIndex < numNodes) {
      React.unmountComponentAtNode(nodes[nodeIndex]);
      $(nodes[nodeIndex]).remove();
      nodeIndex++;
    }

    // gadgets.window.adjustHeight();
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
    $('#'+topicId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'topic', newTopic);
        d.resolve();
        return d.promise();
      },
      emptytext: 'new topic here',
      showbuttons: false
    });
    $('#'+timeId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'time', newTopic);
        d.resolve();
        return d.promise();
      },
      showbuttons: false
    });
    $('#'+ownerId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newTopic = params.value;
        self.props.onEdit(index, 'owner', newTopic);
        d.resolve();
        return d.promise();
      },
      source: self.props.people,
      select2: {
      },
      showbuttons: false
    });
    $('#'+notesId).editable({
      url: function(params) {
        var d = new $.Deferred;
        var newDesc = params.value;
        self.props.onEdit(index, 'desc', newDesc);
        d.resolve();
        return d.promise();
      },
      emptytext: 'new notes here',
      escape: false,
      rows: 2
    });
  },
  render: function() {
    var index = this.props.index;
    var id = index + 1;
    var topicId = "topic-" + index;
    var notesId = "notes-" + index;
    var timeId = "time-" + index;
    var ownerId = "owner-" + index;
    return (
      <tr>
        <td className="index">
          <span className="off-hover">{id}</span>
          <span className="glyphicon glyphicon-menu-hamburger on-hover"></span>
        </td>
        <td>{this.props.item.startTime.format('LT')}</td>
        <td>
          <span className="grey-text" id={timeId} data-inputclass="time-input input-sm" data-type="text">{this.props.item.time}</span> min
        </td>
        <td>
          <span className="topic" id={topicId} data-inputclass="input-sm" data-type="text">{this.props.item.topic}</span>
        </td>
        <td className="link-text">
          <span className="owner" id={ownerId} data-inputclass="input-owner" data-type="select2" data-value="1"></span>
        </td>
        <td className="notes">
          <span className="grey-text" id={notesId} data-inputclass="input-sm" data-type="textarea">{this.props.item.desc}</span>
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
