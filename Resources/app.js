Ti.UI.setBackgroundColor('#226');

var db = Ti.Database.open('playlist.db');
db.execute('CREATE TABLE IF NOT EXISTS lists(id INTEGER PRIMARY KEY, playlist TEXT, artist TEXT, title TEXT, pos INTEGER);');
db.close();

Ti.App.global = {
	
}

var ArtistsWindow = require('ui/ArtistsWindow')
	TracksWindow = require('ui/TracksWindow'),
	PlaylistWindow = require('ui/PlaylistWindow');
	
var tabGroup = Titanium.UI.createTabGroup();

var artistsWin = new ArtistsWindow({tabGroup:tabGroup})
	tracksWin = new TracksWindow({tabGroup:tabGroup}),
	plistWin = new PlaylistWindow({tabGroup:tabGroup});

var	artistsTab = Ti.UI.createTab({title:'Artists', window:artistsWin, height:'auto', icon:'ui/images/users_or.png'}),
	tracksTab = Ti.UI.createTab({title:'Tracks', window:tracksWin, height:'auto', icon:'ui/images/headphones_or.png'}),
	plistTab = Ti.UI.createTab({title:'Playlists', window:plistWin, height:'auto', icon:'ui/images/playlists.png'});

tabGroup.addTab(artistsTab);  
tabGroup.addTab(tracksTab);  
tabGroup.addTab(plistTab);
tabGroup.open();



function authVK(){
	var w = Ti.UI.createWindow();
	var wv = Ti.UI.createWebView();
	// [ 1918220 2943094 ] [ 1902594 2220672 ]
	wv.url = 'http://api.vk.com/oauth/authorize?client_id=1902594&scope=24&display=popup&response_type=token&redirect_uri=http://api.vk.com/blank.html';
	wv.addEventListener('load',function(e){
		Ti.API.info(e.url);
		if (e.url.match(/^http:\/\/api.vk.com\/blank.html/)) {
			if (e.url.indexOf('access_token') !== -1) {
				var token = e.url.substring(e.url.indexOf('=')+1,e.url.indexOf('&'));
				Ti.App.global.token = token;
				Ti.App.Properties.setString("token",token);
				w.close();	
			} else {
				Ti.API.info(e.url);
				var error = e.url.substring(e.url.indexOf('#'));
				 
			}
		}
	});
	w.add(wv);
	w.open({modal:true});
}

if (Ti.App.Properties.hasProperty("token")) {
	Ti.App.global.token = Ti.App.Properties.getString("token");
	if (Ti.App.global.token == "" || Ti.App.global.token == null) {
		authVK();	
	} else {
		Ti.API.info('Using token from storage: '+Ti.App.global.token);
		var xhr = Ti.Network.createHTTPClient();
		xhr.open('GET', 'https://api.vkontakte.ru/method/audio.search?access_token='+ Ti.App.global.token +'&count=1&sort=2&q=ATB');
		xhr.onload = function(){
			var data = JSON.parse(this.responseText);
			if (typeof data.error !== 'undefined') {
				Ti.API.info(data.error.error_msg);
				authVK();
			}
		};
		xhr.send();	
	}			
} else {
	authVK();
}