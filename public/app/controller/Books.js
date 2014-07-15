/**
 * This controller handles functions common to both Phone and Tablets
 */
Ext.define('WL.controller.Books', {

    extend: 'Ext.app.Controller',

    config: {

        routes: {
            'books/:id': 'onMovieUrl'
        },

        refs: {
            bookList: 'bookList',
            main: 'main',
            loggedOut: 'loggedOut',
            toolbar: 'bookDetail toolbar',
            sortBar: 'bookSortBar',
            searchBar: 'bookSearchBar',
            searchButton: 'main toolbar button[iconCls=search]'
        },

        control: {
            bookList: {
                tapBook:    'onBookTap'
            },
            bookDetail: {
                postToWall:  'onPostToWall',
                sendToFriend:'onSendToFriend',
                playTrailer: 'onPlayTrailer'
            },
            activity: {
                itemtap: 'onViewingTap'
            },
            searchButton: {
                tap: 'onSearchButton'
            },
            '#sortBy': {
                toggle: 'onSortToggle'
            },
            '#searchField': {
                action: 'onSearch',
                change: 'onSearch',
                clearicontap: 'onSearchClear'
            },
            'toolbar button[iconCls=movies]': {
                tap: 'onBookIconTap'
            },
            'toolbar button[iconCls=friends]': {
                tap: 'onActivityIconTap'
            },
            '#fbProfilePic': {
                tap: 'onProfileTap'
            },
            '#logoutButton': {
                tap: 'logout'
            },
            '#bookShareButton': {
                tap: 'onBookShare'
            }
        }
    },

    init: function() {
        WL.app.on({
            localStorageData: 'onLocalStorageData',
            scope: this
        });
    },

    onLocalStorageData: function(data) {
    
        var store = Ext.getStore('Books');

        this.initContainer();
        store.setData(data.books);
        store.fireEvent('load', store, store.data);

        this.onFirstLoad(data.profileId);
    },

    onFacebookLogin: function() {

        Ext.getBody().removeCls('splashBg');

        Ext.getStore('Books').onBefore('datarefresh', function(store, data, operation, eOpts, e) {

            var cache = JSON.stringify({
                books: operation.getResponse().books,
                profileId: FB.getUserID()
            });

            if (window.localStorage && window.localStorage.WL && window.localStorage.WL == cache) {
                return false;
            }

            window.localStorage.WL = cache;

            if (!this.firstLoad) {
                this.onFirstLoad(FB.getUserID());
                this.firstLoad = true;
            }
        }, this);

        Ext.getStore('Books').load();
    },

    onFirstLoad: function(profileId) {
        Ext.getCmp('fbProfilePic').setData({
            profileId: profileId
        });

        var learnMore = Ext.ComponentQuery.query('#promo-container')[0];

        learnMore.element.on({
            tap: this.onAbout,
            scope: this,
            delegate: 'button'
        });
    },

    onSearchButton: function() {
        var bar = this.getBookList().down('bookSearchBar');
        if(bar.getHidden()){
            bar.show({type: 'fade'});
        }
        else{
            bar.hide();
        }
    },

    onBookTap: function(record) {
        WL.app.updateUrl('book/' + record.get('code'));
        this.showBook(record);
    },

    onViewingTap: function(list, idx, el, record) {
        this.onBookUrl(record.get('bookCode'));
    },

    onBookUrl: function(bookCode) {
        var bookStore = Ext.getStore('Books'),
            book = bookStore.findRecord('code', bookCode);

        if (book) {
            this.showBook(book);
        } 
        else {
            WL.model.Book.load(bookCode, {
                success: function(book) {
                    this.showBook(book);
                },
                scope: this
            });
        }
    },

    onSearch: function(searchField) {

        var searchStore = Ext.getStore('Search'),
                  value = searchField.getValue();

        if (value != '') {
        
            this.getBookList().setMasked({ xtype: 'loadmask' });
            
            searchStore.load({
                params: { q: searchField.getValue() },
                callback: function() {
                    this.getBookList().setStore(searchStore);
                    this.getBookList().setMasked(false);
                },
                scope: this
            });
        }
    },

    onSearchClear: function() {
        this.getBookList().setStore(Ext.getStore('Books'));
    },

    onBookIconTap: function() {
        this.getSearchButton().show();
        this.getMain().setActiveItem(this.getBookList());
    },

    onActivityIconTap: function() {

        this.getSearchButton().hide();

        if (!this.activityCard) {
            this.activityCard = Ext.widget('activity');
            Ext.getStore('Activity').load();
        }
        this.getMain().setActiveItem(this.activityCard);
        this.activityCard.deselectAll();
    },

    onSortToggle: function(segBtn, btn){

        this.getBookList().setStore(Ext.getStore('Books'));
        this.getBookList().setMasked({ xtype: 'loadmask' });
        this.getBookList().deselectAll();

        Ext.getStore('Books').getProxy().setExtraParams({sort: btn.getText()});
        Ext.getStore('Books').loadPage(1);
    },

    onProfileTap: function(cmp) {

        if (!this.logoutCmp) {

            this.logoutCmp = Ext.create('Ext.Panel', {
                width: 120,
                height: 45,
                top: 0,
                left: 0,
                modal: true,
                cls:'float-panel', //2.1
                hideOnMaskTap: true,
                items: [
                    {
                        xtype: 'button',
                        id: 'logoutButton',
                        text: 'Logout',
                        ui: 'decline'
                    }
                ]
            });
        }

        this.logoutCmp.showBy(cmp);
    },

    logout: function() {
        this.logoutCmp.hide();
        FB.logout();
    },

    onFacebookLogout: function() {

        Ext.getBody().addCls('splashBg');
        Ext.Viewport.setActiveItem({ xtype: 'loggedOut' });

        if (this.bookDetailCmp) {
            this.bookDetailCmp.destroy();
        }

        this.getMain().destroy();
    },

    onBookShare: function() {

        var me = this;

        Ext.create('WL.view.Dialog', {
            msg: "Share this book to your Wall?",
            items: [
                {
                    xtype: 'textfield',
                    labelWidth: 0,
                    width: '100%',
                    cls: 'wallMessage',
                    id: 'wallMessage',
                    placeHolder: 'Message...'
                }
            ],
            buttons: [
                {
                    ui: 'green',
                    text: 'Post to wall.',
                    handler: function() {
                        me.postToWall();
                        this.getParent().hide();
                    }
                },
                {
                    ui: 'red',
                    text: "No thanks.",
                    handler: function() {
                        this.getParent().hide()
                    }
                }
            ]
        }).show();
    },

    onAbout: function() {
        Ext.create('WL.view.Dialog', {
            msg: [
                "<p>The Watch Lib a été réalisé par Abdollatiif Serhani et Mohammed Regragui Avec Sencha Touch et Node.js, des frameworks Javascript qui vous permettent de créer facilement de créer belles applications mobiles à l'aide de Javascript, HTML5 et CSS3</p>"
            ].join(''),
            buttons: [
                {
                    ui: 'green',
                    text: 'Visitez notre site',
                    handler: function() {
                        window.open("http://www.ism.ma", "_blank");
                    }
                }
            ]
        }).show();
    },

    onPlayTrailer: function(book) {
        var bookCode = book.get('trailer').match(/v=(.*)$/);
        WL.app.getController('YouTube').showTrailer(bookCode[1]);
    },

    onFacebookUnauthorized: function() {
        if (this.mainContainer) {
            Ext.create('WL.view.Dialog', {
                msg: "Oops! Your Facebook session has expired.",
                buttons: [
                    {
                        ui: 'green',
                        text: 'Login to Facebook',
                        handler: function() {
                            window.location = WL.Facebook.redirectUrl();
                        }
                    }
                ]
            }).show();
        } 
        else {
            Ext.Viewport.add({ xtype: 'loggedOut' });
        }
    }
    
});

