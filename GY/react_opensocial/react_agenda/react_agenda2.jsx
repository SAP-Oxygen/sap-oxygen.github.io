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
        <AgendaTable data={this.props.items} startTime={this.state.startTime}  />
        <AddButton onAddTopic={this.onAddTopic} />
      </Grid>
    );
  }
});

var AgendaTable = React.createClass({
  getInitialState: function() {
    return {
      items: this.props.data.items, 
      counter: this.props.data.items.length};
  },
  handleSort: function(newOrder) {
    var newItems = newOrder.map(function(index) {
      return this.state.items[index];
    }.bind(this));
    this.setState({items: newItems});
    console.log(this.state.items);
  },
  render: function() {
    var self = this;
    var rowsArr = [];
    var itemId = null;
    var lastItemEndTime = null;
    var items = this.state.items.map(function(item) {
      return (<tr key={item.id} item={item}></tr>);
    })
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
        <TableBody onSort={this.handleSort} startTime={this.props.startTime} >
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
    return {component: "tbody", childComponent: "tr"};
  },
  
  render: function() {
    var props = jQuery.extend({}, this.props);
    delete props.children;
    return (<this.props.component {...props} />);
  },
  
  componentDidMount: function() {
    // Helper function to keep table row from collapsing when being sorted
    // got from http://www.avtex.com/blog/2015/01/27/drag-and-drop-sorting-of-table-rows-in-priority-order/
    var fixHelperModified = function(e, tr) {
      var $originals = tr.children();
      var $helper = tr.clone();
      $helper.children().each(function(index) {
        $(this).width($originals.eq(index).width())
      });
      return $helper;
    };

    var lastItemEndTime = null;

    jQuery(this.getDOMNode()).sortable({
      helper: fixHelperModified,
      stop: this.handleDrop
    });
    this.getChildren().forEach(function(child, i) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = child.props.item;
      jQuery.extend(item, {startTime: lastItemEndTime.clone()});
      jQuery(this.getDOMNode()).append('<' + this.props.childComponent + ' />');
      var node = jQuery(this.getDOMNode()).children().last()[0];
      node.dataset.reactSortablePos = i;
      React.render(<RowItem id={i} item={child.props.item} />, node);
      lastItemEndTime.add(child.props.item.time, 'm');
    }.bind(this));
  },
  
  componentDidUpdate: function() {
    var childIndex = 0;
    var nodeIndex = 0;
    var children = this.getChildren();
    var nodes = jQuery(this.getDOMNode()).children();
    var numChildren = children.length;
    var numNodes = nodes.length;

    var lastItemEndTime = null;
  
    while (childIndex < numChildren) {
      if (!lastItemEndTime) {
        lastItemEndTime = this.props.startTime.clone();
      }
      var item = children[childIndex].props.item;
      jQuery.extend(item, {startTime: lastItemEndTime.clone()});
      if (nodeIndex >= numNodes) {
        jQuery(this.getDOMNode()).append('<' + this.props.childComponent + '/>');
        nodes.push(jQuery(this.getDOMNode()).children().last()[0]);
        nodes[numNodes].dataset.reactSortablePos = numNodes;
        numNodes++;
      }
      React.render(<RowItem id={childIndex} item={item} />, nodes[nodeIndex]);
      childIndex++;
      nodeIndex++;
      lastItemEndTime.add(item.time, 'm');
    }
  
    while (nodeIndex < numNodes) {
      React.unmountComponentAtNode(nodes[nodeIndex]);
      jQuery(nodes[nodeIndex]).remove();
      nodeIndex++;
    }
  },
  
  componentWillUnmount: function() {
    jQuery(this.getDOMNode()).children().get().forEach(function(node) {
      React.unmountComponentAtNode(node);
    });
  },
  
  getChildren: function() {
    // TODO: use mapChildren()
    return this.props.children || [];
  },
  
  handleDrop: function() {
    var newOrder = jQuery(this.getDOMNode()).children().get().map(function(child, i) {
      var rv = child.dataset.reactSortablePos;
      child.dataset.reactSortablePos = i;
      return rv;
    });
    this.props.onSort(newOrder);
  }
});

var RowItem = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.id}</td>
        <td>{this.props.item.startTime.format('LT')}</td>
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
          "topic": "Adam",
          "desc": "A",
          "time": 5,
          "owner": "A"
      },
      {
          "id": "1",
          "topic": "Bob",
          "desc": "B",
          "time": 10,
          "owner": "B"
      },
      {
          "id": "2",
          "topic": "Chalie",
          "desc": "C",
          "time": 15,
          "owner": "C"
      },
      {
          "id": "3",
          "topic": "David",
          "desc": "D",
          "time": 20,
          "owner": "D"
      }
  ],
  "startTime": 1433923200000,
  "nextId": 4
}


React.render(<Agenda items={ITEMS} />, document.body);