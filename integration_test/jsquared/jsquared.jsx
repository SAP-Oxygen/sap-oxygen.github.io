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
      var self = this;
      gadgets.io.makeRequest("https://stage.sapjam.com/api/v1/OData/Groups?$format=json",
        function(result) {
          console.log(result);
          self.setState({data: result.data, users: self.state.users});
        },
        {
          AUTHORIZATION: 'OAUTH2',
          OAUTH_SERVICE_NAME: 'g1',
          CONTENT_TYPE: gadgets.io.ContentType.JSON
        });
    },
    getGroups: function() {
      return this.state.data.d.results;
    }
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      <GroupList/>,
      document.body
    );
  });
})(jQuery);