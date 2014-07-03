Ext.define('WL.controller.Facebook', {

    extend: 'Ext.app.Controller',

    requires: ['WL.Facebook'],

    config: {
        control: {
            '#fbLogin': {
                tap: 'onFacebookLogin'
            }
        }
    },

    init: function() {
        WL.Facebook.on({
            exception: function() {
                Ext.create('WL.view.Dialog', { msg: 'The connection to Facebook has timed out' }).show();
            },
            loginStatus: function() {
                Ext.get('loading').destroy();
            }
        });
    },

    onFacebookLogin: function() {
        window.top.location = WL.Facebook.redirectUrl();
    }
});
