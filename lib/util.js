var          _ = require('underscore'),
    connection = require('./database').conn;

exports.fetchOrCreateViewing = function(req, res, next) {

    connection.query('SELECT * from viewing WHERE profileId = ? AND bookCode = ?', [req.session.fb.user_id, req.body.bookCode], function(err, rows, fields) {
  		
  		if (err) throw err;

		if(rows.length == 0)
        {
            console.log("Saving New Viewing for " + req.session.fb.user_id + " (book " + req.body.bookCode + ")...");
            
            req.viewing = {
                profileId:  req.session.fb.user_id,
                     name:  req.session.fb.user_data.first_name + ' ' + req.session.fb.user_data.last_name,
                     date:  new Date,
                 bookCode:  req.body.bookCode,
                    title:  req.body.title
            };
        } 
        else 
        {
            console.log("Updating Viewing for " + req.session.fb.user_id + " (book " + req.body.bookCode + ")...");
            req.viewing = rows[0];
        }

        next();
    });
};

exports.parseBookResults = function(data, result) {

    result = result || {
        cache: {},
        idx: []
    };

    if (typeof data != 'object') {
        data = JSON.parse(data);
    }

    if (!data.books || data.books.length == 0) {
        data = { books: data };
    }
    
    //data = { books: data };
    
    console.log(data);

    _.each(data.books, function(book) {

        if (book.code && book.title) {
        
            var o = {
                      code: book.code,
                smallImage: book.smallImage,
                largeImage: book.largeImage,
                     title: book.title,
                  synopsis: book.synopsis,
               releaseDate: book.releaseDate,
                      rank: Number(book.rank),
                     genre: book.genre,
                      isbn: book.isbn,
                   authors: book.authors
            };

            result.cache[book.code] = o;
            result.idx.push(book.code);
        }

    });

    if (data.books) {
        console.log("Parsed " + data.books.length + " books.");
    }
	
    return result;
};

exports.viewingAction = function(viewing) {

    var action='';

    if (viewing.wantToSee) {
        action = 'wants to read';
    }
    if (viewing.seen) {
        action = 'read';
    }
    if (viewing.like) {
        action = 'liked';
    }
    if (viewing.dislike) {
        action = 'disliked';
    }
    if (viewing.recommendation) {
        if (viewing.recommendation == 1) {
            action = 'recommended';
        } 
        else if (viewing.recommendation == 0) {
            action = 'did not recommended';
        }
    }

    return action;
};

exports.addViewingData = function(req, res, next, bookCache, bookIdx) {

    var data = { books: [], total: bookIdx.length },
        start = Number(req.query.start) || 0,
        limit = Number(req.query.limit) || 10,
        len = Math.min(bookIdx.length, start + limit),
        bookIds = [],
        bookPointers = {},
        bookId, book, idx, i, clone, action;

    for (i=start; i< len; i++) {
        bookId = bookIdx[i];
        book = bookCache[bookId];

        bookPointers[bookId] = data.books.length;
        
        clone = _.clone(book);
        clone.friendActivity = [];

        data.books.push(clone);
        bookIds.push(bookId);
    }
    
    connection.query('SELECT * from viewing WHERE profileId IN (?) AND bookCode IN (?)', [req.session.fb.friendIds, bookIds], function(err, viewings, fields) {
        if (err) {
            handleError('Could not retrieve list of books', viewings, req, res);
            return;
        }

        _.each(viewings, function(viewing) {

            idx = bookPointers[viewing.bookCode];

            if (viewing.profileId == req.session.fb.user_id) 
            {
                data.books[idx] = _.extend(data.books[idx], {
                    seen: Boolean(viewing.seen),
                    wantToSee: Boolean(viewing.wantToSee),
                    like: Boolean(viewing.like),
                    dislike: Boolean(viewing.dislike)
                });

                data.books[idx].seen = Boolean(viewing.seen);
            } 
            else 
            {

                action = exports.viewingAction(viewing);

                if (action) {
                    data.books[idx].friendActivity.push({
                        profileId: viewing.profileId,
                        name: viewing.name,
                        action: action,
                        date: viewing.date
                    });
                }
            }
        });
        
        console.log(data);

        res.json(data);
    });
};

exports.saveViewing = function(req, res, next) {

    console.log(req.viewing.id);
	
	connection.query('INSERT INTO viewing SET ?', req.viewing, function(err, result) {
	
        if (err) {
            handleError('Could not save viewing', err, req, res);
            return;
        }

        console.log("Successfully saved new viewing");

        var resp = { success: true };

        if (req.fbError) {
            resp.fbError = req.fbError;
        }

        res.json(resp);
    });
};


