/**
 * The tablet specific controller for Books
 */
Ext.define('WL.controller.tablet.Books', {

    extend: 'WL.controller.Books',

    config: {
        refs: {
            tabletContainer: 'tabletContainer'
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
            this.mainContainer = Ext.Viewport.add({ xtype: 'tabletContainer' });
        }
    },

    showBook: function(record) {
        WL.currentBook = record;

        if (!this.bookDetailCmp) {
            this.bookDetailCmp = Ext.widget('bookDetail');
        }

        this.bookDetailCmp.setRecord(record);
        this.getToolbar().setTitle(record.get('title'));
        this.getTabletContainer().setActiveItem(this.bookDetailCmp);
    }
});
