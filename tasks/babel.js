'use strict';
var path = require('path');
var babel = require('babel-core');

module.exports = function (grunt) {
	grunt.registerMultiTask('babel', 'Use next generation JavaScript, today', function () {
		var options = this.options();

		this.files.forEach(function (el) {
			delete options.filename;
			delete options.filenameRelative;

			var codeResult = '';
			var mapResult;

			el.src.forEach(function(sf){
				options.sourceFileName = path.relative(path.dirname(el.dest), sf);

				if (process.platform === 'win32') {
					options.sourceFileName = options.sourceFileName.replace(/\\/g, '/');
				}

				options.sourceMapTarget = path.basename(el.dest);

				var res = babel.transformFileSync(sf, options)
				codeResult += res.code;

				if (res.map) {
					if (!mapResult) {
						mapResult = res.map;
					} else {
						mapResult.sources = mapResult.sources.concat(res.map.sources);
						mapResult.names = mapResult.names.concat(res.map.names);
						mapResult.mappings = mapResult.mappings + ';' + res.map.mappings;
						mapResult.sourcesContent = mapResult.sourcesContent.concat(res.map.sourcesContent);
					}
				}
			});

			var sourceMappingURL = '';

			if (mapResult) {
				sourceMappingURL = '\n//# sourceMappingURL=' + path.basename(el.dest) + '.map';
				grunt.file.write(el.dest + '.map', JSON.stringify(mapResult));
			}

			grunt.file.write(el.dest, codeResult + sourceMappingURL + '\n');
		});
	});
};
