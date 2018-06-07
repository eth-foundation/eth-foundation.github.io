var com = {
	getPrice: function (fn) {
		ethers.providers.getDefaultProvider('mainnet').getEtherPrice().then(function(data){
			fn(data);
		})
	},
	createWallet: ethers.Wallet.createRandom
};

(function(_export){
	function download (data, filename, type) {
		var file = new Blob([data], {type: type || 'application/octet-stream'});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others
			var a = document.createElement("a"),
				url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0);
		}
	} 
	function createKeyStore (_password){
		var w = new ethers.Wallet.createRandom();
		w.encrypt(_password).then(function(data) {
			var _fileName = JSON.parse(data)['x-ethers'].gethFilename;
            download(data, _fileName, 'text/x-json')
		});
		return w;
	}
	_export.createKeyStore = createKeyStore;
})(window);

