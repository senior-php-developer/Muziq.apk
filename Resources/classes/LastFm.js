var LastFm = {
		api: 'http://ws.audioscrobbler.com/2.0/?api_key=7f0ae344d4754c175067118a5975ab15&format=json&',
		out: null,
		
		getArtists: function(q, cb) {
			Ti.API.info('getArtists: '+q);
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				var rows = [];
				for(var i in data.results.artistmatches.artist) {
					var artist = data.results.artistmatches.artist[i];
					var name = decodeURIComponent(artist.name);
					var image = artist.image[2]['#text'];
					rows.push({artist:name, image:image});
				}
				cb(rows);
			}
			xhr.open('GET', this.api+'method=artist.search&artist='+ this.enc(q));
			xhr.send();		
		},
		
		getSimilar: function(q, cb) {
			Ti.API.info('getSimilar: '+q);
			
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				var rows = [];
				for(var i in data.similarartists.artist) {
					var artist = data.similarartists.artist[i];
					var name = decodeURIComponent(artist.name);
					var image = artist.image[2]['#text'];
					rows.push({artist:name, image:image});	
				}
				cb(rows);
			}
			xhr.open('GET', this.api+'method=artist.getsimilar&autocorrect=1&limit=30&artist='+ this.enc(q));
			xhr.send();		
		},
		
		
		getGenres: function(q, cb) {
			Ti.API.info('getGenres: '+q);
			
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				var rows = [];
				for(var i in data.topartists.artist) {
					var artist = data.topartists.artist[i];
					var name = decodeURIComponent(artist.name);
					var image = artist.image[2]['#text'];
					rows.push({artist:name, image:image});
				}
				cb(rows);
			}
			xhr.open('GET', this.api+'method=tag.gettopartists&limit=40&tag='+ this.enc(q));
			xhr.send();				
			
		},
		
		getAlbums: function(q, cb) {
			
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				Ti.API.info(this.responseText);
				var data = JSON.parse(this.responseText);
				var rows = [];
				for(var i in data.topalbums.album) {
					var album = data.topalbums.album[i];
					var name = decodeURIComponent(album.name);
					var image = album.image[2]['#text'];
					rows.push({album:name, artist:q, image:image});
				}
				cb(rows);
			}
			xhr.open('GET', this.api+'method=artist.gettopalbums&autocorrect=1&limit=30&artist='+ this.enc(q));
			xhr.send();				
		},
		
		
		getTracks: function(q, cb) {	
			Ti.API.info('getTracks: '+q);
			var Helper = require('classes/Helper');
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				var result = [];
				var tracks = [];
				
				for(var i in data.toptracks.track) {
					var track = data.toptracks.track[i];
					var name = Helper.cleanTrackName(decodeURIComponent(track.name));
					if (Helper.inArray(name, tracks)) continue; 
					tracks.push(name);
					result.push({artist:q, track:name, plays:track.playcount});		
				}
				Ti.API.info('found tracks: '+result.length);
				cb(result);
			}
			xhr.open('GET', this.api+'method=artist.gettoptracks&limit=80&autocorrect=1&artist='+ this.enc(q));
			xhr.send();				
		},
		
		getAlbumTracks: function(q, a, cb) {
			Ti.API.info('getAlbumTracks: '+q+' '+a);
			var Helper = require('classes/Helper');
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var data = JSON.parse(this.responseText);
				var result = [];
				var tracks = [];
				
				for(var i in data.album.tracks.track) {
					var track = data.album.tracks.track[i];
					var name = Helper.cleanTrackName(decodeURIComponent(track.name));
					if (Helper.inArray(name, tracks)) continue; 
					tracks.push(name);
					result.push({artist:q, track:name, plays:track.duration});		
				}
				Ti.API.info('found tracks: '+result.length);
				cb(result);
			}
			xhr.open('GET', this.api+'method=album.getInfo&autocorrect=1&artist='+ this.enc(q) +'&album='+this.enc(a));
			xhr.send();					
		},
		
		
		enc: function(q) {
			return encodeURIComponent(q);
		}
		
		
		
				
}

module.exports = LastFm;
