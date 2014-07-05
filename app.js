var              _ = require('underscore'),
           express = require('express'),
           connect = require('connect'),
              rest = require('restler'),
                fb = require('./lib/facebook'),
          bookIdx = [],
    bookRatingIdx = [],
      bookDateIdx = [],
        bookCache = {},
       connection = require('./lib/database').conn;


            config = require('./config').config;
       handleError = require('./lib/error').handleError;
             graph = require('fbgraph');
              util = require('./lib/util');
                     
var app = module.exports = express.createServer();

app.configure('development', function() {
    app.use(connect.static('./public'));
    app.set('appIndex', './public/app.html')
});

app.configure('production', function() {
    app.use(connect.static('./public/build/production/WL')); // align to your path
    app.set('appIndex', './public/build/production/WL/app.html'); //align to your path
});

app.configure(function() {
    // Cors headers
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    });

    app.use(connect.cookieParser());

    app.use(express.session({
        secret: config.sessionSecret
    }));

    app.use(connect.bodyParser());
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true }));

    app.enable('jsonp callback');
    app.set('view engine', 'ejs');
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("Listening on " + port);
});

/**
 * Handle requests to the root URL.
 */
app.get('/', function(req, res) {

    var ua = req.headers['user-agent'];

    if (ua.match(/(Android|iPhone|iPod|iPad|Playbook|Silk|Kindle)/)) {
        res.sendfile(app.set('appIndex'));
    } 
    else {
        res.render('web_meta.html.ejs', {
            						layout: 'layout.html.ejs',
            						 title: 'Watch Lib',
            						appUrl: '/app.html?deviceType=Phone',
                                  showDemo: Boolean(ua.match(/(AppleWebKit)/))
        });
    }
});

app.all('/app.html', function(req, res) {
    res.sendfile(app.set('appIndex'));
});

/**
 * Handle requests from the Facebook app.
 */
app.post('/', function(req, res) {

    var ua = req.headers['user-agent'];

    if (ua.match(/(AppleWebKit)/)) {
        res.sendfile(app.set('appIndex'));
    } 
    else {
        res.render('web_meta.html.ejs', {
							layout: 'layout.html.ejs',
							title: 'Watch List',
							appUrl: '/app.html?deviceType=Phone',
							showDemo: false
        });
    }
});

app.get('/books', fb.checkSession, fb.getFriendIds, fb.getUserDetails, function(req, res, next) {

    var cache = {}, idx = [],
        sort = bookIdx;

    if (req.query.sort && req.query.sort.match(/Date/i)) {
        sort = bookDateIdx;
    } else if (req.query.sort && req.query.sort.match(/Rating/)) {
        sort = bookRatingIdx;
    }
    
    util.addViewingData(req, res, next, bookCache, sort);
});

app.get('/book', fb.checkSession, fb.getFriendIds, fb.getUserDetails, function(req, res, next) {

    var url = "http://ism.ma/api.php?method=getBook&code=" + req.query.code;

    rest.get(
        url, { parser: rest.parsers.json }
    )
    .on('complete', function(data) {

        if (data.error) {
            res.json({success: false, error: data.error});
            return;
        }

        var response = util.parseBookResults(data);
        util.addViewingData(req, res, next, response.cache, response.idx)

    })
    .on('error', function(err) {
        console.log('Error getting movies', err);
    });

});

app.post('/book/:id/share', fb.checkSession, fb.getFriendIds, fb.getUserDetails, function(req, res, next) {

    var cache = bookCache[Number(req.params.id)];

    if (cache) {

        var post = {
            link: 'http://ism.ma/api.php?method=getBook&code=' + req.params.id
        };

        if (req.body.message) {
            post.message = req.body.message;
        }

        graph.post(req.session.fb.user_id + '/links', post, function(err, fbRes) {
            if (fbRes.error && fbRes.error.message.match(/#282/)) {
                res.json({ success: false, error: 'permission', scope: 'share_item'})
            } 
            else {
                res.json({ success: true });
            }
        });
    } 
    else {
        res.json({ success: false });
    }
});

app.all('/book/:id', function(req, res, next) {

    var cache = bookCache[Number(req.params.id)],
        showDemo = req.headers['user-agent'] && Boolean(req.headers['user-agent'].match(/(AppleWebKit)/));

    if (cache) {
        res.render('movie_meta.html.ejs', {
            locals: {
                book: cache,
                title: cache.title + ' | The Watch Lib',
                appUrl: app.set('appIndex') + '#books/' + req.params.id,
                showDemo: showDemo
            },
            layout: 'layout.html.ejs'
        })
    } 
    else {
        connection.query('SELECT * from book WHERE code = ?', [req.params.id], function(err, doc, fields) {
            if (doc) {
                res.render('movie_meta.html.ejs', {
                    locals: {
                        book: doc,
                        title: doc.title + ' | The Watch Lib',
                        appUrl: app.set('appIndex') + '#books/' + req.params.id,
                        showDemo: showDemo
                    },
                    layout: 'layout.html.ejs'
                });
            } 
            else {
                res.send("Book not found", 404);
            }
        });
    }
});

app.get('/search', fb.checkSession, fb.getFriendIds, fb.getUserDetails, function(req, res, next) {
	
    console.log("====== req.query.q =====> " + req.query.q);

    rest.get(
        "http://ism.ma/api.php?method=searchBook&q=" + req.query.q
    )
    .on('complete', function(data) {

        var response = util.parseBookResults(data);
        util.addViewingData(req, res, next, response.cache, response.idx)

    })
    .on('error', function(err) {
        console.log('Error getting books', err);
    });
});

/**
 * Return a list of viewings for the user and all the user's friends
 */
app.get('/viewings', fb.checkSession, fb.getFriendIds, function(req, res) {

    // Search for all viewings in the database with a profile ID in the friendIds array
    connection.query('SELECT * from viewing WHERE profileId IN (?)', [req.session.fb.friendIds], function(err, viewings, fields) {
        if (err) {
            handleError('Could not retrieve list of viewings', viewings, req, res);
            return;
        }

        // Send the list of viewings back to the client
        res.json(viewings);
    });
});

app.get('/activity', fb.checkSession, fb.getFriendIds, function(req, res) {
	
	connection.query('SELECT * from viewing WHERE profileId IN (?) ORDER BY date LIMIT 20', [req.session.fb.friendIds], function(err, viewings, fields) {

        if (err) {
            handleError('Could not retrieve list of books', viewings, req, res);
            return;
        }

        var response = [], action;

        _.each(viewings, function(viewing) {

            action = util.viewingAction(viewing);

            if (action) {
                response.push({
                    profileId: viewing.profileId,
                    bookCode: viewing.bookCode,
                    title: viewing.title,
                    name: viewing.name,
                    date: String(viewing.date),
                    action: action
                });
            }
        });

        res.json({ activity: response });
    });
});

/**
 * Add a new Viewing to the database
 */
app.post('/viewing', fb.checkSession, fb.getUserDetails, util.fetchOrCreateViewing, function(req, res, next) {

    var fbActions = [],
        fbResponses = [];

    if (req.body.wantToSee) {
        req.viewing.wantToSee = req.body.wantToSee == 'true';

        if (req.viewing.wantToSee) {
            fbActions.push({
                method: 'POST',
                relative_url: req.session.fb.user_id + '/' + config.fbNamespace + ':want_to_read',
                body: { book: 'http://ism.ma/api.php?method=getBook&code=' + req.body.bookCode }
            });
            fbResponses.push({ key: 'wantToSeeId', value: 'id' });
        } 
        else if (req.viewing.wantToSeeId) {
            fbActions.push({ method: 'DELETE', relative_url: String(req.viewing.wantToSeeId) });
            fbResponses.push({ key: 'wantToSeeId', value: null });
        }
    }

    if (req.body.seen) {
        req.viewing.seen = req.body.seen == 'true';

        if (req.viewing.seen) {
            fbActions.push({
                method: 'POST',
                relative_url: req.session.fb.user_id + '/' + 'books.reads',
                body: 'http://ism.ma/api.php?method=getBook&code=' + req.body.bookCode
            });
            fbResponses.push({ key: 'seenId', value: 'id' });
        } 
        else if (req.viewing.seenId) {
            fbActions.push({ method: 'DELETE', relative_url: String(req.viewing.seenId) });
            fbResponses.push({ key: 'seenId', value: 'null'});
        }
    }

    if (req.body.like && req.viewing.seenId) {
        req.viewing.like = req.body.like == 'true';

        if (req.viewing.like) {
            fbActions.push({
                method: 'POST',
                relative_url: String(req.viewing.seenId),
                body: 'rating=1'
            });
            fbResponses.push();
        }
    }

    if (req.body.dislike && req.viewing.seenId) {
        req.viewing.dislike = req.body.dislike == 'true';

        if (req.viewing.dislike) {
            fbActions.push({
                method: 'POST',
                relative_url: String(req.viewing.seenId),
                body: 'rating=-1'
            });
            fbResponses.push();
        }
    }

    if (fbActions.length) {

        console.log("Posting to Facebook Open Graph...", req.session.fb.access_token, JSON.stringify(fbActions));
	
        rest.post("https://graph.facebook.com", {
            data: {
                access_token: req.session.fb.access_token,
                batch: JSON.stringify(fbActions)
            }
        })
        .on('complete', function(str) {

	    console.log(str);
            //var data = JSON.parse(str);
            var data = str;

            _.each(data, function(batchResponse) {

                var body = JSON.parse(batchResponse.body),
                    takeAction = fbResponses.shift();

                if (body.error) {
                    req.fbError = body.error;
                }

                if (takeAction) {
                    req.viewing[takeAction.key] = body[takeAction.value] || null;
                }

                console.log("Facebook batch complete", body)
            })

            util.saveViewing(req, res, next);
        })
        .on('error', function(err) {
            console.log('Error with batch request to FB', err);
            util.saveViewing(req, res, next);
        });

    } 
    else {
        util.saveViewing(req, res, next);
    }
});

/**
 * When the app first starts, we cache a list of books locally as this will cater for the vast majority of requests.
 */
connection.query('SELECT * from book WHERE releaseDate < ? ORDER BY rank LIMIT 200', [Date.now()], function(err, books, fields) {

    _.each(books, function(book) {
        bookCache[book.code] = book;
        bookIdx.push(book.code);
    });

    _.each(_.sortBy(books, function(book) {
        return -Number(new Date(book.releaseDate));
    }), function(book) {
        bookDateIdx.push(book.code);
    });

    _.each(_.sortBy(books, function(book) {
        return -book.criticRating;
    }), function(book) {
        bookRatingIdx.push(book.code);
    });
    
    console.log("=============> Cached " + books.length + " books.");
});
