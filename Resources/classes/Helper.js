var Helper = {
	
	inArray: function(needle, haystack) {
	    for (key in haystack) {
	        if (haystack.hasOwnProperty(key))
	        	if ((this.lc(haystack[key]).indexOf(this.lc(needle)) != -1) || (this.lc(needle).indexOf(this.lc(haystack[key])) != -1))
	            	return true; 
	        }
	  return false;
	},
	
	
	cleanTrackName: function(str) {
		str = trimBrackets(str);
	    str = str.replace(/( feat| ft\.| vocals by| vip).*/gi,''); // remove (this) and everything after
	    str = str.replace(/(full version|remix|remi| mix|rmx| edit)/gi,''); //remove (this)
	    str = str.replace(/(mp3|wav|flac|ogg)/gi,'');
	    return this.cleanName(str);
	},
	
	cleanName: function(str) {   
	    str = this.cleanU(str);
	    str = str.replace(/(\- | \-|\(|\)|\[|\]|\{|\})+/g,''); // remove bracket leftovers
		str = str.replace(/(@|_|,|\.)+/g,' '); // replace with space
	    str = str.replace(/(!|#|%|\^|\*|\\|\/|\?|<|>)+/g,''); // remove
	    str = str.replace(/"|`/g,"'");
	    str = str.replace(/( )+/g,' ');
	    return this.trim(str);
	},
	
	trim: function(q) {
		return q.replace(/^\s*/g, "").replace(/\s*$/, "").replace(/(\s)+/g," ");
	},
	
	cleanU: function(str) {
    	str = str.replace(/[\u0000-\u001f]/g,'').replace(/[\u007f-\u00bf]/g,'');
    	str = str.replace(/[\u00c0-\u00c6\u00e0-\u00e6]/g,'a').replace(/[\u00c8-\u00cb\u00e8-\u00eb]/g,'e');
    	return str;
	},
	
	lc: function(q) {
    	return q.toLowerCase();
	},
	
	isset: function(arr) {
		if (typeof(arr) == 'undefined') return false;
		if (arr == null || arr == undefined) return false;
		return true;
	},
	
	arsort: function(inputArr,sort_flags){
		var valArr=[],keyArr=[],k,i,ret,sorter,that=this,strictForIn=false,populateArr={};
		switch(sort_flags){
			case'SORT_STRING':sorter=function(a,b){return that.strnatcmp(b,a);};break;
			case'SORT_NUMERIC':sorter=function(a,b){return(a-b);};break;
			case'SORT_REGULAR':default:sorter=function(a,b){if(a>b){return 1;}if(a<b){return-1;}return 0;};break;}
			var bubbleSort=function(keyArr,inputArr){var i,j,tempValue,tempKeyVal;for(i=inputArr.length-2;i>=0;i--){for(j=0;j<=i;j++){ret=sorter(inputArr[j+1],inputArr[j]);if(ret>0){tempValue=inputArr[j];inputArr[j]=inputArr[j+1];inputArr[j+1]=tempValue;tempKeyVal=keyArr[j];keyArr[j]=keyArr[j+1];keyArr[j+1]=tempKeyVal;}}}};this.php_js=this.php_js||{};this.php_js.ini=this.php_js.ini||{};strictForIn=this.php_js.ini['phpjs.strictForIn']&&this.php_js.ini['phpjs.strictForIn'].local_value&&this.php_js.ini['phpjs.strictForIn'].local_value!=='off';populateArr=strictForIn?inputArr:populateArr;for(k in inputArr){if(inputArr.hasOwnProperty(k)){valArr.push(inputArr[k]);keyArr.push(k);if(strictForIn){delete inputArr[k];}}}
			try{bubbleSort(keyArr,valArr);}catch(e){return false;}
			for(i=0;i<valArr.length;i++){populateArr[keyArr[i]]=valArr[i];}
			return keyArr;
	},
	
	mktime: function(dur) {
		var m = parseInt(dur/60);
		var s = dur % 60;
		var duration = (m > 9 ? m : '0'+m) +':'+ (s > 9 ? s : "0"+s);
		return duration;
	}

}

module.exports = Helper;




function cap(str) {
  return str.replace( /(^|\s|\.)(.)/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

// trim whitespaces


// trim numbers
function tnum(q) {
    return q.replace(/\d+/g,'');
}

function trimBrackets(q) {
    return q.replace(/(\(|\[).*(\)|\])?/gi,'');
}

function cleanUni(str) {
    str = str.replace(/[\u0000-\u001f]/g,'').replace(/[\u007f-\u00bf]/g,'');
    str = str.replace(/[\u00c0-\u00c6\u00e0-\u00e6]/g,'a').replace(/[\u00c8-\u00cb\u00e8-\u00eb]/g,'e');
    return str;
}








