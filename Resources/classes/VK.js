var VK = {
	api: "https://api.vkontakte.ru/method/audio.search?",

	getFiles: function(q, cb) {
		//var artist = Ti.App.global.artist;
		var xhr = Ti.Network.createHTTPClient();
		xhr.onload = function(){
			var Helper = require('classes/Helper');
			var data = JSON.parse(this.responseText);
			
			var tracks = {};
			var sources = {};
			for(var i in data.response) {
				var track = data.response[i];
				if (typeof(track.duration) == 'undefined' || typeof(track.title) == 'undefined') continue;
				if (track.duration < 100 || track.duration > 800) continue;
				if (!Helper.isset(tracks[track.duration])) {
					tracks[track.duration] = 1;
					sources[track.duration] = {url:track.url, title:track.title, artist:track.artist}
				} else {
					tracks[track.duration]++;
				}
			}		
			Ti.API.info(JSON.stringify(tracks));

			var keys = Helper.arsort(tracks, 'SORT_NUMERIC');
			var result = [];

			for(var i=0; i<Math.min(5,keys.length); i++) {
				result[i] = {url:sources[keys[i]].url, dur:keys[i], title:sources[keys[i]].title, artist:sources[keys[i]].artist};
			}

			cb(result);
		}
		xhr.open('GET', this.api+'access_token='+ Ti.App.global.token +'&count=200&sort=2&q='+this.enc(q));
		xhr.send();	
	},
	
	enc: function(q) {
		return encodeURIComponent(q);
	}
		
		
		
		
				
}

module.exports = VK;
