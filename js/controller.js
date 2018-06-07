///////////////////////////////////
// VIEW Interface
window.modelObject = {
	address: ''
};
$.auth = {
	btnPrivateKey: 		$('page#auth-pk button#btnPK'),
	btnKeyStore: 		$('page#auth-pk input#fileInput'),
	btnCreateNewWallet: $('page#auth-pk button#createAcc')
};
$.cabinet = {
    myAccount: $('[my-account]'),
    ethBallance: $('[eth-ballance]')
};
$.calc = {
	rangeTX: 		$("#CALC #rangeTX"),
	labelTX: 		$("#CALC #__tx"),
	rangeTXtoMonth: $("#CALC #rangeTXtoMonth"),
	labelTxInMonth: $("#CALC #__txToMonth"),
	inputDeposit: 	$("#CALC #__startDeposit"),
	plan1:			$('#CALC #plan1'),
	plan2:			$('#CALC #plan2'),
	plan3:			$('#CALC #plan3'),
	cur: 			$("#CALC #SelectorCurrency"),
	result:			$("#CALC #__result")
};

///////////////////////////////////
///////////////////////////////////

var aItems = document.getElementsByTagName('item');
var aPages = document.getElementsByTagName('page');
var calcConfig = {
	activePlan: 0.10
};
for (var i = 0; i < aItems.length; i++) {
	aItems[i].onclick = function (e) {
        return setPage(e.target.id);
    };
}

setPage('auth-pk');



window.btnLogOut.onclick = function(e) {
	if (window.confirm("Do you really want to leave?")) { 
		setPage('auth-pk');
		$('.menu').classList.remove('active');
		$('content').classList.remove('active');
		$('.header').classList.remove('active');
		window.btnLogOut.style.display = "none";
	}
};

price();
setInterval(price, 5000);

(function(page){ /* calculator page */
	page.rangeTX.oninput = 
	page.rangeTX.onchange = 
	function(e) {
		page.labelTX.innerText = e.target.value;
		updateCalcRender();
	};
	page.rangeTXtoMonth.oninput = 
	page.rangeTXtoMonth.onchange = function(e) {
		page.labelTxInMonth.innerText = e.target.value;
		updateCalcRender()
	};
	page.inputDeposit.onchange = updateCalcRender;
	page.inputDeposit.onkeyup = updateCalcRender;

	page.cur.onchange = function(e) {
		console.log(e.target.value);
		switchCurrencyEthUsd(e.target.value === "ETH");
		updateCalcRender();
	};

	updateCalcRender();

	var _gd = [page.plan1, page.plan2, page.plan3];

	_gd[0].onclick = onClickHendler;
	_gd[1].onclick = onClickHendler;
	_gd[2].onclick = onClickHendler;

	_gd[1].classList.add('active');

	function onClickHendler(e) {
		for (var i = 0; i < _gd.length; i++) {
			_gd[i].classList.remove('active');
		}
		this.classList.add('active');
		
		calcConfig.activePlan = {
			plan1: 0.05,
			plan2: 0.10,
			plan3: 0.15
		}[this.id];
		
		updateCalcRender();
	}
	function updateCalcRender(e) {
		var obj = {
			startDeposit: page.inputDeposit.value * 1,
			txCount: page.rangeTX.value * page.rangeTXtoMonth.value,
			txValue: 1000,
			plan: calcConfig.activePlan
		};
		obj.result = pageCalc(obj.startDeposit, obj.txCount, obj.startDeposit, obj.plan);

		var _ethOrUsd = page.cur.value === "ETH";
		page.result.innerHTML = (_ethOrUsd? obj.result.profit.toFixed(18): obj.result.profit.toLocaleString()) +
		" <span class=\"curText\"></span><br>" + '<span style="color: green;"> ▲ +' +
		(obj.result.profitProcent).toFixed(2) + '% total profit </span>';

		switchCurrencyEthUsd(page.cur.value === "ETH");
	}
	function switchCurrencyEthUsd(bool) {
		var el = document.querySelectorAll(".curText");
		for(var i = 0; i< el.length;i++){
			if (bool === true){
				el[i].classList.add("eth");
			} else {
				el[i].classList.remove("eth");
			}
		}
	}
	function ProfitCalc(_spredProcent){
		var spredProcent = _spredProcent || 0.05;

		var _money = 0, 
			_moneySystem = 0,
			_tokens = 0, 
			_sellprice = 1 - spredProcent;

		this.sellprice = _sellprice;

		var arrHistory = [];

		function getBuyPrice() {
			return _sellprice / (1 - spredProcent)
		}
		function calcNewPrice() {
			if(_tokens === 0) return;
			var oldSellPrice = _sellprice;
			_sellprice = _money * 99 / _tokens / 100;
		}
		function log() {
			return {
				ask: _sellprice,
				bid: getBuyPrice(),
				money: _money,
				moneySystem: _moneySystem,
				tokens: _tokens,
				arrHistory: arrHistory
			};
		}
		function buy(countTokens) {
			var total = countTokens * getBuyPrice();
			_money += total * (1 - (spredProcent / 2));
			_moneySystem += total * (spredProcent / 2);
			_tokens += countTokens;

			arrHistory.push({
				//index: +arrHistory.length,
				tokens: +countTokens,
				buy_price: +getBuyPrice(),
				sell_price: +_sellprice,
				todo: "buy"
			});
			
			calcNewPrice();
			log();
			return total.toFixed(6) + " $";
		}
		function sell(countTokens) {
			if (_tokens === 0 || _tokens - countTokens < 0) {
				return;
			}

			var total = countTokens * _sellprice;
			_money -= total;
			_tokens -= countTokens;
			
			arrHistory.push({
				tokens: +countTokens,
				buy_price: +getBuyPrice(),
				sell_price: +_sellprice,
				todo: "sell"
			});
			calcNewPrice();
			log();
			return total.toFixed(6) + " $";
		}
		this.sell = sell;
		this.buy = buy;
		this.log = log;
	}
	function pageCalc(startDeposit, countTransaction, maxVal, planProcent) {
		var _calc = new ProfitCalc(planProcent || 0.05);

		countTransaction = countTransaction || 20000;
		maxVal = maxVal || 100;

		// генератор истории транзакций
		_calc.buy(2);
		for (var i = 0; i < countTransaction; i++) {
			if (i < 1000) {
				_calc.buy(Math.floor( maxVal + 5));
			} else if (i === 1000) {
				startDeposit = startDeposit * _calc.log().ask;
			} else {
				i % 2 === 0?
					_calc.sell(Math.floor(maxVal + 5)): 
					_calc.buy(Math.floor(maxVal + 5));
			}
		}
		var arr = _calc.log();
		return {
			profit: arr.ask * startDeposit,
			profitProcent: (arr.ask - 1) * 100
		}
	}
})($.calc);

function price(){
	com.getPrice(function(data){
		window.ethPrice.innerText = (data * 1).toFixed(2);
		modelObject.price = data * 1;
		updateDataCabinet();
	})
}

function fnAuth () {
	setPage('cabinet-accounts');
	$('.menu').classList.add('active');
	$('content').classList.add('active');
	$('.header').classList.add('active');
	window.btnLogOut.style.display = "block";
    updateDataCabinet();
}

function setPage (id){
    document.body.scrollTop = 0;
    for (var i = 0; i < aItems.length; i++) {
        if ( id === aPages[i].id ) {
            aPages[i].classList.add('active');
            aItems[i].classList.add('active');
        } else {
            aPages[i].classList.remove('active');
            aItems[i].classList.remove('active');
        }
    }
}

function Wind(){}
Wind.close = function () {
    $('.template-window').style.display = 'none';
};
Wind.showAlert = function(title, _domBody, _domFoot) {
    var _winContainer = $('.template-window').removeClass('error');
    var domTitleExitButton = $('.template-window .window .btnExit');
    var domTitleContainer = $('.template-window .title');
    var domBodyContainer = $('.template-window .body');
    var domFooterContainer = $('.template-window .footer');
    _winContainer.error = function() {
        _winContainer.addClass('error');
        return _winContainer;
    };
    domTitleContainer.innerHTML = '';
    domTitleContainer.add($span(title))
    domTitleExitButton.events({
        onclick: function() {
        	modelObject.wallet = null;
            _winContainer.style.display = 'none';
        }
    });
    if(_domBody) domBodyContainer.cls().add(_domBody);
    if(_domFoot) domFooterContainer.cls().add(_domFoot);
    else domFooterContainer.cls();

    _winContainer.style.display = 'block';
    return _winContainer;
};
Wind.privateKey = function (fn) {
    var _inp = $input(null, {"class": 'width100', id: 'win-pk', type: 'password'});
    function onEnter(){
        Wind.close();
        if(fn) fn(_inp.text());
    }
    Wind.showAlert("Окно",
        $div([
            $label('Enter private key:').attr('for', 'win-pk'),
            _inp.events({ onkeyup: function(e){
                if (e.key === 'Enter') {
                    onEnter();
                }
            }})
        ]),
        $span([
            $button('concel').events({
                onclick: function (e) {
                    $(".window .btnExit").onclick()
                }
            }),
            $button('OK').events({ onclick: onEnter })
        ]));
    _inp.focus();
};
Wind.showLoader = function(){
    var _l = $('.loader');
    if(!_l) $.render($div($div().addClass('loader')).addClass('template-window'));
};
Wind.hideLoader = function () {
    var _l = $('.loader');
    if(_l) _l.parentNode.remove();
};
$.auth.btnKeyStore.onchange = function() {
	var file = fileInput.files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
		function getPassAndChack() {
            $.auth.btnKeyStore.value = "";
			var json = reader.result;
			var password = window.prompt('input you password for keyStore:');

			console.log(json, password);

            Wind.showLoader();

			ethers.Wallet.fromEncryptedWallet(json, password).then(function (wallet) {
                Wind.hideLoader();
				window.modelObject.address = wallet.address;
                window.modelObject.wallet = wallet;
                fnAuth	();
			}, function () {
                Wind.hideLoader();
				Wind.showAlert('Warning!!', $div("Incorrect password for keyStore File")).error();
			});
		}
		getPassAndChack();
	};
	if(file) {
		reader.readAsText(file);
	} else {
		console.log('error')
	}
};
$.auth.btnPrivateKey.onclick = function () {
    Wind.privateKey(function(privateKey) {
        try {
            var wallet = new ethers.Wallet(privateKey);
            console.log(privateKey, wallet.address);
            window.modelObject.address = wallet.address;
            window.modelObject.wallet = wallet;
            fnAuth();
        } catch (e) {
            alert("Incorect private key");
        }
    })
};
$.auth.btnCreateNewWallet.onclick = function () {
    var _pass = $input(null, {"class": 'width100', id: 'win-pk', type: 'password'}).events({
        onkeyup: function (e) {
            if(e.key === "Enter"){
                window.modelObject.wallet = createKeyStore(_pass.text());
                Wind.close();
                Wind.showAlert('Info', $span('' + window.modelObject.wallet.privateKey));
            }
        }
    });
    Wind.showAlert("Enter new password:", _pass, $div([
        $button("cancel").events({onclick:function(e){
            Wind.close();
        }}),
        $button("Enter").events({onclick: function(){
            window.modelObject.wallet = createKeyStore(_pass.text());
            Wind.close();
            Wind.showAlert('Info', $span('' + window.modelObject.wallet.privateKey));
        }})
    ]));
    _pass.focus();
};
function updateDataCabinet() {
	if (!modelObject.wallet) return;
	if (!modelObject.wallet.provider) {
		modelObject.wallet.provider = ethers.providers.getDefaultProvider('mainnet');
	}
    $.cabinet.myAccount.text( modelObject.address );
	modelObject.wallet.getBalance().then(function(resilt){
		var _eth = ethers.utils.formatEther(resilt);

		$.cabinet.ethBallance.cls().add([
			$span(_eth+""),
			$strong(' ($' + (modelObject.price * _eth).toFixed(2) + ' USD )')
		]);
	})
}