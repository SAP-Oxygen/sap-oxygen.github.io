/*global streamwork, alert, _, jQuery */
(function ($) {
    "use strict";

    var cstarPBE = streamwork.module("com.streamwork.pbe");

    var factories = [];

    cstarPBE.initialized = true;

    /**
     * Private function for handling unknown errors
     */
    // var ERR_MSG = CSTAR.t("application.something_went_wrong") + "\n" + CSTAR.t("application.notified_issue") + "\n";
    function handle_assertion_failure(error_key) {
        // var msg = ERR_MSG;
        // if (error_key) {
        //     msg += CSTAR.t("application.error_key") + ": " + error_key;
        // }
        // lipstick.alert(msg);
        alert("error (handle_assertion_failure)");  //TODO
    }

    cstarPBE.clientChannel = function (type, id, authToken) {
        if (type === undefined || id === undefined) {
            throw new Error("Invalid parameter to clientChannel. type=" + type + ", id=" + id);
        }

        // Bridge this to Rails UI controllers (fake comet!)
        return {
            targetObject: type + "/" + id,
            publish: function (msg) {
                msg = _.extend({target: this.targetObject /*, clientId: comet.getClientId()*/}, msg);
                if (msg["data"]) {
                    // GY: msg["data"] = YAHOO.lang.JSON.stringify(msg["data"]);
                    msg["data"] = JSON.stringify(msg["data"]);
                }
                $.ajax({
                    type: "POST",
                    url: "/pbe/publish",
                    data: msg,
                    dataType: "json",
                    success: function(data, textStatus) {
                        var handlers = cstarPBE.getMessageHandler(type, id);
                        if (data["type"] && handlers[data["type"]]) {
                            handlers[data["type"]](data["data"]);
                        }
                    },
                    error: function () {
                        handle_assertion_failure();
                    }
                });
            }
        };
    };

    // Looks up the matching factory for the given type and id. 
    // If no factory exists, null is returned.
    cstarPBE.getMessageHandler = function (type, id) {
        var i;
        for (i = 0; i < factories.length; ++i) {
            if (factories[i].type === type && factories[i].id === id) {
                return factories[i];
            }
        }
        return null;
    };

    // A default clientChannel; which will display errors if the comet system is not initialized
    var errorClientChannel = {
        publish: function () {
            alert("error (errorClientChannel)");//TODO
            // lipstick.alert(CSTAR.utils.CONNECT_ERR_MSG);
        }
    };

    cstarPBE.createMessageHandler = function (type, id, handlers, authToken) {
        var factory = {
            id: id,
            type: type,
            clientChannel: errorClientChannel,

            _init: function () {
                if (this.clientChannel === errorClientChannel) {
                    this.clientChannel = cstarPBE.clientChannel(this.type, this.id, authToken);
                }
            },
            makeHandlers: function () {
                if (this.id === undefined) {
                    throw new Error("Must initialize id of factory.");
                }
                if (this.type === undefined) {
                    throw new Error("Must initialize type of factory.");
                }

                this._init();

                // Callbacks to for special initialization after a comet channel is available
                if (this.started) {
                    this.started();
                }
            }
        };

        if (handlers) {
            $.extend(factory, handlers);
        }

        factories.push(factory);

        if (cstarPBE.initialized) {
            try {
                factory.makeHandlers();
            } catch (ex) {
                // don't allow a Method or other JS problem cause a bug
            }
        }
        return factory;
    };
}(jQuery));
