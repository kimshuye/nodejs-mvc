module.exports	= function( actionName, controller, options, appInstance ) {
	var _config	= {
		"public"	: false,
		"postData"	: false,
		"maxPostSize"	: 1024*1024, // 1Mb
		"autoClose"	: false,	// action will close itself with response.end();
		"capture"	: function( request, response, appInstance, controller, action ) {

		}
	};
	if( typeof(options) === "object" ) {
		if( "public" in options ) {
			_config.public	= !!options.public;
		}
		
		if( "postData" in options ) {
			_config.postData	= !!options.postData;
		}
		
		if( "maxPostSize" in options ) {
			_config.maxPostSize	= options.maxPostSize;
		}
		
		if( "autoClose" in options ) {
			_config.autoClose	= !!options.autoClose;
		}

		if( "capture" in options && typeof(options.capture) === "function" ) {
			_config.capture	= options.capture;
		}
	}
	var actionObject	= {
		getController	: function() {
			return controller;
		},
		getName	: function() {
			return actionName;
		},
		isPublic	: function() {
			return !!(_config.public);
		},
		usePostData	: function() {
			return !!(_config.postData);
		},
		maxPostSize	: function(v) {
			if( typeof(v) === "number" ) {
				_config.maxPostSize	= v;
				return true;
			} else if( typeof(v) !== "undefined" ) {
				return false;
			}
			return _config.maxPostSize;
		},
		autoClose	: function() {
			return !!(_config.autoClose);
		},
		run			: function( request, response ) {
			var e = true;
			try {
				(_config.capture)( request, response, appInstance, controller, actionObject );
			} catch(e) {
				appInstance._events.onError(e);
			}
			return e;
		}
	};
	return actionObject;
};
