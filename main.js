/**
 * Created by Samuel Gratzl on 04.09.2014.
 */

(function (LineUpJS, d3) {
  var lineUpDemoConfig = {
    renderingOptions: {
      stacked: true
    }
  };

  var lineup = null;

  d3.select(window).on('resize', function() {
    if (lineup) {
      lineup.update()
    }
  });

  function fixMissing(columns, data) {
    columns.forEach(function(col){
      if (col.type === 'number' && !col.domain) {
        var old = col.domain || [NaN, NaN];
        var minmax = d3.extent(data, function (row) { return row[col.column].length === 0 ? undefined : +(row[col.column])});
        col.domain = [
          isNaN(old[0]) ? minmax[0] : old[0],
          isNaN(old[1]) ? minmax[1] : old[1]
        ];
      } else if (col.type === 'categorical' && !col.categories) {
        var sset = d3.set(data.map(function (row) { return row[col];}));
        col.categories = sset.values().sort();
      }
    });
  }

  function splitGroups(columns) {
	var first = columns[0];
	var base = columns.filter(function(d) {
	  return d.type !== 'number';
	});
	var scores = columns.filter(function(d) {
	  return d.type === 'number';
	});
	var groups = {};
	scores.forEach(function(score) {
		var group = score.column.replace(/([^\d]|_)/g,'');
		groups[group] = groups[group] || [];
		groups[group].push(score);
	});
	groups['2015'].unshift.apply(groups['2015'], base);
	return groups;
  }

  function loadDataImpl(name, desc, _data) {
    fixMissing(desc.columns, _data);
	var groups = splitGroups(desc.columns);
	Object.keys(groups).forEach(function(g) { LineUpJS.deriveColors(groups[g]); });
    var provider = LineUpJS.createLocalStorage(_data, desc.columns);


	Object.keys(groups).reverse().forEach(function(g, i) {
		var r = provider.pushRanking();
		if (i > 0) {
			provider.push(r, desc.columns[0]);
		}
		groups[g].filter(function(s) { return s.type !== 'number'; }).forEach(function(s) {
			var col = provider.push(r,s);
      if (col.desc.column === 'iso') {
        col.setWidth(50);
      }
		});
    var stacked = provider.push(r,LineUpJS.model.StackColumn.desc(g));
    groups[g].filter(function(s) { return s.type === 'number'; }).forEach(function(s) {
			stacked.push(provider.create(s));
		});
    stacked.setWidth(300);
    stacked.sortByMe();
	});

    lineUpDemoConfig.name = name;
    if (lineup) {
      lineup.changeDataStorage(provider, desc);
    } else {
      lineup = LineUpJS.create(provider, d3.select('main'), lineUpDemoConfig);
      lineup.addPool(d3.select('#pool').node(), {
        hideUsed: false,
        elemWidth: 80,
        elemHeight: 30,
        layout: 'grid',
        width: 320,
        addAtEndOnClick: true,
        additionalDesc : [
          LineUpJS.model.StackColumn.desc('+ Stack')
        ]
      }).update();
    }
	lineup.update();
    //provider.deriveDefault();
  }


  function countOccurrences(text, char) {
    return (text.match(new RegExp(char,'g'))||[]).length;
  }

  function isNumeric(obj) {
    return (obj - parseFloat(obj) + 1) >= 0;
  }

  function deriveDesc(columns, data, separator) {
    var cols = columns.map(function(col) {
      var r = {
        label: col,
        column: col,
        type: 'string'
      };
      if (isNumeric(data[0][col])) {
        r.type = 'number';
        r.domain = d3.extent(data, function (row) { return row[col].length === 0 ? undefined : +(row[col])});
      } else {
        var sset = d3.set(data.map(function (row) { return row[col];}));
        if (sset.size() <= Math.max(20, data.length * 0.2)) { //at most 20 percent unique values
          r.type = 'categorical';
          r.categories = sset.values().sort();
        }
      }
      return r;
    });
    return {
      separator: separator,
      primaryKey : columns[0],
      columns: cols
    };
  }

  function normalizeValue(val) {
    if (typeof val === 'string') {
      val = val.trim();
      if (val.length >= 2 && val.charAt(0) === '"' && val.charAt(val.length-1) === '"') {
        val = val.slice(1, val.length-1);
      }
    }
    return val;
  }
  /**
   * trims the given object
   * @param row
   * @return {{}}
   */
  function normalizeRow(row) {
    var r = {};
    Object.keys(row).forEach(function (key) {
      r[normalizeValue(key)] = normalizeValue(row[key]);
    });
    return r;
  }

  function loadDataFromStructuredText(headers, _data, fileName) {
    //derive a description file
    var desc = deriveDesc(headers, _data);
    var name = fileName.substring(0, fileName.lastIndexOf('.'));
    loadDataImpl(name, desc, _data);
  }

  function loadDataFileFromText(data_s, fileName) {
    var header = data_s.slice(0,data_s.indexOf('\n'));
    //guess the separator,
    var separator = [',','\t',';'].reduce(function(prev, current) {
      var c = countOccurrences(header, current);
      if (c > prev.c) {
        prev.c = c;
        prev.s = current;
      }
      return prev;
    },{ s: ',', c : 0});
    var _data = d3.dsv(separator.s, 'text/plain').parse(data_s, normalizeRow);
    var headers = header.split(separator.s).map(normalizeValue);
    loadDataFromStructuredText(headers, _data, fileName);
  }

  var url = '2015_Variables.csv';
  //access the url using get request and then parse the data file
  //d3.text(url, 'text/plain', function(data) {
  //    loadDataFileFromText(data, 'wur2013');
  //});
  //access the url using get request and use d3.tsv since it is an tab separated file
  d3.tsv(url, function(data) {
    loadDataFromStructuredText(Object.keys(data[0]), data, 'Prosperity Index');
  });

}(LineUpJS, d3));
