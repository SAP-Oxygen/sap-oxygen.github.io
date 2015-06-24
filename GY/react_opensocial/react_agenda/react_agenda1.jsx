// variables for using React-Bootstrap
var Table = ReactBootstrap.Table;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;

var Agenda = React.createClass({
  getInitialState: function() {
    if (this.props.startTime) {
      var startTime = this.props.startTime;
    } else {
      var startTime = moment();
    }
    return {
      items: this.props.items.items,
      nextId: this.props.items.nextId,
      startTime: startTime
    } 
  },
  onTimeChange: function(newTime) {
    this.setState({
      startTime: newTime
    });
  },
  onAddTopic: function() {
    var newList = this.state.items;
    newList.push({id: this.state.nextId, topic: "", desc: "",time: 0, ownder: ""});
    var nextId = this.state.nextId;
    this.setState({
      items: newList,
      nextId: ++nextId
    });
  },
  onSort: function(newOrder) {
    var self = this;
    var newItems = newOrder.map(function(index) {
      return self.state.items[index];
    });
    this.setState({items: newItems});
    console.log(this.state.items);
  },
  render: function() {
    return (
      <Grid>
        <br />
        <Row>
          <DatePicker />
          <TimePicker handleDateTimeChange={this.onTimeChange} />
        </Row>
        <br />
        <AgendaTable items={this.state.items} startTime={this.state.startTime}  />
        <AddButton onAddTopic={this.onAddTopic} />
      </Grid>
    );
  }
});

var AgendaTable = React.createClass({
  getInitialState: function() {
    return {
      rowOrder: []
    }
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = null;
    var lastItemEndTime = null;
    // var rowOrder = this.state.rowOrder;
    // var orderedItems = [];
    // if (rowOrder.length !== 0) {
    //   rowOrder.forEach(function(element, index) {
    //     orderedItems.push(self.props.items[element]); 
    //   });
    // } else {
    //   orderedItems = this.props.items;
    // }
    // orderedItems.forEach(function(item, index, items) {
    //   if (!lastItemEndTime || !itemId) {
    //     itemId = 0;
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem item={item} itemId={itemId} startTime={lastItemEndTime.clone()} />);
    //   itemId++;
    //   lastItemEndTime.add(item.time, 'm');
    // });
    // this.props.items.forEach(function(item, index, items) {
    //   if (!lastItemEndTime) {
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem item={item} itemId={itemId} startTime={lastItemEndTime.clone()} />);
    //   lastItemEndTime.add(item.time, 'm');
    // });
    return (
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Topic</th>
            <th>Presenter</th>
            <th>Notes</th>
          </tr>
        </thead>
        <TableBody items={this.props.items} startTime={this.props.startTime} onSort={this.props.onSort} />
      </Table>
    );
  }
});

var TableBody = React.createClass({
  getInitialState: function() {
    return {
      tempItems: this.props.items
    }
  },
  componentDidMount: function() {
    var self = this;
    // the following is borrowed from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    // to keep the table row from collapsing when being sorted
    var fixHelperModified = function(e, tr) {
      var $originals = tr.children();
      var $helper = tr.clone();
      $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
      });
      return $helper;
    };
    // make the table sortable
    $('#sortable').sortable({
      helper: fixHelperModified,
      stop: function(event, ui) {
        var newOrder = $('#sortable').sortable('toArray', {attribute: 'data-id'});
        console.log(newOrder);
        self.onSort(newOrder);
      }
    }).disableSelection();
    // up to here
  },
  componentDidUpdate: function() {
    console.log("updated");
    // gadgets.window.adjustHeight();
  },
  handleDrop: function() {
    this.props.onSort(newOrder);
  },
  onSort: function(newOrder) {
    var self = this;
    var newItems = newOrder.map(function(index) {
      return self.state.tempItems[index];
    });
    this.setState({tempItems: newItems});
    console.log(this.state.tempItems);
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = 0;
    var lastItemEndTime = null;
    // this.state.tempItems.forEach(function(item, index, items) {
    //   if (!lastItemEndTime) {
    //     lastItemEndTime = self.props.startTime.clone();
    //   }
    //   rowsArr.push(<RowItem id={itemId} item={item} startTime={lastItemEndTime.clone()} />);
    //   lastItemEndTime.add(item.time, 'm');
    //   itemId++;
    // });
    var rows = this.state.tempItems.map(function(item, index, arr) {
      if (!lastItemEndTime) {
        lastItemEndTime = self.props.startTime.clone();
      }
      return (<RowItem key={item.id} id={index} item={item} startTime={lastItemEndTime.clone()} />);
    })
    return (
      <tbody id='sortable'>
        {rows}
      </tbody>
    );
  }
});

var RowItem = React.createClass({
  render: function() {
    return (
      <tr key={this.props.key} data-id={this.props.id}>
        <td>{this.props.id}</td>
        <td>{this.props.startTime.format('LT')}</td>
        <td>{this.props.item.time} min</td>
        <td>{this.props.item.topic}</td>
        <td>{this.props.item.owner}</td>
        <td>{this.props.item.desc}</td>
      </tr>
    );
  }
});

var AddButton = React.createClass({
  handleAdd: function() {
    this.props.onAddTopic();
  },
  render: function() {
    return (
      <Button onClick={this.handleAdd}>Add an item</Button>
    );
  }
});

var DatePicker = React.createClass({
  componentDidMount: function() {
    var self = this;
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
    $('#datepicker').on("dp.show", function (e) {
      $('#timepicker').data("DateTimePicker").hide();
    });
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
          showClose: true,
          showTodayButton: true,
          allowInputToggle: true,
          toolbarPlacement: 'bottom',
          debug: true
        });
    });
    $('#timepicker').on("dp.change", function (e) {
      var newTime = $('#timepicker').data("DateTimePicker").viewDate();
      self.onTimeChange(newTime);
    });
    $('#timepicker').on("dp.show", function (e) {
      $('#datepicker').data("DateTimePicker").hide();
    });
  },
  onTimeChange: function(time) {
    this.props.handleDateTimeChange(time);
  },
  render: function() {
    return (
      <Col xs={3} id='time'>
        <div className='input-group date' id='timepicker'>
          <input type='text' className='form-control' />
          <span className='input-group-addon'>
            <span className='glyphicon glyphicon-calendar'></span>
          </span>
        </div>
      </Col>
    );
  }
});

var ITEMS = {
  "items": [
      {
          "id": "0",
          "topic": "A",
          "desc": "A",
          "time": 5,
          "owner": "A"
      },
      {
          "id": "1",
          "topic": "B",
          "desc": "B",
          "time": 10,
          "owner": "B"
      },
      {
          "id": "2",
          "topic": "C",
          "desc": "C",
          "time": 15,
          "owner": "C"
      },
      {
          "id": "3",
          "topic": "D",
          "desc": "D",
          "time": 20,
          "owner": "D"
      }
  ],
  "startTime": 1433923200000,
  "nextId": 4
}


React.render(<Agenda items={ITEMS} />, document.body);