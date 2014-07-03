Ext.define('WL.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        name: 'Phone',

        controllers: [
        	'Books'
        ],

        views: [
        	'WL.view.phone.book.List',
        	'WL.view.phone.book.Detail'
        ]
    },

    launch: function() {
        WL.view.phone.book.List.addXtype('bookList');
        WL.view.phone.book.Detail.addXtype('bookDetail');
    },

    isActive: function() {
        return Ext.os.is.Phone;
    }
});
