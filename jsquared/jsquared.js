(function($) {
  var GroupList = React.createClass({displayName: "GroupList",
    // Standard React API
    render: function() {
      var self = this;
      var prefs = new gadgets.Prefs();

      return (
        React.createElement("div", null, 
          React.createElement("div", null, prefs.getMsg('title')), 
          React.createElement("ul", null, 
          
            $.map(this.getGroups(), function(group, index) {
              return (React.createElement("li", {key: group.Id}, group.Name));
            })
          
          )
        )
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
      gadgets.io.makeRequest("http://localhost:3000/api/v1/OData/Groups?$format=json",
        function(result) {
          console.log(result);
          this.setState({data: result.data, users: self.state.users});
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
      React.createElement(GroupList, null),
      document.body
    );
  });
})(jQuery);