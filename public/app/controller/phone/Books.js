/**
 * This is a Phone specific controller for Books.
 */
Ext.define('WL.controller.phone.Books', {

    extend: 'WL.controller.Books',

    config: {
        routes: {
            'home': 'onBookBack'
        },
        control: {
            '#bookBackButton': {
                tap: 'doBookBack'
            }
        },
        refs: {
            toolbar: 'bookDetail titlebar'
        }
    },

    init: function() {

        this.callParent();

        WL.Facebook.on({
            connected: this.onFacebookLogin,
            logout: this.onFacebookLogout,
            unauthorized: this.onFacebookUnauthorized,
            scope: this
        });
    },

    onFacebookLogin: function() {
        this.callParent(arguments);
        this.initContainer();
    },

    initContainer: function() {
        if (!this.mainContainer) {
            this.mainContainer = Ext.Viewport.add({ xtype: 'main' });
        }
    },

    showBook: function(record) {
        WL.currentBook = record;

        if (!this.bookDetailCmp) {
            this.bookDetailCmp = Ext.widget('bookDetail');
        }

        this.getToolbar().setTitle(record.get('title'));

        Ext.Viewport.animateActiveItem(this.bookDetailCmp, {
            type: 'slide',
            direction: 'left'
        });

        this.bookDetailCmp.setRecord(record);
    },

    doBookBack: function() {
        WL.app.updateUrl('home');
        this.onBookBack();
    },

    onBookBack: function() {
        Ext.Viewport.animateActiveItem(this.getMain(), {
            type: 'slide',
            direction: 'right'
        });
    }

});
