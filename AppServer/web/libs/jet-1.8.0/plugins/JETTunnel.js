/* JET: version = 1.8.0, released date = 19/09/2014 */

var JET = {};
var JET_ = {};
JET.extend = function(n,ns,obj)
{
    JET_[ns] = obj;
} 

var onProcessEvent = function(data, callback){}
var onClick = function(data){}
var onInit = function(data){}
var onLoad = function(data){}
var onUnload = function(data){}

var initialize = function(ID, listener)
{
    var c = null;
    var container;
    var jsAsyncContainer;
    var container_variant = 'absent';
    var ContainerDescription;
    var config = {};
    var top_window = window;
    var properties = {};

    var JET = {};
    window.JET = JET;
    var _u = new _JetUtil();
    for(ns in JET_) JET[ns] = JET_[ns](_u);

    if (window.DOMParser) {
        JET.DOMParser = new DOMParser();
    }
    else { // Internet Explorer
        JET.XMLDOM = new ActiveXObject("Microsoft.XMLDOM");
    }

    var _decodeEikonVersion = function () {
        var c = JET.ContainerDescription;
        var g = /EIKON([0-9]*)\.([0-9]*)\.([0-9]*),/i.exec(c.userAgent);
        if (g && g.length == 4) {
            c.major = parseInt(g[1]);
            c.minor = parseInt(g[2]);
            c.build = parseInt(g[3]);
        }
    }

    var defInitialized = _u.queue();

    // timeout for querying data
    var _defaultTimeout = 2000;
    // timeout for registration
    var _registerTimeout = 9966;

    // logging functions
    _u.log = function (func, args, stack) {
        var a = [],
            i;
        for (i = 0; i < args.length; i++)
            a.push(args[i]);
        if (stack && config.trace)
            try {
                var traceLine = Error().stack.split("\n")[4];
                a.push(traceLine);
            } catch (e) {}
        func.apply(console, a); // jshint ignore:line
    };

    _u.info = function () {
        if (!config.log)
            return;
        log(console.log, arguments, true); // jshint ignore:line
    };

    _u.trace = function () {
        if (!config.trace)
            return;
        log(console.log, arguments, true); // jshint ignore:line
    };

    _u.error = function () {
        if (!config.trace)
            return;
        log(console.error, arguments); // jshint ignore:line
    };

    _u.warn = function () {
        if (!config.trace)
            return;
        log(console.warn, arguments); // jshint ignore:line
    };   

    jsAsyncContainer = "registerWithAsyncCCFContainer" in top_window;
    if(jsAsyncContainer || top_window.externalHost != null || ("registerWithJET" in top_window) || ("eikonLinkReady" in top_window))
    container_variant = 'chrome';
    else 
    {
        var co = null;
        if ("registerWithCCFContainer" in top_window) co = top_window;
        if (top_window.external && "registerWithCCFContainer" in top_window.external) co = top_window.external;
        if (co != null) container_variant = 'ko_ie';
    }


    // all possible data providers
    var _dataProviders = {
        // Returns a copy of the current context (JET.ContextData) of the Component to the Container
        context: function() {
            return JET.Context;
        },
        // // returns a copy of Component description (Description)
        // description: function() {
        //     return _getComponentDescription();
        // },
        // // returns a copy of the components current state (ArchiveData)
        // persistdata: function() {
        //     return _getArchiveData();
        // },
        // returns current values (Properties) of all the Component properties
        properties: function() {
            return _properties;
        },
        // returns a copy of the help URL that was provided in the HelpURL property
        helpurl: function() {
            return JET.HelpURL;
        }
        // // returns who owns of user input - either component or container
        // inputowner: function() {
        //     return _getInputOwner();
        // }
    };

    var _callDataProvider = function(requestObj) {
        var h = _dataProviders[requestObj.name];

        if (h != null) {

            var r = h.call(this, requestObj.xmlData);
            return JET.Convert.ToContainer.Result(requestObj.name, r);
        } else
            return null;
    };

    //handle 'getData' calls from the container, route to the appropriate handler
    var _onContainerGetData = function(requestObj) {
        _u.trace("Data request.  Name: ", requestObj.name);
        var result = _callDataProvider(requestObj);
        _u.trace("Data request.  Name: ", requestObj.name, " Result:", result);
        return result;
    };

    _onContainerEvent = function(data)
    {
        listener.processEvent(data);
        return true;
    }

    switch(container_variant)
    {
        case "chrome":
        {
            // register chrome support
            var asyncContainer = { postMessage: function (o) { _u.warn("Jet not loaded, skipping " + o) } };
            JET.ContainerType = "Async";
            c = function () {
                var uid = 0;
                var pm = function (m) {
                    var msg = JSON.stringify(m);
                    _u.trace("To container: ", msg);

                    // process message
                    asyncContainer.postMessage(msg);
                };
                var rm = function () {
                    var l = {};
                    return {
                        register: function (id, timeout) {
                            //resolve(id, null);
                            var it = {
                                d: _u.queue(),
                                t: setTimeout(function () {
                                    if (id in l) {
                                        it.d.resolve(null);
                                        delete l[id];
                                    }
                                }, timeout || _defaultTimeout)
                            };
                            l[id] = it;
                            return it.d;
                        },
                        resolve: function (id, res) {
                            var r = id in l;
                            if (r) {
                                var it = l[id];
                                clearTimeout(it.t);
                                it.d.resolve(res);
                                delete l[id];
                            }
                            return r;
                        }
                    }
                }();
                var _sendAsync = function (r, timeout) {
                    var d = rm.register(r.id = ("request" + uid++), timeout);
                    pm(r);
                    return d;
                };
                var _sendDataSync = jsAsyncContainer ?
                function (r) {
                    var r1 = { name: r.name, data: r.xmlData, method: "getData" };
                    _u.trace("Calling asyncContainer.getDataSync. Data: ", r1);
                    var result = asyncContainer.getDataSync(r1);
                    _u.trace("asyncContainer.getDataSync call result: ", result);
                    return result;
                } :
                function (r) {
                    if (_isSyncDataRequestAllowed()) {

                        var r1 = { name: r.name, data: r.xmlData, method: "getData" };
                        _u.trace("Sending a request to container url for data: ", r1);

                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', JET.ContainerDescription.capabilities.httpGetData.value, false);
                        var sentTxt = JSON.stringify(r1);
                        xhr.send("GUID=" + JET.ContainerDescription.GUID + "&METHOD=getData&CTXTLEN=" + sentTxt.length + "&CTXT=" + sentTxt); // string to send
                        var res = xhr.responseText;
                        _u.trace("Got an answer with status: " + xhr.status + " for httpRequest. Result: ", res);
                        return res;
                    }
                };
                var fc = function (r) {
                    var r1 = _u.eval(r);

                    _u.trace("From container: ", r1);
                    return r1;
                }
                var onGetData = function (r) {
                    var r1 = fc(r);
                    if (!r1.name) {
                        _u.error("No name in message!");
                        return null;
                    }
                    var res = _onContainerGetData(r1);
                    return res;
                };
                var onProcessEvent = function (e) {
                    var e1 = fc(e);
                    if (!e1.name) _u.error("No name in message!");
                    else _onContainerEvent(e1);
                };
                var onMessage = function (m) {
                    var msg = fc(m.data);

                    if (!msg.method && msg.name) {
                        msg.method = "undefined" == typeof msg.id ? "processEvent" : "getData";
                    }

                    if (msg.method) {
                        var res;
                        switch (msg.method.toLowerCase()) {
                            case "getdata":
                                // got a request
                                res = _onContainerGetData(msg);
                                break;
                            case "processevent":
                                // got an event
                                res = _onContainerEvent(msg);
                                break;
                            default:
                                throw new Error("Unsupported method: ", msg.method);
                        }
                        if (msg.id != undefined) {
                            var m1 = { id: msg.id, xmlData: res };
                            pm(m1);
                        }
                    }
                    else if (msg.id != null) {
                        if (!rm.resolve(msg.id, msg.xmlData))
                            _u.warn("Got outdated response: ", msg);
                    }
                };

                var initContainer = function (xmlData) {
                    JET.Initialized = true;

                    if (xmlData != null) {
                        JET.ContainerDescription = JET.Convert.FromContainer.Type("Description", xmlData);
                        _decodeEikonVersion();

                        _u.info("Container Description: ", JET.ContainerDescription);
                    }

                    if (JET.ContainerDescription && JET.ContainerDescription.plugin) {
                        var initPlugin = function () {
                            
                            // poor's man cleanup
                            if (container != null) container = null;
                            
                            var plugin = null;
                            if (top_window.EikonJET != null) {
                                container = top_window.EikonJET;
                                _u.trace("Container is EikonJET");
                            } else {
                                plugin = document.createElement("embed");
                                plugin.type = "application/x-jetPlugin";
                                plugin.width = 0;
                                plugin.height = 0;
                                plugin.id = "jetPlugin";
                                document.body.appendChild(plugin);
                                
                                if (plugin != null) container = plugin.jetPlugin();
                            }
                            
                            if (container != null) {
                                container.onMessage(onProcessEvent);
                                container.onRequest(onGetData);
                                container.init(JET.ContainerDescription.plugin.channel);
                            }

                            plugin = null;
                        }

                        initPlugin();

                        var verrue = function (fn) {
                            try { fn.apply(); }
                            catch (e) {
                                if (e.message == "NPObject deleted") {
                                    initPlugin();
                                    fn.apply();
                                } else throw e;
                            }
                        }

                        if (container != null) {
                            // CEF plugin detected
                            JET.ContainerType = "Sync";
                            _container.getData = function (r) {
                                var r1 = { name: r.name, data: r.xmlData, method: "getData" };
                                var msg = JSON.stringify(r1);
                                _u.trace("Data request. Name: ", r.name);
                                var res = null;
                                try {
                                    verrue(function () {
                                        res = container.send(msg);
                                    });
                                } catch (e) {
                                    _u.error(function () { return 'getData({"name":"' + r.name + '"} throws Exception : "' + e.message + '"' });
                                }
                                _u.trace("Data request. Name: ", r.name, " Result: ", res);
                                if (r.async) {
                                    r.async(res);
                                }
                                return res;
                            }
                            _container.processEvent = function (e) {
                                var m1 = { name: e.name, data: e.xmlData, method: "processEvent" };
                                if (e.channel) m1.channel = e.channel;
                                var msg = JSON.stringify(m1);
                                _u.trace("To container: ", msg);
                                verrue(function () {
                                    container.post(msg);
                                });
                            }
                            _container.setRequestedData = function(data) {
                                var name = data.name;
                                var result = data.result;
                                switch(name)
                                {
                                    case 'properties':
                                        _u.mixin(properties, result);
                                        try{
                                            window.top.document.title = properties.Title.value;
                                        }catch(e){}
                                    break;
                                    default:
                                    break;
                                }
                            }
                        }
                        else JET.Initialized = false;

                        listener.send("setData", {name:"persistdata", data:_container.getData({name:"persistdata", xmlData:"null"})});
                        request_static_data = function(name)
                        {
                            _container.getData({name:name, xmlData:"null", async: function(data){
                                listener.send("setData", {name:name, data:data});
                            }});
                        }.bind(this);
                        request_static_data("getPasteData");
                        request_static_data("UserInfo");
                        request_static_data("ActiveSymbol");
                        request_static_data("ClipboardData");

                        listener.send("containerRequestData", {name:'properties'});
                    }

                    defInitialized.resolve();

                    _u.info("JETComponent register with container finished");
                };
                return {
                    init: function (xmlSession) {
                        var reqObj = { xmlData: xmlSession, method: "registerWithCCF" };
                        var _registerWithJET = function () {
                            top_window.onCEFChannel = initContainer;
                            top_window.registerWithJET(JSON.stringify(reqObj).replace(/\\/g, '\\\\\\'));
                        }
                        if ("registerWithJET" in top_window) {
                            _registerWithJET();
                        }
                        else if ("eikonLinkReady" in top_window) {
                            top_window.eikonLinkReady ? _registerWithJET() : (top_window.onEikonLinkReady = _registerWithJET);
                        }
                        else {
                            _u.info("JETComponent starting register with Chrome container. Session: ", function () { return _getSession(); });

                            var newMessageHandler = onMessage;
                            if (window.externalHost.onmessage != null && window.externalHost.onmessage != undefined) {
                                var otherMessageHanlder = window.externalHost.onmessage;
                                newMessageHandler = function (m) {
                                    otherMessageHanlder(m);
                                    onMessage(m);
                                };
                            }

                            if (jsAsyncContainer) {
                                asyncContainer = top_window.registerWithAsyncCCFContainer(newMessageHandler);
                                JET.ContainerType = "Sync";
                            }
                            else {
                                asyncContainer.onmessage = newMessageHandler;
                            }

                            _sendAsync(reqObj, _registerTimeout).then(initContainer);
                        }
                    },
                    getData: function (r) {
                        if (r.async) {

                            var m1 = { name: r.name, xmlData: r.xmlData, id: r.id, method: "getData" };
                            _sendAsync(m1).then(function (res) { r.async(res); });

                        } else {
                            return _sendDataSync(r);
                        }
                        return null;
                    },
                    processEvent: function (e) {
                        var m1 = { name: e.name, data: e.xmlData, method: "processEvent" };
                        if (e.channel) m1.channel = e.channel;
                        pm(m1);
                    },
                    setRequestedData: function(data) {

                    }
                }
            };
        }
        break;
    }

    var _container = new c();
    return _container;
}

Socket = function (source, originId) {
    this.source = source;
    this.originId = originId;
    this.container = initialize(originId, this);

    this.processEvent = function(event) {
        this.send( "resultEvent", event );
    }
    this.getData = function(data) {
        this.send( "setData", data);
    }
    this.requestData = function(request) {
        this.send("containerRequestData", request);
    }
    this.send = function( method, data ) {
        this.source.postMessage({ data: data, method: method, targetId: this.originId }, '*');
    }
}

var JETClients = {};
window.addEventListener("message", function( event ) {
    var e = event.data;
    var listener = JETClients[e.originId];
    if( ! listener ) {

        listener = new Socket(event.source, e.originId);

        JETClients[e.originId] = listener;
    }

    if( e.method  === 'registerWithCCFContainer') {
        listener.container.init(e.data);
    } else if( e.method==='processEvent') {
        listener.container.processEvent(e.data);
    } else if( e.method==='getData') {
        //listener.container.getData(e.data);
    } else if(e.method === 'containerGetData') {
        listener.container.setRequestedData(e.data);
    } else if( e.method==='click') {
        onClick(e.data);
    } else if( e.method==='init') {

    } else if( e.method==='load') {
        onLoad(e.data);
    } else if( e.method==='unload') {
        onUnload(e.data);
    }
}, false);

