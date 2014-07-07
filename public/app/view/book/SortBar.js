/**
 * The definition for the Sort bar at the top of the movie list
 */
Ext.define('WL.view.book.SortBar', {

	extend: 'Ext.Toolbar',
	
	xtype: 'bookSortBar',

	config: {

		cls: 'sort',
		id: 'sortContainer',

		items: [
			{
				xtype: 'segmentedbutton',
				id: 'sortBy',
				flex: 1,

				layout: {
					pack: 'center'
				},

				defaults: {
		    		xtype: 'button',
				iconCls: 'refresh',
		    		flex: 1
				},

				items: [
		    		{ text: 'Popular', pressed: true },
		    		{ text: 'Rating' },
		    		{ text: 'Release Date' }
				]
			}
		]
	}
});
