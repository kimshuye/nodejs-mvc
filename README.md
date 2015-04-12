nodejs-mvc
==========

Fast and simple MCV in nodejs


### [Section 1] Starting an Application

```javascript

	var app	= require("nodejs-mvc");
	var appVars	= app.getVars();

	var server	= require("http").createServer(function( request, response, next ) {
		app.handleServerResponse( request, response, next );
	});

	app.sessionCookieName("ssid");
	app.sessionDynCookieName("ssid");
	app.sessionDynCookieDomain(false);
	app.sessionDynAutoUpdate(true);
	app.sessionDynExpire(60*60*2);

	app.setRootPath( __dirname );
	app.setPublicPath( __dirname+'/public');
	app.setModulePath( __dirname+'/app/modules');
	app.runBootstrap();

	server.listen(8080);
```

### [Section 2] Attaching a "socket.io" to server and assing SESSION and COOKIES

```javascript

	--------------------------
	// add here CODE from [ Section 1 ]
	--------------------------

	/****************************
	 * Ataching SocketIO server *
	 ***************************/

	var io = require('socket.io')(server);

	/**
	 * adding session to socketio on authorisation
	 */

	var io = require('socket.io')(server);

	io.set('authorization', function(data, accept) {
		// check if user has a session
		app.handleServerMidleware(data, {}, function (err) {
			if (!err) {
				console.log("authorization-no-session::signedCookies: ", data.session, data.cookies, data.signedCookies);
				accept(null, true);
			} else {
				console.log("authorization-session::signedCookies: ", data.session, data.cookies, data.signedCookies);
				accept(null, true);
			}
		});
	});

	io.sockets.on('connection', function (client) {
		var sessionCronTimer;

		// attaching session to socket
		app.handleServerMidleware(client.handshake, {}, function (err) {
			if (!err) {
				// adding client session
				client.session	= client.handshake.session;

				// adding cron form refreshing session
				sessionCronTimer	= setInterval(function () {
					client.handshake.session.reload( function () { 
						client.handshake.session.touch().save();
					});
				}, 2000);
		});

		client.on('disconnect', function () {
			var er; try {
				clearInterval(sessionCronTimer);
			} catch (er) {};
		});
	});

	// attaching your events :)
	io.on('connection', function(socket){
		socket.on('event', function(data){});
		socket.on('disconnect', function(){});
	});
```


> A demo application you will see in ./demo/mvc-sample/app.js

## Templating FaceboxTPL

### To view parameters that are send have folowing structure

On template Rendering we have following variables

```javascript

	// variables that a sent from controllers
	var vars	= {};
	
	var env		= {
		error	: [],
		vars	: envVars,
		path	: "", // file path of current rendered template
		dirname	: "", // dirname of current rendered template
		render	: function( text, vars, env ) {}, // render function
		renderFile	: function( file, vars, callback ) {}, // render file function
			// callback( error {{ [] or false }}, htm)
	};

	// env vars sent from app
	env.vars = {
		response : [object] // http reponse object 
	}
```

### An example how to render a view:

```javascript

	// file app/modules/index/controller/pageviews.js

	// file reprezents action pageviews from controller index
	var _vars	= {
		pageviews	: 0
	};
	module.exports	= {
		public	: true,
		capture	: function( request, response, app, controller, action ) {
			// increasing pageviews
			// sending pageviews to view
			controller.render( response, 'index', { pageviews: (++_vars.pageviews) });
		}
	};
```

### Operation in templates

#### Include another template

```html
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		<!-- Include rendered teplate -->
		{{render: env.vars.paths.layouts+"header.tpl" }}
		<div class="my-content">
			<!-- Include teplate and render with all content -->
			{{include: env.vars.paths.layouts+"header.tpl" }}
			Lorem ipsum Excepteur dolore labore nisi non.
		</div>
		<!-- Include rendered teplate -->
		{{render: env.vars.paths.layouts+"footer.tpl" }}
	</body>
	</html>
```

#### Executing operations in template code

```html
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		{eval}
			vars.item_index	= 0;
		{eval}
		<ul>
			<li>item {{ ++vars.item_index }}</li>
			<li>item {{ ++vars.item_index }}</li>
			<li>item {{ ++vars.item_index }}</li>
			<li>item {{ ++vars.item_index }}</li>
			<li>item {{ ++vars.item_index }}</li>
		</ul>
		{js-return}
			var message	= 'Were inserted '+vars.item_index+' items';
			// returning response that will be inserted
			return message;
		{js-return}
	</body>
	</html>
```


#### Isolate a section of code from parsing / noformat

```html
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		{code}
			not parsed code ... even this "{{read:license.txt}}"
		{code}
	</body>
	</html>
```


#### Adding a script and a css style

```html
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		{js-script}
			// javascript code
			alert("Hello");
		{js-script}
		{css-style}
			html, body {
				background	: white;
				color	: black;
			}
		{css-style}
	</body>
	</html>
```

#### Include content from a file without parcing it
```html
	<h1>License</h1>
	<pre><code>
		{{read:license.txt}}
	</code></pre>
```

#### Include content from a file encoded in HEX

```html
	<script type="text/javascript">
		var fileHexContent	= "{{read-hex:file.hex}}"
	</script>
```


#### Include content from a file encoded in base64
```html
	<img src="data:image/jpeg; base64,{{read-base64:image.png}}" />
```
## Extended template operations regardin prototype

## Authors

 - Gordienco Sergiu

## License

(The MIT License)

Copyright (c) 2014 Gordienco Sergiu &lt;sergiu.gordienco@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
