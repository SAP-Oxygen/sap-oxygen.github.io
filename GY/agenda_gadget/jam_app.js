/*globals YAHOO, Cubetree, window, document, setInterval, clearInterval, _, Backbone, jQuery, photo, photoTagging, memberTagger, beforeResize, showCompactView, showFullView, slideshow, loadImages */

/* Global vars. Keep to a minimum and add them to script/jsl_strict.conf */
var jamApp = {};

/* Helpers, etc. */
(function ($) {
  "use strict";

  jamApp.t = YAHOO.cubetree.util.t;
  jamApp.betas = {};  // set on HTML page
  jamApp.togglableBetas = {};
  jamApp.features = {};

  jamApp.routers = [];
  jamApp.modal = null;

  jamApp.initialPath = null;
  jamApp.startedWithGet = true;

  jamApp.startBackbone = function (desiredRoot, requestWasGet, uuidUrl) {
    var root = desiredRoot;
    jamApp.startedWithGet = requestWasGet;
    jamApp.initialPath = window.location.pathname;
    var segments = window.location.pathname.split("/"); //e.g. "/c/cubetree.com/feed/item/406" will become ["", "c", "cubetree.com", "feed", "item", "406"]
    if (segments.length >= 2 && segments[1] === "c") {
      var actualRoot = "/c/" + segments[2] + "/";
      if (desiredRoot !== actualRoot) {
        if (window.history.replaceState) {
          var desiredPath = desiredRoot + _.tail(segments, 3).join("/");
          jamApp.initialPath = desiredPath;
          if (window.location.search) {
            //CUB-5418 Don't lose the query params
            desiredPath += window.location.search;
          }
          if (window.location.hash) {
            //CUB-7859 Don't lose the hash params
            desiredPath += window.location.hash;
          }
          window.history.replaceState({}, "", desiredPath);
        } else {
          root = actualRoot;
        }
      }
    }

    if (window.history.replaceState && uuidUrl) {
      if (window.location.pathname !== uuidUrl) {
        window.history.replaceState({}, "", uuidUrl + window.location.hash);
      }
    }

    if (!window.history.pushState && jamApp.allowingHashChange()) {
      //save flash messages for after redirect on IE<10
      //will be re-inserted by pjax_view.js
      var error = $("#errorMessageCustom");
      var notice = $("#noticeMessage");
      if (window.sessionStorage) {
        if (error.length > 0) {
          window.sessionStorage.setItem("flashError", error.html());
        }
        if (notice.length > 0) {
          window.sessionStorage.setItem("flashNotice", notice.html());
        }
      } else {
        //IE7 doesn't support sessionStorage; use a cookie instead.
        if (error.length > 0) {
          YAHOO.cubetree.util.writeCookie("flashError", error.html());
        }
        if (notice.length > 0) {
          YAHOO.cubetree.util.writeCookie("flashNotice", notice.html());
        }
      }
    }

    jamApp.initialPageLoad = true;
    Backbone.history.start({pushState: true, hashChange: jamApp.allowingHashChange(), root: root});
    jamApp.initialPageLoad = false;
    if (root !== desiredRoot) {
      Backbone.history.options.root = desiredRoot;
    }

    Backbone.history.on("navigate", function () {
      // fetch_updates polling can be halted due to network loss.
      // Resume polling after navigating with pjax.
      YAHOO.cubetree.UpdateManager.reset_error_count();
      $.modal.close();
    });
  };

  jamApp.allowingHashChange = _.once(function () {
    if (!jamApp.startedWithGet) {
      return false;
    }

    //Only allowing pages inside the left_nav_routes.js universe to use hashchange
    var segments = window.location.pathname.split("/");
    if (segments.length >= 3 && segments[1] === "c") {
      segments = _.tail(segments, 3);
    }
    var frag = segments.join("/");
    if (frag && window.location.search) {
      frag += window.location.search;
    }
    if (!frag) {
      frag = Backbone.history.getHash();
    }
    if (!frag || frag === "/") {
      return true;
    }
    if (_.str.startsWith(frag, "/")) {
      frag = frag.substring(1);
    }

    return jamApp.pathAllowsHashChange(frag);
  });

  jamApp.pathAllowsHashChange = function (path) {
    var allowed = false;
    var routes = _.extend({}, jamApp.nav.routes, jamApp.groupsRouter.routes, jamApp.gettingStartedRouter.routes);
    _.each(routes, function (name, route) {
      if (allowBetaRoute(route)) {
        var re = jamApp.nav._routeToRegExp(route);
        if (re.test(path)) {
          allowed = true;
        }
      }
    });
    return allowed;
  };

  var allowBetaRoute = function(route) {
    if (jamApp.nav.betaRoutes && jamApp.nav.betaRoutes[route]) {
      return jamApp.betas[jamApp.nav.betaRoutes[route]];
    }
    return true;
  };

  jamApp.canPjax = function () {
    if (jamApp.betas.single_item_view_pjax_content_1502 && jamApp.isSingleItem) {
      return false;
    } else {
      return Backbone.history._hasPushState || jamApp.allowingHashChange();
    }
  };

  jamApp.atRoot = function () {
    return Backbone.history.options.root === window.location.pathname;
  };

  jamApp.startedAtRoot = function () {
    return jamApp.initialPath === Backbone.history.options.root || jamApp.initialPath === "/" || jamApp.initialPath === "" || _.str.startsWith(jamApp.initialPath, "/c/");
  };

  jamApp.beforeUnload = function (cb, scope) {

    // mainContent not set until document ready
    $(document).ready(function () {
      if (jamApp.modal && (!scope || scope.closest("#robusMask").length > 0)) {
        jamApp.modal.beforeUnload(cb);
        return;
      }

      if (jamApp.mainContent && (!scope || $(scope).closest("#jam-body").length > 0)) {
        jamApp.mainContent.beforeReplace(cb);
        return;
      }
      //Could handle left nav, full page here
    });
  };

  jamApp.clearGlobals = function () {
    if (typeof photo !== 'undefined') {
      photo = undefined;
    }
    if (typeof photoTagging !== 'undefined') {
      photoTagging = undefined;
    }
    if (typeof memberTagger !== 'undefined') {
      memberTagger = undefined;
    }
    if (typeof beforeResize !== 'undefined') {
      beforeResize = undefined;
    }
    if (typeof showCompactView !== 'undefined') {
      showCompactView = undefined;
    }
    if (typeof showFullView !== 'undefined') {
      showFullView = undefined;
    }
    if (typeof slideshow !== 'undefined') {
      slideshow = undefined;
    }
    if (typeof loadImages !== 'undefined') {
      loadImages = undefined;
    }

    Cubetree.app.ReportViewer.clearData();
  };

  // Subclasses of BaseLeftNav should register themselves here so that we can render when the URL changes
  jamApp.navLookup = {
    map: {},
    registerLeftNav: function (navFor, navClass) {
      this.map[navFor] = navClass;
    }
  };

  jamApp.Navigation = Backbone.Router.extend({
    routes: {
      /* Need a routes property to be able to add to it */
    },

    betaRoutes: {
      /* Maintain a list of routes that are in beta */
    },

    // return true if routed, false if not routed or is single item view(show_item_only=true)
    dataRoute: function (href, replace) {
      var path = jamApp.nav.internalUrl(href);
      if (jamApp.pathAllowsHashChange(path)) {
        if(jamApp.betas.single_item_view_pjax_content_1502 && jamApp.isSingleItem){
          return false;
        } else {
          jamApp.nav.navigate(path, {trigger: true, replace: replace, force: true});
          return true;
        }
      } else {
        return false;
      }
    },

    internalApplyNav: function (route, segments, params) {
      if (!jamApp.initialPageLoad) {
        if (jamApp.canPjax() || !this._forceAjax) {
          if (jamApp.mainContent.canRemove()) {
            //We maybe shouldn't call navigate until the pjax view has loaded.
            this.navigate(route);
          } else {
            //If the current main content section is not unloadable, start the page refresh before rendering the left nav
            jamApp.loadUrl(this.url(route));
            return;
          }
        }
      }
      //If pushState is not available then navigate will cause a page refresh
      //If we're forcing a page refresh, we don't want to load the pjax view
      //On initial page load we still need to render the nav
      if (jamApp.secondaryNav && (jamApp.canPjax() || this._forceAjax || jamApp.initialPageLoad)) {
        if (jamApp.modal) {
          if (jamApp.modal.canHandle(route)) {
            jamApp.modal.applyNav(route);
            return;
          } else {
            var modal = jamApp.modal;
            jamApp.modal = null;
            modal.remove();
          }
        }
        params = params || {};
        params.url = this.url(route);
        if(jamApp.betas.feed_change_detecting_1502){
          jamApp.ChangeDetector.setGroupNavInfo(segments,params);
          if(!jamApp.ChangeDetector.getCheckUrl()){
          jamApp.secondaryNav.applyNav(segments, params);
          jamApp.ChangeDetector.setNextAction(false);
        }
        } else {
          jamApp.secondaryNav.applyNav(segments, params);
        }
      }

      if (jamApp.showWizard) {
        if(!jamApp.GettingStartedAdmin.get("display_getting_started") && jamApp.currentUser.isAdmin() && jamApp.betas.getting_started_wizard_admin_1505){
          jamApp.gettingStartedRouter.wizardAdminWelcome();
        } else {
          jamApp.gettingStartedRouter.wizardPeople();
        }
      }
    },

    //Force pjax for loading the main column even if pushState is not available
    forceAjax: function () {
      this._forceAjax = true;
      var fn = _.first(arguments);
      var args = _.rest(arguments);
      try {
        this[fn].apply(this, args);
      } finally {
        this._forceAjax = false;
      }
    },

    url: function (path) {    
      if(Backbone.history) {
        if (Backbone.history.options && Backbone.history.options.root) {
          return Backbone.history.options.root + path;
        }
      }      
      return '/' + path;
    },

    internalUrl: function (path) {
      var host = window.location.host;
      var hostIndex = path.indexOf(host);
      if (hostIndex >= 0) {
        //deal with IE7 bugginess
        path = path.substring(hostIndex + host.length);
      }

      if (_.str.startsWith(path, "/c/")) {
        var segments = path.split("/");  //e.g. "/c/cubetree.com/feed/item/406" will become ["", "c", "cubetree.com", "feed", "item", "406"]
        path = _.tail(segments, 3).join("/");
      }

      var root = Backbone.history.options.root;
      var rootIndex = path.indexOf(root);
      if (rootIndex === 0) {
        path = path.substring(root.length);
      }
      return path;
    }
  });

  // Extensibility function to allow routes to be added where the functionality is standard navigation panel.
  //
  // Params:
  //  navKey - the top-level nav identifer (ex. "home", "profile", "company")
  //  navClass - the view class to be instantiated for left nav. Must be a subclass of jamApp.BaseLeftNav
  //  routeMetadata - a hash of route settings, used to auto-generate a Backbone route function and
  //                  hook it up to right-side content rendering.
  //
  // Example:
  //    jamApp.Navigation.extendRouter("profile", jamApp.ProfileNav, {
  //      wall: {route: "profile/wall/:id", view: jamApp.FeedView},
  //      info: {route: "profile/info/:id"}
  //    });
  //
  // Note that the key of each entry in metadata ought to match with the keys in the .navItems member of the view.
  //
  // Options for each entry include:
  //    route - required, a standard Backbone route to recognize. If a parameter is present, it *must* be called :id;
  //            if more than one parameters are required that is not supported; directly extend jamApp.Navigation instead.
  //            The :id part of the route will be automatically substituted with the first parameter to the callback.
  //    view - optional, content class to instantiate. defaults to jamApp.PjaxView
  //    navItem - optional, usually not specified unless you need multiple actions to highlight the same left nav area
  //    callback - optional, use to supply the entire function for the route. Ignores "view" and "navItem" parameter.
  //
  // Relevant functions will be generated and added to jamApp.Navigation
  //
  jamApp.Navigation.extendRouter = function (navKey, navClass, routeMetadata) {
    jamApp.navLookup.registerLeftNav(navKey, navClass);
    _.each(routeMetadata, function (item, key) {

      if(item.beta) {
        // Register this route as a beta
        jamApp.Navigation.prototype.betaRoutes[item.route] = item.beta;
      }

      // Note that if we split the Navs into multiple routers then we don't need the navKey function name prefix.
      var keyCaps = _.str.capitalize(key),
        fnName = navKey + keyCaps,
        navSegment = item.navItem || key;
      if (jamApp.Navigation.prototype.routes[item.route]) {
        throw "Existing route: " + item.route;
      }
      if (jamApp.Navigation.prototype[fnName]) {
        throw "Existing function name: " + fnName;
      }
      jamApp.Navigation.prototype.routes[item.route] = fnName;

      if (item.callback) {
        jamApp.Navigation.prototype[fnName] = item.callback;
      } else {
        jamApp.Navigation.prototype[fnName] = function () {
          var options, route = item.route;
          //We have to reconstruct the url of the page we are navigating to so we can pass it down to the pjax view
          options = {};
          var args = Array.prototype.slice.call(arguments);
          var splatParam = /\*\w+/g;
          var path;
          if (splatParam.test(route)) {
            //the route uses a splat param, e.g. foo/*something
            var splat = args.shift();
            path = route.replace(splatParam, splat);
          } else {
            //replace named segments (e.g. :id) with the arguments passed to the router callback (this function)
            path = reconstructPath(route, args, options);
          }
          if (args.length && _.isObject(args[0])) {
            //append query params
            var params = args.shift();
            path += "?" + $.param(params);
            options.params = params;
          }
          if (Backbone.history._hasPushState && Backbone.history._wantsPushState && window.location.hash && -1 === path.indexOf("#")) {
            //keep hash on pushState browsers
            path += window.location.hash;
          }
          var navItem = navSegment;
          if (_.isFunction(navItem)) {
            navItem = navItem.apply(this, arguments);
          }
          var segments = [navKey, navItem];
          if (item.view) {
            if (_.isArray(item.view)) {
              segments = _.flatten([segments, item.view]);
            } else {
              segments.push(item.view);
            }
          } else {
            segments.push(jamApp.PjaxView);
          }
          options.beta = item.beta;
          this.internalApplyNav(path, segments, options);
        };
      }
    });
  };

  //e.g. reconstructPath("profile/edit_:section/:id", ["basic", "10"], {}) -> "profile/edit_basic/10", and options will be {section: "basic", idParam: "10"}
  function reconstructPath (route, args, options) {
    var namedParamRegExp = /:\w+/g;
    var m = namedParamRegExp.exec(route);
    var param;
    if (!m || !(param = args.shift())) {
      return route;
    }
    var part = m[0];
    if (":id" === part) {
      //we use 'idParam' instead of 'id' because backbone views will take an 'id' argument and use it as their element's id
      options.idParam = param;
    } else {
      options[part.substring(1)] = param;
    }
    var path = route.substring(0, m.index) + param + route.substring(m.index + part.length);
    return reconstructPath(path, args, options);
  }

  jamApp.loadUrl = function (url, replace) {
    if (replace) {
      window.location.replace(url);
    } else {
      window.location.assign(url);
    }
  };

  jamApp.documentHidden = function () {
    if (undefined !== document.hidden) {
      return document.hidden;
    }
    if (undefined !== document.webkitHidden) {
      return document.webkitHidden;
    }
    if (undefined !== document.mozHidden) {
      return document.mozHidden;
    }
    if (undefined !== document.msHidden) {
      return document.msHidden;
    }
    return undefined;
  };

  //Keeping columns at the same height without using tables or javascript is a challenge.
  //Jam used to use a function called YAHOO.cubetree.util.match_heights(), but it only ran once and
  //didn't allow for columns growing (e.g. lazy feed load) or shrinking (e.g. pjax).
  //Unnecessary post-1405 due to css improvements
  /*var matchHeightInterval = null;
  jamApp.matchColumnHeights = function (ids) {
    if (matchHeightInterval !== null || jamApp.betas.ux_1405) {
      return;
    }
    //state is a collection of column heights as of the last interval
    var state = null;
    matchHeightInterval = setInterval(function () {
      if (!jamApp.documentHidden() && !jamApp.modal) {
        //get the dom elements for these column ids - they might not all be there
        var cols = _.chain(ids).map(function (id) {
          return document.getElementById(id);
        }).compact().value();
        //get the heights as a map of IDs -> heights
        var currentState = {};
        _.each(cols, function (col) {
          currentState[col.id] = $(col).height();
        });
        //if they've changed...
        if (!_.isEqual(currentState, state)) {
          //clear out previous min-height
          $(cols).css("min-height", "");
          //find the column with the max height
          var max = _.reduce(cols, function (memo, col) {
            var h = $(col).height();
            return h > memo.h ? {id: col.id, h: h} : memo;
          }, {h: 0});
          if (max.h) {
            //set it as the min-height of the other columns
            _.each(cols, function (col) {
              if (col.id !== max.id) {
                $(col).css("min-height", max.h);
              }
            });
          }
          //save the state for the next interval
          state = currentState;
        }
      }
    }, 500);
  };
  jamApp.stopMatchColumnHeights = function () {
    clearInterval(matchHeightInterval);
    matchHeightInterval = null;
  };*/

  jamApp.small_trash_icon = "/images/cubetree_global/body/icons/icon_trash_13x13.gif";
  /* Dispatcher for inter view communication */
  jamApp.dispatch = _.clone(Backbone.Events);

  /* Remove leading and trailing whitespace */
  jamApp.strip = function (str) { return str.replace(/^\s+|\s+$/g, ''); };

  /**
   * CUB-6273 There's a mobile safari bug that breaks contentEditable elements (i.e. rich text editors)
   * when the first touch event is handled. This prevents them from escaping tinyMCE's iframe.
   */
  jamApp.fixTinyMceOnTouch = function () {
    if (Modernizr.touch) {
      $(function () {
        $(".mceIframeContainer > iframe").each(function () {
          var iframe = this;
          var target = this.contentDocument;
          var stopTouch = function (e) {
            iframe.contentWindow.focus();
            e.stopPropagation();
          };
          target.addEventListener('touchend', stopTouch);
          target.addEventListener('touchstart', stopTouch);
          target.addEventListener('touchmove', stopTouch);
        });
      });
    }
  };

  jamApp.copyImageWidthAndHeightToCssStyle = function( parentElem ) {
    parentElem.find('img').each( function( index, element ) {
      var copyAttrToCss = function( $element, element, attrib_name, target_name ) {

        // FLui: need element.attributes, not $element.attr() to get the
        // original HTML DOM attribute (e.g. "217") not the current 
        // effective one in the current DOM (e.g. "1192")
        var attrib = element.attributes[attrib_name];

        if ( attrib !== undefined && attrib !== null ) {
          if (target_name === undefined || target_name === null) {
            target_name = attrib_name;
          }          
          
          var val = attrib.value;
          if ( val.indexOf( "%" ) >= 0 ) {
            $element.css(target_name, val );
          }
          else {
            $element.css(target_name, val + "px" );
          }
        }
      };

      var $element = $(this);
      copyAttrToCss($element, element, "width");
      copyAttrToCss($element, element, "width", "max-width");
      copyAttrToCss($element, element, "height");
    });
  };

  jamApp.addAndRemoveViewerOnBody = function () {
    jQuery(document.body).addClass("viewer");

    $(function () {
      if (jamApp.mainContent) {
        jamApp.mainContent.beforeReplace(function () {
          jQuery(document.body).removeClass("viewer");
        });
      }
    });
  };

  // This function contains a helper for IE8 to parse ISO string format
  jamApp.parseDate = function(dateString) {
    if (CSTAR.utils.ie8) {
      return $.fullCalendar.parseISO8601(dateString, false);
    } else {
      return new Date(dateString);
    }
  };

  jamApp.isFocusedOnInputOrTextArea = function () {
    return $("body > .simplemodal-container").length > 0 ||
      (document.activeElement && document.activeElement.tagName === 'TEXTAREA') || //activeElement might be null on IE11 (CUB-10069)
      (document.activeElement && document.activeElement.tagName === 'INPUT');
  };

  $(document).ready(function () {

    if ( $('#jam-navbar').length > 0 ) {
      var navbarHeight = $('#jam-navbar').height();
      var bodyScrollTop = $(document).scrollTop();
      $(window).bind('scroll.toggle-jam-navbar', _.throttle( function () {

        var bodyMax = $(document).outerHeight() - $(window).height();
        if ( $(document).scrollTop() > bodyScrollTop + navbarHeight ) {

          $('#jam-navbar').removeClass('jam-navbar-visible');

          bodyScrollTop = $(document).scrollTop();
          bodyScrollTop = Math.max( 0, bodyScrollTop );
          bodyScrollTop = Math.min( bodyMax, bodyScrollTop );

        } else if ( $(document).scrollTop() < navbarHeight || $(document).scrollTop() < bodyScrollTop - navbarHeight ) {
          
          $('#jam-navbar').addClass('jam-navbar-visible');

          bodyScrollTop = $(document).scrollTop();
          bodyScrollTop = Math.max( 0, bodyScrollTop );
          bodyScrollTop = Math.min( bodyMax, bodyScrollTop );
        }

if (jamApp.betas.cozy_feed_1505) {
        var $stickers = $('.jam-sticker-sticked');
        if ($stickers.length > 0) {
          $stickers.each(function () {
            $(this).css('top', $(this).parent().offset().top - ($('#jam-navbar').hasClass('jam-navbar-visible') ? 0 : navbarHeight));
          });
        }
}
      }, 100));

      $(document).on('mouseenter', '#jam-header, #jam-navbar, #groups_nav_dropdown', function () {
        $('#jam-navbar').addClass('jam-navbar-sticky');
      });

      $(document).on('mouseleave', '#jam-header, #jam-navbar, #groups_nav_dropdown', function () {
        $('#jam-navbar').removeClass('jam-navbar-sticky');
      });

      $(document).on('mouseenter', '.navbar-groups', function () {
        var el = $("#groups_nav_dropdown .dropdown-menu");
        el.css('opacity', 0);
        var autoHeight = el.css('height', 'auto').height();
        el.height(0).animate({
          height: autoHeight,
          opacity: 1
        });
      });
      
      $(".non-zero-do-not-animate").addClass("non-zero").removeClass('non-zero-do-not-animate');
    }

    /* Convenience function for model validation errors */
    jamApp.errorsToJSON = function (errors) {
      var i, comma = "", str = '{"errors":[';
      for (i = 0; i < errors.length; i++) {
        str += comma + '"' + errors[i] + '"';
        comma = ',';
      }
      str += "]}";
      return {responseText: str};
    };
    /* Convenience error handler (error callback for model.save) */
    jamApp.handleError = function (model, response) {
      var t = jamApp.t;
      jamApp.hide_throbber();
      try {
        if (response.responseText && !response.responseText.match(/^\s*$/)) {
          var json = $.parseJSON(response.responseText);
          if (json && json.errors) {
            var errors = json.errors.join(', ');
          } else {
            errors = response.statusText;
          }
          jamApp.fleeting.render(t('inbox.error') + ": " + errors, {error: true});
        } else {
          jamApp.fleeting.render(t('inbox.error') + ": " + response.statusText, {error: true});
        }
      } catch (err) {
        jamApp.fleeting.render(t('learning.server_error'), {error: true});
      }
    };
    jamApp.show_throbber = function () {
      if (!jamApp.showing_throbber) {
        jamApp.showing_throbber = true;
        $(".jamAppThrobber").show();
      }
    };
    jamApp.hide_throbber = function () {
      if (jamApp.showing_throbber) {
        $(".jamAppThrobber").hide();
        jamApp.showing_throbber = false;
      }
    };

    jamApp.genericError = function () {
      YAHOO.cubetree.widgets.errorDisplay.show({
        header : jamApp.t('common.error'),
        body   : jamApp.t('common.sorry_try_again')
      });
    };

    jamApp.editable = function (domElem, postUrl) {
      var inputWidth = domElem.width();
      domElem.editable(function (value) {
        if ($.trim(value).length > 0) {
          $.post(postUrl, {title: value});
          return value.escapeHTML();
        } else {
          return this.revert;
        }
      }, {name: 'title', onblur: 'submit', maxlength: 255, width: inputWidth, submit: ''});
    };
    
    jamApp.isExternalUrl = function (url) {
      var isStartWithHttp = false;
      var isJam = false;
      var isTracked = false;
      if (/^(f|ht)tps?:\/\//i.test(url)) {
        isStartWithHttp = true;
      }
      
      var patterns = [
        (/([\w\W]*\.)?cubetree\.com/),
        (/([\w\W]*\.)?sapjam\.com/),
        (/([\w\W]*\.)?jamatsap\.com/)
      ];

      // Check if the root matches one of Jam's known hostnames,
      // but also that the current host matches the one in the URL.
      isJam = _.some(patterns, function (pattern) {
        return pattern.test(url);
      }) && url.indexOf(window.location.host) >= 0;
      
      if (/click\/track/.test(url)) {
        isTracked = true;
      }
      
      return (isStartWithHttp && !isJam) || isTracked;
    };

    var toggleBeta = _.debounce( function (beta) {
      $.post('/profile/toggle_beta', {
        beta: beta,
        toggle: $('html').hasClass(beta)
      });
    }, 1000);

    $(document.body).on("click", ".jam-beta-toggle", function (e) {
      var $target = $(e.currentTarget);
      var clientSide = $target.data('client-side');

      if (clientSide) {
        $('html').toggleClass($target.data('beta'));
        toggleBeta($target.data('beta'));
      } else {
        jamApp.ui.addWaitOverlay( $('body') );
        $.post('/profile/toggle_beta', {
          beta: $target.data('beta'),
          toggle: $target.data('toggle')
        }, function () {
          window.location.reload();
        });
      }
    });

    $(document).on("jam:pjax:loading", function () {
      $(document.body).addClass('pjax-loading');
    });

    $(document).on("jam:pjax:ready", function () {
      $(document.body).removeClass('pjax-loading');
    });

    //Adapted from the official rails/jquery-ujs plugin
    //Add data-method="post" to <a> elements to make them trigger POSTs instead of GETs
    var submitting;
    $(document.body).on("click", "a[data-method]", function (e) {
      if (this === submitting) {
        e.preventDefault();
        return;
      }
      var confirm = $(this).data('confirm');

      var self = this;
      var submitAsPost = function () {
        var href = $(self).attr("href"),
        method = $(self).data('method'),
        target = $(self).attr('target'),
        csrf_token = Cubetree.util.Config("form_auth_token"),
        csrf_param = "authenticity_token",
        form = $('<form method="post" action="' + href + '"></form>'),
        metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';

        if (csrf_param !== undefined && csrf_token !== undefined) {
          metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
        }

        if (target) {
          form.attr('target', target);
        }

        form.hide().append(metadata_input).appendTo('body');
        form.submit();
        submitting = self;
      };

      if (confirm) {
        jamApp.ui.confirm(confirm, function () { 
            submitAsPost();
          },
          {okLabel: jamApp.t('infrastructure.delete')}
        );
      }
      else {
        submitAsPost();
      }        

      e.preventDefault();
    });

    $(document.body).on("submit", "form", function (e) {
      if (window.location.pathname === '/' && window.location.hash) {
        var form = $(this);
        var input = form.find("input[name='_referer']");
        if (input.length !== 0) {
          return;
        }
        var hash = window.location.hash;
        if (_.str.startsWith(hash, '#')) {
          hash = hash.substring(1);
        }
        if (hash) {
          input = '<input name="_referer" value="/' + _.escape(hash) + '" type="hidden" />';
          form.append(input);
        }
      }
    });

    $(document.body).on("click", "a", function (e) {
      if (!jamApp.modal && (!jamApp.mainContent || !jamApp.mainContent.canRemove())) {
        //we won't be able to do pjax on this page anyway, so bail out early to not confuse the browser history
        return;
      }
      var target = $(e.currentTarget);
      if (target.attr("target") === "_blank") {
        return;
      }
      if (target.data("route") === false) {
        return;
      }
      var href = target.attr('href');
      if (_.str.startsWith(href, "mailto:")) {
        if (CSTAR.utils.ie8) {
          YAHOO.cubetree.util.createIFrameHref(href);
          e.preventDefault();      
        }
        return;
      }
      var onclick = target.attr('onclick');
      if (href === "#") {
        e.preventDefault();
      }
      if (jamApp.canPjax()) {
        if (e.isDefaultPrevented()) {
          return;
        }
        //ignore cmd-click, ctrl-click, etc.
        if ( e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ) {
          return;
        }
        //Don't try and handle rails-generated form submissions
        if (onclick && Cubetree.util.Config("form_auth_token") && _.str.include(onclick, Cubetree.util.Config("form_auth_token"))) {
          return;
        }
        if (href && !target.attr('data-method')) {
          if (jamApp.nav.dataRoute(href)) {
            if (target.closest(".simplemodal-container").length) {
              $.modal.close(); //link is in modal dialog; close it.
            }
            e.preventDefault();
          } else if (_.str.startsWith(href, "#") && !Backbone.history._hasPushState) {
            //Scroll to anchor manually on IE
            var fragment = Backbone.history.getFragment();
            var hashIndex = fragment.indexOf("#");
            if (-1 !== hashIndex) {
              fragment = fragment.substring(0, hashIndex);
            }
            fragment += href;
            _.defer(function () {
              var name = href.substring(1);
              jamApp.nav.navigate(fragment, {force: true});
              var anchor = $("a[name='"+name+"'], #"+name);
              if (anchor.length > 0) {
                $(window).scrollTop(anchor.offset().top);
              }
            });
            e.preventDefault();
          }
        }
      }
    });

    jamApp.core.init();
    
    new jamApp.BodyView().setElement( $('body') );
    
  });
}(jQuery));
