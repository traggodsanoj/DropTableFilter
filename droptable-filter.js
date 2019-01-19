// <nowiki>
(function($, util){
	'use strict'; 
	if ($('table.item-drops.filterable').length == 0) {
		return;
	}

	var userSettings,
		settingsName = 'rsw-drop-display-settings2',
		defaultSettings = {ratedisp: 1, memitemfilt: true, memcoldisp: true, valcoldisp: 1};
	
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
	function changeRateDisp(data,init){
		var  rdisp = 0, attr = '', append = '', upsettings = false;
		if (init == true) {
			rdisp = data;
		} else {
			rdisp = data.getData();
		}
		console.log('changing rate displayed data to type '+rdisp);
		switch(rdisp) {
			case 1:
				attr = 'data-drop-fraction';
				upsettings = true;
				break;
			case 2:
				attr = 'data-drop-oneover';
				upsettings = true;
				break;
			case 3:
				attr = 'data-drop-percent';
				upsettings = true;
				append = '%';
				break;
			default:
				console.log('Invalid rate display type '+rdisp);
		}
		$('table.item-drops td span[data-drop-fraction]').each(function(){
			var $cell = $(this), newText = $cell.attr(attr);
			$cell.text(newText + append);
		});
		if (upsettings == true) {
			userSettings.ratedisp = rdisp;
			updateSettings();
		}
	}

	// change filter for members items
	function changeMemsFilter(data){
		console.log('changing members filter to type '+data);
		var tbl = 'table.item-drops.filterable';
		var upsettings = false;
		if (data == false) {
			$(tbl).each(function(){
				$(this).addClass('rsw-dropsline-hidemembers');
			});
			upsettings = true;
		} else if (data == true) {
			$(tbl).each(function(){
				$(this).removeClass('rsw-dropsline-hidemembers');
			});
			upsettings = true;
		} else {
			console.log('Invalid members filter type '+data);
		}
		if (upsettings == true) {
			userSettings.memitemfilt = data;
			updateSettings();
		}
	}

	// toggle display of members item column
	function changeMemsDisp(data){
		console.log('changing members item column to '+data);
		var tbl = 'table.item-drops.filterable';
		var upsettings = false;
		//function - show/hide column, hide/show icon
		if (data == false) {
			$(tbl).each(function(){
				$(this).addClass('rsw-dropsline-hidememcol');
			});
			upsettings = true;
		} else if (data == true) {
			$(tbl).each(function(){
				$(this).removeClass('rsw-dropsline-hidememcol');
			});
			upsettings = true;
		} else {
			console.log('Invalid members item column setting '+data);
		}
		if (upsettings == true) {
			userSettings.memcoldisp = data;
			updateSettings();
		}
	}

	// change value display column
	function changeValDisp(data,init){
		var tbl = 'table.item-drops.filterable';
		var vdisp = 0, upsettings = false;
		if (init == true) {
			vdisp = data;
		} else {
			vdisp = data.getData();
		}
		console.log('changing value column display to type '+vdisp);
		switch (vdisp) {
			case 1:
				$(tbl).each(function(){
					$(this).removeClass('rsw-dropsline-hidege');
					$(this).addClass('rsw-dropsline-hidealch');
				});
				upsettings = true;
				break;
			case 2:
				$(tbl).each(function(){
					$(this).addClass('rsw-dropsline-hidege');
					$(this).removeClass('rsw-dropsline-hidealch');
				});
				upsettings = true;
				break;
			case 3:
				$(tbl).each(function(){
					$(this).removeClass('rsw-dropsline-hidege');
					$(this).removeClass('rsw-dropsline-hidealch');
				});
				upsettings = true;
				break;
			default:
				console.log('Invalid value column display type '+vdisp);
		}
		if (upsettings == true) {
			userSettings.valcoldisp = vdisp;
			updateSettings();
		}
	}
	
	// initialise
	function init() {
		var $tables = $('table.item-drops.filterable'),
		$overlay = $('<div id="rsw-drops-overlay2">').appendTo('body'),
		popup,
		fieldset, applyButton, 
		fractionButton, overoneButton, percentButton, rateGroup, 
		membersToggle, memberstGroup, memscolToggle, memscoltGroup,
		gecolButton, alcolButton, bothcolButton, valGroup;

		console.log('Tables found: '+$tables);
		
		// get settings and update display
		getSettings();
		changeRateDisp(userSettings.ratedisp,true);
		changeMemsFilter(userSettings.memitemfilt);
		changeMemsDisp(userSettings.memcoldisp);
		changeValDisp(userSettings.valcoldisp,true);
		
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
		rateGroup.on('choose',changeRateDisp);

		// Members items filter
		membersToggle = new OO.ui.ToggleSwitchWidget({
			value: true,
			title: 'Toggle display of members items on and off.'
		});
		memberstGroup = new OO.ui.FieldLayout(membersToggle, {label: 'Display members items: ', align: 'top'});
		membersToggle.setValue(userSettings.memitemfilt);
		membersToggle.on('change',changeMemsFilter);
		//Members column toggle
		memscolToggle = new OO.ui.ToggleSwitchWidget({
			value: false,
			title: 'Toggle the members/non-members column on and off.',
		});
		memscolToggle.setValue(userSettings.memcoldisp);
		memscolToggle.on('change',changeMemsDisp);
		memscoltGroup = new OO.ui.FieldLayout(memscolToggle, {label: 'Toggle members column: ', align: 'top'});

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
		valGroup.on('choose',changeValDisp);
		
		fieldset = new OO.ui.FieldsetLayout({});
		fieldset.addItems([
			new OO.ui.FieldLayout(rateGroup, {label: 'Display drops as: ', align: 'top'}),
			new OO.ui.HorizontalLayout({items: [memberstGroup, memscoltGroup]}),
			new OO.ui.FieldLayout(valGroup, {label: 'Display price/value as: ', align: 'top'}),
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
				membersToggle.setValue(userSettings.memitemfilt);
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
