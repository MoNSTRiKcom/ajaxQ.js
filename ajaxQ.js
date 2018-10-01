/*!
 * jQuery ajaxQ Plugin
 * version: 2.8-2017.10.24
 * Requires jQuery v1.5 or later
 * Copyright (c) 2017 NY. Cherkasov (Monstrik)
 * Vk: https://vk.com/monstrikcom
 * Dual licensed under the MIT and GPL licenses.
 * Example: $('form').ajaxQ({'url' : '/ajax/'});
 */

/*! эталон ответа сеовера
 *
 * arr = {
 * 	'redirect':'#redirect',
 * 	'url':'new_url',
 * 	'attr': [
 * 		{'dom': 'input','attr':'value','value':'значение','name':'id'},
 * 		{'dom': 'input[name=namef]','attr':'disabled','value':'disabled'}
 * 	],
 * 	'message': [
 * 		{'text':'строка сообщения обычная'},
 * 		{'text':'строка сообщения красная', 'type':'red'},
 * 		{'text':'строка сообщения зелёная', 'type':'green'}
 * 	],
 * 	'tooltip': [
 * 		{'dom': 'input[name=namef]','text':'строка сообщения зелёная','type':'green'}
 * 	],
 * 	'content': '<b>любой HTML</b>'
 * 	'remove': 'DOM объект'
 * 	'before': 'DOM объект'
 * 	'contentBefore': '<b>любой HTML</b>'
 * 	'after': 'DOM объект'
 * 	'contentAfter': '<b>любой HTML</b>'
 * 	'append': 'DOM объект'
 * 	'contentAppend': '<b>любой HTML</b>'
 * };
 */

(function($){

	var dataAjax = {};

	// Скрываем поля .tooltip рядом с input и textarea
	$("input, textarea").click(function() { $(this).next('.tooltip').remove(); });

	$.fn.ajaxQ = function( options )
	{

		// Настройки по-умолчанию
		var shade = '<div class="ajaxOut"><div class="ajaxLoad"></div></div>', // HTML шторка
			settings = $.extend({
				'url': window.location.href, 	// адрес отправки
				'callback_param': false,		// параметры функции по завершению
				'callback_success': false,		// вызов функции после ответа от сервера
				'callback_complete': false,		// вызов функции по завершению
				'disabled': true,				// блокировка форм
				'data': false, 					// дополнительные параметры
				'timeout': false, 				// автоповтор, если установлен интервал
				'dom': this, 					// вывод в DOM
				'before': false, 				// вывод перед элементов DOM
				'after': false, 				// вывод после элементов DOM
				'remove': false, 				// удаление элементов DOM
				'shade': true,					// шторка ожидания ответа
				'dataType': false,				// xml, json, script, или html
				'processData': false,			// преобразование данных
				'contentType': false,			// данные передаются в указанном виде
				'alert': false,					// alert с ответом
				'console': false				// console.log с ответом
			}, options);

		return this.each(function()
		{
			t = $(this);

			// устанавливаем url отправки
			if (t.attr("action")) settings['url'] = t.attr("action");

			// Очищаем меcто под новый контент
			if (settings['before'])	$(settings['before']).html();
			if (settings['after'])	$(settings['after']).html();
			if (settings['dom'])	$(settings['dom']).html();

			// Удаляем шторку
			t.find('.ajaxOut').remove();

			// Добавляем шторку
			if (settings['shade']) t.append(shade);

			// Собираем формы
			dataAjax = new FormData();
			t.find("input[type=text], input[type=password], input[type=file], input[type=hidden], input[type=radio]:checked, input[type=checkbox]:checked, select, textarea, button").each(function(e)
			{
				var value = $(this).val();
				if( $(this).attr('type') == 'file' ) value = this.files[0];

				if ( $(this).attr('name') && $(this).is(':enabled') ) { dataAjax.append( $(this).attr('name'), value ); }
			});

			// Если переданы параметры data
			if (settings['data']) dataAjax.append('data', settings['data']);

			// Блокируем формы
			if (settings['disabled']) t.find("*:not(:disabled)").addClass('disabled').attr('disabled', 'disabled');

			// Ajax запрос
			if (settings['timeout']) ajaxQcircleStart(t, settings);
			else ajaxQStart(t, settings);

			// Разблокируем формы
			t.find(".disabled").removeClass('disabled').removeAttr('disabled');
		});

	};

	// Ajax запрос
	ajaxQStart = function(t, settings)
	{
		// GET параметры
		var get = ( (settings['url'].indexOf('?') + 1) ? "&" : "?" ) + "ref=" + document.location.href;

		$.ajax({
			type: "POST",
			url: settings['url'] + get,
			dataType: settings['dataType'],
			processData: settings['processData'],
			contentType: settings['contentType'],
			cache: false,
			data: dataAjax,

			// Удачные ответ
			success: function(result)
			{
				// выводим alert если включён дебаг
				if (settings['alert']) { alert(result); console.log(result); }
				if (settings['console']) console.log(result);

				// Проверяем на JSON
				if (isJSON(result)) result = JSON.parse(result);
				else { $(settings['dom']).html(result); return; }

				if (result == null)
				{
					if (settings['shade']) { t.find('.ajaxOut').click(function(){ $(this).hide(0); }).html('<div class="block"><span class="error">Страница не доступна</span></div>'); }
					return;
				}

				// Редирект
				if (result.redirect) { document.location.href = result.redirect; return; }

				// Новый урл
				if (result.url) window.history.replaceState('', '', result.url);

				// Строка сообщения в шторку
				if (settings['shade'] && result.message)
				{
					message = "";
					result.message.forEach(function(e) { if (e.text) message += '<span class="' + ( (e.type) ? e.type : "" ) + '">' + e.text + '</span>'; });
					t.find('.ajaxOut').click(function(){ $(this).hide(0); }).html('<div class="block">' + message + '</div>');
				}

				// Устанавливаем tooltip
				if (result.tooltip)
				{
					result.tooltip.forEach(function(e) { if (e.dom && e.text) $(e.dom).after('<span class="tooltip' + ( (e.type) ? " " + e.type : "" ) + '">' + e.text + '</span>'); });
				}

				// Вставка контента
				if (result.before && result.contentBefore)	$(result.before).before(result.contentBefore);
				if (settings['before'] && result.content) 	$(settings['before']).before(result.content);

				if (result.after && result.contentAfter)	$(result.after).after(result.contentAfter);
				if (settings['after'] && result.content)	$(settings['after']).after(result.content);

				if (result.html && result.contentHtml)		$(result.html).html(result.contentHtml);
				if (settings['html'] && result.content)		$(settings['html']).html(result.content);

				if (result.append && result.contentAppend)	$(result.append).append(result.contentAppend);
				if (settings['dom'] && result.content)		$(settings['dom']).html(result.content);

				if (result.remove)							$(result.remove).remove();
				if (settings['remove'])						$(settings['remove']).remove();

				// Изменения атрибутов
				if (result.attr)
				{
					result.attr.forEach(function(e)
					{
						if (e.dom && e['attr'])
						{
							switch(e['attr'])
							{
								case 'html': 	$(e.dom).html(e['value']); 		break;
								case 'val': 	$(e.dom).val(e['value']); 		break;
								case 'text': 	$(e.dom).text(e['value']); 		break;
								case 'checked':	$(e.dom).attr('checked');		break;
								case 'class': case 'addclass':	$(e.dom).addClass(e['value']); 	break;
								case 'removeclass': $(e.dom).removeClass(e['value']); 	break;
								case 'data': 	$(e.dom).data( (e['name']) ? e['name'] : 'data', e['value'] ); break;

								default: $(e.dom).attr( e['attr'], e['value'] ); break;
							}
						}
					});
				}

				// Вызываем колбэк
				executCallback( settings, 'success', result);

			},

			// Вызываем функцию по завершению
			complete: function()
			{
				// Вызываем колбэк
				executCallback( settings, 'complete');
			},

			// Ошибка запроса
			error: function(jqXHR, textStatus, errorThrown)
			{
				// Выводим сообщение в шторку
				if (settings['shade']) t.find('.ajaxOut').click(function(){ $(this).hide(0); }).html("<div class='block'><span class='error'>Страница не доступна</span></div>");
			}
		});
	};

    // Выполняем Callback функцию
    executCallback = function (settings, type, result)
    {
    	var result = result || null;
	    var callback_name = 'callback_' + type;

	    // Если строка
	    if(typeof settings[callback_name] == 'string' )
	    {
			data = settings['callback_param'] ? settings['callback_param'] : result ;
			parseCallback(settings[callback_name], data, settings);
	    }

	    // Если функция
	    else if (typeof settings[callback_name] == 'function') settings[callback_name](result);

	    // Если массив
	    else if (Array.isArray(settings[callback_name])) settings[callback_name].forEach(function(item) { parseCallback(item, result, settings); });
    }

    // обработка каллбеков / разбор массивов
    parseCallback = function(item, data, settings)
    {
    	var data = data || false;
    	// разбиваем строку
		var arr = item.split('|');

		// Вызываем объект jQuery
		if (arr.length > 2) $.fn[arr[0]](arr[1], arr[2], data); // $.fn.core('имя метода','параметр', result);
		else if (arr.length > 1) $.fn[arr[0]](arr[1], data);
		// Вызываем функцию
		else $.fn[settings['module']](item, data );
    };

	// Цикличный запрос
	ajaxQcircleStart = function(t, settings)
	{
		window.circleTime = setTimeout(function()
	    {
			ajaxQStart(t, settings);		// Ajax запрос
			ajaxQcircleStart(t, settings); 	// повтор цикла
		}, settings['timeout']);
	};

	// Остановить цикличный запрос
	ajaxQcircleStop = function(settings) { clearTimeout(window.circleTime); };

	// Проверка на JSON
	isJSON = function(string) { try { JSON.parse(string); } catch (e) { return false; } return true; };

})( jQuery );