/**
 * The definition for the Search bar at the top of the book list
 */
Ext.define('WL.view.book.SearchBar', {

	extend: 'Ext.form.Panel',
	
	xtype: 'bookSearchBar',

	config: {

    	scrollable: false,
        cls: 'search',
        id: 'searchContainer',

        items: [
        	{
        		xtype: 'textfield',
        		clearIcon: true,
        		labelWidth: 0,
		        inputCls: 'searchField',
        		placeHolder: 'Mot à chercher...',
        		id: 'searchField'
        	}
        ]
	}
});
