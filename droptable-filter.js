// <nowiki>
(function($, util){
	'use strict'; 
	if ($('table.item-drops.filterable').length == 0) {
		return;
	}

	var userSettings,
		settingsName = 'rsw-drop-display-settings2',
		defaultSettings = {ratedisp: 1, memitemfilt: 1, memcoldisp: false, valcoldisp: 1};
	
	// grabs settings from localstorage (or defaults if not supported)
	function getSettings(){
		var settings = {};
		if (rswiki.hasLocalStorage()) {
			try {
				settings = JSON.parse(localStorage.getItem(settingsName));
			} catch (err) {
				settings = {};
			}
			if (settings === null) {
				settings = {};
			}

		}
		userSettings = $.extend({}, defaultSettings, settings);
	}
	
	// put settings back into localstorage
	function updateSettings(){
		if (!rswiki.hasLocalStorage()) return;
		localStorage.setItem(settingsName, JSON.stringify(userSettings));
	}
	
	// change rate to a different display
	function changeRateDisp(data){
		console.log('changing rate displayed data to type '+data);
		var  attr = '', append = '';
		switch(data) {
			case 1:
				attr = 'data-drop-fraction';
				break;
			case 2:
				attr = 'data-drop-oneover';
				break;
			case 3:
				attr = 'data-drop-percent';
				append = '%';
				break;
		}
		if (attr === '') return -1;
		
		$('table.item-drops td span[data-drop-fraction]').each(function(){
			var $cell = $(this), newText = $cell.attr(attr);
			$cell.text(newText + append);
		});
		return data;
	}

	// change filter for members items
	function changeMemsFilter(data){
		console.log('changing members filter to type '+data);
		var tbltr = 'table.item-drops.filterable tr';
		switch(data) {
			case 1:
				$(tbltr).each(function(){
					$(this).show();
				});
				break;
			case 2:
				$(tbltr+'.members-item').each(function(){
					$(this).hide();
				});
				$(tbltr+'.nonmembers-item').each(function(){
					$(this).show();
				});
				break;
			case 3:
				$(tbltr+'.members-item').each(function(){
					$(this).show();
				});
				$(tbltr+'.nonmembers-item').each(function(){
					$(this).hide();
				});
				break;
			default:
				return -1;
		}
		return data;
	}

	// toggle display of members item column
	function changeMemsDisp(data){
		console.log('changing members item column to '+data);
		var tbltr = 'table.item-drops.filterable tr';
		var retdata = -1;
		//function - show/hide column, hide/show icon
		if (data == false) {
			$(tbltr+' td.members-column, '+tbltr+' th.members-column').each(function(){
				$(this).hide();
			});
			$(tbltr+' td.item-col sup[title="Members only"]').each(function(){
				$(this).show();
			});
			retdata = 0;
		} else if (data == true) {
			$(tbltr+' td.members-column, '+tbltr+' th.members-column').each(function(){
				$(this).show();
			});
			$(tbltr+' td.item-col sup[title="Members only"]').each(function(){
				$(this).hide();
			});
			retdata = 1;
		}
		return retdata;
	}

	// change value display column
	function changeValDisp(data){
		console.log('changing value column display to type '+data);
		var tblge = 'table.item-drops.filterable tr td.ge-column, table.item-drops.filterable tr th.ge-column';
		var tblalc = 'table.item-drops.filterable tr td.alch-column, table.item-drops.filterable tr th.alch-column';
		switch (data) {
			case 1:
				$(tblge).each(function(){
					$(this).show();
				});
				$(tblalc).each(function(){
					$(this).hide();
				});
				break;
			case 2:
				$(tblge).each(function(){
					$(this).hide();
				});
				$(tblalc).each(function(){
					$(this).show();
				});
				break;
			case 3:
				$(tblge).each(function(){
					$(this).show();
				});
				$(tblalc).each(function(){
					$(this).show();
				});
				break;
			default:
				return -1;
		}
		return data;
	}
	
	// initialise
	function init() {
		var $tables = $('table.item-drops.filterable'),
		$overlay = $('<div id="rsw-drops-overlay2">').appendTo('body'),
		popup,
		fieldset, applyButton, 
		fractionButton, overoneButton, percentButton, rateGroup, 
		membersButton, nonmemsButton, bothmemsButton, membsGroup, 
		memscolToggle, 
		gecolButton, alcolButton, bothcolButton, valGroup;

		console.log('Tables found: '+$tables);
		
		// get settings and update display
		getSettings();
		changeRateDisp(userSettings.ratedisp);
		changeMemsFilter(userSettings.memitemfilt);
		changeMemsDisp(userSettings.memcoldisp);
		changeValDisp(userSettings.valcoldisp);
		
		// build popup
		// Droprate column
		fractionButton = new OO.ui.ButtonOptionWidget({
			data: 1,
			label: 'Default fraction (a/b, default)',
			title: 'Displays a fraction without simplifying, in a/b style. Example: 4/128. This is the default display.',
		});
		overoneButton = new OO.ui.ButtonOptionWidget({
			data: 2,
			label: 'One-over fraction (1/x)',
			title: 'Displays a fraction simplified to 1/x. Fraction denominators are rounded to 3 significant figures.',
		});
		percentButton = new OO.ui.ButtonOptionWidget({
			data: 3,
			label: 'Percentage (y%)',
			title: 'Displays a percentage (y%), rounded to 3 significant figures.',
		});
		rateGroup = new OO.ui.ButtonSelectWidget({
			items: [fractionButton, overoneButton, percentButton]
		});
		rateGroup.selectItemByData(userSettings.ratedisp);

		// Members items
		membersButton = new OO.ui.ButtonOptionWidget({
			data: 3,
			label: 'Members items',
			title: 'Hides all non-member items.',
		});
		nonmemsButton = new OO.ui.ButtonOptionWidget({
			data: 2,
			label: 'Non-members items',
			title: 'Hides all members items.',
		});
		bothmemsButton = new OO.ui.ButtonOptionWidget({
			data: 1,
			label: 'All Items',
			title: 'Displays both members and non-members items.',
		});
		membsGroup = new OO.ui.ButtonSelectWidget({
			items: [membersButton, nonmemsButton, bothmemsButton]
		});
		membsGroup.selectItemByData(userSettings.memitemfilt);

		//Members column toggle
		memscolToggle = new OO.ui.ToggleSwitchWidget({
			value: false,
			title: 'Toggle the members/non-members column on and off.',
		});
		memscolToggle.setValue(userSettings.memcoldisp);

		//Price/Value columns
		gecolButton = new OO.ui.ButtonOptionWidget({
			data: 1,
			label: 'Show GE Price',
			title: 'Display only the GE Price column.',
		});
		alcolButton = new OO.ui.ButtonOptionWidget({
			data: 2,
			label: 'Show High alch value',
			title: 'Display only the high alch value column.',
		});
		bothcolButton = new OO.ui.ButtonOptionWidget({
			data: 3,
			label: 'Show both',
			title: 'Display both the GE Price and high alch value columns.',
		});
		valGroup = new OO.ui.ButtonSelectWidget({
			items: [gecolButton, alcolButton, bothcolButton]
		});
		valGroup.selectItemByData(userSettings.valcoldisp);

		// Apply button
		applyButton = new OO.ui.ButtonInputWidget({
			label: 'Apply',
			flags: ['primary', 'progressive']
		});
		
		applyButton.on('click', function(){
			var upsettings = false;
			// For rate display
			var rval = rateGroup.findSelectedItem(), rdata=1, rretdata = -1;
			if (rval !== null) {
				rdata = rval.getData();
			}
			rretdata = changeRateDisp(rdata);
			if (rretdata !== -1) {
				// update settings only if correct type (should be always but hey)
				userSettings.ratedisp = rretdata;
				upsettings = true;
			}
			// For members items filter
			var mfval = membsGroup.findSelectedItem(), mfdata=1, mfretdata = -1;
			if (mfval !== null) {
				mfdata = mfval.getData();
			}
			mfretdata = changeMemsFilter(mfdata);
			if (mfretdata !== -1) {
				userSettings.memitemfilt = mfretdata;
				upsettings = true;
			}
			// For members column display
			var mcval = memscolToggle.getValue(), mcdata=false, mcretdata = -1;
			if (mcval !== null) {
				mcdata = mcval;
			}
			mcretdata = changeMemsDisp(mcdata);
			if (mcretdata == 0) {
				userSettings.memcoldisp = false;
				upsettings = true;
			} else if (mcretdata == 1) {
				userSettings.memcoldisp = true;
				upsettings = true;
			}
			// For value column display
			var vcval = valGroup.findSelectedItem(), vcdata=1, vcretdata = -1;
			if (vcval !== null) {
				vcdata = vcval.getData();
			}
			vcretdata = changeValDisp(vcdata);
			if (vcretdata !== -1) {
				userSettings.valcoldisp = vcretdata;
				upsettings = true;
			}
			// If settings changed update settings
			if (upsettings == true) {
				updateSettings();
			}
		});
		
		fieldset = new OO.ui.FieldsetLayout({});
		fieldset.addItems([
			new OO.ui.FieldLayout(rateGroup, {label: 'Display drops as: ', align: 'top'}),
			new OO.ui.FieldLayout(membsGroup, {label: 'Filter items: ', align: 'top'}),
			new OO.ui.FieldLayout(memscolToggle, {label: 'Toggle members column: ', align: 'top'}),
			new OO.ui.FieldLayout(valGroup, {label: 'Display price/value as: ', align: 'top'}),
			new OO.ui.FieldLayout(applyButton),
		]);
		
		popup = new OO.ui.PopupWidget({
			padded: true,
			autoClose: true,
			$content: fieldset.$element,
			width: 'auto',
			position: 'above',
			align: 'force-right',
			head: true,
			label: 'Display settings and filters',
			classes: ['rsw-drop-display-popup2']
		});
		$overlay.append(popup.$element);
		
		// add button to each table
		$tables.each(function(){
			console.log('Add button to table header');
			var button = new OO.ui.ButtonWidget({
				icon: 'advanced',
				title: 'Open display settings and filters',
				framed: false,
				invisibleLabel: true,
				classes: ['rsw-drop-display-button2']
			});
			button.on('click',function(){
				// move popup to the clicked button
				popup.setFloatableContainer(button.$element);
				// reset buttons (i.e. open popup, click a button but don't apply, close - next time it is opened it should show the current setting not the unapplied one)
				rateGroup.selectItemByData(userSettings.ratedisp);
				membsGroup.selectItemByData(userSettings.memitemfilt);
				memscolToggle.setValue(userSettings.memcoldisp);
				valGroup.selectItemByData(userSettings.valcoldisp);
				// show popup
				popup.toggle(true);
			});
			
			var $cell = $(this).find('thead>tr>th.drops-img-header');
			$cell.append(button.$element);
		});
	}
	
	$(init);
})(jQuery, rswiki);
// </nowiki>
