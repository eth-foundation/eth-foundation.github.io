function $ ( s )  {
    return document.querySelector(s);
}

$.render = function(dom){
    document.body.add(dom);
};
Node.prototype.remove = function (){
    this.parentNode.removeChild(this);
};
Node.prototype.replaceDOM = function ( DOMelementTo ){
	this.parentNode.insertBefore(DOMelementTo, this);
	this.parentNode.removeChild(this);
};
Node.prototype.cls = function (child) {
    this.innerHTML = '';
    return this;
};
Node.prototype.add = function (child) {
	if (child instanceof Node) {
		this.appendChild(child);
	}else{
		for (var item in child) {
			this.appendChild(child[item]);
		}
	}
	return this;
};
Node.prototype.events = function (... arr ) {
	for (var i = 0; i < arr.length; i++) {
		for(var item in arr[i]){
			this[item] = arr[i][item];
		}
	}
	return this;
};
Node.prototype.addClass = function (className) {
    this.classList.add(className);
    return this;
};
Node.prototype.removeClass = function (className) {
    this.classList.remove(className);
    return this;
};


Node.prototype.attr = function (attrName, value) {
	this.setAttribute(attrName, value);
	return this;
}
Node.prototype.text = function (str) {
	if (this.tagName === 'INPUT') {
		if (str == null) {
			return this.value;
		} else {
			this.value = str;
			return this;
		}
	}else{
		if (str == null) {
			return this.innerHTML;
		} else {
			this.innerHTML = str;
			return this;
		}
	}
};

(function(){
	function div (config, tag, attr) {
		if (typeof config === 'string' || typeof config === 'number') {
		   return div([document.createTextNode(config+'')], tag, attr);
		}

		var el = document.createElement(tag || 'div');

		if (attr && typeof attr === 'object') {
			for(var atr in attr){
				el.setAttribute(atr, attr[atr]);
			}
		}
		if (config instanceof Node) {
			el.appendChild(config)
		}else{
			for (var item in config) {
				el[item] = config[item];
				el.appendChild(config[item])
			}
		}
		return el;
	}
	var arrTags = "a$abbr$acronym$address$applet$area$article$aside$audio$b$base$basefont$bdi$bdo$big$blockquote$body$br$button$canvas$caption$center$cite$code$col$colgroup$command$datalist$dd$del$details$dfn$dir$div$dl$dt$em$embed$fieldset$figcaption$figure$font$footer$form$frame$frameset$h1$h2$h3$h4$h5$h6$head$header$hgroup$hr$html$i$iframe$img$input$ins$kbd$keygen$label$legend$li$link$map$mark$menu$meta$meter$nav$noframes$noscript$object$ol$optgroup$option$output$p$param$pre$progress$q$rp$rt$ruby$s$samp$script$section$select$small$source$span$strike$strong$style$sub$summary$sup$table$tbody$td$textarea$tfoot$th$thead$time$title$tr$track$tt$u$ul$var$video$wbr".split('$')
	for (var i = 0; i < arrTags.length; i++) {
		switch (arrTags[i]) {
			case "a":
				window["$" + arrTags[i]] = function(paramA, paramB) {
					var _a = document.createElement('a');
					_a.innerHTML = paramA instanceof Node? paramA.outerHTML: paramA +"";
					if(paramB){
						for(var item in paramB){
							_a[item] = paramB[item];
						}
					}
					return _a;
				}

				break;
			case "table":
				window["$" + arrTags[i]] = function(paramA, paramB) {
					if(!paramA) return $(null, 'table');
					var d = $(null, 'table'), tbody, tr;
					
					if(paramA.caption) d.add($caption(paramA.caption))
					if(paramA.head) {
						d.add($thead(tr = $tr()));
						for (var j = 0; j < paramA.head.length; j++) {
							tr.add($th(paramA.head[j]))	
						}
					}
					if(paramA.foot) {
						d.add($tfoot(tr = $tr()));
						for (var j = 0; j < paramA.foot.length; j++) {
							tr.add($td(paramA.foot[j]))	
						}
					}
					if(paramB) paramA = paramB;
					d.add(tbody = $tbody());
					for (var i = 0; i < paramA.length; i++) {
						tbody.add(tr = $tr());
						for (var j = 0; j < paramA[i].length; j++) {
							tr.add($td(paramA[i][j]))	
						}
					}
					return d;
				}
				break;
			default:
				window["$" + arrTags[i]] = (function(tag){
					return function(content, attr) {
						return div(content, tag, attr);
					}
				})(arrTags[i])
				break;
		}
	}
})();

