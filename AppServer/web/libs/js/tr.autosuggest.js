(function(){var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.CHARTS_ONLY_LAYER = false;
goog.IS_COMPILED = false;
goog.LANG = "en";
goog.LOCALE = goog.LANG;
if (!goog.CHARTS_ONLY_LAYER) {
  if (window["EikonLocale"]) {
    goog.LOCALE = window["EikonLocale"];
  } else {
    if (window["dojo"]) {
      goog.LOCALE = window["dojo"]["locale"];
    }
  }
} else {
  if (window["dojo"]) {
    window["dojo"]["provide"]("shared.html5chart.TrWebChart" + (goog.LOCALE === "en" ? "" : "_" + goog.LOCALE));
  }
}
goog.TRUSTED_SITE = true;
goog.provide = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while (namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }
  goog.exportPath_(name);
};
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if (!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };
  goog.implicitNamespaces_ = {};
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0]);
  }
  for (var part;parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object;
    } else {
      if (cur[part]) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for (var part;part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for (var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0;require = requires[j];j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if (goog.global.console) {
      goog.global.console["error"](errorMessage);
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc;
  };
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else {
      if (!goog.inHtmlDocument_()) {
        return;
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for (var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if (doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true;
    } else {
      return false;
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }
      deps.visited[path] = true;
      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }
    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }
    for (var i = 0;i < scripts.length;i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };
  goog.findBasePath_();
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js");
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == "object") {
    if (value) {
      if (value instanceof Array) {
        return "array";
      } else {
        if (value instanceof Object) {
          return s;
        }
      }
      var className = Object.prototype.toString.call((value));
      if (className == "[object Window]") {
        return "object";
      }
      if (className == "[object Array]" || typeof value.length == "number" && (typeof value.splice != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")))) {
        return "array";
      }
      if (className == "[object Function]" || typeof value.call != "undefined" && (typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call"))) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if (s == "function" && typeof value.call == "undefined") {
      return "object";
    }
  }
  return s;
};
goog.isDef = function(val) {
  return val !== undefined;
};
goog.isNull = function(val) {
  return val === null;
};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array";
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number";
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function";
};
goog.isString = function(val) {
  return typeof val == "string";
};
goog.isBoolean = function(val) {
  return typeof val == "boolean";
};
goog.isNumber = function(val) {
  return typeof val == "number";
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function";
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function";
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.removeUid = function(obj) {
  if ("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == "object" || type == "array") {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == "array" ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments));
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error;
  }
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if (typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true;
        } else {
          goog.evalWorksForGlobals_ = false;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for (var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  };
  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }
  if (opt_modifier) {
    return className + "-" + rename(opt_modifier);
  } else {
    return rename(className);
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value);
  }
  return str;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1));
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global);
};
goog.provide("nova.res");
nova.res = {_default:"default", background:"background", blur:"blur", bottom:"bottom", button:"button", cell:"cell", change:"change", checkbox:"checkbox", checked:"checked", click:"click", clicked:"clicked", colIndex:"colIndex", columnAdded:"columnAdded", columnMoved:"columnMoved", columnRemoved:"columnRemoved", colorDef:"colorDef", content:"content", currency:"currency", currencyDisplay:"currencyDisplay", dataColumnName:"dataColumnName", dataSource:"dataSource", dataValue:"dataValue", disabled:"disabled", 
displayFormat:"displayFormat", div:"div", enabled:"enabled", event:"event", focus:"focus", fromColIndex:"fromColIndex", fromRowIndex:"fromRowIndex", getElement:"getElement", groupingSeparator:"groupingSeparator", handle:"handle", header:"header", height:"height", hidden:"hidden", hitbox:"hitbox", input:"input", keydown:"keydown", keyup:"keyup", left:"left", localeMatcher:"localeMatcher", mousedown:"mousedown", mousemove:"mousemove", mouseout:"mouseout", mouseover:"mouseover", mouseup:"mouseup", nochange:"nochange", 
none:"none", number:"number", partial:"partial", postSectionDataBinding:"postSectionDataBinding", prevColIndex:"prevColIndex", prevRowIndex:"prevRowIndex", radio:"radio", right:"right", rowIndex:"rowIndex", section:"section", sectionAdded:"sectionAdded", sectionIndex:"sectionIndex", sectionSettings:"sectionSettings", sectionType:"sectionType", shown:"shown", span:"span", scrollLeft:"scrollLeft", scrollTop:"scrollTop", stateChanged:"stateChanged", string:"string", style:"style", text:"text", title:"title", 
toColIndex:"toColIndex", top:"top", toRowIndex:"toRowIndex", roundingMethod:"roundingMethod", unchecked:"unchecked", unitSuffix:"unitSuffix", useGrouping:"useGrouping", width:"width", zzz:"zzz"};
goog.exportSymbol("nova.res", nova.res);
goog.provide("nova.msgDe");
nova.msgDe = {prevMonth:"Vorheriger Monat", nextMonth:"N\u00e4chster Monat", months:["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], monthsShort:["Jan.", "Febr.", "Mrz.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."], weekdays:["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"], weekdaysShort:["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."], weekdaysMin:["So", "Mo", 
"Di", "Mi", "Do", "Fr", "Sa"], longDateFormat:{LT:"H:mm [Uhr]", L:"DD.MM.YYYY", LL:"D. MMMM YYYY", LLL:"D. MMMM YYYY LT", LLLL:"dddd, D. MMMM YYYY LT"}, pleaseSelect:"Please select"};
goog.provide("nova.defEn");
nova.defEn = {dateFormat:"MM/DD/YY"};
goog.provide("nova.defDe");
nova.defDe = {dateFormat:"dd.MM.yy"};
goog.provide("nova.msgEn");
nova.msgEn = {prevMonth:"Previous Month", nextMonth:"Next Month", months:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], weekdays:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], weekdaysShort:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], weekdaysMin:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], 
longDateFormat:{LT:"HH:mm", L:"DD/MM/YYYY", LL:"D MMMM YYYY", LLL:"D MMMM YYYY LT", LLLL:"dddd, D MMMM YYYY LT"}, pleaseSelect:"Please select"};
goog.provide("nova.msgJa");
nova.msgJa = {prevMonth:"\u524d\u6708", nextMonth:"\u6765\u6708", months:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"], monthsShort:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"], weekdays:["\u65e5\u66dc\u65e5", "\u6708\u66dc\u65e5", "\u706b\u66dc\u65e5", "\u6c34\u66dc\u65e5", "\u6728\u66dc\u65e5", "\u91d1\u66dc\u65e5", 
"\u571f\u66dc\u65e5"], weekdaysShort:["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"], weekdaysMin:["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"], longDateFormat:{LT:"Ah\u6642m\u5206", L:"YYYY/MM/DD", LL:"YYYY\u5e74M\u6708D\u65e5", LLL:"YYYY\u5e74M\u6708D\u65e5LT", LLLL:"YYYY\u5e74M\u6708D\u65e5LT dddd"}, meridiem:{am:"\u5348\u524d", pm:"\u5348\u5f8c"}, ordinal:{d:"\u65e5", m:"\u6708", y:"\u5e74"}, pleaseSelect:"\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044"};
goog.provide("nova.defJa");
nova.defJa = {dateFormat:"YYYY/MM/DD"};
goog.provide("nova.msgZh");
nova.msgZh = {prevMonth:"\u4e0a\u6708", nextMonth:"\u4e0b\u4e2a\u6708", months:["\u4e00\u6708", "\u4e8c\u6708", "\u4e09\u6708", "\u56db\u6708", "\u4e94\u6708", "\u516d\u6708", "\u4e03\u6708", "\u516b\u6708", "\u4e5d\u6708", "\u5341\u6708", "\u5341\u4e00\u6708", "\u5341\u4e8c\u6708"], monthsShort:["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"], weekdays:["\u661f\u671f\u65e5", "\u661f\u671f\u4e00", "\u661f\u671f\u4e8c", 
"\u661f\u671f\u4e09", "\u661f\u671f\u56db", "\u661f\u671f\u4e94", "\u661f\u671f\u516d"], weekdaysShort:["\u5468\u65e5", "\u5468\u4e00", "\u5468\u4e8c", "\u5468\u4e09", "\u5468\u56db", "\u5468\u4e94", "\u5468\u516d"], weekdaysMin:["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d"], longDateFormat:{LT:"Ah\u70b9mm", L:"YYYY-MM-DD", LL:"YYYY\u5e74MMMD\u65e5", LLL:"YYYY\u5e74MMMD\u65e5LT", LLLL:"YYYY\u5e74MMMD\u65e5ddddLT", l:"YYYY-MM-DD", ll:"YYYY\u5e74MMMD\u65e5", lll:"YYYY\u5e74MMMD\u65e5LT", 
llll:"YYYY\u5e74MMMD\u65e5ddddLT"}, meridiem:{ante1:"\u51cc\u6668", ante2:"\u65e9\u4e0a", ante3:"\u4e0a\u5348", post1:"\u4e2d\u5348", post2:"\u4e0b\u5348", post3:"\u665a\u4e0a"}, ordinal:{d:"\u65e5", m:"\u6708", w:"\u5468", y:"\u5e74"}, pleaseSelect:"\u8bf7\u9009\u62e9"};
goog.provide("nova.defZh");
nova.defZh = {dateFormat:"YYYY-MM-DD"};
goog.provide("nova.msgTh");
nova.msgTh = {prevMonth:"\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e01\u0e48\u0e2d\u0e19", nextMonth:"\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e16\u0e31\u0e14\u0e44\u0e1b", months:["\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21", "\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c", "\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21", "\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19", "\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21", "\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19", "\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21", "\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21", 
"\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19", "\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21", "\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19", "\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21"], monthsShort:["\u0e21\u0e01\u0e23\u0e32", "\u0e01\u0e38\u0e21\u0e20\u0e32", "\u0e21\u0e35\u0e19\u0e32", "\u0e40\u0e21\u0e29\u0e32", "\u0e1e\u0e24\u0e29\u0e20\u0e32", "\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32", "\u0e01\u0e23\u0e01\u0e0e\u0e32", "\u0e2a\u0e34\u0e07\u0e2b\u0e32", "\u0e01\u0e31\u0e19\u0e22\u0e32", "\u0e15\u0e38\u0e25\u0e32", 
"\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32", "\u0e18\u0e31\u0e19\u0e27\u0e32"], weekdays:["\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c", "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c", "\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23", "\u0e1e\u0e38\u0e18", "\u0e1e\u0e24\u0e2b\u0e31\u0e2a\u0e1a\u0e14\u0e35", "\u0e28\u0e38\u0e01\u0e23\u0e4c", "\u0e40\u0e2a\u0e32\u0e23\u0e4c"], weekdaysShort:["\u0e2d\u0e32\u0e17\u0e34\u0e15\u0e22\u0e4c", "\u0e08\u0e31\u0e19\u0e17\u0e23\u0e4c", "\u0e2d\u0e31\u0e07\u0e04\u0e32\u0e23", 
"\u0e1e\u0e38\u0e18", "\u0e1e\u0e24\u0e2b\u0e31\u0e2a", "\u0e28\u0e38\u0e01\u0e23\u0e4c", "\u0e40\u0e2a\u0e32\u0e23\u0e4c"], weekdaysMin:["\u0e2d\u0e32.", "\u0e08.", "\u0e2d.", "\u0e1e.", "\u0e1e\u0e24.", "\u0e28.", "\u0e2a."], longDateFormat:{LT:"H \u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32 m \u0e19\u0e32\u0e17\u0e35", L:"YYYY/MM/DD", LL:"D MMMM YYYY", LLL:"D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 LT", LLLL:"\u0e27\u0e31\u0e19dddd\u0e17\u0e35\u0e48 D MMMM YYYY \u0e40\u0e27\u0e25\u0e32 LT"}, meridiem:{am:"\u0e01\u0e48\u0e2d\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07", 
pm:"\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e17\u0e35\u0e48\u0e22\u0e07"}, pleaseSelect:"\u0e01\u0e23\u0e38\u0e13\u0e32\u0e40\u0e25\u0e37\u0e2d\u0e01"};
goog.provide("nova.msg");
goog.provide("nova.def");
goog.require("nova.msgDe");
goog.require("nova.msgEn");
goog.require("nova.msgJa");
goog.require("nova.msgTh");
goog.require("nova.msgZh");
goog.require("nova.defEn");
goog.require("nova.defJa");
goog.require("nova.defZh");
goog.require("nova.defDe");
nova.lang = "en";
nova.msg = nova.msgEn;
nova.def = nova.defEn;
switch(nova.lang) {
  case "de":
    nova.msg = nova.msgDe;
    nova.def = nova.defDe;
    break;
  case "ja":
    nova.msg = nova.msgJa;
    nova.def = nova.defJa;
    break;
  case "th":
    nova.msg = nova.msgTh;
    break;
  case "zh":
    nova.msg = nova.msgZh;
    nova.def = nova.defZh;
    break;
}
;goog.provide("nova");
goog.require("nova.res");
goog.require("nova.msg");
nova.version = "3.4.6";
goog.exportSymbol("nova.version", nova.version);
nova.ieVersion = nova.ieVersion || function() {
  var jscriptVersion = (new Function("/*@cc_on return @_jscript_version; @*/"))();
  if (jscriptVersion) {
    return parseFloat(jscriptVersion);
  }
  return-1;
}();
nova.modernBrowser = nova.ieVersion < 0 || nova.ieVersion > 8;
nova.createElement = function(input, opt_spaceCollapsing) {
  var documentObject = null;
  if (nova.isString(input)) {
    if (input.charCodeAt(0) === 60 || input.charCodeAt(input.length - 1) === 62) {
      var htmlCompat = opt_spaceCollapsing !== false ? nova.collapseSpaces((input)) : input;
      if (!nova._cacheElement) {
        nova._cacheElement = document.createElement("div");
      }
      nova._cacheElement.innerHTML = htmlCompat;
      if (nova._cacheElement.children.length > 0) {
        if (nova._cacheElement.children.length > 1) {
          documentObject = nova._cacheElement;
          nova._cacheElement = null;
        } else {
          documentObject = (nova._cacheElement.removeChild(nova._cacheElement.children[0]));
        }
      }
    } else {
      documentObject = document.createElement((input));
    }
  } else {
    if (nova.isElement(input)) {
      documentObject = input;
    }
  }
  return(documentObject);
};
nova.collapseSpaces = function(str) {
  if (str.indexOf("\n") >= 0) {
    str = str.replace(/[\r\n\t]/g, "");
  } else {
    if (str.indexOf("\t") >= 0) {
      str = str.replace(/\t/g, "");
    }
  }
  while (str.indexOf("  ") >= 0) {
    str = str.replace(/  /g, " ");
  }
  if (str.indexOf("> <") >= 0) {
    str = str.replace(/> </g, "><");
  }
  return str;
};
nova.getElement = function(obj) {
  if (nova.isElement(obj)) {
    return(obj);
  } else {
    if (obj && nova.isFunction(obj[nova.res.getElement])) {
      return obj[nova.res.getElement]();
    }
  }
  return null;
};
nova.isElement = function(val) {
  if (val) {
    return val.nodeType === 1;
  }
  return false;
};
nova.isNumber = goog.isNumber;
nova.isString = goog.isString;
nova.isArray = function(val) {
  return val instanceof Array;
};
nova.is2DArray = function(val) {
  if (nova.isArray(val)) {
    for (var i = val.length;--i >= 0;) {
      if (nova.isArray(val[i])) {
        return true;
      }
    }
  }
  return false;
};
nova.isFunction = function(val) {
  return typeof val === "function";
};
nova.getClientPosition = function(target, opt_retObj) {
  var pos = opt_retObj || {"x":0, "y":0};
  try {
    if (target["getBoundingClientRect"]) {
      var box = target["getBoundingClientRect"]();
      pos["x"] = box.left;
      pos["y"] = box.top;
    } else {
      pos["x"] = target.clientX;
      pos["y"] = target.clientY;
    }
  } catch (e) {
    pos["x"] = target.clientX;
    pos["y"] = target.clientY;
  }
  return(pos);
};
nova.getRelativePosition = function(A, B, opt_retObj) {
  opt_retObj = nova.getClientPosition(A, opt_retObj);
  var bp = nova.getClientPosition(B);
  opt_retObj["x"] -= bp["x"];
  opt_retObj["y"] -= bp["y"];
  return(opt_retObj);
};
nova.formatNumber = function(number, format) {
  var dec = ".";
  var group = ",";
  var neg = "-";
  var validFormat = "0#+-,.";
  var signInFront = false;
  if (number !== number) {
    return "NaN";
  }
  if (format === "") {
    return number + "";
  }
  var prefix = "";
  for (var i = 0, len = format.length;i < len;i++) {
    if (validFormat.indexOf(format.charAt(i)) === -1) {
      prefix = prefix + format.charAt(i);
    } else {
      if (i === 0 && (format.charAt(i) === "-" || format.charAt(i) === "+" || number < 0)) {
        signInFront = true;
        continue;
      } else {
        break;
      }
    }
  }
  var suffix = "";
  for (var i = format.length - 1;i >= 0;i--) {
    if (validFormat.indexOf(format.charAt(i)) == -1) {
      suffix = format.charAt(i) + suffix;
    } else {
      break;
    }
  }
  format = format.substring(prefix.length);
  format = format.substring(0, format.length - suffix.length);
  if (suffix.charAt(suffix.length - 1) === "%") {
    number = number * 100;
  }
  var returnString = "";
  if (format.indexOf(".") > -1) {
    var decimalPortion = dec;
    var decimalFormat = format.substring(format.lastIndexOf(".") + 1);
    number = new Number(number.toFixed(decimalFormat.length));
    var decimalValue = new Number(number.toString().substring(number.toString().indexOf(".")));
    var decimalString = new String(decimalValue.toFixed(decimalFormat.length));
    decimalString = decimalString.substring(decimalString.lastIndexOf(".") + 1);
    for (var i = 0;i < decimalFormat.length;i++) {
      if (decimalFormat.charAt(i) == "#" && decimalString.charAt(i) != "0") {
        decimalPortion += decimalString.charAt(i);
        continue;
      } else {
        if (decimalFormat.charAt(i) == "#" && decimalString.charAt(i) == "0") {
          var notParsed = decimalString.substring(i);
          if (notParsed.match("[1-9]")) {
            decimalPortion += decimalString.charAt(i);
            continue;
          } else {
            break;
          }
        } else {
          if (decimalFormat.charAt(i) == "0") {
            decimalPortion += decimalString.charAt(i);
          }
        }
      }
    }
    returnString += decimalPortion;
  } else {
    number = Math.round(number);
  }
  var ones = Math.floor(number);
  if (number < 0) {
    ones = Math.ceil(number);
  }
  var onesFormat = "";
  if (format.indexOf(".") == -1) {
    onesFormat = format;
  } else {
    onesFormat = format.substring(0, format.indexOf("."));
  }
  var onePortion = "";
  if (!(ones == 0 && onesFormat.substr(onesFormat.length - 1) == "#")) {
    var oneText = new String(Math.abs(ones));
    var groupLength = 9999;
    if (onesFormat.lastIndexOf(",") != -1) {
      groupLength = onesFormat.length - onesFormat.lastIndexOf(",") - 1;
    }
    var groupCount = 0;
    for (var i = oneText.length - 1;i > -1;i--) {
      onePortion = oneText.charAt(i) + onePortion;
      groupCount++;
      if (groupCount == groupLength && i != 0) {
        onePortion = group + onePortion;
        groupCount = 0;
      }
    }
    if (onesFormat.length > onePortion.length) {
      var padStart = onesFormat.indexOf("0");
      if (padStart != -1) {
        var padLen = onesFormat.length - padStart;
        var pos = onesFormat.length - onePortion.length - 1;
        while (onePortion.length < padLen) {
          var padChar = onesFormat.charAt(pos);
          if (padChar == ",") {
            padChar = group;
          }
          onePortion = padChar + onePortion;
          pos--;
        }
      }
    }
  }
  if (!onePortion && onesFormat.indexOf("0", onesFormat.length - 1) !== -1) {
    onePortion = "0";
  }
  returnString = onePortion + returnString;
  var sign = "";
  if (number) {
    sign = number < 0 ? "-" : "+";
  }
  if (signInFront && prefix.length > 0) {
    prefix = sign + prefix;
  } else {
    if (signInFront) {
      returnString = sign + returnString;
    }
  }
  returnString = prefix + returnString + suffix;
  return returnString;
};
nova.getLanguageSetting = function(lang) {
  var resource = null;
  if (lang == "de") {
    resource = nova.msgDe;
  } else {
    if (lang == "en") {
      resource = nova.msgEn;
    } else {
      if (lang == "ja") {
        resource = nova.msgJa;
      } else {
        if (lang == "th") {
          resource = nova.msgTh;
        } else {
          if (lang == "zh") {
            resource = nova.msgZh;
          } else {
            return null;
          }
        }
      }
    }
  }
  var langSetting = {months:resource.months, monthsShort:resource.monthsShort, weekdays:resource.weekdays, weekdaysShort:resource.weekdaysShort, weekdaysMin:resource.weekdaysMin, longDateFormat:resource.longDateFormat};
  switch(lang) {
    case "de":
      langSetting.ordinal = "%d.";
      langSetting.week = {dow:1, doy:4};
      break;
    case "en":
      langSetting.ordinal = function(number) {
        var b = number % 10, output = ~~(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
        return number + output;
      };
      langSetting.week = {dow:1, doy:4};
      break;
    case "ja":
    ;
    case "th":
      langSetting.meridiem = function(hour, minute, isLower) {
        if (hour < 12) {
          return resource.meridiem.am;
        } else {
          return resource.meridiem.pm;
        }
      };
      break;
    case "zh":
      langSetting.meridiem = function(hour, minute, isLower) {
        var hm = hour * 100 + minute;
        if (hm < 600) {
          return resource.meridiem.ante1;
        } else {
          if (hm < 900) {
            return resource.meridiem.ante2;
          } else {
            if (hm < 1130) {
              return resource.meridiem.ante3;
            } else {
              if (hm < 1230) {
                return resource.meridiem.post1;
              } else {
                if (hm < 1800) {
                  return resource.meridiem.post2;
                } else {
                  return resource.meridiem.post3;
                }
              }
            }
          }
        }
      };
      langSetting.ordinal = function(number, period) {
        switch(period) {
          case "d":
          ;
          case "D":
          ;
          case "DDD":
            return number + resource.ordinal.d;
          case "M":
            return number + resource.ordinal.m;
          case "w":
          ;
          case "W":
            return number + resource.ordinal.w;
          default:
            return number;
        }
      };
      langSetting.week = {dow:1, doy:4};
      break;
  }
  return langSetting;
};
nova.jQueryPlugin = function(pluginName, classObj) {
  if (window["jQuery"]) {
    jQuery.fn[pluginName] = function(opt_model) {
      return this.each(function() {
        if (!this["nova"]) {
          this["nova"] = new classObj(this, opt_model);
        }
      });
    };
  }
};
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function() {
    };
    var fBound = function() {
      return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP;
    return fBound;
  };
}
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    if (this === undefined || this === null) {
      throw new TypeError('"this" is null or not defined');
    }
    var length = this.length >>> 0;
    fromIndex = +fromIndex || 0;
    if (Math.abs(fromIndex) === Infinity) {
      fromIndex = 0;
    }
    if (fromIndex < 0) {
      fromIndex += length;
      if (fromIndex < 0) {
        fromIndex = 0;
      }
    }
    for (;fromIndex < length;fromIndex++) {
      if (this[fromIndex] === searchElement) {
        return fromIndex;
      }
    }
    return-1;
  };
}
nova.moveArrayItem = function(ary, from, to) {
  if (!ary) {
    return null;
  }
  var len = ary.length;
  if (from >= len && to >= len) {
    return(ary);
  }
  var item = ary.splice(from, 1)[0];
  if (to < len) {
    ary.splice(to, 0, item);
  } else {
    ary[to] = item;
  }
  return(ary);
};
nova.insertArrayItem = function(ary, at, item) {
  if (!ary) {
    return;
  }
  if (at < 0) {
    return;
  }
  if (at < ary.length) {
    ary.splice(at, 0, item);
  } else {
    ary[at] = item;
  }
};
nova.removeArrayItem = function(ary, at) {
  if (!ary) {
    return null;
  }
  if (at >= 0 && at < ary.length) {
    return ary.splice(at, 1)[0];
  }
  return null;
};
nova.moveIndex = function(num, from, opt_to) {
  if (!nova.isNumber(num)) {
    return-1;
  }
  if (num === from) {
    if (nova.isNumber(opt_to)) {
      return(opt_to);
    }
    return-1;
  }
  if (from !== null) {
    if (num > from) {
      --num;
    }
  }
  if (opt_to !== null) {
    if (num >= opt_to) {
      ++num;
    }
  }
  return(num);
};
nova.lowerBound = function(ary, value, left, right, opt_lessFunc) {
  if (left === undefined || left < 0) {
    left = 0;
  }
  if (right === undefined || (right < 0 || right > ary.length)) {
    right = ary.length;
  }
  if (left > right) {
    left = right;
  }
  if (opt_lessFunc === undefined) {
    opt_lessFunc = nova._defaultLessComparator;
  }
  var mid = 0;
  while (right > left) {
    mid = left + right >> 1;
    if (opt_lessFunc(ary[mid], value)) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};
nova.upperBound = function(ary, value, left, right, opt_lessFunc) {
  var at = nova.lowerBound(ary, value, left, right, opt_lessFunc);
  while (ary[at + 1] === value) {
    ++at;
  }
  return at;
};
nova._defaultLessComparator = function(left, right) {
  return left < right;
};
nova.ajaxGetJson = function(url, callback, opt_errorCallback, opt_timeoutCallback, opt_timeout) {
  var xmlhttp;
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest;
  } else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4) {
      if (xmlhttp.status === 200) {
        var json = null;
        try {
          json = JSON.parse(xmlhttp.responseText);
        } catch (err) {
          window.console.log("ERROR: Cannot parse server response: " + xmlhttp.responseText);
        }
        if (json) {
          json["url"] = url;
          callback(json);
        }
      } else {
        if (opt_errorCallback) {
          opt_errorCallback(xmlhttp);
        }
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.timeout = opt_timeout || 5E3;
  if (opt_timeoutCallback) {
    xmlhttp.ontimeout = function() {
      opt_timeoutCallback(xmlhttp);
    };
  }
  xmlhttp.send();
  return xmlhttp;
};
nova.extend = function(destination, source) {
  if (destination === undefined || destination === null) {
    destination = {};
  }
  for (var k in source) {
    if (!destination.hasOwnProperty(k)) {
      destination[k] = source[k];
    }
  }
  return destination;
};
nova.valueByPath = function(object, path) {
  if (object) {
    var sp = path.split("/");
    var pointer = object;
    for (var i = 0;i < sp.length;i++) {
      if (pointer[sp[i]]) {
        pointer = pointer[sp[i]];
      } else {
        return null;
      }
    }
    return pointer;
  } else {
    return null;
  }
};
nova.escapeCharacters = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
nova.getComputedStyle = function(element, style) {
  var property = nova.spinalToCamel(style);
  if (element.currentStyle) {
    return element.currentStyle[property];
  } else {
    if (document.defaultView && document.defaultView.getComputedStyle) {
      return document.defaultView.getComputedStyle(element, null).getPropertyValue(style);
    }
  }
  return element.style[property];
};
nova.spinalToCamel = function(str) {
  return str.replace(/\-(\w)/g, function(str, letter) {
    return letter.toUpperCase();
  });
};
goog.exportSymbol("nova.createElement", nova.createElement);
goog.exportSymbol("nova.formatNumber", nova.formatNumber);
goog.provide("nova.Event");
goog.require("nova");
nova.Event = function(opt_sender) {
  this._listeners = [];
  this.setSender(opt_sender);
};
nova.Event.prototype.listen = function(listener, opt_priority) {
  if (!nova.isFunction(listener)) {
    return;
  }
  if (this._listeners.indexOf(listener) < 0) {
    if (opt_priority === undefined) {
      this._listeners.push(listener);
    } else {
      listener._priority = opt_priority;
      var at = nova.lowerBound(this._listeners, listener, 0, this._listeners.length, nova.Event.listenerComparer);
      this._listeners.splice(at, 0, listener);
    }
  }
};
nova.Event.prototype.unlisten = function(listener) {
  var index = this._listeners.indexOf(listener);
  if (index >= 0) {
    this._listeners.splice(index, 1);
  }
};
nova.Event.prototype.unlistenAll = function() {
  this._listeners.length = 0;
};
nova.Event.prototype.getListenerCount = function() {
  return this._listeners.length;
};
nova.Event.prototype.hasListener = function() {
  return this._listeners.length > 0;
};
nova.Event.prototype.dispatch = function(eventArg) {
  if (!this._enabled || this._listeners.length <= 0) {
    return;
  }
  if (this._dispatching) {
    window.console.log("WARNING: Infinite loop detected. You must've done something wrong in your codes!!");
  }
  this._dispatching = true;
  if (eventArg === undefined || eventArg === null) {
    eventArg = {};
  }
  if (this._sender !== null) {
    eventArg["sender"] = this._sender;
  }
  if (this._extender !== null) {
    this._extender((eventArg));
  }
  for (var i = 0;i < this._listeners.length;++i) {
    this._listeners[i](eventArg);
  }
  this._dispatching = false;
};
nova.Event.prototype.isDispatching = function() {
  return this._dispatching;
};
nova.Event.prototype.isEnabled = function() {
  return this._enabled;
};
nova.Event.prototype.enable = function(opt_enabled) {
  this._enabled = opt_enabled !== false;
};
nova.Event.prototype.disable = function(opt_disabled) {
  this._enabled = opt_disabled === false;
};
nova.Event.prototype.setSender = function(sender) {
  this._sender = sender !== undefined ? sender : null;
};
nova.Event.prototype.setEventArgExtender = function(extender) {
  this._extender = extender !== undefined ? extender : null;
};
nova.Event.listenerComparer = function(a, b) {
  if (b._priority === undefined) {
    return true;
  }
  return a._priority >= b._priority;
};
nova.Event.prototype._listeners = null;
nova.Event.prototype._sender = null;
nova.Event.prototype._extender = null;
nova.Event.prototype._enabled = true;
nova.Event.prototype._dispatching = false;
goog.exportSymbol("nova.Event", nova.Event);
nova.Event._proto = nova.Event.prototype;
goog.exportProperty(nova.Event._proto, "listen", nova.Event._proto.listen);
goog.exportProperty(nova.Event._proto, "unlisten", nova.Event._proto.unlisten);
goog.exportProperty(nova.Event._proto, "unlistenAll", nova.Event._proto.unlistenAll);
goog.exportProperty(nova.Event._proto, "hasListener", nova.Event._proto.hasListener);
goog.exportProperty(nova.Event._proto, "getListenerCount", nova.Event._proto.getListenerCount);
goog.exportProperty(nova.Event._proto, "dispatch", nova.Event._proto.dispatch);
goog.exportProperty(nova.Event._proto, "isDispatching", nova.Event._proto.isDispatching);
goog.exportProperty(nova.Event._proto, "isEnabled", nova.Event._proto.isEnabled);
goog.exportProperty(nova.Event._proto, "enable", nova.Event._proto.enable);
goog.exportProperty(nova.Event._proto, "disable", nova.Event._proto.disable);
goog.exportProperty(nova.Event._proto, "setSender", nova.Event._proto.setSender);
goog.exportProperty(nova.Event._proto, "setEventArgExtender", nova.Event._proto.setEventArgExtender);
goog.provide("nova.IElementControl");
goog.require("nova.Event");
nova.IElementControl = function() {
};
nova.IElementControl.prototype.getContent = function(opt_allContent) {
};
nova.IElementControl.prototype.setContent = function(content, opt_tooltip) {
};
nova.IElementControl.prototype.addContent = function(content) {
};
nova.IElementControl.prototype.removeContent = function(content) {
};
nova.IElementControl.prototype.listen = function(type, handler, opt_priority) {
};
nova.IElementControl.prototype.unlisten = function(type, handler) {
};
nova.IElementControl.prototype.unlistenAll = function(opt_type) {
};
nova.IElementControl.prototype.dispose = function() {
};
nova.IElementControl.prototype.getEvent = function(type) {
};
nova.IElementControl.prototype.getElement = function() {
};
nova.IElementControl.prototype.getNextSibling = function() {
};
nova.IElementControl.prototype.getParent = function() {
};
nova.IElementControl.prototype.setParent = function(parent, opt_prepend) {
};
nova.IElementControl.prototype.insertBefore = function(nextSibling) {
};
nova.IElementControl.prototype.insertAfter = function(previousSibling) {
};
nova.IElementControl.prototype.hasClass = function(str) {
};
nova.IElementControl.prototype.addClass = function(str) {
};
nova.IElementControl.prototype.removeClass = function(str) {
};
nova.IElementControl.prototype.toggleClass = function(str, opt_replacement) {
};
nova.IElementControl.prototype.enableClass = function(str, opt_enabled) {
};
nova.IElementControl.prototype.getClass = function() {
};
nova.IElementControl.prototype.setClass = function(str) {
};
nova.IElementControl.prototype.getAttribute = function(str) {
};
nova.IElementControl.prototype.setAttribute = function(str, val) {
};
nova.IElementControl.prototype.setAttributes = function(json) {
};
nova.IElementControl.prototype.removeAttribute = function(str) {
};
nova.IElementControl.prototype.getStyle = function(str) {
};
nova.IElementControl.prototype.setStyle = function(str, val) {
};
nova.IElementControl.prototype.setStyles = function(json) {
};
nova.IElementControl.prototype.getComputedStyle = function(str) {
};
nova.IElementControl.prototype.getId = function() {
};
nova.IElementControl.prototype.toString = function() {
};
nova.IElementControl.prototype.getTextContent = function() {
};
nova.IElementControl.prototype.getLeft = function() {
};
nova.IElementControl.prototype.setLeft = function(val) {
};
nova.IElementControl.prototype.getTop = function() {
};
nova.IElementControl.prototype.setTop = function(val) {
};
nova.IElementControl.prototype.getWidth = function() {
};
nova.IElementControl.prototype.setWidth = function(val) {
};
nova.IElementControl.prototype.getHeight = function() {
};
nova.IElementControl.prototype.setHeight = function(val) {
};
nova.IElementControl.prototype.getBoundingClientRect = function() {
};
nova.IElementControl.prototype.fillParentWidth = function(opt_percent) {
};
nova.IElementControl.prototype.fillParentHeight = function(opt_percent) {
};
nova.IElementControl.prototype.getTooltip = function() {
};
nova.IElementControl.prototype.setTooltip = function(str) {
};
nova.IElementControl.prototype.show = function(opt_shown) {
};
nova.IElementControl.prototype.hide = function(opt_hidden) {
};
nova.IElementControl.prototype.toggleVisibility = function() {
};
nova.IElementControl.prototype.isVisible = function() {
};
nova.IElementControl.prototype.enable = function(opt_enabled) {
};
nova.IElementControl.prototype.disable = function(opt_disabled) {
};
nova.IElementControl.prototype.isEnabled = function() {
};
nova.IElementControl.prototype.focus = function(opt_focused) {
};
nova.IElementControl.prototype.getScrollLeft = function() {
};
nova.IElementControl.prototype.getScrollTop = function() {
};
nova.IElementControl.prototype.isEndOfHorizontalScroll = function() {
};
nova.IElementControl.prototype.isEndOfVerticalScroll = function() {
};
goog.provide("nova.ElementWrapper");
goog.require("nova");
goog.require("nova.IElementControl");
goog.require("nova.Event");
nova.ElementWrapper = function(opt_element) {
  if (opt_element) {
    this._element = opt_element;
  } else {
    this._element = document.createElement("div");
  }
};
nova.ElementWrapper.prototype.getContent = function(opt_allContent) {
  if (opt_allContent) {
    return this._element.children;
  }
  return(this._element.lastChild);
};
nova.ElementWrapper.prototype.setContent = function(content, opt_tooltip) {
  if (content === undefined || (content === null || content !== content)) {
    content = null;
  } else {
    if (content.nodeType !== 1) {
      if (content[nova.res.getElement] === undefined) {
        if (!nova.isString(content)) {
          content = content + "";
        }
        if (this._textSpan === null) {
          this._textSpan = document.createElement("span");
        }
        if (nova.modernBrowser) {
          this._textSpan.textContent = content;
        } else {
          this._textSpan.innerText = content;
        }
        content = this._textSpan;
      } else {
        content = content[nova.res.getElement]();
      }
    }
  }
  if (content !== this._content) {
    this._content = (content);
    while (this._element.firstChild !== null) {
      this._element.removeChild(this._element.firstChild);
    }
    if (this._content !== null) {
      this._element.appendChild(this._content);
    }
  }
  if (opt_tooltip && content) {
    content.setAttribute("title", opt_tooltip);
  }
  return(this._content);
};
nova.ElementWrapper.prototype.addContent = function(content) {
  content = nova.getElement(content);
  if (content === null) {
    return null;
  }
  this._content = this._element.children;
  this._element.appendChild(content);
  return content;
};
nova.ElementWrapper.prototype.removeContent = function(content) {
  content = nova.getElement(content);
  if (content === null) {
    return false;
  }
  this._content = this._element.children;
  this._element.removeChild(content);
  return true;
};
nova.ElementWrapper.prototype.listen = function(type, handler, opt_priority) {
  if (this._events === null) {
    this._events = {};
  }
  var event = this._events[type];
  if (event === undefined) {
    event = new nova.Event;
    this._events[type] = event;
    event.dispatch = event.dispatch.bind(event);
    if (nova.modernBrowser) {
      this._element.addEventListener(type, event.dispatch, false);
    } else {
      this._element.attachEvent("on" + type, event.dispatch);
    }
  }
  event.listen(handler, opt_priority);
};
nova.ElementWrapper.prototype.unlisten = function(type, handler) {
  if (this._events === null) {
    return;
  }
  var event = this._events[type];
  if (event === undefined) {
    return;
  }
  event.unlisten(handler);
};
nova.ElementWrapper.prototype.unlistenAll = function(opt_type) {
  if (this._events === null) {
    return;
  }
  if (opt_type) {
    if (this._events[opt_type]) {
      this._unlistenAll(opt_type);
      delete this._events[opt_type];
    }
  } else {
    for (var key in this._events) {
      this._unlistenAll(key);
    }
    this._events = null;
  }
};
nova.ElementWrapper.prototype.dispose = function() {
  this.setParent(null);
  this.unlistenAll();
  this._element = null;
  this._content = null;
  this._textSpan = null;
};
nova.ElementWrapper.prototype.getEvent = function(type) {
  return this._events[type] || null;
};
nova.ElementWrapper.prototype.getElement = function() {
  return this._element;
};
nova.ElementWrapper.prototype.getNextSibling = function() {
  return this._element.nextSibling;
};
nova.ElementWrapper.prototype.getParent = function() {
  return this._element.parentNode;
};
nova.ElementWrapper.prototype.setParent = function(parent, opt_prepend) {
  if (!this._element) {
    return;
  }
  parent = nova.getElement(parent);
  if (parent !== null) {
    if (opt_prepend) {
      parent.insertBefore(this._element, parent.firstChild);
    } else {
      parent.appendChild(this._element);
    }
  } else {
    if (this._element.parentNode !== null) {
      this._element.parentNode.removeChild(this._element);
    }
  }
};
nova.ElementWrapper.prototype.insertBefore = function(nextSibling) {
  nextSibling = nova.getElement(nextSibling);
  if (nextSibling === null) {
    this.setParent(this.getParent());
    return;
  }
  var parent = nextSibling.parentNode;
  if (parent === null) {
    return;
  }
  parent.insertBefore(this._element, nextSibling);
};
nova.ElementWrapper.prototype.insertAfter = function(previousSibling) {
  previousSibling = nova.getElement(previousSibling);
  this.insertBefore(previousSibling ? previousSibling.nextSibling : null);
};
nova.ElementWrapper.prototype.hasClass = function(str) {
  return this._element.classList.contains(str);
};
nova.ElementWrapper.prototype.addClass = function(str) {
  if (!this.hasClass(str)) {
    this._addClass(str);
    return true;
  }
  return false;
};
nova.ElementWrapper.prototype.removeClass = function(str) {
  if (this.hasClass(str)) {
    this._element.classList.remove(str);
    return true;
  }
  return false;
};
nova.ElementWrapper.prototype.toggleClass = function(str, opt_replacement) {
  if (this.removeClass(str)) {
    if (opt_replacement) {
      this.addClass(opt_replacement);
    }
    return false;
  }
  this._addClass(str);
  return true;
};
nova.ElementWrapper.prototype.enableClass = function(str, opt_enabled) {
  if (opt_enabled !== false) {
    return this.addClass(str);
  }
  return this.removeClass(str);
};
nova.ElementWrapper.prototype.getClass = function() {
  return this._element.className;
};
nova.ElementWrapper.prototype.setClass = function(str) {
  this._element.className = str;
};
nova.ElementWrapper.prototype.getAttribute = function(str) {
  return this._element.getAttribute(str);
};
nova.ElementWrapper.prototype.setAttribute = function(str, val) {
  this._element.setAttribute(str, val);
};
nova.ElementWrapper.prototype.setAttributes = function(json) {
  for (var key in json) {
    this._element.setAttribute(key, json[key]);
  }
};
nova.ElementWrapper.prototype.removeAttribute = function(str) {
  this._element.removeAttribute(str);
};
nova.ElementWrapper.prototype.getStyle = function(str) {
  return this._element.style[str];
};
nova.ElementWrapper.prototype.setStyle = function(str, val) {
  this._element.style[str] = val;
};
nova.ElementWrapper.prototype.setStyles = function(json) {
  var styles = this._element.style;
  for (var key in json) {
    styles[key] = json[key];
  }
};
nova.ElementWrapper.prototype.getComputedStyle = function(str) {
  return nova.getComputedStyle(this._element, str);
};
nova.ElementWrapper.prototype.getId = function() {
  return this._element.id;
};
nova.ElementWrapper.prototype.toString = function() {
  var outer = this._element.outerHTML;
  outer = outer.replace(this._element.innerHTML, "");
  return outer;
};
nova.ElementWrapper.prototype.getTextContent = function() {
  return nova.modernBrowser ? (this._element.textContent) : (this._element.innerText);
};
nova.ElementWrapper.prototype.getLeft = function() {
  return this._element.offsetLeft;
};
nova.ElementWrapper.prototype.setLeft = function(val) {
  this._element.style.left = val + "px";
  return true;
};
nova.ElementWrapper.prototype.getTop = function() {
  return this._element.offsetTop;
};
nova.ElementWrapper.prototype.setTop = function(val) {
  this._element.style.top = val + "px";
  return true;
};
nova.ElementWrapper.prototype.getWidth = function() {
  return this._element.offsetWidth;
};
nova.ElementWrapper.prototype.setWidth = function(val) {
  this._element.style.width = val + "px";
  return true;
};
nova.ElementWrapper.prototype.getHeight = function() {
  return this._element.offsetHeight;
};
nova.ElementWrapper.prototype.setHeight = function(val) {
  if (val < 0) {
    val = 0;
  }
  this._element.style.height = val + "px";
  return true;
};
nova.ElementWrapper.prototype.getBoundingClientRect = function() {
  return this._element.getBoundingClientRect();
};
nova.ElementWrapper.prototype.fillParentWidth = function(opt_percent) {
  if (opt_percent === undefined) {
    opt_percent = 100;
  }
  this._element.style.width = opt_percent + "%";
  return true;
};
nova.ElementWrapper.prototype.fillParentHeight = function(opt_percent) {
  if (opt_percent === undefined) {
    opt_percent = 100;
  }
  this._element.style.height = opt_percent + "%";
  return true;
};
nova.ElementWrapper.prototype.getTooltip = function() {
  return this.getAttribute("title");
};
nova.ElementWrapper.prototype.setTooltip = function(str) {
  this.setAttribute("title", str || "");
};
nova.ElementWrapper.prototype.show = function(opt_shown) {
  this._element.style.display = opt_shown !== false ? "" : "none";
};
nova.ElementWrapper.prototype.hide = function(opt_hidden) {
  this.show(opt_hidden === false);
};
nova.ElementWrapper.prototype.toggleVisibility = function() {
  var visibility = !this.isVisible();
  this.show(visibility);
  return visibility;
};
nova.ElementWrapper.prototype.isVisible = function() {
  return this._element.style.display !== "none";
};
nova.ElementWrapper.prototype.enable = function(opt_enabled) {
  opt_enabled = opt_enabled !== false;
  if (opt_enabled) {
    this.removeAttribute("disabled");
  } else {
    this.setAttribute("disabled", "disabled");
    this._element.disabled = !opt_enabled;
  }
};
nova.ElementWrapper.prototype.disable = function(opt_disabled) {
  this.enable(opt_disabled === false);
};
nova.ElementWrapper.prototype.isEnabled = function() {
  return!this._element.hasAttribute("disabled");
};
nova.ElementWrapper.prototype.focus = function(opt_focused) {
  if (opt_focused !== false) {
    this._element.focus();
  } else {
    this._element.blur();
  }
};
nova.ElementWrapper.prototype.getScrollLeft = function() {
  return this._element.scrollLeft;
};
nova.ElementWrapper.prototype.getScrollTop = function() {
  return this._element.scrollTop;
};
nova.ElementWrapper.prototype.isEndOfHorizontalScroll = function() {
  return this._element.scrollLeft >= this._element.scrollWidth - this.getWidth();
};
nova.ElementWrapper.prototype.isEndOfVerticalScroll = function() {
  return this._element.scrollTop >= this._element.scrollHeight - this.getHeight();
};
nova.ElementWrapper.prototype._addClass = function(str) {
  var className = this._element.className;
  if (className.length > 0) {
    this._element.className = className + " " + str;
  } else {
    this._element.className = str;
  }
};
nova.ElementWrapper.prototype._unlistenAll = function(type) {
  var event = this._events[type];
  if (nova.modernBrowser) {
    this._element.removeEventListener(type, event.dispatch, false);
  } else {
    this._element.detachEvent("on" + type, event.dispatch);
  }
  event.unlistenAll();
};
nova.ElementWrapper.prototype._element = null;
nova.ElementWrapper.prototype._content = null;
nova.ElementWrapper.prototype._textSpan = null;
nova.ElementWrapper.prototype._events = null;
goog.exportSymbol("nova.ElementWrapper", nova.ElementWrapper);
nova.ElementWrapper._proto = nova.ElementWrapper.prototype;
goog.exportProperty(nova.ElementWrapper._proto, "getContent", nova.ElementWrapper._proto.getContent);
goog.exportProperty(nova.ElementWrapper._proto, "setContent", nova.ElementWrapper._proto.setContent);
goog.exportProperty(nova.ElementWrapper._proto, "addContent", nova.ElementWrapper._proto.addContent);
goog.exportProperty(nova.ElementWrapper._proto, "removeContent", nova.ElementWrapper._proto.removeContent);
goog.exportProperty(nova.ElementWrapper._proto, "listen", nova.ElementWrapper._proto.listen);
goog.exportProperty(nova.ElementWrapper._proto, "unlisten", nova.ElementWrapper._proto.unlisten);
goog.exportProperty(nova.ElementWrapper._proto, "unlistenAll", nova.ElementWrapper._proto.unlistenAll);
goog.exportProperty(nova.ElementWrapper._proto, "dispose", nova.ElementWrapper._proto.dispose);
goog.exportProperty(nova.ElementWrapper._proto, "getElement", nova.ElementWrapper._proto.getElement);
goog.exportProperty(nova.ElementWrapper._proto, "getNextSibling", nova.ElementWrapper._proto.getNextSibling);
goog.exportProperty(nova.ElementWrapper._proto, "getParent", nova.ElementWrapper._proto.getParent);
goog.exportProperty(nova.ElementWrapper._proto, "setParent", nova.ElementWrapper._proto.setParent);
goog.exportProperty(nova.ElementWrapper._proto, "insertBefore", nova.ElementWrapper._proto.insertBefore);
goog.exportProperty(nova.ElementWrapper._proto, "insertAfter", nova.ElementWrapper._proto.insertAfter);
goog.exportProperty(nova.ElementWrapper._proto, "hasClass", nova.ElementWrapper._proto.hasClass);
goog.exportProperty(nova.ElementWrapper._proto, "addClass", nova.ElementWrapper._proto.addClass);
goog.exportProperty(nova.ElementWrapper._proto, "removeClass", nova.ElementWrapper._proto.removeClass);
goog.exportProperty(nova.ElementWrapper._proto, "toggleClass", nova.ElementWrapper._proto.toggleClass);
goog.exportProperty(nova.ElementWrapper._proto, "enableClass", nova.ElementWrapper._proto.enableClass);
goog.exportProperty(nova.ElementWrapper._proto, "getClass", nova.ElementWrapper._proto.getClass);
goog.exportProperty(nova.ElementWrapper._proto, "setClass", nova.ElementWrapper._proto.setClass);
goog.exportProperty(nova.ElementWrapper._proto, "getAttribute", nova.ElementWrapper._proto.getAttribute);
goog.exportProperty(nova.ElementWrapper._proto, "setAttribute", nova.ElementWrapper._proto.setAttribute);
goog.exportProperty(nova.ElementWrapper._proto, "setAttributes", nova.ElementWrapper._proto.setAttributes);
goog.exportProperty(nova.ElementWrapper._proto, "removeAttribute", nova.ElementWrapper._proto.removeAttribute);
goog.exportProperty(nova.ElementWrapper._proto, "getStyle", nova.ElementWrapper._proto.getStyle);
goog.exportProperty(nova.ElementWrapper._proto, "setStyle", nova.ElementWrapper._proto.setStyle);
goog.exportProperty(nova.ElementWrapper._proto, "setStyles", nova.ElementWrapper._proto.setStyles);
goog.exportProperty(nova.ElementWrapper._proto, "getComputedStyle", nova.ElementWrapper._proto.getComputedStyle);
goog.exportProperty(nova.ElementWrapper._proto, "getId", nova.ElementWrapper._proto.getId);
goog.exportProperty(nova.ElementWrapper._proto, "toString", nova.ElementWrapper._proto.toString);
goog.exportProperty(nova.ElementWrapper._proto, "getTextContent", nova.ElementWrapper._proto.getTextContent);
goog.exportProperty(nova.ElementWrapper._proto, "getLeft", nova.ElementWrapper._proto.getLeft);
goog.exportProperty(nova.ElementWrapper._proto, "setLeft", nova.ElementWrapper._proto.setLeft);
goog.exportProperty(nova.ElementWrapper._proto, "getTop", nova.ElementWrapper._proto.getTop);
goog.exportProperty(nova.ElementWrapper._proto, "setTop", nova.ElementWrapper._proto.setTop);
goog.exportProperty(nova.ElementWrapper._proto, "getWidth", nova.ElementWrapper._proto.getWidth);
goog.exportProperty(nova.ElementWrapper._proto, "setWidth", nova.ElementWrapper._proto.setWidth);
goog.exportProperty(nova.ElementWrapper._proto, "getHeight", nova.ElementWrapper._proto.getHeight);
goog.exportProperty(nova.ElementWrapper._proto, "setHeight", nova.ElementWrapper._proto.setHeight);
goog.exportProperty(nova.ElementWrapper._proto, "getBoundingClientRect", nova.ElementWrapper._proto.getBoundingClientRect);
goog.exportProperty(nova.ElementWrapper._proto, "fillParentWidth", nova.ElementWrapper._proto.fillParentWidth);
goog.exportProperty(nova.ElementWrapper._proto, "fillParentHeight", nova.ElementWrapper._proto.fillParentHeight);
goog.exportProperty(nova.ElementWrapper._proto, "getTooltip", nova.ElementWrapper._proto.getTooltip);
goog.exportProperty(nova.ElementWrapper._proto, "setTooltip", nova.ElementWrapper._proto.setTooltip);
goog.exportProperty(nova.ElementWrapper._proto, "show", nova.ElementWrapper._proto.show);
goog.exportProperty(nova.ElementWrapper._proto, "hide", nova.ElementWrapper._proto.hide);
goog.exportProperty(nova.ElementWrapper._proto, "toggleVisibility", nova.ElementWrapper._proto.toggleVisibility);
goog.exportProperty(nova.ElementWrapper._proto, "isVisible", nova.ElementWrapper._proto.isVisible);
goog.exportProperty(nova.ElementWrapper._proto, "enable", nova.ElementWrapper._proto.enable);
goog.exportProperty(nova.ElementWrapper._proto, "disable", nova.ElementWrapper._proto.disable);
goog.exportProperty(nova.ElementWrapper._proto, "isEnabled", nova.ElementWrapper._proto.isEnabled);
goog.exportProperty(nova.ElementWrapper._proto, "focus", nova.ElementWrapper._proto.focus);
goog.exportProperty(nova.ElementWrapper._proto, "getScrollLeft", nova.ElementWrapper._proto.getScrollLeft);
goog.exportProperty(nova.ElementWrapper._proto, "getScrollTop", nova.ElementWrapper._proto.getScrollTop);
goog.exportProperty(nova.ElementWrapper._proto, "isEndOfHorizontalScroll", nova.ElementWrapper._proto.isEndOfHorizontalScroll);
goog.exportProperty(nova.ElementWrapper._proto, "isEndOfVerticalScroll", nova.ElementWrapper._proto.isEndOfVerticalScroll);
goog.provide("nova.EventDispatcher");
goog.require("nova.Event");
nova.EventDispatcher = function() {
  throw "Cannot instantiate an abstract class";
};
nova.EventDispatcher.prototype.listen = function(type, handler, opt_priority) {
  if (this._events !== null && this._events[type] !== undefined) {
    this._events[type].listen(handler, opt_priority);
  } else {
    window.console.log(type + " event is not defined by this object");
  }
};
nova.EventDispatcher.prototype.unlisten = function(type, handler) {
  if (this._events !== null && this._events[type] !== undefined) {
    this._events[type].unlisten(handler);
  }
};
nova.EventDispatcher.prototype.unlistenAll = function(opt_type) {
  if (opt_type === undefined) {
    for (var key in this._events) {
      this._events[key].unlistenAll();
    }
  } else {
    if (this._events !== null && this._events[opt_type] !== undefined) {
      this._events[opt_type].unlistenAll();
    }
  }
};
nova.EventDispatcher.prototype._addEvent = function(type) {
  if (this._events === null) {
    this._events = {};
  }
  var event = this._events[type];
  if (event === undefined) {
    event = new nova.Event(this);
    this._events[type] = event;
  }
  return(event);
};
nova.EventDispatcher.prototype._getEvent = function(type) {
  return this._events[type];
};
nova.EventDispatcher.prototype._hasListener = function(type) {
  if (this._events && this._events[type]) {
    return this._events[type].hasListener();
  }
  return false;
};
nova.EventDispatcher.prototype._dispatch = function(type, eventArg) {
  this._events[type].dispatch(eventArg);
};
nova.EventDispatcher.prototype._events = null;
nova.EventDispatcher._proto = nova.EventDispatcher.prototype;
goog.exportProperty(nova.EventDispatcher._proto, "listen", nova.EventDispatcher._proto.listen);
goog.exportProperty(nova.EventDispatcher._proto, "unlisten", nova.EventDispatcher._proto.unlisten);
goog.exportProperty(nova.EventDispatcher._proto, "unlistenAll", nova.EventDispatcher._proto.unlistenAll);
goog.provide("nova.ElementControl");
goog.require("nova.IElementControl");
goog.require("nova.EventDispatcher");
nova.ElementControl = function() {
  throw "Cannot instantiate ElementControl. It is an abstract class.";
};
goog.inherits(nova.ElementControl, nova.EventDispatcher);
nova.ElementControl.prototype._topNode = null;
nova.ElementControl.prototype.getContent = function(opt_allContent) {
  return this._topNode.getContent(opt_allContent);
};
nova.ElementControl.prototype.setContent = function(content, opt_tooltip) {
  return this._topNode.setContent(content, opt_tooltip);
};
nova.ElementControl.prototype.addContent = function(content) {
  return this._topNode.addContent(content);
};
nova.ElementControl.prototype.removeContent = function(content) {
  return this._topNode.removeContent(content);
};
nova.ElementControl.prototype.listen = function(type, handler, opt_priority) {
  if (this._events !== null && this._events[type] !== undefined) {
    this._events[type].listen(handler, opt_priority);
  } else {
    this._topNode.listen(type, handler, opt_priority);
  }
};
nova.ElementControl.prototype.unlisten = function(type, handler) {
  if (this._events !== null && this._events[type] !== undefined) {
    this._events[type].unlisten(handler);
  } else {
    this._topNode.unlisten(type, handler);
  }
};
nova.ElementControl.prototype.unlistenAll = function(opt_type) {
  if (opt_type === undefined) {
    if (this._topNode) {
      this._topNode.unlistenAll();
    }
    for (var key in this._events) {
      this._events[key].unlistenAll();
    }
  } else {
    if (this._events !== null && this._events[opt_type] !== undefined) {
      this._events[opt_type].unlistenAll();
    } else {
      this._topNode.unlistenAll(opt_type);
    }
  }
};
nova.ElementControl.prototype.dispose = function() {
  this._topNode.dispose();
  for (var key in this._events) {
    this._events[key].unlistenAll();
  }
  this._topNode = null;
  this._events = null;
};
nova.ElementControl.prototype.getEvent = function(type) {
  if (this._events !== null && this._events[type] !== undefined) {
    return this._events[type];
  }
  return this._topNode.getEvent(type);
};
nova.ElementControl.prototype.getElement = function() {
  return this._topNode.getElement();
};
nova.ElementControl.prototype.getNextSibling = function() {
  return this._topNode.getNextSibling();
};
nova.ElementControl.prototype.getParent = function() {
  return this._topNode.getParent();
};
nova.ElementControl.prototype.setParent = function(parent, opt_prepend) {
  this._topNode.setParent(parent, opt_prepend);
};
nova.ElementControl.prototype.insertBefore = function(nextSibling) {
  this._topNode.insertBefore(nextSibling);
};
nova.ElementControl.prototype.insertAfter = function(previousSibling) {
  this._topNode.insertAfter(previousSibling);
};
nova.ElementControl.prototype.hasClass = function(str) {
  return this._topNode.hasClass(str);
};
nova.ElementControl.prototype.addClass = function(str) {
  return this._topNode.addClass(str);
};
nova.ElementControl.prototype.removeClass = function(str) {
  return this._topNode.removeClass(str);
};
nova.ElementControl.prototype.toggleClass = function(str, opt_replacement) {
  return this._topNode.toggleClass(str, opt_replacement);
};
nova.ElementControl.prototype.enableClass = function(str, opt_enabled) {
  return this._topNode.enableClass(str, opt_enabled);
};
nova.ElementControl.prototype.getClass = function() {
  return this._topNode.getClass();
};
nova.ElementControl.prototype.setClass = function(str) {
  this._topNode.setClass(str);
};
nova.ElementControl.prototype.getAttribute = function(str) {
  return this._topNode.getAttribute(str);
};
nova.ElementControl.prototype.setAttribute = function(str, val) {
  this._topNode.setAttribute(str, val);
};
nova.ElementControl.prototype.setAttributes = function(json) {
  this._topNode.setAttributes(json);
};
nova.ElementControl.prototype.removeAttribute = function(str) {
  return this._topNode.removeAttribute(str);
};
nova.ElementControl.prototype.getStyle = function(str) {
  return this._topNode.getStyle(str);
};
nova.ElementControl.prototype.setStyle = function(str, val) {
  this._topNode.setStyle(str, val);
};
nova.ElementControl.prototype.setStyles = function(json) {
  this._topNode.setStyles(json);
};
nova.ElementControl.prototype.getComputedStyle = function(str) {
  return this._topNode.getComputedStyle(str);
};
nova.ElementControl.prototype.getId = function() {
  return this._topNode.getId();
};
nova.ElementControl.prototype.toString = function() {
  return this._topNode.toString();
};
nova.ElementControl.prototype.getTextContent = function() {
  return this._topNode.getTextContent();
};
nova.ElementControl.prototype.getLeft = function() {
  return this._topNode.getLeft();
};
nova.ElementControl.prototype.setLeft = function(val) {
  return this._topNode.setLeft(val);
};
nova.ElementControl.prototype.getTop = function() {
  return this._topNode.getTop();
};
nova.ElementControl.prototype.setTop = function(val) {
  return this._topNode.setTop(val);
};
nova.ElementControl.prototype.getWidth = function() {
  return this._topNode.getWidth();
};
nova.ElementControl.prototype.setWidth = function(val) {
  return this._topNode.setWidth(val);
};
nova.ElementControl.prototype.getHeight = function() {
  return this._topNode.getHeight();
};
nova.ElementControl.prototype.setHeight = function(val) {
  return this._topNode.setHeight(val);
};
nova.ElementControl.prototype.getBoundingClientRect = function() {
  return this._topNode.getBoundingClientRect();
};
nova.ElementControl.prototype.fillParentWidth = function(opt_percent) {
  return this._topNode.fillParentWidth(opt_percent);
};
nova.ElementControl.prototype.fillParentHeight = function(opt_percent) {
  return this._topNode.fillParentHeight(opt_percent);
};
nova.ElementControl.prototype.getTooltip = function() {
  return this._topNode.getTooltip();
};
nova.ElementControl.prototype.setTooltip = function(str) {
  this._topNode.setTooltip(str);
};
nova.ElementControl.prototype.show = function(opt_shown) {
  this._topNode.show(opt_shown);
};
nova.ElementControl.prototype.hide = function(opt_hidden) {
  this.show(opt_hidden === false);
};
nova.ElementControl.prototype.toggleVisibility = function() {
  var visibility = !this.isVisible();
  this.show(visibility);
  return visibility;
};
nova.ElementControl.prototype.isVisible = function() {
  return this._topNode.isVisible();
};
nova.ElementControl.prototype.enable = function(opt_enabled) {
  return this._topNode.enable(opt_enabled);
};
nova.ElementControl.prototype.disable = function(opt_disabled) {
  return this.enable(opt_disabled === false);
};
nova.ElementControl.prototype.isEnabled = function() {
  return this._topNode.isEnabled();
};
nova.ElementControl.prototype.focus = function(opt_focused) {
  this._topNode.focus(opt_focused);
};
nova.ElementControl.prototype.getScrollLeft = function() {
  return this._topNode.getScrollLeft();
};
nova.ElementControl.prototype.getScrollTop = function() {
  return this._topNode.getScrollTop();
};
nova.ElementControl.prototype.isEndOfHorizontalScroll = function() {
  return this._topNode.isEndOfHorizontalScroll();
};
nova.ElementControl.prototype.isEndOfVerticalScroll = function() {
  return this._topNode.isEndOfVerticalScroll();
};
goog.exportSymbol("nova.ElementControl", nova.ElementControl);
nova.ElementControl._proto = nova.ElementControl.prototype;
goog.exportProperty(nova.ElementControl._proto, "getContent", nova.ElementControl._proto.getContent);
goog.exportProperty(nova.ElementControl._proto, "setContent", nova.ElementControl._proto.setContent);
goog.exportProperty(nova.ElementControl._proto, "addContent", nova.ElementControl._proto.addContent);
goog.exportProperty(nova.ElementControl._proto, "removeContent", nova.ElementControl._proto.removeContent);
goog.exportProperty(nova.ElementControl._proto, "listen", nova.ElementControl._proto.listen);
goog.exportProperty(nova.ElementControl._proto, "unlisten", nova.ElementControl._proto.unlisten);
goog.exportProperty(nova.ElementControl._proto, "unlistenAll", nova.ElementControl._proto.unlistenAll);
goog.exportProperty(nova.ElementControl._proto, "dispose", nova.ElementControl._proto.dispose);
goog.exportProperty(nova.ElementControl._proto, "getElement", nova.ElementControl._proto.getElement);
goog.exportProperty(nova.ElementControl._proto, "getNextSibling", nova.ElementControl._proto.getNextSibling);
goog.exportProperty(nova.ElementControl._proto, "getParent", nova.ElementControl._proto.getParent);
goog.exportProperty(nova.ElementControl._proto, "setParent", nova.ElementControl._proto.setParent);
goog.exportProperty(nova.ElementControl._proto, "insertBefore", nova.ElementControl._proto.insertBefore);
goog.exportProperty(nova.ElementControl._proto, "insertAfter", nova.ElementControl._proto.insertAfter);
goog.exportProperty(nova.ElementControl._proto, "hasClass", nova.ElementControl._proto.hasClass);
goog.exportProperty(nova.ElementControl._proto, "addClass", nova.ElementControl._proto.addClass);
goog.exportProperty(nova.ElementControl._proto, "removeClass", nova.ElementControl._proto.removeClass);
goog.exportProperty(nova.ElementControl._proto, "toggleClass", nova.ElementControl._proto.toggleClass);
goog.exportProperty(nova.ElementControl._proto, "enableClass", nova.ElementControl._proto.enableClass);
goog.exportProperty(nova.ElementControl._proto, "getClass", nova.ElementControl._proto.getClass);
goog.exportProperty(nova.ElementControl._proto, "setClass", nova.ElementControl._proto.setClass);
goog.exportProperty(nova.ElementControl._proto, "getAttribute", nova.ElementControl._proto.getAttribute);
goog.exportProperty(nova.ElementControl._proto, "setAttribute", nova.ElementControl._proto.setAttribute);
goog.exportProperty(nova.ElementControl._proto, "setAttributes", nova.ElementControl._proto.setAttributes);
goog.exportProperty(nova.ElementControl._proto, "removeAttribute", nova.ElementControl._proto.removeAttribute);
goog.exportProperty(nova.ElementControl._proto, "getStyle", nova.ElementControl._proto.getStyle);
goog.exportProperty(nova.ElementControl._proto, "setStyle", nova.ElementControl._proto.setStyle);
goog.exportProperty(nova.ElementControl._proto, "setStyles", nova.ElementControl._proto.setStyles);
goog.exportProperty(nova.ElementControl._proto, "getComputedStyle", nova.ElementControl._proto.getComputedStyle);
goog.exportProperty(nova.ElementControl._proto, "getId", nova.ElementControl._proto.getId);
goog.exportProperty(nova.ElementControl._proto, "toString", nova.ElementControl._proto.toString);
goog.exportProperty(nova.ElementControl._proto, "getTextContent", nova.ElementControl._proto.getTextContent);
goog.exportProperty(nova.ElementControl._proto, "getLeft", nova.ElementControl._proto.getLeft);
goog.exportProperty(nova.ElementControl._proto, "setLeft", nova.ElementControl._proto.setLeft);
goog.exportProperty(nova.ElementControl._proto, "getTop", nova.ElementControl._proto.getTop);
goog.exportProperty(nova.ElementControl._proto, "setTop", nova.ElementControl._proto.setTop);
goog.exportProperty(nova.ElementControl._proto, "getWidth", nova.ElementControl._proto.getWidth);
goog.exportProperty(nova.ElementControl._proto, "setWidth", nova.ElementControl._proto.setWidth);
goog.exportProperty(nova.ElementControl._proto, "getHeight", nova.ElementControl._proto.getHeight);
goog.exportProperty(nova.ElementControl._proto, "setHeight", nova.ElementControl._proto.setHeight);
goog.exportProperty(nova.ElementControl._proto, "getBoundingClientRect", nova.ElementControl._proto.getBoundingClientRect);
goog.exportProperty(nova.ElementControl._proto, "fillParentWidth", nova.ElementControl._proto.fillParentWidth);
goog.exportProperty(nova.ElementControl._proto, "fillParentHeight", nova.ElementControl._proto.fillParentHeight);
goog.exportProperty(nova.ElementControl._proto, "getTooltip", nova.ElementControl._proto.getTooltip);
goog.exportProperty(nova.ElementControl._proto, "setTooltip", nova.ElementControl._proto.setTooltip);
goog.exportProperty(nova.ElementControl._proto, "show", nova.ElementControl._proto.show);
goog.exportProperty(nova.ElementControl._proto, "hide", nova.ElementControl._proto.hide);
goog.exportProperty(nova.ElementControl._proto, "toggleVisibility", nova.ElementControl._proto.toggleVisibility);
goog.exportProperty(nova.ElementControl._proto, "isVisible", nova.ElementControl._proto.isVisible);
goog.exportProperty(nova.ElementControl._proto, "enable", nova.ElementControl._proto.enable);
goog.exportProperty(nova.ElementControl._proto, "disable", nova.ElementControl._proto.disable);
goog.exportProperty(nova.ElementControl._proto, "isEnabled", nova.ElementControl._proto.isEnabled);
goog.exportProperty(nova.ElementControl._proto, "focus", nova.ElementControl._proto.focus);
goog.exportProperty(nova.ElementControl._proto, "getScrollLeft", nova.ElementControl._proto.getScrollLeft);
goog.exportProperty(nova.ElementControl._proto, "getScrollTop", nova.ElementControl._proto.getScrollTop);
goog.exportProperty(nova.ElementControl._proto, "isEndOfHorizontalScroll", nova.ElementControl._proto.isEndOfHorizontalScroll);
goog.exportProperty(nova.ElementControl._proto, "isEndOfVerticalScroll", nova.ElementControl._proto.isEndOfVerticalScroll);
goog.provide("nova.TextBox");
goog.require("nova");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
nova.TextBox = function(opt_initializer, opt_model) {
  var _this = this;
  _this._onKeyDown = this._onKeyDown.bind(_this);
  _this._onChange = this._onChange.bind(_this);
  if (!nova.isElement(opt_initializer)) {
    opt_model = opt_initializer;
    opt_initializer = null;
  }
  _this._init((opt_initializer));
  _this._deserialize(opt_model);
};
goog.inherits(nova.TextBox, nova.ElementControl);
nova.TextBox.prototype.setReadOnly = function(opt_readOnly) {
  this.getElement().readOnly = opt_readOnly !== false;
};
nova.TextBox.prototype.getReadOnly = function() {
  return this.getElement().readOnly;
};
nova.TextBox.prototype.setText = function(text) {
  var elem = this.getElement();
  if (elem.value !== text) {
    elem.value = text;
    elem.defaultValue = text;
  }
};
nova.TextBox.prototype.getText = function() {
  return this._topNode.getElement().value;
};
nova.TextBox.prototype.setPlaceholderText = function(placeholder) {
  var elem = this.getElement();
  if (elem.placeholder !== placeholder) {
    elem.placeholder = placeholder;
  }
};
nova.TextBox.prototype.getPlaceholderText = function() {
  return this._topNode.getElement().placeholder;
};
nova.TextBox.prototype.select = function() {
  return this._topNode.getElement().select();
};
nova.TextBox.prototype.disableEscReversion = function(opt_disabled) {
  var _this = this;
  if (opt_disabled !== false) {
    _this.unlisten("keydown", _this._onKeyDown);
  } else {
    _this.listen("keydown", _this._onKeyDown);
  }
};
nova.TextBox.prototype._init = function(opt_element) {
  if (!opt_element) {
    opt_element = nova.createElement("input");
    opt_element.type = "text";
  }
  var _this = this;
  _this._topNode = new nova.ElementWrapper(opt_element);
  _this._topNode.addClass("nova-textbox");
  _this.listen("keydown", _this._onKeyDown);
  _this.listen("change", _this._onChange);
};
nova.TextBox.prototype._deserialize = function(opt_model) {
  if (!opt_model || !this._topNode) {
    return;
  }
  var pref, elem = this.getElement();
  if (pref = opt_model["text"]) {
    elem.value = pref;
  }
  if (pref = opt_model["placeHolderText"]) {
    elem.placeholder = pref;
  }
};
nova.TextBox.prototype._onKeyDown = function(e) {
  if (e["keyCode"] === 27) {
    var elem = this.getElement();
    elem.value = elem.defaultValue;
  }
};
nova.TextBox.prototype._onChange = function(e) {
  var elem = this.getElement();
  elem.defaultValue = elem.value;
};
goog.exportSymbol("nova.TextBox", nova.TextBox);
nova.TextBox._proto = nova.TextBox.prototype;
goog.exportProperty(nova.TextBox._proto, "setReadOnly", nova.TextBox._proto.setReadOnly);
goog.exportProperty(nova.TextBox._proto, "getReadOnly", nova.TextBox._proto.getReadOnly);
goog.exportProperty(nova.TextBox._proto, "setText", nova.TextBox._proto.setText);
goog.exportProperty(nova.TextBox._proto, "getText", nova.TextBox._proto.getText);
goog.exportProperty(nova.TextBox._proto, "setPlaceholderText", nova.TextBox._proto.setPlaceholderText);
goog.exportProperty(nova.TextBox._proto, "getPlaceholderText", nova.TextBox._proto.getPlaceholderText);
goog.exportProperty(nova.TextBox._proto, "select", nova.TextBox._proto.select);
goog.exportProperty(nova.TextBox._proto, "disableEscReversion", nova.TextBox._proto.disableEscReversion);
goog.provide("nova.Event.KeyCodes");
nova.Event.KeyCodes = {BACKSPACE:8, TAB:9, ENTER:13, SHIFT:16, CTRL:17, ALT:18, ESC:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT:37, UP:38, RIGHT:39, DOWN:40, INSERT:45, DELETE:46, ZERO:48, ONE:49, TWO:50, THREE:51, FOUR:52, FIVE:53, SIX:54, SEVEN:55, EIGHT:56, NINE:57, A:65, B:66, C:67, D:68, E:69, F:70, G:71, H:72, I:73, J:74, K:75, L:76, M:77, N:78, O:79, P:80, Q:81, R:82, S:83, T:84, U:85, V:86, W:87, X:88, Y:89, Z:90, NUM_ZERO:96, NUM_ONE:97, NUM_TWO:98, NUM_THREE:99, NUM_FOUR:100, 
NUM_FIVE:101, NUM_SIX:102, NUM_SEVEN:103, NUM_EIGHT:104, NUM_NINE:105, NUM_MULTIPLY:106, NUM_PLUS:107, NUM_MINUS:109, NUM_PERIOD:110, NUM_DIVISION:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, NUMLOCK:144, SCROLL_LOCK:145};
goog.provide("nova.MenuItem");
goog.require("nova");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
nova.MenuItem = function(opt_initializer, opt_model) {
  this._addEvent("itemHovered");
  this._addEvent("itemClicked");
  this._addEvent("itemContextMenu");
  this._onItemHovered = this._onItemHovered.bind(this);
  this._onItemClicked = this._onItemClicked.bind(this);
  this._onItemContextMenu = this._onItemContextMenu.bind(this);
  if (!nova.isElement(opt_initializer)) {
    opt_model = opt_initializer;
    opt_initializer = null;
  }
  this._init((opt_initializer));
  this._deserialize(opt_model);
};
goog.inherits(nova.MenuItem, nova.ElementControl);
nova.MenuItem.prototype.dispose = function() {
  this.unlistenAll();
  if (this._subMenu) {
    this._subMenu.dispose();
  }
  this.setMenu(null);
  this._topNode.dispose();
};
nova.MenuItem.prototype.isDisabled = function() {
  return!this.isEnabled();
};
nova.MenuItem.prototype.show = function(opt_shown) {
  var isVisible = this.isVisible();
  opt_shown = opt_shown !== false;
  if (opt_shown) {
    if (isVisible) {
      return;
    }
  } else {
    if (!isVisible) {
      return;
    }
  }
  this.enableClass("hidden", !opt_shown);
};
nova.MenuItem.prototype.isVisible = function() {
  return!this.hasClass("hidden");
};
nova.MenuItem.prototype.disableSelection = function(opt_disabled) {
  if (opt_disabled !== false) {
    this.setAttribute("data-unselectable", "true");
  } else {
    this.removeAttribute("data-unselectable");
  }
};
nova.MenuItem.prototype.isSelectable = function() {
  return!this.getElement().hasAttribute("data-unselectable");
};
nova.MenuItem.prototype.highlight = function(opt_highlighted) {
  this._topNode.enableClass("highlighted", opt_highlighted !== false);
};
nova.MenuItem.prototype.isHighlighted = function() {
  return this._topNode.hasClass("highlighted");
};
nova.MenuItem.prototype.select = function(opt_selected) {
  if (this.checkSelectionType() === 1) {
    this._topNode.enableClass("selected", opt_selected !== false);
    return true;
  }
  return false;
};
nova.MenuItem.prototype.isSelected = function() {
  return this._topNode.hasClass("selected");
};
nova.MenuItem.prototype.checkSelectionType = function() {
  var result = 1;
  switch(this.getType()) {
    case "separator":
      result = 0;
      break;
    case "command":
      result = 2;
    default:
      if (!this.isVisible() || (this.isDisabled() || !this.isSelectable())) {
        result = 0;
      }
    ;
  }
  return result;
};
nova.MenuItem.prototype.setType = function(type) {
  this._topNode.setAttribute("data-type", type);
};
nova.MenuItem.prototype.getType = function() {
  var type = this._topNode.getAttribute("data-type");
  return type || "default";
};
nova.MenuItem.prototype.setText = function(text) {
  if (!this._topNode || !this._topNode.getElement()) {
    return false;
  }
  var element = this._topNode.getElement();
  if (!goog.isDef(text)) {
    text = null;
  }
  if (element.text === text) {
    return false;
  }
  element.text = text;
  this._updateContent();
};
nova.MenuItem.prototype.getText = function() {
  if (!this._topNode || !this._topNode.getElement()) {
    return "";
  }
  return this._topNode.getElement().text || "";
};
nova.MenuItem.prototype.setValue = function(value) {
  this._value = value;
};
nova.MenuItem.prototype.getValue = function() {
  return this._value;
};
nova.MenuItem.prototype.setMenu = function(menu, opt_index) {
  if (menu === this._menu) {
    return;
  }
  if (this._menu) {
    this._menu.releaseItem(this);
  }
  if (menu) {
    var siblingItem;
    if (goog.isDef(opt_index)) {
      siblingItem = menu.getItem(opt_index);
    }
    if (goog.isDef(siblingItem)) {
      this.insertBefore(siblingItem);
    } else {
      opt_index = undefined;
      this.setParent(menu.getList());
    }
    menu.hookItem(this, opt_index);
  } else {
    this.setParent(null);
  }
  this._menu = menu;
};
nova.MenuItem.prototype.getMenu = function() {
  return this._menu;
};
nova.MenuItem.prototype.setSubMenu = function(subMenu) {
  if (subMenu && !(subMenu instanceof nova.ListMenu)) {
    subMenu = new nova.ListMenu(subMenu);
  }
  if (!goog.isNull(this._subMenu) && this._subMenu !== subMenu) {
    this._subMenu.setParentItem(null);
  }
  if (subMenu) {
    subMenu.setParentItem(this);
    if (this._menu) {
      this._menu.addSubMenu(subMenu);
    }
  } else {
    if (this._menu) {
      this._menu.removeSubMenu(subMenu);
    }
  }
  this._subMenu = subMenu;
  this._topNode.enableClass("has-child", !goog.isNull(subMenu));
};
nova.MenuItem.prototype.getSubMenu = function() {
  return this._subMenu;
};
nova.MenuItem.prototype.getItems = function() {
  return this._subMenu ? this._subMenu.getItems() : [];
};
nova.MenuItem.prototype.setRenderer = function(renderer) {
  if (typeof renderer !== "function") {
    return;
  }
  this._topNode.addClass("customvisual");
  this._renderer = renderer;
  this._updateContent();
};
nova.MenuItem.prototype.getRenderer = function() {
  return this._renderer;
};
nova.MenuItem.prototype.setMatchingFunction = function(matchingFunction) {
  if (typeof matchingFunction !== "function") {
    return;
  }
  this._matchingFunction = matchingFunction;
};
nova.MenuItem.prototype.getMatchingFunction = function() {
  return this._matchingFunction;
};
nova.MenuItem.prototype.setMatchingMaskFunction = function(matchingMaskFunction) {
  if (typeof matchingMaskFunction !== "function") {
    return;
  }
  this._matchingMaskFunction = matchingMaskFunction;
};
nova.MenuItem.prototype.getMatchingMaskFunction = function() {
  return this._matchingMaskFunction;
};
nova.MenuItem.prototype.matchCriteria = function(criteria) {
  var type = this.getType();
  if (type !== "default" && type !== "command") {
    return false;
  }
  this._matchingCriteria = criteria;
  var isMatched = (this._matchingFunction ? this._matchingFunction : nova.MenuItem.defaultMatchingFunction)({"item":this, "criteria":criteria});
  this._updateContent();
  return isMatched;
};
nova.MenuItem.prototype.getMatchingCriteria = function() {
  return this._matchingCriteria;
};
nova.MenuItem.prototype.getMatchedCriteria = nova.MenuItem.prototype.getMatchingCriteria;
nova.MenuItem.prototype.updateDisplay = function() {
  this._updateContent();
};
nova.MenuItem.prototype.isSeparator = function() {
  return this.getType() === "separator";
};
nova.MenuItem.prototype.getIsEnabled = nova.MenuItem.prototype.isEnabled;
nova.MenuItem.prototype.setIsEnabled = nova.MenuItem.prototype.enable;
nova.MenuItem.prototype.getIsActive = nova.MenuItem.prototype.isSelected;
nova.MenuItem.prototype.getIsSeparator = nova.MenuItem.prototype.isSeparator;
nova.MenuItem.defaultRenderer = function(e) {
  var item = e["item"];
  var content = item.getText();
  var criteria = item.getMatchingCriteria();
  if (criteria && !nova.isString(criteria)) {
    criteria = criteria["text"];
  }
  if (criteria) {
    var regex = (item.getMatchingMaskFunction() || nova.MenuItem.defaultMatchingMaskFunction)(criteria);
    content = content.replace(regex, function(str) {
      return'<span class="matched">' + str + "</span>";
    });
  }
  item.getElement().innerHTML = content;
};
nova.MenuItem.defaultMatchingFunction = function(e) {
  var criteria = e["criteria"];
  if (nova.isString(criteria) || nova.isNumber(criteria)) {
    criteria = [criteria];
  }
  if (nova.isArray(criteria)) {
    criteria = {"text":criteria};
  }
  if (!criteria) {
    return true;
  }
  var item = e["item"];
  var i, j, dummyCriteria, attr, regex, matchingRenderer;
  for (i in criteria) {
    dummyCriteria = criteria[i];
    switch(i) {
      case "text":
        attr = item.getText();
        break;
      case "value":
        attr = item.getValue();
        break;
    }
    if (nova.isString(attr) && attr) {
      for (j = 0;j < dummyCriteria.length;++j) {
        regex = (item.getMatchingMaskFunction() || nova.MenuItem.defaultMatchingMaskFunction)(dummyCriteria[j]);
        if (regex.test(attr)) {
          return true;
        }
      }
    }
  }
  return false;
};
nova.MenuItem.defaultMatchingMaskFunction = function(key) {
  if (nova.isString(key)) {
    key = key.replace(/^\s*/g, "").replace(/\s*$/g, "").replace(/\s+/g, " ").split(" ");
  }
  key = key.map(function(str) {
    return "\\b(" + nova.escapeCharacters(str) + ")";
  });
  return new RegExp(key.join("|"), "ig");
};
nova.MenuItem.prototype._init = function(opt_element) {
  if (!opt_element) {
    opt_element = nova.createElement("li");
  }
  var temp = new nova.ElementWrapper((opt_element));
  temp.addClass("nova-list-item");
  temp.listen("mouseover", this._onItemHovered);
  temp.listen("click", this._onItemClicked);
  temp.listen("contextmenu", this._onItemContextMenu);
  this._topNode = temp;
};
nova.MenuItem.prototype._deserialize = function(opt_model) {
  if (!opt_model) {
    opt_model = {};
  }
  var pref;
  pref = opt_model["type"];
  if (pref) {
    this.setType(pref);
  }
  pref = opt_model["text"];
  if (goog.isDefAndNotNull(pref)) {
    this.setText(pref);
  }
  pref = opt_model["value"];
  if (goog.isDefAndNotNull(pref)) {
    this.setValue(pref);
  }
  pref = opt_model["isDisabled"];
  if (pref) {
    this.disable(pref);
  }
  pref = opt_model["isVisible"];
  if (pref === false) {
    this.show(pref);
  }
  pref = opt_model["isSelectable"];
  if (pref === false) {
    this.disableSelection();
  }
  pref = opt_model["renderer"] || opt_model["renderFunction"];
  if (pref) {
    this.setRenderer(pref);
  }
  pref = opt_model["matchingFunction"];
  if (pref) {
    this.setMatchingFunction(pref);
  }
  pref = opt_model["matchingMaskFunction"];
  if (pref) {
    this.setMatchingMaskFunction(pref);
  }
  pref = opt_model["subMenu"];
  if (pref) {
    this.setSubMenu(pref);
  } else {
    pref = opt_model["items"];
    if (pref) {
      this.setSubMenu({"items":opt_model["items"]});
    }
  }
  if (opt_model["isSeparator"]) {
    this.setType("separator");
  }
};
nova.MenuItem.prototype._onItemHovered = function(event) {
  event["item"] = this;
  this._dispatch("itemHovered", event);
};
nova.MenuItem.prototype._onItemClicked = function(event) {
  event["item"] = this;
  this._dispatch("itemClicked", event);
};
nova.MenuItem.prototype._onItemContextMenu = function(event) {
  event["item"] = this;
  this._dispatch("itemContextMenu", event);
};
nova.MenuItem.prototype._updateContent = function() {
  if (this.getType() === "separator") {
    return;
  }
  var topNode = this._topNode;
  var element = topNode.getElement();
  element.textContent = "";
  var content = (this._renderer || nova.MenuItem.defaultRenderer)({"item":this, "element":element});
  if (goog.isDef(content)) {
    if (nova.isString(content)) {
      element.innerHTML = content;
    } else {
      if (nova.isElement(content)) {
        topNode.setContent(content);
      }
    }
  }
};
nova.MenuItem.prototype._value = null;
nova.MenuItem.prototype._menu = null;
nova.MenuItem.prototype._subMenu = null;
nova.MenuItem.prototype._renderer = null;
nova.MenuItem.prototype._matchingFunction = null;
nova.MenuItem.prototype._matchingCriteria = null;
goog.exportSymbol("nova.MenuItem", nova.MenuItem);
nova.MenuItem._proto = nova.MenuItem.prototype;
goog.exportProperty(nova.MenuItem._proto, "dispose", nova.MenuItem._proto.dispose);
goog.exportProperty(nova.MenuItem._proto, "isDisabled", nova.MenuItem._proto.isDisabled);
goog.exportProperty(nova.MenuItem._proto, "show", nova.MenuItem._proto.show);
goog.exportProperty(nova.MenuItem._proto, "isVisible", nova.MenuItem._proto.isVisible);
goog.exportProperty(nova.MenuItem._proto, "disableSelection", nova.MenuItem._proto.disableSelection);
goog.exportProperty(nova.MenuItem._proto, "isSelectable", nova.MenuItem._proto.isSelectable);
goog.exportProperty(nova.MenuItem._proto, "highlight", nova.MenuItem._proto.highlight);
goog.exportProperty(nova.MenuItem._proto, "isHighlighted", nova.MenuItem._proto.isHighlighted);
goog.exportProperty(nova.MenuItem._proto, "select", nova.MenuItem._proto.select);
goog.exportProperty(nova.MenuItem._proto, "isSelected", nova.MenuItem._proto.isSelected);
goog.exportProperty(nova.MenuItem._proto, "setType", nova.MenuItem._proto.setType);
goog.exportProperty(nova.MenuItem._proto, "getType", nova.MenuItem._proto.getType);
goog.exportProperty(nova.MenuItem._proto, "setText", nova.MenuItem._proto.setText);
goog.exportProperty(nova.MenuItem._proto, "getText", nova.MenuItem._proto.getText);
goog.exportProperty(nova.MenuItem._proto, "setValue", nova.MenuItem._proto.setValue);
goog.exportProperty(nova.MenuItem._proto, "getValue", nova.MenuItem._proto.getValue);
goog.exportProperty(nova.MenuItem._proto, "setMenu", nova.MenuItem._proto.setMenu);
goog.exportProperty(nova.MenuItem._proto, "getMenu", nova.MenuItem._proto.getMenu);
goog.exportProperty(nova.MenuItem._proto, "setSubMenu", nova.MenuItem._proto.setSubMenu);
goog.exportProperty(nova.MenuItem._proto, "getSubMenu", nova.MenuItem._proto.getSubMenu);
goog.exportProperty(nova.MenuItem._proto, "getItems", nova.MenuItem._proto.getItems);
goog.exportProperty(nova.MenuItem._proto, "setRenderer", nova.MenuItem._proto.setRenderer);
goog.exportProperty(nova.MenuItem._proto, "getRenderer", nova.MenuItem._proto.getRenderer);
goog.exportProperty(nova.MenuItem._proto, "matchCriteria", nova.MenuItem._proto.matchCriteria);
goog.exportProperty(nova.MenuItem._proto, "getMatchingCriteria", nova.MenuItem._proto.getMatchingCriteria);
goog.exportProperty(nova.MenuItem._proto, "getMatchedCriteria", nova.MenuItem._proto.getMatchedCriteria);
goog.exportProperty(nova.MenuItem._proto, "updateDisplay", nova.MenuItem._proto.updateDisplay);
goog.exportProperty(nova.MenuItem._proto, "isSeparator", nova.MenuItem._proto.isSeparator);
goog.exportProperty(nova.MenuItem._proto, "getIsSeparator", nova.MenuItem._proto.getIsSeparator);
goog.exportProperty(nova.MenuItem._proto, "getIsEnabled", nova.MenuItem._proto.getIsEnabled);
goog.exportProperty(nova.MenuItem._proto, "setIsEnabled", nova.MenuItem._proto.setIsEnabled);
goog.exportProperty(nova.MenuItem._proto, "getIsActive", nova.MenuItem._proto.getIsActive);
goog.provide("nova.ListMenu");
goog.require("nova");
goog.require("nova.Event.KeyCodes");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
goog.require("nova.MenuItem");
nova.ListMenu = function(opt_initializer, opt_model) {
  this._items = [];
  this._subMenus = [];
  this._addEvent("itemHovered");
  this._addEvent("itemClicked");
  this._addEvent("itemContextMenu");
  this._addEvent("itemActivated");
  this._addEvent("itemSelected");
  this._addEvent("itemHighlighted");
  this._addEvent("treeItemActivated");
  this._addEvent("treeItemSelected");
  this._onKeyDown = this._onKeyDown.bind(this);
  this._onItemHovered = this._onItemHovered.bind(this);
  this._onItemClicked = this._onItemClicked.bind(this);
  this._onItemContextMenu = this._onItemContextMenu.bind(this);
  if (!nova.isElement(opt_initializer)) {
    opt_model = opt_initializer;
    opt_initializer = null;
  }
  if (nova.isArray(opt_model)) {
    opt_model = {"items":opt_model};
  }
  this._init((opt_initializer));
  this._deserialize(opt_model);
};
goog.inherits(nova.ListMenu, nova.ElementControl);
nova.ListMenu.prototype.dispose = function() {
  this.unlistenAll();
  var i;
  if (this._subMenus) {
    for (i = 0;i < this._subMenus.length;++i) {
      this._subMenus[i].dispose();
    }
    this._subMenus = null;
  }
  if (this._items) {
    for (i = 0;i < this._items.length;++i) {
      this._items[i].dispose();
    }
    this._items = null;
  }
  if (this._topNode) {
    this._topNode.dispose();
  }
};
nova.ListMenu.prototype.focus = function(opt_focused) {
  var element = this.getElement();
  if (element.tabIndex < 0) {
    element.tabIndex = 0;
  }
  this._topNode.focus(opt_focused);
};
nova.ListMenu.prototype.setItemRenderer = function(renderer, opt_includeChildren) {
  if (typeof renderer !== "function") {
    return;
  }
  var i, item, subMenu;
  for (i = 0;i < this._items.length;++i) {
    item = this._items[i];
    if (!item.getRenderer()) {
      item.setRenderer(renderer);
    }
  }
  this._itemRenderer = renderer;
  if (opt_includeChildren !== false) {
    for (i = 0;i < this._subMenus.length;++i) {
      subMenu = this._subMenus[i];
      if (!subMenu.getItemRenderer()) {
        subMenu.setItemRenderer(renderer);
      }
    }
  }
};
nova.ListMenu.prototype.getItemRenderer = function() {
  return this._itemRenderer;
};
nova.ListMenu.prototype.setItemMatchingFunction = function(matchingFunction, opt_includeChildren) {
  if (typeof matchingFunction !== "function") {
    return;
  }
  var i, item, subMenu;
  for (i = 0;i < this._items.length;++i) {
    item = this._items[i];
    if (!item.getMatchingFunction()) {
      item.setMatchingFunction(matchingFunction);
    }
  }
  this._itemMatchingFunction = matchingFunction;
  if (opt_includeChildren !== false) {
    for (i = 0;i < this._subMenus.length;++i) {
      subMenu = this._subMenus[i];
      if (!subMenu.getItemMatchingFunction()) {
        subMenu.setItemMatchingFunction(matchingFunction);
      }
    }
  }
};
nova.ListMenu.prototype.getItemMatchingFunction = function() {
  return this._itemMatchingFunction;
};
nova.ListMenu.prototype.setItemMatchingMaskFunction = function(matchingMaskFunction, opt_includeChildren) {
  if (typeof matchingMaskFunction !== "function") {
    return;
  }
  var i, item, subMenu;
  for (i = 0;i < this._items.length;++i) {
    item = this._items[i];
    if (!item.getMatchingMaskFunction()) {
      item.setMatchingMaskFunction(matchingMaskFunction);
    }
  }
  this._itemMatchingMaskFunction = matchingMaskFunction;
  if (opt_includeChildren !== false) {
    for (i = 0;i < this._subMenus.length;++i) {
      subMenu = this._subMenus[i];
      if (!subMenu.getItemMatchingMaskFunction()) {
        subMenu.setItemMatchingMaskFunction(matchingMaskFunction);
      }
    }
  }
};
nova.ListMenu.prototype.getItemMatchingMaskFunction = function() {
  return this._itemMatchingMaskFunction;
};
nova.ListMenu.prototype.setMaxHeight = function(value, opt_includeChildren) {
  if (nova.isNumber(value)) {
    if (value < 0) {
      value = "";
    } else {
      value += "px";
    }
  }
  this.setStyle("max-height", (value));
  if (opt_includeChildren !== false) {
    var i, subMenu;
    for (i = 0;i < this._subMenus.length;++i) {
      subMenu = this._subMenus[i];
      if (!subMenu.getStyle("max-height")) {
        subMenu.setMaxHeight(value);
      }
    }
  }
};
nova.ListMenu.prototype.setMenuHeight = nova.ListMenu.prototype.setMaxHeight;
nova.ListMenu.prototype.getMenuHeight = nova.ListMenu.prototype.getHeight;
nova.ListMenu.prototype.setModel = function(model) {
  this._deserialize(model);
};
nova.ListMenu.prototype.setItems = function(items) {
  while (this._items.length > 0) {
    this.removeItem(0);
  }
  this._items = [];
  if (items) {
    var i;
    for (i = 0;i < items.length;++i) {
      this.addItem(items[i]);
    }
  }
};
nova.ListMenu.prototype.getItems = function() {
  return this._items;
};
nova.ListMenu.prototype.addItem = function(item, opt_index) {
  var _this = this;
  if (!(item instanceof nova.MenuItem)) {
    if (!item["renderer"]) {
      if (item["renderFunction"]) {
        item["renderer"] = item["renderFunction"];
      } else {
        if (_this._itemRenderer) {
          item["renderer"] = _this._itemRenderer;
        }
      }
    }
    item = new nova.MenuItem(item);
  } else {
    if (_this._items.indexOf(item) >= 0) {
      return false;
    }
  }
  item.setMenu(_this, opt_index);
  return true;
};
nova.ListMenu.prototype.removeItem = function(indicator) {
  var index = -1;
  if (typeof indicator === "number") {
    index = indicator;
    indicator = this.getItem(index);
  } else {
    index = this.getItemIndex(indicator);
  }
  if (index < 0) {
    return false;
  }
  if (this._highlightedItem === indicator) {
    this._highlightedItem = null;
  }
  if (this._selectedItem === indicator) {
    this._selectedItem = null;
  }
  indicator.dispose();
  return true;
};
nova.ListMenu.prototype.hookItem = function(item, opt_index) {
  item.listen("itemHovered", this._onItemHovered);
  item.listen("itemClicked", this._onItemClicked);
  item.listen("itemContextMenu", this._onItemContextMenu);
  if (this.getItemIndex(item) < 0) {
    if (!goog.isDef(opt_index)) {
      opt_index = this.getItems().length;
    }
    this._items.splice(opt_index, 0, item);
  }
  var subMenu = item.getSubMenu();
  if (subMenu && this.getSubMenuIndex(subMenu) < 0) {
    this._subMenus.push(subMenu);
  }
};
nova.ListMenu.prototype.releaseItem = function(item) {
  item.unlistenAll();
  if (this.getItemIndex(item) >= 0) {
    this._items.splice(this.getItemIndex(item), 1);
  }
  var index = this.getSubMenuIndex(item.getSubMenu());
  if (index >= 0) {
    this._subMenus.splice(index, 1);
  }
};
nova.ListMenu.prototype.getItemIndex = function(item) {
  return this._items.indexOf(item);
};
nova.ListMenu.prototype.findItemIndex = nova.ListMenu.prototype.getItemIndex;
nova.ListMenu.prototype.getSubMenuIndex = function(subMenu) {
  var subMenus = this._subMenus;
  return subMenus && subMenu ? subMenus.indexOf(subMenu) : -1;
};
nova.ListMenu.prototype.getItem = function(index) {
  if (!nova.isNumber(index) || (index < 0 || index >= this._items.length)) {
    return null;
  }
  return this._items[index] || null;
};
nova.ListMenu.prototype.findItemByValue = function(value, opt_includeChildren) {
  var i, item, subMenu;
  for (i = 0;i < this._items.length;++i) {
    item = this._items[i];
    if (item.getValue() === value) {
      return item;
    }
    if (opt_includeChildren !== false) {
      subMenu = this._items[i].getSubMenu();
      if (subMenu) {
        item = subMenu.findItemByValue(value, true);
        if (item) {
          return item;
        }
      }
    }
  }
  return null;
};
nova.ListMenu.prototype.findTreeItemByValue = function(value) {
  return this.getRootMenu().findItemByValue(value, true);
};
nova.ListMenu.prototype.highlightItem = function(item) {
  if (item === this._highlightedItem) {
    return false;
  }
  var index;
  if (!goog.isNull(item)) {
    index = this.getItemIndex(item);
    switch(item.getType()) {
      case "separator":
        return false;
      default:
        if (!item.isVisible() || item.isDisabled()) {
          return false;
        }
      ;
    }
  }
  if (!goog.isNull(this._highlightedItem)) {
    this._highlightedItem.highlight(false);
  }
  this._highlightedItem = item;
  if (!goog.isNull(item)) {
    item.highlight();
    this._dispatch("itemHighlighted", {"item":item});
  }
  return true;
};
nova.ListMenu.prototype.setHighlightedItem = nova.ListMenu.prototype.highlightItem;
nova.ListMenu.prototype.getHighlightedItem = function() {
  return this._highlightedItem;
};
nova.ListMenu.prototype.highlightItemByIndex = function(index) {
  var item = this.getItem(index);
  return this.highlightItem(item);
};
nova.ListMenu.prototype.moveHighlightedItem = function(step, opt_index) {
  var items = this._items;
  var item, result;
  if (nova.isNumber(opt_index)) {
    if (opt_index < 0 || opt_index >= items.length) {
      opt_index = undefined;
    }
  }
  if (!goog.isDef(opt_index)) {
    opt_index = this.getItemIndex(this._highlightedItem);
    if (goog.isNull(opt_index)) {
      opt_index = -1;
    }
  }
  do {
    opt_index += step;
    if (opt_index < 0) {
      opt_index = items.length - 1;
    }
    if (opt_index >= items.length) {
      opt_index = 0;
    }
    item = items[opt_index];
  } while (!item.isVisible() || (item.isDisabled() || item.getType() === "separator"));
  result = this.highlightItem(item);
  this._scrollToItem(this._highlightedItem);
  return result;
};
nova.ListMenu.prototype.highlightPrevItem = function() {
  return this.moveHighlightedItem(-1);
};
nova.ListMenu.prototype.highlightNextItem = function() {
  return this.moveHighlightedItem(1);
};
nova.ListMenu.prototype.selectItem = function(item, opt_event, opt_includeChildren, opt_check) {
  var i, subItem, selectionType, prevSelectedItem, isSelectionChanged, result = 1;
  if (item) {
    selectionType = item.checkSelectionType();
    if (opt_check !== false) {
      if (!this._hasItem(item, true)) {
        return false;
      }
      if (selectionType < 1) {
        return false;
      }
    }
    if (this.getItemIndex(item) < 0) {
      result = -1;
    } else {
      result = selectionType;
    }
  }
  if (result !== 0 && result !== 2) {
    this.filterItems(null, false);
    prevSelectedItem = this._selectedItem;
    if (item !== prevSelectedItem) {
      isSelectionChanged = true;
      if (prevSelectedItem) {
        prevSelectedItem.select(false);
      }
      if (item) {
        item.select();
      }
      this._selectedItem = item;
    }
  }
  if (opt_event) {
    opt_event = {"eventType":opt_event["type"], "shiftKey":opt_event["shiftKey"], "ctrlKey":opt_event["ctrlKey"], "metaKey":opt_event["metaKey"], "altKey":opt_event["altKey"]};
  } else {
    opt_event = {};
  }
  opt_event["item"] = item;
  this._dispatch("itemActivated", opt_event);
  if (isSelectionChanged) {
    opt_event["prevSelectedItem"] = prevSelectedItem;
    this._dispatch("itemSelected", opt_event);
  }
  if (opt_includeChildren !== false) {
    if (selectionType !== 2 || !this._hasItem(item, false)) {
      subItem = result <= 0 ? item : null;
      for (i = 0;i < this._subMenus.length;++i) {
        if (this._subMenus[i].selectItem(subItem, opt_event, true, false)) {
          if (result < 1) {
            result = selectionType;
          }
        }
      }
    }
  }
  if (result < 1) {
    return false;
  }
  if (!this._parentItem) {
    prevSelectedItem = this._treeSelectedItem;
    this._treeSelectedItem = item;
    this._dispatch("treeItemActivated", opt_event);
    if (result === 1 && item !== prevSelectedItem) {
      opt_event["prevSelectedItem"] = prevSelectedItem;
      this._dispatch("treeItemSelected", opt_event);
    }
  }
  return true;
};
nova.ListMenu.prototype.setSelectedItem = nova.ListMenu.prototype.selectItem;
nova.ListMenu.prototype.getSelectedItem = function() {
  return this._selectedItem;
};
nova.ListMenu.prototype.selectItemByIndex = function(index) {
  var item = this.getItem(index);
  return this.selectItem(item);
};
nova.ListMenu.prototype.setSelectedIndex = nova.ListMenu.prototype.selectItemByIndex;
nova.ListMenu.prototype.getSelectedIndex = function() {
  return this.getItemIndex(this._selectedItem);
};
nova.ListMenu.prototype.selectTreeItem = function(item, opt_event) {
  return this.getRootMenu().selectItem(item, opt_event, true);
};
nova.ListMenu.prototype.getRootMenu = function() {
  if (this._parentItem) {
    var menu = this._parentItem.getMenu();
    if (menu) {
      return this._parentItem.getMenu().getRootMenu();
    }
  }
  return this;
};
nova.ListMenu.prototype.getTreeSelectedItem = function() {
  return this.getRootMenu()._treeSelectedItem;
};
nova.ListMenu.prototype.selectItemByValue = function(value, opt_includeChildren) {
  var item = this.findItemByValue(value, opt_includeChildren);
  return this.selectItem(item, null, opt_includeChildren);
};
nova.ListMenu.prototype.setSelectedValue = nova.ListMenu.prototype.selectItemByValue;
nova.ListMenu.prototype.getSelectedValue = function() {
  return this._selectedItem ? this._selectedItem.getValue() : null;
};
nova.ListMenu.prototype.selectTreeItemByValue = function(value) {
  var item = this.findTreeItemByValue(value);
  return item ? this.selectTreeItem(item) : false;
};
nova.ListMenu.prototype.getFirstAvailableItem = function(opt_startIndex) {
  if (!goog.isDef(opt_startIndex)) {
    opt_startIndex = 0;
  }
  var items = this.getItems();
  var i, item;
  for (i = opt_startIndex;i < items.length;++i) {
    item = items[i];
    if (item.isVisible() && (!item.isDisabled() && item.getType() !== "separator")) {
      return item;
    }
  }
  return null;
};
nova.ListMenu.prototype.filterItems = function(criteria, opt_includeChildren) {
  if (!criteria) {
    criteria = null;
  }
  var totalMatched = 0;
  var i, item, itemType, subMenu, isSubMatched, isMatched;
  this.enableClass("no-selected", !goog.isNull(criteria));
  for (i = 0;i < this._items.length;++i) {
    item = this._items[i];
    itemType = item.getType();
    isMatched = false;
    if (itemType === "default" || itemType === "command") {
      isMatched = item.matchCriteria(criteria) && !item.isDisabled();
      isSubMatched = false;
      subMenu = item.getSubMenu();
      if (subMenu) {
        isSubMatched = subMenu.filterItems(opt_includeChildren !== false ? criteria : null, true) > 0;
      }
      if (isSubMatched) {
        isMatched = true;
      }
      item.enableClass("has-child", isSubMatched === true);
    }
    item.show(!criteria || isMatched);
    if (isMatched) {
      ++totalMatched;
    }
  }
  this._filterCriteria = criteria;
  this._totalMatched = totalMatched;
  return totalMatched;
};
nova.ListMenu.prototype.filterTreeItems = function(criteria) {
  if (!criteria) {
    criteria = null;
  }
  if (criteria === this._filterCriteria) {
    return this._totalMatched ? this._totalMatched : this._items.length;
  }
  return this.getRootMenu().filterItems(criteria, true);
};
nova.ListMenu.prototype.getFilterCriteria = function() {
  return this._filterCriteria;
};
nova.ListMenu.prototype.setParentItem = function(item) {
  this._parentItem = item;
};
nova.ListMenu.prototype.getParentItem = function(item) {
  return this._parentItem;
};
nova.ListMenu.prototype.getList = function() {
  return this._list;
};
nova.ListMenu.prototype.getItemContainer = nova.ListMenu.prototype.getList;
nova.ListMenu.prototype.getSubMenus = function() {
  return this._subMenus;
};
nova.ListMenu.prototype.addSubMenu = function(subMenu) {
  if (!subMenu) {
    return;
  }
  var subMenus = this._subMenus;
  if (subMenus.indexOf(subMenu) < 0) {
    subMenus.push(subMenu);
  }
};
nova.ListMenu.prototype.removeSubMenu = function(subMenu) {
  if (!subMenu) {
    return;
  }
  var index = this._subMenus.indexOf(subMenu);
  if (index >= 0) {
    this._subMenus.splice(index, 1);
  }
};
nova.ListMenu.prototype._init = function(opt_element) {
  if (!opt_element) {
    opt_element = nova.createElement("div");
  }
  var temp;
  temp = new nova.ElementWrapper((opt_element));
  temp.addClass("nova-menu");
  temp.listen("keydown", this._onKeyDown);
  this._topNode = temp;
  temp = new nova.ElementWrapper(nova.createElement("ul"));
  temp.addClass("nova-list");
  temp.setParent(this._topNode);
  this._list = temp;
};
nova.ListMenu.prototype._deserialize = function(opt_model) {
  if (!opt_model) {
    return;
  }
  var itemRenderer = opt_model["itemRenderer"] || opt_model["itemRenderFunction"];
  if (itemRenderer) {
    this.setItemRenderer(itemRenderer, false);
  }
  var itemMatchingFunction = opt_model["itemMatchingFunction"];
  if (itemMatchingFunction) {
    this.setItemMatchingFunction(itemMatchingFunction, false);
  }
  var itemMatchingMaskFunction = opt_model["itemMatchingMaskFunction"];
  if (itemMatchingMaskFunction) {
    this.setItemMatchingMaskFunction(itemMatchingMaskFunction, false);
  }
  var items = opt_model["items"];
  if (items) {
    this.setItems(items);
  }
  var maxHeight = opt_model["maxHeight"] || opt_model["menuHeight"];
  if (maxHeight) {
    this.setMaxHeight(maxHeight, false);
  }
  var i, subMenu;
  for (i = 0;i < this._subMenus.length;++i) {
    subMenu = this._subMenus[i];
    if (!subMenu.getItemRenderer()) {
      subMenu.setItemRenderer(itemRenderer);
    }
    if (!subMenu.getStyle("max-height")) {
      subMenu.setMaxHeight(maxHeight);
    }
  }
};
nova.ListMenu.prototype._onKeyDown = function(event) {
  var keyCodes = nova.Event.KeyCodes;
  switch(event.keyCode) {
    case keyCodes.DOWN:
      this.moveHighlightedItem(1);
      event.preventDefault();
      break;
    case keyCodes.UP:
      this.moveHighlightedItem(-1);
      event.preventDefault();
      break;
    case keyCodes.ENTER:
      var item = this.getHighlightedItem();
      if (item) {
        this.selectTreeItem(item, event);
      }
      event.preventDefault();
      break;
    case keyCodes.BACKSPACE:
      event.preventDefault();
      break;
  }
};
nova.ListMenu.prototype._onItemHovered = function(event) {
  this._dispatch("itemHovered", event);
  var item = event["item"];
  this.highlightItem(item);
};
nova.ListMenu.prototype._onItemClicked = function(event) {
  this._dispatch("itemClicked", event);
  var item = event["item"];
  this.selectTreeItem(item, event);
};
nova.ListMenu.prototype._onItemContextMenu = function(event) {
  this._dispatch("itemContextMenu", event);
};
nova.ListMenu.prototype._hasItem = function(item, opt_includeChildren) {
  if (this.getItemIndex(item) >= 0) {
    return true;
  }
  var i;
  if (opt_includeChildren !== false) {
    for (i = 0;i < this._subMenus.length;++i) {
      if (this._subMenus[i]._hasItem(item)) {
        return true;
      }
    }
  }
  return false;
};
nova.ListMenu.prototype._scrollToItem = function(item) {
  var element = item.getElement();
  if (goog.isNull(element)) {
    return;
  }
  var itemTop = element.offsetTop;
  var itemHeight = element.offsetHeight;
  var itemBottom = itemTop + itemHeight;
  var menuTop = this._topNode.getScrollTop();
  var menuHeight = this._topNode.getHeight();
  var menuBottom = menuTop + menuHeight;
  if (menuTop < itemTop && menuBottom > itemBottom) {
    return;
  }
  var topNodeElement = this._topNode.getElement();
  if (menuTop > itemTop) {
    topNodeElement.scrollTop = itemTop;
  } else {
    if (itemTop - menuBottom < itemHeight) {
      topNodeElement.scrollTop = itemBottom - menuHeight;
    }
  }
};
nova.ListMenu.prototype._items = null;
nova.ListMenu.prototype._subMenus = null;
nova.ListMenu.prototype._parentItem = null;
nova.ListMenu.prototype._highlightedItem = null;
nova.ListMenu.prototype._selectedItem = null;
nova.ListMenu.prototype._treeSelectedItem = null;
nova.ListMenu.prototype._filterCriteria = null;
nova.ListMenu.prototype._itemRenderer = null;
nova.ListMenu.prototype._itemMatchingFunction = null;
nova.ListMenu.prototype._itemMatchingMaskFunction = null;
nova.ListMenu.prototype._totalMatched = null;
nova.ListMenu.prototype._list = null;
goog.exportSymbol("nova.ListMenu", nova.ListMenu);
nova.ListMenu._proto = nova.ListMenu.prototype;
goog.exportProperty(nova.ListMenu._proto, "dispose", nova.ListMenu._proto.dispose);
goog.exportProperty(nova.ListMenu._proto, "focus", nova.ListMenu._proto.focus);
goog.exportProperty(nova.ListMenu._proto, "setItemRenderer", nova.ListMenu._proto.setItemRenderer);
goog.exportProperty(nova.ListMenu._proto, "setItemMatchingFunction", nova.ListMenu._proto.setItemMatchingFunction);
goog.exportProperty(nova.ListMenu._proto, "setItemMatchingMaskFunction", nova.ListMenu._proto.setItemMatchingMaskFunction);
goog.exportProperty(nova.ListMenu._proto, "setMaxHeight", nova.ListMenu._proto.setMaxHeight);
goog.exportProperty(nova.ListMenu._proto, "getMenuHeight", nova.ListMenu._proto.getMenuHeight);
goog.exportProperty(nova.ListMenu._proto, "setMenuHeight", nova.ListMenu._proto.setMenuHeight);
goog.exportProperty(nova.ListMenu._proto, "setModel", nova.ListMenu._proto.setModel);
goog.exportProperty(nova.ListMenu._proto, "setItems", nova.ListMenu._proto.setItems);
goog.exportProperty(nova.ListMenu._proto, "getItems", nova.ListMenu._proto.getItems);
goog.exportProperty(nova.ListMenu._proto, "addItem", nova.ListMenu._proto.addItem);
goog.exportProperty(nova.ListMenu._proto, "removeItem", nova.ListMenu._proto.removeItem);
goog.exportProperty(nova.ListMenu._proto, "getItemIndex", nova.ListMenu._proto.getItemIndex);
goog.exportProperty(nova.ListMenu._proto, "findItemIndex", nova.ListMenu._proto.findItemIndex);
goog.exportProperty(nova.ListMenu._proto, "getItem", nova.ListMenu._proto.getItem);
goog.exportProperty(nova.ListMenu._proto, "findItemByValue", nova.ListMenu._proto.findItemByValue);
goog.exportProperty(nova.ListMenu._proto, "findTreeItemByValue", nova.ListMenu._proto.findTreeItemByValue);
goog.exportProperty(nova.ListMenu._proto, "highlightItem", nova.ListMenu._proto.highlightItem);
goog.exportProperty(nova.ListMenu._proto, "setHighlightedItem", nova.ListMenu._proto.setHighlightedItem);
goog.exportProperty(nova.ListMenu._proto, "getHighlightedItem", nova.ListMenu._proto.getHighlightedItem);
goog.exportProperty(nova.ListMenu._proto, "highlightItemByIndex", nova.ListMenu._proto.highlightItemByIndex);
goog.exportProperty(nova.ListMenu._proto, "moveHighlightedItem", nova.ListMenu._proto.moveHighlightedItem);
goog.exportProperty(nova.ListMenu._proto, "selectItem", nova.ListMenu._proto.selectItem);
goog.exportProperty(nova.ListMenu._proto, "setSelectedItem", nova.ListMenu._proto.setSelectedItem);
goog.exportProperty(nova.ListMenu._proto, "getSelectedItem", nova.ListMenu._proto.getSelectedItem);
goog.exportProperty(nova.ListMenu._proto, "selectItemByIndex", nova.ListMenu._proto.selectItemByIndex);
goog.exportProperty(nova.ListMenu._proto, "setSelectedIndex", nova.ListMenu._proto.setSelectedIndex);
goog.exportProperty(nova.ListMenu._proto, "getSelectedIndex", nova.ListMenu._proto.getSelectedIndex);
goog.exportProperty(nova.ListMenu._proto, "selectItemByValue", nova.ListMenu._proto.selectItemByValue);
goog.exportProperty(nova.ListMenu._proto, "setSelectedValue", nova.ListMenu._proto.setSelectedValue);
goog.exportProperty(nova.ListMenu._proto, "getSelectedValue", nova.ListMenu._proto.getSelectedValue);
goog.exportProperty(nova.ListMenu._proto, "selectTreeItem", nova.ListMenu._proto.selectTreeItem);
goog.exportProperty(nova.ListMenu._proto, "getTreeSelectedItem", nova.ListMenu._proto.getTreeSelectedItem);
goog.exportProperty(nova.ListMenu._proto, "selectTreeItemByValue", nova.ListMenu._proto.selectTreeItemByValue);
goog.exportProperty(nova.ListMenu._proto, "filterItems", nova.ListMenu._proto.filterItems);
goog.exportProperty(nova.ListMenu._proto, "filterTreeItems", nova.ListMenu._proto.filterTreeItems);
goog.exportProperty(nova.ListMenu._proto, "getFilterCriteria", nova.ListMenu._proto.getFilterCriteria);
goog.exportProperty(nova.ListMenu._proto, "getList", nova.ListMenu._proto.getItemContainer);
goog.exportProperty(nova.ListMenu._proto, "getItemContainer", nova.ListMenu._proto.getItemContainer);
goog.provide("nova.Popup");
goog.require("nova");
goog.require("nova.res");
goog.require("nova.IElementControl");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
nova.Popup = function(opt_initializer, opt_model) {
  var _this = this;
  var res = nova.res;
  _this._addEvent(res.shown);
  _this._addEvent(res.hidden);
  _this._addEvent("clickedOutside");
  _this._manageVisibility = _this._manageVisibility.bind(_this);
  _this._managePosition = _this._managePosition.bind(_this);
  _this._onClickOverlay = _this._onClickOverlay.bind(_this);
  if (!_this._defaultPinMap) {
    _this._defaultPinMap = {"left":res.right, "right":res.left, "top":res.bottom, "bottom":res.top, "center":"center", "top-left":res.bottom + "-" + res.left, "top-right":res.bottom + "-" + res.right, "bottom-left":res.top + "-" + res.left, "bottom-right":res.top + "-" + res.right};
    nova.Popup.prototype._defaultPinMap = _this._defaultPinMap;
  }
  if (opt_initializer && !nova.isElement(opt_initializer)) {
    opt_model = opt_initializer;
    opt_initializer = undefined;
  }
  _this._init((opt_initializer));
  _this._deserialize(opt_model);
};
goog.inherits(nova.Popup, nova.ElementControl);
nova.Popup.Anchor;
nova.Popup.Placement;
nova.Popup.Pin;
nova.Popup.prototype.dispose = function() {
  var _this = this;
  _this.unlistenAll();
  window.removeEventListener("resize", _this._managePosition, false);
  _this._overlay.dispose();
  _this._topNode.dispose();
};
nova.Popup.prototype.setContent = function(content) {
  var _this = this;
  if (typeof content === nova.res.string || nova.isElement(content)) {
    _this._contentWrapper.addClass("visual");
    return _this._contentWrapper.setContent(content);
  } else {
    _this._contentWrapper = (content);
    _this._contentWrapper.addClass("nova-popup-content");
    return _this._topNode.setContent(content);
  }
};
nova.Popup.prototype.addContent = function(content) {
  return this._contentWrapper.addContent(content);
};
nova.Popup.prototype.updatePosition = function() {
  this._managePosition();
};
nova.Popup.prototype.setPosition = function(param) {
  var anchor = param["anchor"], pin = param["pin"], offset = param["offset"], _this = this;
  if (anchor) {
    _this.setAnchor(anchor);
  }
  if (pin) {
    _this.setPin(pin["anchor"], pin["self"]);
  }
  if (offset) {
    _this.setOffset(offset);
  }
};
nova.Popup.prototype.setAnchor = function(anchor) {
  this._anchor = anchor;
  return true;
};
nova.Popup.prototype.getAnchor = function() {
  return this._anchor;
};
nova.Popup.prototype.setPin = function(anchorPin, selfPin) {
  var validPins = ["left", "right", "top", "bottom", "center", "top-left", "top-right", "bottom-left", "bottom-right"], _this = this;
  if (!anchorPin && !selfPin) {
    return false;
  }
  if (!goog.isNull(_this._pin) && (anchorPin === _this._pin.anchor && selfPin === _this._pin.self)) {
    return false;
  }
  if (anchorPin && validPins.indexOf(anchorPin) < 0) {
    return false;
  }
  if (selfPin && validPins.indexOf(selfPin) < 0) {
    return false;
  }
  if (!_this._pin) {
    _this._pin = {anchor:null, self:null};
  }
  if (anchorPin) {
    _this._pin.anchor = anchorPin;
  }
  if (selfPin) {
    _this._pin.self = selfPin;
  }
  return true;
};
nova.Popup.prototype.getPin = function() {
  var _this = this;
  if (_this._pin) {
    return{"anchor":_this._pin.anchor ? _this._pin.anchor : null, "self":_this._pin.self ? _this._pin.self : null};
  }
  return null;
};
nova.Popup.prototype.setAlignment = function(alignment) {
  if (!alignment) {
    return false;
  }
  var points = alignment.split(" "), anchorPin = points[0], selfPin = points[1], _this = this;
  anchorPin = _this._toSpinalCase(anchorPin);
  selfPin = _this._toSpinalCase(selfPin);
  return _this.setPin(anchorPin, selfPin);
};
nova.Popup.prototype.getAlignment = function() {
  return this._pin & this._pin.anchor ? this._pin.anchor : "default";
};
nova.Popup.prototype.setOffset = function(opt_x, opt_y) {
  var _this = this;
  if (goog.isNull(_this._offset)) {
    _this._offset = {x:0, y:0};
  }
  if (goog.isDefAndNotNull(opt_x)) {
    _this._offset.x = opt_x;
  }
  if (goog.isDefAndNotNull(opt_y)) {
    _this._offset.y = opt_y;
  }
};
nova.Popup.prototype.getOffset = function() {
  return this._offset;
};
nova.Popup.prototype.show = function(opt_show, opt_dispatch) {
  var _this = this;
  opt_show = opt_show !== false;
  if (opt_show === _this.isVisible()) {
    return;
  }
  var topNode = _this._topNode;
  var overlay = _this._overlay;
  var eventType;
  if (opt_show) {
    eventType = "shown";
    var documentBody = document.body;
    topNode.addClass("visible");
    topNode.addClass("transition");
    if (_this.isAutoHide() || _this.isModal()) {
      overlay.setParent(documentBody);
    }
    topNode.setParent(documentBody);
    _this._managePosition();
  } else {
    eventType = "hidden";
    topNode.removeClass("visible");
    topNode.addClass("transition");
  }
  if (_this.getTransition()) {
    var duration = opt_show ? 0 : _this.getTransitionDuration();
    setTimeout(function() {
      _this._manageVisibility((opt_show));
    }, duration);
  } else {
    _this._manageVisibility((opt_show));
  }
  if (opt_dispatch !== false) {
    _this._dispatch(eventType, {});
  }
};
nova.Popup.prototype.hide = function(opt_hide, opt_dispatch) {
  this.show(opt_hide === false, opt_dispatch);
};
nova.Popup.prototype.isVisible = function() {
  return this._topNode.hasClass("visible");
};
nova.Popup.prototype.isShown = nova.Popup.prototype.isVisible;
nova.Popup.prototype.setModal = function(opt_value) {
  this._overlay.enableClass("modal", opt_value !== false);
};
nova.Popup.prototype.isModal = function() {
  return this._overlay.hasClass("modal");
};
nova.Popup.prototype.setAutoHide = function(opt_value) {
  this._overlay.enableClass("autohide", opt_value !== false);
};
nova.Popup.prototype.isAutoHide = function() {
  return this._overlay.hasClass("autohide");
};
nova.Popup.prototype.setAutoReposition = function(opt_value) {
  this._autoReposition = opt_value !== false;
};
nova.Popup.prototype.isAutoReposition = function() {
  return this._autoReposition;
};
nova.Popup.prototype.setAutoResize = function(opt_value) {
  this._autoResize = opt_value !== false;
  if (!this._autoResize) {
    this._clearMaxHeight();
  }
};
nova.Popup.prototype.isAutoResize = function() {
  return this._autoResize;
};
nova.Popup.prototype.setTransition = function(transition) {
  if (transition) {
    this.setAttribute("data-transition", transition);
  } else {
    this.removeAttribute("data-transition");
  }
};
nova.Popup.prototype.getTransition = function() {
  return this.getAttribute("data-transition");
};
nova.Popup.prototype.getTransitionDuration = function() {
  return this.getTransition() ? this._transitionDuration : 0;
};
nova.Popup.prototype.setMinWidth = function(value) {
  if (nova.isNumber(value)) {
    if (value < 0) {
      value = "";
    } else {
      value += "px";
    }
  }
  this._contentWrapper.setStyle("min-width", (value));
};
nova.Popup.prototype.setMaxHeight = function(value, opt_store) {
  if (nova.isNumber(value)) {
    if (value < 0) {
      value = "";
    } else {
      value += "px";
    }
  }
  this._contentWrapper.setStyle("max-height", (value));
  if (opt_store !== false) {
    this._maxHeight = (value);
  }
};
nova.Popup.prototype.getMaxHeight = function() {
  return this._contentWrapper.getStyle("max-height");
};
nova.Popup.prototype.getOverlay = function() {
  return this._overlay;
};
nova.Popup.prototype._init = function(opt_element) {
  var element, res = nova.res, _this = this;
  element = nova.createElement(res.div);
  _this._topNode = new nova.ElementWrapper(element);
  _this._topNode.addClass("nova-popup");
  _this._topNode.addClass("customvisual");
  if (!document.body.classList.contains("nova")) {
    _this._topNode.addClass("nova");
    _this._topNode.addClass("charcoal");
  }
  if (!opt_element) {
    opt_element = nova.createElement(res.div);
  }
  _this._contentWrapper = new nova.ElementWrapper(opt_element);
  _this._contentWrapper.addClass("nova-popup-content");
  _this._contentWrapper.addClass("visual");
  _this._contentWrapper.setParent(_this._topNode);
  element = nova.createElement("svg");
  _this._overlay = new nova.ElementWrapper(element);
  _this._overlay.addClass("nova-popup-overlay");
  _this._overlay.listen(nova.res.mousedown, _this._onClickOverlay);
  window.addEventListener("resize", _this._managePosition, false);
};
nova.Popup.prototype._deserialize = function(opt_model) {
  if (!opt_model) {
    opt_model = {};
  }
  var pref, anchorPin, selfPin, offsetX, offsetY, _this = this;
  _this.setAutoHide(opt_model["autoHide"] !== false);
  if (opt_model["disableDefaultStyle"] === true) {
    _this._contentWrapper.removeClass("visual");
  }
  pref = opt_model["autoReposition"];
  if (goog.isDefAndNotNull(pref)) {
    _this.setAutoReposition(pref);
  }
  pref = opt_model["autoResize"];
  if (goog.isDef(pref)) {
    _this.setAutoResize(pref);
  }
  pref = opt_model["transition"];
  if (goog.isDef(pref)) {
    _this.setTransition(pref);
  }
  pref = opt_model["modal"];
  if (goog.isDefAndNotNull(opt_model["modal"])) {
    _this.setModal(pref);
  }
  pref = opt_model["anchor"];
  _this.setAnchor(pref ? pref : null);
  pref = opt_model["alignment"];
  if (goog.isDefAndNotNull(pref)) {
    _this.setAlignment(pref);
  }
  pref = opt_model["pin"];
  if (pref) {
    _this.setPin(pref["anchor"], pref["self"]);
  } else {
    if (goog.isDefAndNotNull(anchorPin = opt_model["anchorPin"]) || goog.isDefAndNotNull(selfPin = opt_model["selfPin"])) {
      _this.setPin(anchorPin, selfPin);
    }
  }
  pref = opt_model["offset"];
  if (pref) {
    _this.setOffset(pref["x"], pref["y"]);
  } else {
    if (goog.isDefAndNotNull(offsetX = opt_model["offsetX"]) || goog.isDefAndNotNull(offsetY = opt_model["offsetY"])) {
      _this.setOffset(offsetX, offsetY);
    }
  }
  pref = opt_model["show"];
  if (goog.isDefAndNotNull(pref)) {
    _this.show(pref);
  }
};
nova.Popup.prototype._onClickOverlay = function() {
  var _this = this;
  if (_this.isAutoHide()) {
    _this.hide(true);
    _this._dispatch("clickedOutside", {});
  }
};
nova.Popup.prototype._manageVisibility = function(show) {
  var topNode = this._topNode;
  if (!topNode.getElement()) {
    return;
  }
  if (show !== this.isVisible()) {
    return;
  }
  if (!show) {
    var overlay = this._overlay;
    if (overlay) {
      overlay.setParent(null);
    }
    topNode.setParent(null);
  }
  topNode.removeClass("transition");
};
nova.Popup.prototype._managePosition = function() {
  var _this = this, res = nova.res, anchor = _this._anchor, anchorType = _this._checkAnchorType(anchor), winX = window.pageXOffset, winY = window.pageYOffset, winW = window.innerWidth, winH = window.innerHeight, winRight = winX + winW, winBottom = winY + winH, selfWidth = _this.getWidth(), selfHeight = _this.getHeight(), expandDownward = true, forceFlip = false, x, y, elemX, elemY, elemRight, elemBottom, anchorPin, selfPin, pos, maxHeight, leftGap, rightGap, topGap, bottomGap;
  if (_this._pin) {
    anchorPin = _this._pin.anchor;
    selfPin = _this._pin.self;
  }
  if (!anchorPin) {
    if (anchorType === 0) {
      anchorPin = "center";
    } else {
      if (anchorType === 1) {
        anchorPin = {"x":0, "y":0};
      } else {
        anchorPin = res.bottom + "-" + res.left;
      }
    }
  }
  if (!selfPin) {
    if (anchorType === 0) {
      selfPin = anchorPin;
    } else {
      if (anchorType === 1) {
        selfPin = res.top + "-" + res.left;
      } else {
        selfPin = _this._defaultPinMap[(anchorPin)];
      }
    }
  }
  if (anchorType === 0) {
    if (anchorPin.indexOf(res.left) >= 0) {
      x = winX;
    } else {
      if (anchorPin.indexOf(res.right) >= 0) {
        x = winRight;
      } else {
        if (anchorPin.indexOf("-") < 0) {
          x = winX + winW / 2;
        }
      }
    }
    if (anchorPin.indexOf(res.top) >= 0) {
      y = winY;
    } else {
      if (anchorPin.indexOf(res.bottom) >= 0) {
        y = winBottom;
      } else {
        if (anchorPin.indexOf("-") < 0) {
          y = winY + winH / 2;
        }
      }
    }
  } else {
    if (anchorType === 1) {
      x = anchor["x"];
      y = anchor["y"];
    } else {
      if (nova.isFunction(anchor["getElement"])) {
        anchor = anchor["getElement"]();
      }
      pos = nova.getRelativePosition(anchor, document.body.parentElement);
      elemX = pos["x"];
      elemY = pos["y"];
      elemRight = elemX + anchor.offsetWidth, elemBottom = elemY + anchor.offsetHeight;
      if (anchorPin.indexOf(res.left) >= 0) {
        x = elemX;
      } else {
        if (anchorPin.indexOf(res.right) >= 0) {
          x = elemRight;
        } else {
          if (anchorPin.indexOf("-") < 0) {
            x = elemX + anchor.offsetWidth / 2;
          }
        }
      }
      if (anchorPin.indexOf(res.top) >= 0) {
        y = elemY;
      } else {
        if (anchorPin.indexOf(res.bottom) >= 0) {
          y = elemBottom;
        } else {
          if (anchorPin.indexOf("-") < 0) {
            y = elemY + anchor.offsetHeight / 2;
          }
        }
      }
    }
  }
  if (this._autoResize) {
    _this._clearMaxHeight();
  }
  if (selfPin.indexOf(res.left) < 0) {
    if (selfPin.indexOf(res.right) >= 0) {
      x -= selfWidth;
    } else {
      if (selfPin.indexOf("-") < 0) {
        x -= selfWidth / 2;
      }
    }
  }
  if (selfPin.indexOf(res.top) < 0) {
    if (selfPin.indexOf(res.bottom) >= 0) {
      expandDownward = false;
      y -= selfHeight;
    } else {
      if (selfPin.indexOf("-") < 0) {
        y -= selfHeight / 2;
      }
    }
  }
  if (_this._offset) {
    x += _this._offset.x;
    y += _this._offset.y;
  }
  leftGap = elemRight - winX;
  rightGap = winRight - elemX;
  topGap = elemY - winY;
  bottomGap = winBottom - elemBottom;
  if (_this._autoReposition) {
    if (anchorType === 0 || anchorType === 1) {
      if (x < winX) {
        x = winX;
      } else {
        if (x + selfWidth > winRight && selfWidth < winW) {
          x = winRight - selfWidth;
        }
      }
      if (y < winY) {
        y = winY;
      } else {
        if (y + selfHeight > winBottom && selfHeight < winH) {
          y = winBottom - selfHeight;
        }
      }
    } else {
      if (x < winX && rightGap >= leftGap) {
        x = elemX;
      } else {
        if (x + selfWidth > winRight && leftGap >= rightGap) {
          if (selfWidth < winW) {
            x = elemRight - selfWidth;
          } else {
            x = winX;
          }
        }
      }
      if (y < winY) {
        forceFlip = true;
        expandDownward = !_this._autoResize || bottomGap >= topGap;
      } else {
        if (y + selfHeight > winBottom) {
          forceFlip = true;
          expandDownward = _this._autoResize && bottomGap >= topGap;
        }
      }
      if (forceFlip) {
        if (_this._autoResize || selfHeight < winH) {
          y = expandDownward ? elemBottom : elemY - selfHeight;
        } else {
          y = winY;
          expandDownward = true;
        }
      }
    }
  }
  if (_this._autoResize) {
    if (expandDownward) {
      if (y + selfHeight > winBottom) {
        maxHeight = winBottom - y - 8;
        if (maxHeight < 32) {
          maxHeight = 32;
        }
        _this.setMaxHeight(maxHeight, false);
      }
    } else {
      if (winY > y) {
        if (elemY === undefined) {
          elemY = y;
        }
        maxHeight = elemY - winY - 10;
        y = winY + 8;
        _this.setMaxHeight(maxHeight, false);
      }
    }
  }
  _this._topNode.setLeft(x);
  _this._topNode.setTop(y);
};
nova.Popup.prototype._checkAnchorType = function(anchor) {
  if (!anchor) {
    return 0;
  } else {
    if (anchor["x"] && anchor["y"]) {
      return 1;
    } else {
      if (nova.isElement(anchor)) {
        return 2;
      } else {
        return 3;
      }
    }
  }
};
nova.Popup.prototype._clearMaxHeight = function() {
  this.setMaxHeight(this._maxHeight || "");
};
nova.Popup.prototype._toSpinalCase = function(camel) {
  var res = nova.res, map = {"topLeft":res.top + "-" + res.left, "topRight":res.top + "-" + res.right, "bottomLeft":res.bottom + "-" + res.left, "bottomRight":res.bottom + "-" + res.right}, spinal = map[camel];
  return spinal ? spinal : camel;
};
nova.Popup.prototype._anchor = null;
nova.Popup.prototype._pin = null;
nova.Popup.prototype._offset = null;
nova.Popup.prototype._contentWrapper = null;
nova.Popup.prototype._overlay = null;
nova.Popup.prototype._autoReposition = true;
nova.Popup.prototype._autoResize = true;
nova.Popup.prototype._transitionDuration = 200;
nova.Popup.prototype._maxHeight = "";
nova.Popup.prototype._defaultPinMap = null;
goog.exportSymbol("nova.Popup", nova.Popup);
nova.Popup._proto = nova.Popup.prototype;
goog.exportProperty(nova.Popup._proto, "dispose", nova.Popup._proto.dispose);
goog.exportProperty(nova.Popup._proto, "show", nova.Popup._proto.show);
goog.exportProperty(nova.Popup._proto, "hide", nova.Popup._proto.hide);
goog.exportProperty(nova.Popup._proto, "isVisible", nova.Popup._proto.isVisible);
goog.exportProperty(nova.Popup._proto, "isShown", nova.Popup._proto.isShown);
goog.exportProperty(nova.Popup._proto, "setContent", nova.Popup._proto.setContent);
goog.exportProperty(nova.Popup._proto, "updatePosition", nova.Popup._proto.updatePosition);
goog.exportProperty(nova.Popup._proto, "setPosition", nova.Popup._proto.setPosition);
goog.exportProperty(nova.Popup._proto, "setAnchor", nova.Popup._proto.setAnchor);
goog.exportProperty(nova.Popup._proto, "getAnchor", nova.Popup._proto.getAnchor);
goog.exportProperty(nova.Popup._proto, "setPin", nova.Popup._proto.setPin);
goog.exportProperty(nova.Popup._proto, "getPin", nova.Popup._proto.getPin);
goog.exportProperty(nova.Popup._proto, "setAlignment", nova.Popup._proto.setAlignment);
goog.exportProperty(nova.Popup._proto, "getAlignment", nova.Popup._proto.getAlignment);
goog.exportProperty(nova.Popup._proto, "setOffset", nova.Popup._proto.setOffset);
goog.exportProperty(nova.Popup._proto, "getOffset", nova.Popup._proto.getOffset);
goog.exportProperty(nova.Popup._proto, "setModal", nova.Popup._proto.setModal);
goog.exportProperty(nova.Popup._proto, "isModal", nova.Popup._proto.isModal);
goog.exportProperty(nova.Popup._proto, "setAutoHide", nova.Popup._proto.setAutoHide);
goog.exportProperty(nova.Popup._proto, "isAutoHide", nova.Popup._proto.isAutoHide);
goog.exportProperty(nova.Popup._proto, "setAutoReposition", nova.Popup._proto.setAutoReposition);
goog.exportProperty(nova.Popup._proto, "isAutoReposition", nova.Popup._proto.isAutoReposition);
goog.exportProperty(nova.Popup._proto, "setAutoResize", nova.Popup._proto.setAutoResize);
goog.exportProperty(nova.Popup._proto, "isAutoResize", nova.Popup._proto.isAutoResize);
goog.exportProperty(nova.Popup._proto, "setTransition", nova.Popup._proto.setTransition);
goog.exportProperty(nova.Popup._proto, "getTransition", nova.Popup._proto.getTransition);
goog.exportProperty(nova.Popup._proto, "getTransitionDuration", nova.Popup._proto.getTransitionDuration);
goog.exportProperty(nova.Popup._proto, "setMinWidth", nova.Popup._proto.setMinWidth);
goog.exportProperty(nova.Popup._proto, "setMaxHeight", nova.Popup._proto.setMaxHeight);
goog.exportProperty(nova.Popup._proto, "getMaxHeight", nova.Popup._proto.getMaxHeight);
goog.exportProperty(nova.Popup._proto, "getOverlay", nova.Popup._proto.getOverlay);
goog.provide("nova.PopupMenu");
goog.require("nova");
goog.require("nova.Event.KeyCodes");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
goog.require("nova.Popup");
goog.require("nova.ListMenu");
goog.require("nova.MenuItem");
nova.PopupMenu = function(opt_initializer, opt_model) {
  var _this = this;
  _this._addEvent("itemHighlighted");
  _this._addEvent("itemActivated");
  _this._addEvent("itemSelected");
  _this._addEvent("treeItemActivated");
  _this._addEvent("treeItemSelected");
  _this._addEvent("treeHidden");
  _this._addEvent("childShown");
  _this._addEvent("childHidden");
  _this._onChildShown = _this._onChildShown.bind(_this);
  _this._onChildHidden = _this._onChildHidden.bind(_this);
  _this._onKeyDown = _this._onKeyDown.bind(_this);
  _this._onItemHovered = _this._onItemHovered.bind(_this);
  _this._onItemHighlighted = _this._onItemHighlighted.bind(_this);
  _this._onItemActivated = _this._onItemActivated.bind(_this);
  _this._onItemSelected = _this._onItemSelected.bind(_this);
  _this._onTreeItemActivated = _this._onTreeItemActivated.bind(_this);
  _this._onTreeItemSelected = _this._onTreeItemSelected.bind(_this);
  goog.base(this, opt_initializer, opt_model);
};
goog.inherits(nova.PopupMenu, nova.Popup);
nova.PopupMenu.prototype.dispose = function() {
  this.disposeChildren();
  var menu = this._menu;
  if (menu) {
    menu.dispose();
  }
  goog.base(this, "dispose");
};
nova.PopupMenu.prototype.disposeChildren = function() {
  var child = this._child;
  if (child) {
    child.dispose();
    this._child = null;
  }
};
nova.PopupMenu.prototype.focus = function(opt_focused) {
  var menu = this._menu;
  if (menu) {
    menu.focus(opt_focused);
  }
};
nova.PopupMenu.prototype.show = function(opt_shown) {
  goog.base(this, "show", opt_shown);
  var creator = this._creator;
  var menu = this._menu;
  if (opt_shown !== false) {
    if (creator) {
      this.setAutoResize(creator.isAutoResize());
    }
    this._managePosition();
    if (menu && this._handleKeyDown) {
      menu.focus();
    }
  } else {
    if (menu && !creator) {
      menu.setHighlightedItem(null);
    }
    this.hideChild();
  }
};
nova.PopupMenu.prototype.showChild = function() {
  var item, subMenu, child;
  if (this._menu) {
    item = this._menu.getHighlightedItem();
    if (item && item.hasClass("has-child")) {
      subMenu = item.getSubMenu();
    }
  }
  if (subMenu) {
    child = this._child;
    if (child) {
      child.hideChild();
    } else {
      child = new nova.PopupMenu;
      child.setCreator(this);
      child.setAutoHide(false);
      child.setPin("top-right", "top-left");
      child.listen("shown", this._onChildShown);
      child.listen("hidden", this._onChildHidden);
      this._child = child;
    }
    child.setMenu(subMenu);
    child.setAnchor(item);
    child.show();
    child.updatePosition();
    subMenu.highlightItem(null);
  }
  this._hoveredItem = null;
};
nova.PopupMenu.prototype.hideChild = function() {
  var child = this._child;
  if (child) {
    child.hide();
  }
};
nova.PopupMenu.prototype.hideTree = function() {
  var creator = this._creator;
  if (creator) {
    creator.hideTree();
  }
  this.hide();
  this._dispatch("treeHidden", {});
};
nova.PopupMenu.prototype.setMenu = function(menu) {
  var _this, prevMenu, menuMaxHeight;
  _this = this;
  prevMenu = _this._menu;
  _this._topNode.addClass("customvisual");
  if (menu === _this._menu) {
    return;
  } else {
    if (!menu) {
      menu = null;
    }
  }
  if (prevMenu && prevMenu.getElement()) {
    prevMenu.unlisten("itemHovered", _this._onItemHovered);
    prevMenu.unlisten("itemHighlighted", _this._onItemHighlighted);
    prevMenu.unlisten("treeItemActivated", _this._onTreeItemActivated);
    prevMenu.unlisten("treeItemSelected", _this._onTreeItemSelected);
    prevMenu.unlisten("keydown", _this._onKeyDown);
    if (prevMenu.getElement()) {
      prevMenu.setParent(null);
    }
  }
  if (menu) {
    if (!(menu instanceof nova.ListMenu)) {
      menu = new nova.ListMenu(menu);
    }
    _this.setContent(menu);
    menu.setHighlightedItem(null);
    menu.listen("itemHovered", _this._onItemHovered);
    menu.listen("itemHighlighted", _this._onItemHighlighted);
    menu.listen("itemActivated", _this._onItemActivated);
    menu.listen("itemSelected", _this._onItemSelected);
    menu.listen("treeItemActivated", _this._onTreeItemActivated);
    menu.listen("treeItemSelected", _this._onTreeItemSelected);
    if (_this._handleKeyDown) {
      menu.listen("keydown", _this._onKeyDown);
    }
    menuMaxHeight = menu.getStyle("max-height");
    if (menuMaxHeight) {
      _this.setMaxHeight(menuMaxHeight);
    }
  }
  _this._menu = menu;
};
nova.PopupMenu.prototype.getMenu = function() {
  return this._menu;
};
nova.PopupMenu.prototype.setCreator = function(creator) {
  this._creator = creator;
};
nova.PopupMenu.prototype.getCreator = function() {
  return this._creator;
};
nova.PopupMenu.prototype.findItemByValue = function(value) {
  var menu = this._menu;
  return menu ? menu.findItemByValue(value) : null;
};
nova.PopupMenu.prototype.findTreeItemByValue = function(value) {
  var menu = this._menu;
  return menu ? menu.findTreeItemByValue(value) : null;
};
nova.PopupMenu.prototype.selectItem = function(item) {
  var menu = this._menu;
  return menu ? menu.selectItem(item) : false;
};
nova.PopupMenu.prototype.setSelectedItem = nova.PopupMenu.prototype.selectItem;
nova.PopupMenu.prototype.getSelectedItem = function() {
  var menu = this._menu;
  return menu ? menu.getSelectedItem() : null;
};
nova.PopupMenu.prototype.selectItemByValue = function(value) {
  var menu = this._menu;
  return menu ? menu.selectItemByValue(value) : false;
};
nova.PopupMenu.prototype.setSelectedValue = nova.PopupMenu.prototype.selectItemByValue;
nova.PopupMenu.prototype.getSelectedValue = function() {
  var menu = this._menu;
  return menu ? menu.getSelectedValue() : null;
};
nova.PopupMenu.prototype.selectTreeItem = function(item) {
  var menu = this._menu;
  return menu ? menu.selectTreeItem(item) : false;
};
nova.PopupMenu.prototype.getTreeSelectedItem = function() {
  var menu = this._menu;
  return menu ? menu.getTreeSelectedItem() : null;
};
nova.PopupMenu.prototype.selectTreeItemByValue = function(value) {
  var menu = this._menu;
  return menu ? menu.selectTreeItemByValue(value) : false;
};
nova.PopupMenu.prototype.filterTreeItems = function(criteria) {
  var totalMatched = this._menu ? this._menu.filterTreeItems(criteria) : 0;
  this.enableClass("hidden", totalMatched === 0);
  return totalMatched;
};
nova.PopupMenu.prototype.setMenuHeight = function(value) {
  this.setMaxHeight(value);
};
nova.PopupMenu.prototype.getMenuHeight = function() {
  var menu = this._menu;
  return menu ? menu.getHeight() : 0;
};
nova.PopupMenu.prototype.getPopup = function() {
  return(this);
};
nova.PopupMenu.prototype._init = function(opt_element) {
  goog.base(this, "_init", opt_element);
  this._topNode.addClass("nova-popupmenu");
};
nova.PopupMenu.prototype._deserialize = function(opt_model) {
  if (!opt_model) {
    opt_model = {};
  }
  var pref;
  pref = opt_model["popup"];
  if (pref) {
    goog.base(this, "_deserialize", pref);
  } else {
    goog.base(this, "_deserialize", opt_model);
  }
  pref = opt_model["handleKeyDown"];
  if (pref === false) {
    this._handleKeyDown = false;
  }
  pref = opt_model["menu"];
  if (pref) {
    this.setMenu(pref);
  }
};
nova.PopupMenu.prototype._onChildShown = function() {
  var child = this._child, childRight = child.getBoundingClientRect()["right"], creator = this, isOverlay;
  while (true) {
    if (creator) {
      if (childRight < creator.getBoundingClientRect()["right"]) {
        isOverlay = true;
      }
      creator = creator.getCreator();
    } else {
      break;
    }
  }
  if (isOverlay) {
    child.setPin("top-left", "top-right");
    child.updatePosition();
  }
  this._dispatch("childShown", {child:child});
};
nova.PopupMenu.prototype._onChildHidden = function() {
  this.focus();
  this._dispatch("childHidden", {child:this._child});
};
nova.PopupMenu.prototype._onKeyDown = function(event) {
  var _this, keyCodes;
  _this = this;
  keyCodes = nova.Event.KeyCodes;
  switch(event.keyCode) {
    case keyCodes.LEFT:
      if (_this._creator) {
        _this.hide();
      }
      break;
    case keyCodes.RIGHT:
      _this.showChild();
      break;
    case nova.Event.KeyCodes.ESC:
      _this.hideTree();
      break;
  }
};
nova.PopupMenu.prototype._onItemHovered = function(event) {
  var _this, item;
  _this = this;
  item = event["item"];
  if (item === _this._hoveredItem) {
    return;
  }
  _this._hoveredItem = item;
};
nova.PopupMenu.prototype._onItemHighlighted = function(event) {
  var _this, item;
  _this = this;
  item = event["item"];
  _this._dispatch("itemHighlighted", event);
  if (item === _this._hoveredItem) {
    if (item.getSubMenu()) {
      _this.showChild();
    } else {
      _this.hideChild();
    }
  }
};
nova.PopupMenu.prototype._onItemActivated = function(event) {
  this._dispatch("itemActivated", event);
};
nova.PopupMenu.prototype._onItemSelected = function(event) {
  this._dispatch("itemSelected", event);
};
nova.PopupMenu.prototype._onTreeItemActivated = function(event) {
  this.hideTree();
  this._dispatch("treeItemActivated", event);
};
nova.PopupMenu.prototype._onTreeItemSelected = function(event) {
  this._dispatch("treeItemSelected", event);
};
nova.PopupMenu.prototype._menu = null;
nova.PopupMenu.prototype._creator = null;
nova.PopupMenu.prototype._child = null;
nova.PopupMenu.prototype._hoveredItem = null;
nova.PopupMenu.prototype._handleKeyDown = true;
goog.exportSymbol("nova.PopupMenu", nova.PopupMenu);
nova.PopupMenu._proto = nova.PopupMenu.prototype;
goog.exportProperty(nova.PopupMenu._proto, "dispose", nova.PopupMenu._proto.dispose);
goog.exportProperty(nova.PopupMenu._proto, "focus", nova.PopupMenu._proto.focus);
goog.exportProperty(nova.PopupMenu._proto, "show", nova.PopupMenu._proto.show);
goog.exportProperty(nova.PopupMenu._proto, "setMenu", nova.PopupMenu._proto.setMenu);
goog.exportProperty(nova.PopupMenu._proto, "getMenu", nova.PopupMenu._proto.getMenu);
goog.exportProperty(nova.PopupMenu._proto, "setCreator", nova.PopupMenu._proto.setCreator);
goog.exportProperty(nova.PopupMenu._proto, "getCreator", nova.PopupMenu._proto.getCreator);
goog.exportProperty(nova.PopupMenu._proto, "findItemByValue", nova.PopupMenu._proto.findItemByValue);
goog.exportProperty(nova.PopupMenu._proto, "findTreeItemByValue", nova.PopupMenu._proto.findTreeItemByValue);
goog.exportProperty(nova.PopupMenu._proto, "selectItem", nova.PopupMenu._proto.selectItem);
goog.exportProperty(nova.PopupMenu._proto, "setSelectedItem", nova.PopupMenu._proto.setSelectedItem);
goog.exportProperty(nova.PopupMenu._proto, "getSelectedItem", nova.PopupMenu._proto.getSelectedItem);
goog.exportProperty(nova.PopupMenu._proto, "selectItemByValue", nova.PopupMenu._proto.selectItemByValue);
goog.exportProperty(nova.PopupMenu._proto, "setSelectedValue", nova.PopupMenu._proto.setSelectedValue);
goog.exportProperty(nova.PopupMenu._proto, "getSelectedValue", nova.PopupMenu._proto.getSelectedValue);
goog.exportProperty(nova.PopupMenu._proto, "selectTreeItem", nova.PopupMenu._proto.selectTreeItem);
goog.exportProperty(nova.PopupMenu._proto, "getTreeSelectedItem", nova.PopupMenu._proto.getTreeSelectedItem);
goog.exportProperty(nova.PopupMenu._proto, "selectTreeItemByValue", nova.PopupMenu._proto.selectTreeItemByValue);
goog.exportProperty(nova.PopupMenu._proto, "filterTreeItems", nova.PopupMenu._proto.filterTreeItems);
goog.exportProperty(nova.PopupMenu._proto, "setMenuHeight", nova.PopupMenu._proto.setMenuHeight);
goog.exportProperty(nova.PopupMenu._proto, "getMenuHeight", nova.PopupMenu._proto.getMenuHeight);
goog.exportProperty(nova.PopupMenu._proto, "getPopup", nova.PopupMenu._proto.getPopup);
goog.provide("nova.AutoSuggest");
goog.require("nova");
goog.require("nova.res");
goog.require("nova.ElementControl");
goog.require("nova.ElementWrapper");
goog.require("nova.TextBox");
goog.require("nova.PopupMenu");
goog.require("nova.ListMenu");
goog.require("nova.MenuItem");
nova.AutoSuggest = function(opt_initializer, opt_model) {
  this._extendedComponents = [];
  this._addEvent("itemActivated");
  this._addEvent("itemSelected");
  this._addEvent("moreSearch");
  this._addEvent("enter");
  this._addEvent("itemHighlighted");
  this._addEvent("itemContextMenu");
  this._addEvent("newSuggestions");
  this._addEvent("suggestionsHidden");
  this._addEvent("suggestionFailed");
  this._onFocus = this._onFocus.bind(this);
  this._onBlur = this._onBlur.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._onKeyDown = this._onKeyDown.bind(this);
  this._onKeyUp = this._onKeyUp.bind(this);
  this._onItemContextMenu = this._onItemContextMenu.bind(this);
  this._onItemHighlighted = this._onItemHighlighted.bind(this);
  this._onItemSelected = this._onItemSelected.bind(this);
  this._onPopupMenuShown = this._onPopupMenuShown.bind(this);
  this._onSearch = this._onSearch.bind(this);
  this._manageState = this._manageState.bind(this);
  this._itemRenderer = this._itemRenderer.bind(this);
  this._moreSearchItemRenderer = this._moreSearchItemRenderer.bind(this);
  if (opt_initializer && !nova.isElement(opt_initializer)) {
    opt_model = opt_initializer;
    opt_initializer = null;
  }
  this._init((opt_initializer));
  this._deserialize(opt_model);
};
goog.inherits(nova.AutoSuggest, nova.ElementControl);
nova.AutoSuggest.prototype.dispose = function() {
  this.unlistenAll();
  this._terminateSearchRequest();
  if (this._topNode !== this._textBox) {
    this._textBox.dispose();
    this._textBox = null;
    this._topNode.dispose();
    this._topNode = null;
  } else {
    if (this._externalInput) {
      this.setTextBox(null);
    }
  }
  this._popupMenu.dispose();
};
nova.AutoSuggest.prototype.focus = function(opt_value) {
  this._textBox.focus(opt_value);
};
nova.AutoSuggest.prototype.enable = function(opt_value) {
  this._textBox.enable(opt_value);
};
nova.AutoSuggest.prototype.isEnabled = function() {
  return this._textBox.isEnabled();
};
nova.AutoSuggest.prototype.setUrl = function(url) {
  this._url = url;
};
nova.AutoSuggest.prototype.getPopupMenu = function() {
  return this._popupMenu;
};
nova.AutoSuggest.prototype.setTextBox = function(textBox, opt_external) {
  this._externalInput = opt_external !== false;
  if (nova.isElement(textBox)) {
    textBox = new nova.TextBox(textBox);
  }
  if (this._textBox) {
    if (textBox && textBox.getElement() === this._textBox.getElement()) {
      return;
    }
    if (this._externalInput) {
      this._textBox.unlisten("focus", this._onFocus);
      this._textBox.unlisten("blur", this._onBlur);
      this._textBox.unlisten("keydown", this._onKeyDown);
      this._textBox.unlisten("keyup", this._onKeyUp);
      this._textBox.unlisten("mouseup", this._onMouseUp);
    } else {
      this._textBox.unlistenAll();
      this._textBox.dispose();
    }
  }
  if (textBox) {
    this._textBox = (textBox);
    this._textBox.disableEscReversion();
    this._textBox.listen("focus", this._onFocus);
    this._textBox.listen("blur", this._onBlur);
    this._textBox.listen("keydown", this._onKeyDown);
    this._textBox.listen("keyup", this._onKeyUp);
  } else {
    this._textBox = null;
  }
  this.setAnchor(this._textBox);
  if (this._externalInput) {
    this._topNode = this._textBox;
  } else {
    if (this._textBox.getParent()) {
      this._topNode.insertBefore(this._textBox);
    }
    this._textBox.setParent(this._topNode);
  }
};
nova.AutoSuggest.prototype.getTextBox = function() {
  return this._textBox;
};
nova.AutoSuggest.prototype.setInputElement = nova.AutoSuggest.prototype.setTextBox;
nova.AutoSuggest.prototype.setAnchor = function(anchor) {
  this._popupMenu.setAnchor(anchor);
};
nova.AutoSuggest.prototype.setAnchorElement = nova.AutoSuggest.prototype.setAnchor;
nova.AutoSuggest.prototype.addExtendedComponent = function(component) {
  if (!nova.isElement(component)) {
    component = component.getElement();
  }
  var extendedComponents = this._extendedComponents;
  if (extendedComponents.indexOf(component) > -1) {
    return;
  }
  component.addEventListener("blur", this._onBlur, false);
  extendedComponents.push(component);
};
nova.AutoSuggest.prototype.removeExtendedComponent = function(component) {
  if (!nova.isElement(component)) {
    component = component.getElement();
  }
  var extendedComponents = this._extendedComponents;
  var index = extendedComponents.indexOf(component);
  if (index < 0) {
    return;
  }
  component.removeEventListener("blur", this._onBlur, false);
  extendedComponents.splice(index, 1);
};
nova.AutoSuggest.prototype.setMenuHeight = function(value) {
  this._popupMenu.setMenuHeight(value);
};
nova.AutoSuggest.prototype.setMoreSearchText = function(value) {
  if (!value) {
    return;
  }
  this._moreSearchText = value;
};
nova.AutoSuggest.prototype.getMoreSearchText = function() {
  return this._moreSearchText;
};
nova.AutoSuggest.prototype.getMenuHeight = function() {
  return this._popupMenu.getMenuHeight();
};
nova.AutoSuggest.prototype.setFieldMapping = function(mapping) {
  this._fieldMapping = mapping;
};
nova.AutoSuggest.prototype.setAutoHighlight = function(opt_value) {
  this._autoHighlight = opt_value !== false;
};
nova.AutoSuggest.prototype.isAutoHighlight = function() {
  return this._autoHighlight;
};
nova.AutoSuggest.prototype.disableSuggestion = function(opt_disabled) {
  opt_disabled = opt_disabled !== false;
  this._disableSuggestion = opt_disabled;
  if (opt_disabled) {
    this._hidePopupMenu();
  }
};
nova.AutoSuggest.prototype.isSuggestionEnabled = function() {
  return!this._disableSuggestion;
};
nova.AutoSuggest.prototype.disableMoreSearchOption = function(opt_disabled) {
  this._disableMoreSearch = opt_disabled !== false;
};
nova.AutoSuggest.prototype.isMoreSearchEnabled = function() {
  return!this._disableMoreSearch;
};
nova.AutoSuggest.prototype.disableAutoComplete = function(opt_disabled) {
  this._disableAutoComplete = opt_disabled !== false;
};
nova.AutoSuggest.prototype.enableAutoHighlightFirstItem = function(opt_enabled) {
  this._enableAutoHighlightFirstItem = opt_enabled !== false;
};
nova.AutoSuggest.prototype.disableNonDefaultItemSelection = function(opt_enabled) {
  this._nonDefaultItemSelection = opt_enabled === false;
};
nova.AutoSuggest.prototype.setMaxRetry = function(maxRetry) {
  this._maxRetry = maxRetry;
};
nova.AutoSuggest.prototype.setSuggestionTimeout = function(suggestionTimeout) {
  this._suggestionTimeout = suggestionTimeout;
};
nova.AutoSuggest.prototype.search = function() {
  var result = this._onSearch();
  switch(result) {
    case 0:
      this._popupMenu.show();
      break;
    case 1:
      this._popupMenu.getMenu().highlightItem(null);
      break;
  }
  return result;
};
nova.AutoSuggest.prototype._init = function(opt_element) {
  var temp1, fragment;
  if (opt_element && opt_element.tagName.toLowerCase() === "input") {
    temp1 = opt_element;
    opt_element = null;
  }
  if (!temp1) {
    temp1 = nova.createElement("input");
  }
  if (!opt_element) {
    opt_element = nova.createElement(nova.res.span);
  }
  var menu = new nova.ListMenu({"itemRenderer":this._itemRenderer});
  menu.listen("itemContextMenu", this._onItemContextMenu);
  this._popupMenu = new nova.PopupMenu({"autoHide":false, "handleKeyDown":false, "menu":menu});
  this._popupMenu.addClass("nova-autosuggest-popup");
  this._popupMenu.listen("itemHighlighted", this._onItemHighlighted);
  this._popupMenu.listen("itemSelected", this._onItemSelected);
  this._topNode = new nova.ElementWrapper((opt_element));
  this._topNode.addClass("nova-autosuggest");
  this.setTextBox((temp1), false);
};
nova.AutoSuggest.prototype._deserialize = function(opt_model) {
  if (!opt_model) {
    return;
  }
  var pref = opt_model["url"];
  if (nova.isString(pref)) {
    this.setUrl((pref));
  }
  if (opt_model["disableSuggestion"] === true) {
    this.disableSuggestion();
  }
  if (opt_model["disableMoreSearchOption"] === true) {
    this.disableMoreSearchOption();
  }
  if (opt_model["disableAutoComplete"] === true) {
    this.disableAutoComplete();
  }
  if (opt_model["enableAutoHighlightFirstItem"] === true) {
    this.enableAutoHighlightFirstItem();
  }
  pref = opt_model["maxRetry"];
  if (pref > 0) {
    this.setMaxRetry(pref);
  }
  pref = opt_model["suggestionTimeout"];
  if (pref > 0) {
    this.setSuggestionTimeout(pref);
  }
};
nova.AutoSuggest.prototype._onFocus = function(event) {
  this._textBox.listen("mouseup", this._onMouseUp);
};
nova.AutoSuggest.prototype._onBlur = function(event) {
  if (!goog.isNull(this._stateTimer)) {
    clearTimeout(this._stateTimer);
  }
  this._stateTimer = setTimeout(this._manageState, 200);
};
nova.AutoSuggest.prototype._onMouseUp = function(event) {
  event.preventDefault();
  this._textBox.select();
  this._textBox.unlisten("mouseup", this._onMouseUp);
};
nova.AutoSuggest.prototype._onKeyDown = function(event) {
  var keyCode, menu, items, item, isPopupMenuVisible;
  if (!this.isSuggestionEnabled()) {
    return;
  }
  keyCode = event["keyCode"];
  menu = this._popupMenu.getMenu();
  isPopupMenuVisible = this._popupMenu.isVisible();
  switch(keyCode) {
    case nova.Event.KeyCodes.UP:
      if (isPopupMenuVisible) {
        menu.highlightPrevItem();
      }
      break;
    case nova.Event.KeyCodes.DOWN:
      if (isPopupMenuVisible) {
        menu.highlightNextItem();
      }
      break;
    case nova.Event.KeyCodes.SPACE:
      if (isPopupMenuVisible && this._highlightedIndexMoved) {
        item = menu.getHighlightedItem();
        if (item) {
          this._textBox.setText(item.getText());
        }
      }
      return;
    case nova.Event.KeyCodes.ESC:
      this._terminateSearchRequest();
      if (!isPopupMenuVisible) {
        return;
      }
      break;
    case nova.Event.KeyCodes.ENTER:
      this._enterEvent = event;
      if (this._disableAutoComplete) {
        if (isPopupMenuVisible && this._highlightedIndexMoved) {
          this._selectItem();
          break;
        } else {
          this._onEnter();
        }
      } else {
        if (this.search() === 0) {
          if (this._selectItem()) {
            break;
          }
        }
      }
      return;
    default:
      return;
  }
  event.stopPropagation();
  event.preventDefault();
};
nova.AutoSuggest.prototype._onKeyUp = function(event) {
  if (!this.isSuggestionEnabled()) {
    return;
  }
  switch(event["keyCode"]) {
    case nova.Event.KeyCodes.ALT:
    ;
    case nova.Event.KeyCodes.CTRL:
    ;
    case nova.Event.KeyCodes.SHIFT:
    ;
    case nova.Event.KeyCodes.UP:
    ;
    case nova.Event.KeyCodes.DOWN:
    ;
    case nova.Event.KeyCodes.TAB:
    ;
    case nova.Event.KeyCodes.ESC:
    ;
    case nova.Event.KeyCodes.ENTER:
      break;
    default:
      if (!this._textBox.getText()) {
        this._hidePopupMenu();
      }
      this.search();
      break;
  }
};
nova.AutoSuggest.prototype._onItemContextMenu = function(event) {
  this.focus();
  this._dispatch("itemContextMenu", event);
};
nova.AutoSuggest.prototype._onItemHighlighted = function(event) {
  this._highlightedIndexMoved = true;
  this._dispatch("itemHighlighted", event);
};
nova.AutoSuggest.prototype._onItemSelected = function(event) {
  this._terminateSearchRequest();
  event["text"] = this._textBox.getText();
  var item = event["item"];
  if (item) {
    if (this._isLinkItem(item)) {
      if (this.isMoreSearchEnabled()) {
        this._dispatch("moreSearch", event);
      }
    } else {
      this._searchCriteria = item.getText();
      this._textBox.setText(this._searchCriteria);
      this._dispatch("itemSelected", event);
    }
  }
  if (event["eventType"]) {
    this.focus();
  }
};
nova.AutoSuggest.prototype._onPopupMenuShown = function(event) {
  this.focus();
  this._popupMenu.updatePosition();
};
nova.AutoSuggest.prototype._onEnter = function(opt_text, opt_selectedItem) {
  this._terminateSearchRequest();
  var event = {"text":opt_text || this._textBox.getText(), "selectedItem":opt_selectedItem || null};
  this._dispatch("enter", event);
};
nova.AutoSuggest.prototype._onSearch = function() {
  var searchCriteria;
  if (this.isSuggestionEnabled() && this._url) {
    searchCriteria = this._textBox.getText();
  }
  if (!searchCriteria || searchCriteria.charAt(0) === "'") {
    this._terminateSearchRequest();
    return-1;
  }
  var newRequest = searchCriteria !== this._preSearchCriteria;
  if (newRequest) {
    this._requestFailure = 0;
    this._abortSearchRequest();
  }
  if (searchCriteria === this._searchCriteria && this._popupMenu.isVisible()) {
    this._preSearchCriteria = searchCriteria;
    return 0;
  }
  var retryRequest = this._maxRetry > 0 && (this._requestFailure > 0 && this._requestFailure <= this._maxRetry);
  if (newRequest || retryRequest) {
    this._preSearchCriteria = searchCriteria;
    this._abort = false;
    this._searchRequest = nova.ajaxGetJson(this._url + encodeURIComponent(searchCriteria), this._onRequestSuccess.bind(this, searchCriteria), this._onRequestFailed.bind(this), null, this._suggestionTimeout);
  }
  return 1;
};
nova.AutoSuggest.prototype._onRequestSuccess = function(searchCriteria, searchResult) {
  this._searchCriteria = searchCriteria;
  this._searchRequest = null;
  this._processSearchResult(searchResult);
  if (this._enterEvent) {
    this._selectItem();
    this._enterEvent = null;
  } else {
    if (document.activeElement !== this._textBox.getElement()) {
      return;
    }
    this._dispatch("newSuggestions", {result:searchResult});
    this._showPopupMenu(this._popupMenu.getMenu().getItems().length > 0);
  }
};
nova.AutoSuggest.prototype._onRequestFailed = function(xmlhttp) {
  if (xmlhttp.status === 0 && this._abort) {
    this._abort = false;
    return;
  }
  if (this._requestFailure++ < this._maxRetry) {
    this.search();
    return;
  }
  console.error("ERROR request (status = " + xmlhttp.status + ") for url " + this._url + encodeURIComponent(this._preSearchCriteria));
  this._clearSearchRequest();
  this._dispatch("suggestionFailed", {"readyState":xmlhttp.readyState, "status":xmlhttp.status});
};
nova.AutoSuggest.prototype._terminateSearchRequest = function() {
  this._hidePopupMenu();
  this._abortSearchRequest();
  this._clearSearchRequest();
};
nova.AutoSuggest.prototype._abortSearchRequest = function() {
  if (this._searchRequest) {
    this._abort = true;
    this._searchRequest.abort();
  }
};
nova.AutoSuggest.prototype._clearSearchRequest = function() {
  this._preSearchCriteria = "";
  this._searchRequest = null;
  this._enterEvent = null;
};
nova.AutoSuggest.prototype._processSearchResult = function(searchResult) {
  var menu = this._popupMenu.getMenu();
  var items = [];
  var result = searchResult["result"];
  var search = searchResult["search"];
  var totalItems, highlightedIndex, categoryIndex, hitIndex, relIndex, category, hitItem, relation, textField, hasRelation, url;
  if (result) {
    totalItems = 0;
    if (this._enableAutoHighlightFirstItem && (result.length > 0 && result[0].name === "Eikon Answers")) {
      highlightedIndex = 0;
    }
    for (categoryIndex = 0;categoryIndex < result.length;++categoryIndex) {
      category = result[categoryIndex];
      for (hitIndex = 0;hitIndex < category["hits"].length;++hitIndex) {
        if (category["default"] === true && hitIndex == 0) {
          highlightedIndex = totalItems;
        }
        hitItem = category["hits"][hitIndex];
        textField = this._fieldMapping && this._fieldMapping["text"] ? this._fieldMapping["text"] : "cmd";
        items.push({"text":hitItem[textField], "value":hitItem});
        ++totalItems;
        hasRelation = false;
        if (hitItem["relations"]) {
          for (relation in hitItem["relations"]) {
            relation = hitItem["relations"][relation];
            if (relation["hits"] && relation["hits"].length > 0) {
              for (relIndex = 0;relIndex < relation["hits"].length;++relIndex) {
                if (relation["default"] === true && relIndex == 0) {
                  highlightedIndex = totalItems;
                }
                var subHitItem = relation["hits"][relIndex];
                items.push({"text":subHitItem[textField], "value":subHitItem});
                ++totalItems;
                subHitItem["isSub"] = true;
              }
              hasRelation = true;
            }
          }
        }
      }
    }
    if (this.isMoreSearchEnabled() && search) {
      items.push({"text":search, "value":{"isMoreLink":true, "url":search, "searchTerm":this._textBox.getText()}, "renderer":this._moreSearchItemRenderer});
    }
  }
  menu.setItems(items);
  if (!result) {
    return false;
  }
  url = searchResult["url"];
  url = url ? url.substring(this._url.length) : null;
  if (url === encodeURIComponent(this._searchCriteria)) {
    menu.highlightItem(menu.getItem((highlightedIndex)));
  } else {
    menu.highlightItem(null);
  }
  this._highlightedIndexMoved = false;
  return true;
};
nova.AutoSuggest.prototype._selectItem = function() {
  var menu = this._popupMenu.getMenu();
  var items = menu.getItems();
  var item = null;
  var enteredText;
  if (this._enterEvent) {
    enteredText = this._textBox.getText();
    if (this._enterEvent.shiftKey && this.isMoreSearchEnabled()) {
      if (this._isLinkItem(items[items.length - 1])) {
        item = items[items.length - 1];
      }
    }
  }
  if (!item && items.length > 0) {
    item = menu.getHighlightedItem();
    if (this._nonDefaultItemSelection) {
      if (!item && !this._isLinkItem(items[0])) {
        item = items[0];
      }
    }
  }
  if (item) {
    menu.selectItem(item, this._enterEvent);
  }
  if (goog.isDef(enteredText)) {
    this._onEnter(enteredText, item);
  }
  return item;
};
nova.AutoSuggest.prototype._isLinkItem = function(item) {
  if (item) {
    var val = item.getValue();
    if (val && val["isMoreLink"]) {
      return true;
    }
  }
  return false;
};
nova.AutoSuggest.prototype._showPopupMenu = function(opt_shown) {
  this._popupMenu.show(opt_shown);
  if (opt_shown) {
    this._popupMenu.updatePosition();
  }
};
nova.AutoSuggest.prototype._hidePopupMenu = function(opt_hidden) {
  this._showPopupMenu(opt_hidden === false);
  this._dispatch("suggestionsHidden", {});
};
nova.AutoSuggest.prototype._manageState = function() {
  var activeElement = document.activeElement;
  if (this._textBox && activeElement === this._textBox.getElement()) {
    return;
  }
  if (this._extendedComponents.indexOf(activeElement) > -1) {
    return;
  }
  this._terminateSearchRequest();
};
nova.AutoSuggest.prototype._itemRenderer = function(e) {
  var item = e["item"];
  var itemValue = item.getValue();
  var element = item.getElement();
  var assetField, titleField, subtitleField, symbolField, symbolContent, content, temp1, temp2, temp3, fragment, isSub, isAutoHighlight, highlightedRegex, matchingRegex, matchingRenderer, isAnswerSuggestion;
  if (this._fieldMapping) {
    assetField = this._fieldMapping["asset"];
    titleField = this._fieldMapping["title"];
    subtitleField = this._fieldMapping["subtitle"];
    symbolField = this._fieldMapping["symbol"];
  }
  if (!assetField) {
    assetField = "vc";
  }
  if (!titleField) {
    titleField = "title";
  }
  if (!subtitleField) {
    subtitleField = "subtitle";
  }
  if (!symbolField) {
    symbolField = "symbol";
  }
  isSub = itemValue["isSub"];
  isAutoHighlight = this.isAutoHighlight();
  if (isAutoHighlight) {
    highlightedRegex = new RegExp("</?b>", "g");
    matchingRegex = nova.MenuItem.defaultMatchingMaskFunction(this._searchCriteria);
    matchingRenderer = function(str) {
      return "<b>" + str + "</b>";
    };
  }
  fragment = document.createDocumentFragment();
  symbolContent = nova.valueByPath(itemValue, symbolField);
  if (!isSub && symbolContent) {
    if (isAutoHighlight && symbolContent.indexOf("<b>") < 0) {
      symbolContent = symbolContent.replace(matchingRegex, matchingRenderer);
    }
  }
  temp1 = nova.createElement("div");
  temp1.className = "asset-column";
  if (!isSub) {
    content = nova.valueByPath(itemValue, assetField);
    if (content) {
      temp2 = nova.createElement("span");
      temp2.className = "asset";
      temp2.innerHTML = content;
      temp1.appendChild(temp2);
      isAnswerSuggestion = content == "ANS";
    }
  }
  fragment.appendChild(temp1);
  temp1 = nova.createElement("div");
  temp1.className = "info-column";
  content = nova.valueByPath(itemValue, titleField);
  if (content) {
    if (isAutoHighlight && (content.indexOf("<b>") < 0 && (symbolContent && symbolContent.indexOf("<b>") < 0))) {
      content = content.replace(matchingRegex, matchingRenderer);
    }
    temp2 = nova.createElement("span");
    temp2.className = "title";
    if (isAnswerSuggestion) {
      temp2.classList.add("reverse-ellipsis");
      temp3 = nova.createElement("span");
      temp3.className = "title-wrapper";
      temp3.innerHTML = content;
      temp2.appendChild(temp3);
    } else {
      temp2.innerHTML = content;
    }
    temp2.title = (temp2.textContent);
    temp1.appendChild(temp2);
  }
  if (!isSub) {
    content = nova.valueByPath(itemValue, subtitleField);
    if (content) {
      if (isAutoHighlight) {
        content = content.replace(highlightedRegex, "");
      }
      temp2 = nova.createElement("span");
      temp2.className = "subtitle";
      temp2.innerHTML = content;
      temp2.title = (temp2.textContent);
      temp1.appendChild(temp2);
    }
  }
  fragment.appendChild(temp1);
  temp1 = nova.createElement("div");
  temp1.className = "symbol-column";
  if (symbolContent) {
    temp2 = nova.createElement("span");
    temp2.className = "ric";
    temp2.innerHTML = symbolContent;
    temp2.title = (temp2.innerText);
    temp1.appendChild(temp2);
  } else {
    if (isAnswerSuggestion) {
      temp1.classList.add("empty");
    }
  }
  fragment.appendChild(temp1);
  temp1 = nova.createElement("div");
  temp1.appendChild(fragment);
  element.appendChild(temp1);
  item.addClass("customvisual");
  if (isSub) {
    item.addClass("sub");
  }
};
nova.AutoSuggest.prototype._moreSearchItemRenderer = function(e) {
  var item, element, temp1, temp2;
  item = e["item"];
  element = item.getElement();
  temp1 = nova.createElement("div");
  temp2 = nova.createElement("span");
  temp2.className = "link-text";
  temp2.innerHTML = this._moreSearchText.replace(/\{0\}/g, item.getValue()["searchTerm"]);
  temp1.appendChild(temp2);
  temp2 = nova.createElement("span");
  temp2.className = "link-text command";
  temp2.textContent = "Shift+Enter";
  temp1.appendChild(temp2);
  element.appendChild(temp1);
  item.addClass("customvisual");
  item.addClass("morelink");
};
nova.AutoSuggest.prototype._textBox = null;
nova.AutoSuggest.prototype._popupMenu;
nova.AutoSuggest.prototype._stateTimer = null;
nova.AutoSuggest.prototype._url = null;
nova.AutoSuggest.prototype._searchCriteria = "";
nova.AutoSuggest.prototype._preSearchCriteria = "";
nova.AutoSuggest.prototype._searchRequest = null;
nova.AutoSuggest.prototype._enterEvent = null;
nova.AutoSuggest.prototype._abort = false;
nova.AutoSuggest.prototype._fieldMapping = null;
nova.AutoSuggest.prototype._autoHighlight = false;
nova.AutoSuggest.prototype._disableSuggestion = false;
nova.AutoSuggest.prototype._disableMoreSearch = false;
nova.AutoSuggest.prototype._disableAutoComplete = false;
nova.AutoSuggest.prototype._highlightedIndexMoved = false;
nova.AutoSuggest.prototype._enableAutoHighlightFirstItem = false;
nova.AutoSuggest.prototype._nonDefaultItemSelection = true;
nova.AutoSuggest.prototype._moreSearchText = "More search results for &quot;<b>{0}</b>&quot;";
nova.AutoSuggest.prototype._requestFailure = 0;
nova.AutoSuggest.prototype._maxRetry = 0;
nova.AutoSuggest.prototype._suggestionTimeout = null;
nova.AutoSuggest.prototype._extendedComponents = null;
goog.exportSymbol("nova.AutoSuggest", nova.AutoSuggest);
goog.exportSymbol("tr.AutoSuggest", nova.AutoSuggest);
nova.AutoSuggest._proto = nova.AutoSuggest.prototype;
goog.exportProperty(nova.AutoSuggest._proto, "dispose", nova.AutoSuggest._proto.dispose);
goog.exportProperty(nova.AutoSuggest._proto, "enable", nova.AutoSuggest._proto.enable);
goog.exportProperty(nova.AutoSuggest._proto, "disable", nova.AutoSuggest._proto.disable);
goog.exportProperty(nova.AutoSuggest._proto, "isEnabled", nova.AutoSuggest._proto.isEnabled);
goog.exportProperty(nova.AutoSuggest._proto, "setUrl", nova.AutoSuggest._proto.setUrl);
goog.exportProperty(nova.AutoSuggest._proto, "getPopupMenu", nova.AutoSuggest._proto.getPopupMenu);
goog.exportProperty(nova.AutoSuggest._proto, "getMoreSearchText", nova.AutoSuggest._proto.getMoreSearchText);
goog.exportProperty(nova.AutoSuggest._proto, "setMoreSearchText", nova.AutoSuggest._proto.setMoreSearchText);
goog.exportProperty(nova.AutoSuggest._proto, "setTextBox", nova.AutoSuggest._proto.setTextBox);
goog.exportProperty(nova.AutoSuggest._proto, "getTextBox", nova.AutoSuggest._proto.getTextBox);
goog.exportProperty(nova.AutoSuggest._proto, "setInputElement", nova.AutoSuggest._proto.setInputElement);
goog.exportProperty(nova.AutoSuggest._proto, "setAnchor", nova.AutoSuggest._proto.setAnchor);
goog.exportProperty(nova.AutoSuggest._proto, "setAnchorElement", nova.AutoSuggest._proto.setAnchorElement);
goog.exportProperty(nova.AutoSuggest._proto, "addExtendedComponent", nova.AutoSuggest._proto.addExtendedComponent);
goog.exportProperty(nova.AutoSuggest._proto, "removeExtendedComponent", nova.AutoSuggest._proto.removeExtendedComponent);
goog.exportProperty(nova.AutoSuggest._proto, "setMenuHeight", nova.AutoSuggest._proto.setMenuHeight);
goog.exportProperty(nova.AutoSuggest._proto, "getMenuHeight", nova.AutoSuggest._proto.getMenuHeight);
goog.exportProperty(nova.AutoSuggest._proto, "setFieldMapping", nova.AutoSuggest._proto.setFieldMapping);
goog.exportProperty(nova.AutoSuggest._proto, "setAutoHighlight", nova.AutoSuggest._proto.setAutoHighlight);
goog.exportProperty(nova.AutoSuggest._proto, "isAutoHighlight", nova.AutoSuggest._proto.isAutoHighlight);
goog.exportProperty(nova.AutoSuggest._proto, "disableSuggestion", nova.AutoSuggest._proto.disableSuggestion);
goog.exportProperty(nova.AutoSuggest._proto, "isSuggestionEnabled", nova.AutoSuggest._proto.isSuggestionEnabled);
goog.exportProperty(nova.AutoSuggest._proto, "disableMoreSearchOption", nova.AutoSuggest._proto.disableMoreSearchOption);
goog.exportProperty(nova.AutoSuggest._proto, "isMoreSearchEnabled", nova.AutoSuggest._proto.isMoreSearchEnabled);
goog.exportProperty(nova.AutoSuggest._proto, "disableAutoComplete", nova.AutoSuggest._proto.disableAutoComplete);
goog.exportProperty(nova.AutoSuggest._proto, "disableNonDefaultItemSelection", nova.AutoSuggest._proto.disableNonDefaultItemSelection);
goog.exportProperty(nova.AutoSuggest._proto, "setMaxRetry", nova.AutoSuggest._proto.setMaxRetry);
goog.exportProperty(nova.AutoSuggest._proto, "setSuggestionTimeout", nova.AutoSuggest._proto.setSuggestionTimeout);
nova.jQueryPlugin("NovaAutoSuggest", nova.AutoSuggest);
goog.provide("nk_autosuggest_entrypoint");
goog.require("nova");
goog.require("nova.AutoSuggest");
}).call(this);
