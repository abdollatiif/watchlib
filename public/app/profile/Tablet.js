Ext.define('WL.profile.Tablet', {
    extend: 'Ext.app.Profile',

    config: {
        name: 'Tablet',

        controllers: [
        	'Books'
        ],

        views: [
        	'Container',
            'WL.view.tablet.book.List',
        	'WL.view.tablet.book.Detail'
        ]
    },

    launch: function() {
        WL.view.tablet.book.List.addXtype('bookList');
        WL.view.tablet.book.Detail.addXtype('bookDetail');
    },

    isActive: function() {
        return !Ext.os.is.Phone;
    }
});
