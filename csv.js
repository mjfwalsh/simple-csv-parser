function csv2json(csvData) {
	// change line endings, but remember later for strings
	var w;
	var newline = "\n";
	if((w = csvData.match(/\r\n/)) || (w = csvData.match(/\r/))) {
		newline = w[0];
		csvData = csvData.replace(new RegExp(w[0], 'g'), "\n");
	}

	// escape quotes in quoted strings
	csvData = csvData.replace(/(^|,)"""/gm, "$1\"\x01");
	csvData = csvData.replace(/(^|,)""(?=(,|$))/gm, "$1");
	csvData = csvData.replace(/""/g, "\x01");

	// commas and newlines in quoted strings
	csvData = csvData.replace(/,/g, "\x00");
	csvData = csvData.replace(/(^|\x00|\n)"([^"]+)"(?=(\x00|\n|$))/g, function (ignore, open, str) {
		var z = str;
		z = z.replace(/\x00/g, ',');
		z = z.replace(/\n/g, "\x02");
		return open + z;
	});

	// put back the quotes
	csvData = csvData.replace(/\x01/g, '"');

	// split on lines
	csvLines = csvData.split("\n");

	var resultArr = [];
	var csvLine;
	while(csvLine = csvLines.shift()) {
		// skip comments and header string
		if(csvLine.match(/^ *#/) || csvLine == '') {
			continue;
		} else {
			// re-insert new lines
			csvLine = csvLine.replace(/\x02/g, newline);

			// split into fields
			var fields = csvLine.split("\x00");

			// push into 2D array
			resultArr.push(fields);
		}
	}

	// first row is headers
	var keys = resultArr.shift();

	var resultHash = [];
	var values;
	while(values = resultArr.shift()) {
		var thisLine = {};
		for(var j=0; j<keys.length; j++) {
			thisLine[keys[j]] = (values[j] ? values[j] : '');
		}
		resultHash.push(thisLine);
	}

	return resultHash;
}
