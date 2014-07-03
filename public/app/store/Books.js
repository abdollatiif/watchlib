
Ext.define('WL.store.Books', {
    extend  : 'Ext.data.Store',

    config: {
        model: 'WL.model.Book',

        pageSize: 20,

        proxy: {
            type: 'jsonp',
            url: '/books',

            reader: {
                type: 'json',
                rootProperty: 'books'
            }
        }
    }
});
