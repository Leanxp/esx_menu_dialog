(function () {

	let MenuTpl =
		'<div id="menu_{{_namespace}}_{{_name}}" class="dialog {{#isBig}}big{{/isBig}}">' +
		//'<div class="menu-head" >SERVER NAME</div>' +
		'<div class="menu-head">' +
			'<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-react-native" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ff9300" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>  <path d="M6.357 9c-2.637 .68 -4.357 1.845 -4.357 3.175c0 2.107 4.405 3.825 9.85 3.825c.74 0 1.26 -.039 1.95 -.097" />  <path d="M9.837 15.9c-.413 -.596 -.806 -1.133 -1.18 -1.8c-2.751 -4.9 -3.488 -9.77 -1.63 -10.873c1.15 -.697 3.047 .253 4.974 2.254" />  <path d="M6.429 15.387c-.702 2.688 -.56 4.716 .56 5.395c1.783 1.08 5.387 -1.958 8.043 -6.804c.36 -.67 .683 -1.329 .968 -1.978" />  <path d="M12 18.52c1.928 2 3.817 2.95 4.978 2.253c1.85 -1.102 1.121 -5.972 -1.633 -10.873c-.384 -.677 -.777 -1.204 -1.18 -1.8" />  <path d="M17.66 15c2.612 -.687 4.34 -1.85 4.34 -3.176c0 -2.11 -4.408 -3.824 -9.845 -3.824c-.747 0 -1.266 .029 -1.955 .087" />  <path d="M8 12c.285 -.66 .607 -1.308 .968 -1.978c2.647 -4.844 6.253 -7.89 8.046 -6.801c1.11 .679 1.262 2.706 .56 5.393" />  <path d="M12.26 12.015h-.01c-.01 .13 -.12 .24 -.26 .24a0.263 .263 0 0 1 -.25 -.26c0 -.14 .11 -.25 .24 -.25h-.01c.13 -.01 .25 .11 .25 .24" />'+
			'</svg>'+
			
		'</div>'+
		'<div class="subtitle" >{{title}}</div>' +
		/**'{{#isDefault}}<input type="text" name="value" placeholder="{{title}}" id="inputText"/>{{/isDefault}}' +**/
		'{{#isDefault}}<input type="text" name="value" placeholder="" id="inputText"/>{{/isDefault}}' +
		'{{#isBig}}<textarea name="value"/>{{/isBig}}' +
		//'<button type="button" name="submit">OK</button>'+
		'<button type="button" name="submit"><span>CONFIRMAR</span></button>'+

		'</div>' +
		'</div>'
		;

	window.ESX_MENU = {};
	ESX_MENU.ResourceName = 'esx_menu_dialog';
	ESX_MENU.opened = {};
	ESX_MENU.focus = [];
	ESX_MENU.pos = {};

	ESX_MENU.open = function (namespace, name, data) {

		if (typeof ESX_MENU.opened[namespace] == 'undefined') {
			ESX_MENU.opened[namespace] = {};
		}

		if (typeof ESX_MENU.opened[namespace][name] != 'undefined') {
			ESX_MENU.close(namespace, name);
		}

		if (typeof ESX_MENU.pos[namespace] == 'undefined') {
			ESX_MENU.pos[namespace] = {};
		}

		if (typeof data.type == 'undefined') {
			data.type = 'default';
		}

		if (typeof data.align == 'undefined') {
			data.align = 'top-left';
		}

		data._index = ESX_MENU.focus.length;
		data._namespace = namespace;
		data._name = name;

		ESX_MENU.opened[namespace][name] = data;
		ESX_MENU.pos[namespace][name] = 0;

		ESX_MENU.focus.push({
			namespace: namespace,
			name: name
		});

		document.onkeyup = function (key) {
			if (key.which == 27) { // Escape key
				$.post('http://' + ESX_MENU.ResourceName + '/menu_cancel', JSON.stringify(data));
			} else if (key.which == 13) { // Enter key
				$.post('http://' + ESX_MENU.ResourceName + '/menu_submit', JSON.stringify(data));
			}
		};

		ESX_MENU.render();

	};

	ESX_MENU.close = function (namespace, name) {

		delete ESX_MENU.opened[namespace][name];

		for (let i = 0; i < ESX_MENU.focus.length; i++) {
			if (ESX_MENU.focus[i].namespace == namespace && ESX_MENU.focus[i].name == name) {
				ESX_MENU.focus.splice(i, 1);
				break;
			}
		}

		ESX_MENU.render();

	};

	ESX_MENU.render = function () {

		let menuContainer = $('#menus')[0];

		$(menuContainer).find('button[name="submit"]').unbind('click');
		// $(menuContainer).find('button[name="cancel"]').unbind('click');
		$(menuContainer).find('[name="value"]').unbind('input propertychange');

		menuContainer.innerHTML = '';

		$(menuContainer).hide();

		for (let namespace in ESX_MENU.opened) {
			for (let name in ESX_MENU.opened[namespace]) {

				let menuData = ESX_MENU.opened[namespace][name];
				let view = JSON.parse(JSON.stringify(menuData));

				switch (menuData.type) {
					case 'default': {
						view.isDefault = true;
						break;
					}

					case 'big': {
						view.isBig = true;
						break;
					}

					default: break;
				}

				let menu = $(Mustache.render(MenuTpl, view))[0];

				$(menu).css('z-index', 1000 + view._index);

				$(menu).find('button[name="submit"]').click(function () {
					ESX_MENU.submit(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				// $(menu).find('button[name="cancel"]').click(function () {
				// 	ESX_MENU.cancel(this.namespace, this.name, this.data);
				// }.bind({ namespace: namespace, name: name, data: menuData }));

				$(menu).find('[name="value"]').bind('input propertychange', function () {
					this.data.value = $(menu).find('[name="value"]').val();
					ESX_MENU.change(this.namespace, this.name, this.data);
				}.bind({ namespace: namespace, name: name, data: menuData }));

				if (typeof menuData.value != 'undefined')
					$(menu).find('[name="value"]').val(menuData.value);

				menuContainer.appendChild(menu);
			}
		}

		$(menuContainer).show();
		$("#inputText").focus();
	};

	ESX_MENU.submit = function (namespace, name, data) {
		$.post('http://' + ESX_MENU.ResourceName + '/menu_submit', JSON.stringify(data));
	};

	// ESX_MENU.cancel = function (namespace, name, data) {
	// 	$.post('http://' + ESX_MENU.ResourceName + '/menu_cancel', JSON.stringify(data));
	// };

	ESX_MENU.change = function (namespace, name, data) {
		$.post('http://' + ESX_MENU.ResourceName + '/menu_change', JSON.stringify(data));
	};

	ESX_MENU.getFocused = function () {
		return ESX_MENU.focus[ESX_MENU.focus.length - 1];
	};

	window.onData = (data) => {

		switch (data.action) {
			case 'openMenu': {
				ESX_MENU.open(data.namespace, data.name, data.data);
				break;
			}

			case 'closeMenu': {
				ESX_MENU.close(data.namespace, data.name);
				break;
			}
		}

	};

	window.onload = function (e) {
		window.addEventListener('message', (event) => {
			onData(event.data);
		});
	};

})();