var Input = ReactBootstrap.Input;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var DialogBox = React.createClass({
  render: function() {
    return(
      <div>
        <h3>
        Add New Agenda Topic
        </h3>
        <form>
          <Input type='text' label='Topic' placeholder='Enter Agenda Topic' />
          <Input type='textarea' label='Details' placeholder='Describe This Topic' />
        </form>
      </div>
    );
  }
});

React.render(<DialogBox />, document.body);
