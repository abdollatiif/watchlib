/**
 * This controller responds when a user clicks the 'Seen it', 'Want to see it', 'Like' and 'Dislike' buttons shown
 * in the book list and book detail pages.
 */
Ext.define('WL.controller.Viewings', {

    extend: 'Ext.app.Controller',

    config: {
        control: {

            // Target the movieList xtype
            bookList: {
                seen:        'onSeenBook',
                unSeen:      'onUnSeenBook',
                wantToSee:   'onWantToSeeBook',
                unWantToSee: 'onUnWantToSeeBook',
                like:        'onLikeBook',
                unLike:      'onUnLikeBook',
                dislike:     'onDislikeBook',
                unDislike:   'onUnDislikeBook'
            },

            // Target the movieDetail xtype
            bookDetail: {
                seen:        'onSeenBook',
                unSeen:      'onUnSeenBook',
                wantToSee:   'onWantToSeeBook',
                unWantToSee: 'onUnWantToSeeBook',
                like:        'onLikeBook',
                unLike:      'onUnLikeBook',
                dislike:     'onDislikeBook',
                unDislike:   'onUnDislikeBook'
            }
        }
    },

    onWantToSeeBook: function(record) {
        this.updateViewing(record, { wantToSee: true, seen: false, like: false, dislike: false });
    },
    onUnWantToSeeBook: function(record) {
        this.updateViewing(record, { wantToSee: false, seen: false, like: false, dislike: false });
    },

    onSeenBook: function(record) {
        this.updateViewing(record, { wantToSee: false, seen: true, like: false, dislike: false });
    },
    onUnSeenBook: function(record) {
        this.updateViewing(record, { wantToSee: false, seen: false, like: false, dislike: false });
    },

    onLikeBook: function(record) {
        this.updateViewing(record, { like: true, dislike: false });
    },
    onUnLikeBook: function(record) {
        this.updateViewing(record, { like: false, dislike: false });
    },

    onDislikeBook: function(record) {
        this.updateViewing(record, { like: false, dislike: true });
    },
    onUnDislikeBook: function(record) {
        this.updateViewing(record, { like: false, dislike: false });
    },

    updateViewing: function(record, data) {

        if (this.updating) {
            return;
        }

        this.updating = true;

        record.set(data);

        Ext.Ajax.request({
            url: '/viewing',
            method: 'POST',
            params: Ext.apply({
                bookCode: record.data.code,
                title:   record.data.title
            }, data),
            success: function(response) {

                var data = JSON.parse(response.responseText);
                this.updating = false;

                if (data.fbError) {
                    WL.Facebook.error(data.fbError)
                }
            },
            scope: this
        });
    }

});

