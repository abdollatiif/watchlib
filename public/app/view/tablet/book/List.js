Ext.define('WL.view.tablet.book.List', {

	extend: 'WL.view.book.List',

	config: {

		listeners: {
            itemtap: function(dataview, index, target, record, evt) {
                var el = Ext.get(evt.target);
            	this.fireEvent('tapBook', record, el);
            }
        },

		itemTpl: Ext.create('Ext.XTemplate',
		    '<div class="img"><img src="{smallImage}" /></div>',
		    '<div class="meta">',
		        '<h3>{title}</h3>',
		        '<div class="actions">',
		            '<div class="rating"><span>{% if (values.criticRating >= 0) { %}{criticRating}%{% } else { %}?{% } %}</span></div>',
            		'<p>{formattedReleaseDate}</p>',
		        '</div>',
		        '<div class="friends">{[this.friendActivity(values.friendActivity)]}</div>',
		    '</div>'
		)
    }
});
