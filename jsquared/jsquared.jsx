(function($) {
  var GroupList = React.createClass({
    // Standard React API
    render: function() {
      var self = this;
      var prefs = new gadgets.Prefs();

      return (
        <div>
          <div>{prefs.getMsg('title')}</div>
          <ul>
          {
            $.map(this.getGroups(), function(group, index) {
              return (<li key={group.Id}>{group.Name}</li>);
            })
          }
          </ul>
        </div>
      );
    },
    getInitialState: function() {
      return {data: {d: {results: []}}, users: []};
    },
    componentDidMount: function() {
      this.loadGroups();
      gadgets.window.adjustHeight();
    },
    componentDidUpdate: function(prevProps, prevState) {
      gadgets.window.adjustHeight();
    },
    // Our own code
    loadGroups: function() {
      gadgets.io.makeRequest("http://localhost:3000/api/v1/OData/Groups?$format=json",
        function(result) {
          this.setState({data: result, users: this.state.users});
        },
        {
          AUTHORIZATION: 'OAUTH2',
          OAUTH2_SERVICE_NAME: 'g1'
        });
    },
    getGroups: function() {
      this.state.data.d.results;
    }
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      <GroupList/>,
      document.body
    );
  });
})(jQuery);