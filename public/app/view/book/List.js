/**
 * This view contains functionality shared between the book list component for Phone and Tablet profiles.
 */
Ext.define('WL.view.book.List', {

	extend: 'Ext.List',
	
	requires: [
		'Ext.form.Panel',
		'Ext.plugin.ListPaging',
		'Ext.TitleBar',

		'WL.view.book.SortBar',
		'WL.view.book.SearchBar'
	],

	config: {

		store: 'Books',

        plugins: [
            { xclass: 'Ext.plugin.ListPaging' }
        ],

		itemCls: 'expandedMovie',

        itemHeight:114, 
        
		items: [

            { xtype: 'bookSortBar' , docked:'top'},
            { xtype: 'bookSearchBar' , docked:'top' , hidden:true},
            {
                xtype: 'container',
                cls: 'promo',
                itemId:'promo-container',
                docked:'bottom',
                html: '<span class="logo"></span>Réalisé par Abdollatiif & Mohamed<button>Learn More</button>'
            }
		],

		loadingText: null
	},

	friendActivityFormatter: function(activity) {

		var pics = [], friendIds = [], additionalFriends, numAdditionalFriends, i;

		if (activity && activity.length) {

			for (i=0; i < activity.length; i++) {
				if (!Ext.Array.contains(friendIds, activity[i].profileId)) {
    				pics.push('<img src="http://src.sencha.io/20/https://graph.facebook.com/' + activity[i].profileId + '/picture?type=square" />');
    				friendIds.push(activity[i].profileId);
				}
			}

			numAdditionalFriends = pics.length - 5;
			additionalFriends = numAdditionalFriends > 0 ? (' + ' + numAdditionalFriends + ' friend' + (numAdditionalFriends > 1 ? 's' : '')) : '';

			return pics.slice(0,5).join('') + additionalFriends;

		} 
		else {
			return 'No Friend Activity'
		}
	},

    applyItemTpl: function(){
    	var itemTpl = this.callParent(arguments);
    	itemTpl.friendActivity = this.friendActivityFormatter;
    	return itemTpl;
    }
    
});
