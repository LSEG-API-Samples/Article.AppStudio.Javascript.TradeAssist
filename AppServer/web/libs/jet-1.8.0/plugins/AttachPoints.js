/* JET: version = 1.8.0, released date = 19/09/2014 */

// declare AttachPoints namespace
JET.extend(0, "AttachPoints", function(_u) {
	var api = {};
	// registered interfaces for detaching events
	var dom_attaches = [];
	// attach points are active
	var attach_points_active;

	api.init = function(attachPoints) {

		if (attach_points_active)
			throw new Error("AttachPoints was already initialized!");

		// registered names and events
		var cfgMultiQuery = {
			names: [],
			evtTypes: []
		};

		// event handlers
		var cfgEvtHandlers = {};

		// mapping from node name to data type
		var jetAvailableDataAttrNames = { JETNAVIGATION: "Navigation", JETCONTEXT: "ContextData", JETCOMMANDBAR: "CommandBar", JETARCHIVE: "ArchiveData", JETLOCATION: "Location", JETPERSIST: "Properties" };

		var addOrMerge = function(obj1, obj2) {
			return _u.isArray(obj1) && _u.isArray(obj2) ? obj1.concat(obj2) : _u.mixin(null, obj2, obj1);
		}

		var _contains = function(ar, item) {
			return _u.each(ar, function(i){if (i == item) return true; }, false);
		};

		var _mapToJETName = function(name) {
			switch (name.toLowerCase()) {
				case "click":
					return "navigate";
				case "contextmenu":
					return "contextMenu";
				case "dragstart":
					return "dragStart";
				default:
					return name;
			}
		};
		var _addCfgEvtHandler = function(multiQuery, evtHandlers, attachPoint) {
			// get list of names
			var names = attachPoint.name.split(",");
			var ret = true;
			// for each query
			_u.each(names, function (name) {

				if (typeof name != "string")
					throw new Error("Invalid name parameter was provided!");

				if (name.length > 0) {
					// search for current name
					if (!_contains(multiQuery.names,name))
						// reqister new unique name
						multiQuery.names.push(name);
					// get events from attach point as array
					var events = attachPoint.event;
					if (!_u.isArray(events)) {
						events = [events];
					}
					// for each event
					_u.each(events, function (event) {
						// get handlers for the event
						var evtHdlrs = evtHandlers[event];
						if (evtHdlrs == null) {
							evtHdlrs = [];
							evtHandlers[event] = evtHdlrs;
						}
						// get config of each attach point by removing fields: name, event, config
						var config = {};
						// copy all the data from attachPoint to config object
						_u.mixin(config, attachPoint);
						// copy all the fields from attachPoint.config to config object
						if (attachPoint.config != null)
							_u.mixin(config, attachPoint.config);
						// delete processed fields from config object (name. event and config)
						delete config.name;
						delete config.event;
						delete config.config;
						// get handlers, be sure all are of function type
						var dataHandler = config.dataHandler;
						if (_u.isString(dataHandler))
							dataHandler = _u.eval(dataHandler);
						var defHandler = (config != null && config.defaultHandler != null) ? config.defaultHandler : null;
						if (_u.isString(defHandler))
							defHandler = _u.eval(defHandler);
						// register new event handler
						var objHdlr = {"name": name, "jetName": config.jetName != null ? config.jetName : _mapToJETName(event),
							"context": config.context != null ? config.context : {}, "dataHandler": dataHandler, "defaultHandler": defHandler
						};
						evtHdlrs.push(objHdlr);
						// search for event types
						if (!_contains(multiQuery.evtTypes,event))
							// reqister new unique event type - to be handled on jetcomponent dom node level
							multiQuery.evtTypes.push(event);
					});
				}
			});
		};
		var _attachToCCFGlobalHandler = function(multiQuery, evtHandlers) {

			// function for matching a node with jetcontext to the query
			var matchObjectToQuery = function(dom, name) {
				var jetAttr = null;
				// it has a jet attribute with needded query???
				return dom.attributes[name] != null;
			};
			// summary: retrieve any CCFContext from DOM markup
			var _getNodeContext = function(node) {

				// data to return
				var data = {};

				var addNodeData = function(node, map, data) {
					// scan all the attributes and collect all the jet information
					if (node && node.getAttribute) {
						var ids = {type:"COMP"};
						var shrt = false;
						_u.each(node.attributes, function(attr) {
							var attrName = attr.nodeName.toUpperCase();
							// parse short CCF syntax
							if (attrName.substr(0,2) == "E.") {
								ids[attrName.substr(2)] = attr.nodeValue;
								shrt = true;
							}
							// parse full CCF syntax
							else if (attrName in map) {
								var s = attr.nodeValue;
								if (s != null && s.length > 0) {
									var d = _u.eval(s);
									var prop = map[attrName];
									data[prop] = prop in data ? addOrMerge(data[prop], d) : d;
								}
							}
						});
						// do we have identifiers with short syntax?
						if (shrt) {
							if (!data.ContextData)
								data.ContextData = [];
							// write the context
							data.ContextData[data.ContextData.length] = ids;
						}
					}
				}

				// iterate through all the parents
				while(node != document.body && node != document) {

					// collect shared data
					addNodeData(node, jetAvailableDataAttrNames, data);
					node = node.parentNode;
				}

				return data;
			};

			// prepare a jet data for a jet event
			var _getCcfData = function(node,eventObj) {
				// prepare location data
				var ev = eventObj.jetName || eventObj.name;
				var mouse = {screenX:eventObj.eventObj.screenX, screenY:eventObj.eventObj.screenY, clientX:eventObj.eventObj.clientX, clientY:eventObj.eventObj.clientY};
				var jetObj = {};
				switch (ev.toLowerCase()) {
					case "click":
						var ctx = _getNodeContext(node);
						if (ctx.ContextData)
							jetObj.entities = ctx.ContextData;
						break;
					case "dragstart":
						var ctx = _getNodeContext(node);
						jetObj = {mouse: mouse};
						if (ctx.ArchiveData)
							jetObj.archive = ctx.ArchiveData;
						if (ctx.ContextData)
							jetObj.entities = ctx.ContextData;
						break;
					case "contextmenu":
						var ctx = _getNodeContext(node);
						jetObj = {mouse: mouse};
						if (ctx.ContextData)
							jetObj.entities = ctx.ContextData;
						if (ctx.CommandBar)
							jetObj.menu = ctx.CommandBar;
						break;
					case "navigate":
						var ctx = _getNodeContext(node);
						if (ctx.Navigation)
							jetObj = ctx.Navigation;
						if (ctx.ContextData)
							jetObj.entities = jetObj.entities ? addOrMerge(jetObj.entities, ctx.ContextData) : ctx.ContextData;
						if (ctx.ArchiveData)
							jetObj.archive = jetObj.archive ? addOrMerge(jetObj.archive, ctx.ArchiveData) : ctx.ArchiveData;
						if (ctx.Location)
							jetObj.location = jetObj.location ? addOrMerge(jetObj.location, ctx.Location) : ctx.Location;
						break;
				};
				return jetObj; // json Object
			};
			// handler will be called each time when registered events is raised via bubbling
			var handler = function(eventObj) {
				// check if system is active
				if (!attach_points_active) return false;
				var oriEventObj = eventObj;
				eventObj = eventObj || {};
				// item which is raised the current event
				var dom = eventObj.target || eventObj.srcElement;
				// can't handle events w/o type
				if (!eventObj.type)
					return false;
				// wrap original event
				eventObj = {
					eventObj: eventObj,
					name: eventObj.type
				};

				//set a sender property on the event Object, so we can recieve the original context later
				eventObj.sender = this;
				var success = false;
				// process all the items under BODY tag
				while(dom != document.body && dom != document) {
					// go though all registered event names
					for (var eventType in evtHandlers) {
						// is found needed one?
						if (eventType == eventObj.name) {
							// go though all the jet handlers
							if (true == _u.each(evtHandlers[eventType], function(objHdlr) {
								// is node found?
								if (matchObjectToQuery(dom, objHdlr.name)) {
									// put handler context to eventObj
									_u.mixin(eventObj, objHdlr.context);
									// add jetName name
									eventObj.jetName = objHdlr.jetName;
									// do we have devault handler?
									if (objHdlr.defaultHandler != null)
										// call it
										objHdlr.defaultHandler.call(window, eventObj);
									else {
										// prepare jet event by either calling dataHandler or _getCcfData
										var data = objHdlr.dataHandler != null ? objHdlr.dataHandler.call(dom, eventObj, objHdlr.jetName) : _getCcfData(dom, eventObj);

										var ccfHelperName = objHdlr.jetName;
										// make 1st leter lowcase
										if (ccfHelperName.length > 0 && ccfHelperName in JET)
											JET[ccfHelperName](data);
										else throw new Error("Invalid jetName is specified: " + ccfHelperName);
									}
									// event is processed
									return (success = true);
								}
							})) break;
						}
					}
							
					if (success) {
						oriEventObj.cancelBubble = true;
						oriEventObj.returnValue = false;
						break;
					}

					dom = dom.parentNode;
				};

				return success;
			};

			_u.each(multiQuery.evtTypes, function(evt) {
				dom_attaches[dom_attaches.length] = _u.attachEvent(document.body, evt, handler);
			});
		};

		_u.each(attachPoints, function(ap) {
			if (ap.name != null) {
				_addCfgEvtHandler(cfgMultiQuery, cfgEvtHandlers, ap);
			} else {
				console.error("Attach point's name was not found in : " + JSON.stringify(ap));
			}
		});

		// always attach to a default node (body)
		_attachToCCFGlobalHandler(cfgMultiQuery, cfgEvtHandlers);
		// mark handling active
		attach_points_active = true;
		// register uninit function
		JET.onUnload(api.uninit);
	};

	// uninit
	api.uninit = function() {

		if (attach_points_active) {
			for (var i = 0; i < dom_attaches.length; i++) {
				dom_attaches[i].detachEvent();
			};
			dom_attaches = [];
			attach_points_active = false;
		}
	}

	return api;
});