/**
 * Book definition
 */
Ext.define('WL.model.Book', {
    extend: 'Ext.data.Model',

    config: {

        idProperty : "code",

        fields: [
            'code',

            'title',
            'rank',

            'criticRating',

            'smallImage',
            'largeImage',
            'releaseDate',

            'synopsis',
            'genre',
            'authors',
            'isbn',
            'seen',
            'wantToSee',
            'like',
            'dislike',

            'friendActivity',

            {
                name: 'status',
                type: 'string',
                convert: function() {
                    return 'In Book Store'
                }
            },
            {
                name: 'formattedReleaseDate',
                type: 'string',
                convert: function(v, record) {
                    if (record.data.releaseDate) {
                        var arr = record.data.releaseDate.split(/[- :T]/),
                            date = new Date(arr[0], arr[1]-1, arr[2]);

                        return "In Book Store " + Ext.Date.format(date, 'M j, Y');
                    } 
                    else {
                        return 'Unknown release date';
                    }
                }
            }
        ],

        proxy: {
            type: 'jsonp',
            url: '/book',

            reader: {
                type: 'json',
                rootProperty: 'books'
            }
        }
    }
});
