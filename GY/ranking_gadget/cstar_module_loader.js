/**
 * cstar_module_loader.js
 *
 * Provides the dynamic code and stylesheet loading services for the methods API
 */
// create a top-level namespace variable if it does not already exist
var streamwork = streamwork || {};

(function () {
    // module namespace
    var ns = streamwork;
    // imports
    var $ = jQuery;
    
    // this is set of loaded modules (i.e the actual namespaces)
    var modules = {};

    // this is set of loaded resource bundles
    var resources = {};

    ns.module = function (name) {
        if (!modules[name]) {
            modules[name] = {};
        }
        return modules[name];
    };

    // this is Doug Crockford's "object function"
    ns.object = function (proto) {l
        function F() {}
        F.prototype = proto;
        return new F();
    };

    var registeredControllers = {};

    /**
     * Dynamically load the collection of javascripts in order, and call the callback when all
     * are loaded. Will not reload previously loaded scripts and will update isLoaded as new
     * scripts are loaded.
     * @param javascripts the list of scripts in load order
     * @param isLoaded a hash/set containing the already loaded script names
     * @param callback the function to call when done
     */
    function loadJavascripts(javascripts, isLoaded, callback) {
        if (javascripts.length === 0) {
            return;
        }
        // recursively deal with the rest of the list
        function next(rest, isLoaded, callback) {
            if (rest) {
                loadJavascripts(rest, isLoaded, callback);
            }
            else {
                callback();
            }
        }
        // get the head of the list
        var first = javascripts[0];
        // and the rest or nil
        var rest = javascripts.length > 1 ? javascripts.slice(1) : null;
        // if the first is not loaded...
        if (!isLoaded[first]) {
            CSTAR.utils.getScript(first, function() {
                // when done, set the load flag and carry on with the rest of the list
                isLoaded[first] = true;
                next(rest, isLoaded, callback);
            });
        } else {
            // otherwise, carry on with the rest of the list
            next(rest, isLoaded, callback);
        }
    }

    /**
     * Will dynamically load the requested set of stylesheets by adding a new 
     * @import statement into a shared "style" element.  This is done instead 
     * of using the "link" tag because of a limitation in IE:
     * http://support.microsoft.com/kb/262161  
     * 
     * Will not load previously loaded stylesheets and will update
     * isLoaded as new stylesheets are loaded
     * @param stylesheets the list of stylesheets
     * @param isLoaded a hash/set of the loaded stylesheets
     */
    function loadStylesheets(stylesheets, isLoaded) {
        // no async callback stuff here, we can go iteratively
        var s, ss, href, modules_css = $('head style.modules_css:last'), 
            import_count = modules_css.data('import_count');
        var addFn = function() {
            if (this.styleSheet && this.styleSheet.addImport) {
                // IE specific code
                
                // fix for when constellation is loaded in an iframe on a page
                // hosted by IIS, IE will use the hostname from the containing
                // page rather than the iframe for the @imports so explicitly 
                // include the protocol and host
                if(href.charAt(0) === '/') {
                    href = location.protocol + "//" + location.host + href;
                }
                
                this.styleSheet.addImport(href);
            }
            else {
                $(this).append('@import url('+href+');\n');
            }
        };
        for (s = 0; s < stylesheets.length; s++) {
            ss = stylesheets[s];
            if (!isLoaded[ss]) {
                href = ss; 

                if (!modules_css.length || import_count >= 31) {
                    // IE will only allow 31 imports per stylesheet, so create a new style element
                    modules_css = $('<style type="text/css" class="modules_css" media="all"></style>').appendTo('head');
                    import_count = 0;
                    modules_css.data('import_count', import_count);
                }

                modules_css.each(addFn);

                isLoaded[ss] = true;
                import_count += 1;
                modules_css.data('import_count', import_count);
            }
        }
    }

    /**
     * Builds an "image helper" function which will be injected into loaded modules.
     * The function will return the correct image URLs for the module's bundled images.
     * @param moduleLocation
     */
    function makeImageHelper(moduleLocation) {
        return function(resourceName) {
            return moduleLocation + "/images/" + resourceName;
        };
    }

    /**
     * Injects image helpers into all of the referenced modules, if not already injected
     * @param moduleLocations array of pairs of moduleName, location
     */
    function setModuleImageHelpers(moduleLocations) {
        var m, module, moduleName, location;
        for (m = 0; m < moduleLocations.length; m++) {
            moduleName = moduleLocations[m][0];
            location = moduleLocations[m][1];
            module = modules[moduleName];
            if (module && location && !module.image) {
                module.image = makeImageHelper(location);
            }
        }
    }
    
    function registerController(module, moduleName, timestamp, options, initialData) {
        if(registeredControllers[options.elementId + timestamp]) {
            return;
        }
            
        if(!initialData) {
            initialData = options.initialData;
        }
        var controller = module.methodClient(options.elementId, initialData, options) || {};
        if(!controller.api_update) {
            controller.api_update = function(data) {
                $("#" + options.elementId).html("");
                registeredControllers[options.elementId + timestamp] = null;
                registerController(module, moduleName, timestamp, options, data.data);
            };
        }
        // $.extend(controller, CSTAR.references.referenceHandlers());
        // registeredControllers[options.elementId + timestamp] = controller;
        // Object type is now the real PBE agent class prefix. Previously was the method key name.
        // if (options.objectType && options.parentMessageHandler) {
        //     options.parentMessageHandler.setDelegate(options.objectType, options.itemId, controller);
        // }

        var handler = streamwork.module("com.streamwork.pbe").createMessageHandler(options.objectType, options.itemId, controller);
        $.extend(controller, handler);  // add clientChannel to controller
        registeredControllers[options.elementId + timestamp] = controller;
    }

    /**
     * Declare the public namespace for the module loader
     */
    ns.moduleLoader = {
        /**
         * The loaded module set
         */
        moduleLoadFlags: {},
        /**
         * The loaded javascript set
         */
        javascripts: {},
        /**
         * The loaded stylesheet set
         */
        stylesheets: {},
        
        startFunctions: [],
        
        /**
         * This is the main entrypoint for the loaded. This is currently invoked from the partial
         * in cstar_method/_start.html.erb. It will load the given modulename and all of it's
         * dependencies, using the module service to look them up.
         * @param moduleName module name to load
         * @param readyFn the function to invoke when we are done
         */
        load: function(moduleName, readyFn) {
            var loader = this;

            // if already loaded, just fire the ready function
            if (loader.moduleLoadFlags[moduleName]) {
                readyFn();
            }
            else {
                // otherwise, add the function to the queue
                loader.startFunctions[loader.startFunctions.length] = readyFn;
            }
        },
        
        loadResources: function(modResources, moduleName) {
            if (!modResources) {
                return;
            }
            
            var loader = this;
            if(moduleName && loader.moduleLoadFlags[moduleName]) {
                return;
            }
            
            loadStylesheets(modResources.stylesheets, loader.stylesheets);
            loadJavascripts(modResources.javascripts, loader.javascripts, function () {
                // set load flags
                var m;
                for (m = 0; m < modResources.moduleLocations.length; m++) {
                    var name = modResources.moduleLocations[m][0];
                    loader.moduleLoadFlags[name] = true;
                }
                
                // once all scripts are loaded, inject image helpers
                setModuleImageHelpers(modResources.moduleLocations);
                
                // call queued up start functions
                var i;
                for(i = 0; i < loader.startFunctions.length; ++i) {
                    loader.startFunctions[i]();
                }
                loader.startFunctions = [];
            });
        },
        
        start: function(moduleName, options, timestamp) {
            console.log("start called");
            debugger;
            var loader = this;
            $(document).ready(function() {
                console.log("document.ready (inside) called");
                loader.load(moduleName, function() {
                    debugger;
                    var module = ns.module(moduleName);

                    // try {
                        if (module.start) {
                            module.start(options);
                        }
                        // instantiate a PBE controller and register it
                        registerController(module, moduleName, timestamp, options);
                    // } catch (ex) {
                    //     // don't allow bug in method to break the loading of other methods
                    //     if (console && console.error) {
                    //         console.error(ex);
                    //     }
                    // }
                });
            });
            console.log("start ended");
        }
    };
}());