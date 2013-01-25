function TracksWindow(_args) {
	var self = Ti.UI.createWindow({
		title:'Tracks List',
		backgroundColor:'#222',
		activity: {
			onCreateOptionsMenu: function(e){
				var menu = e.menu;
				var sortAzItem = menu.add({title:"Sort A-Z"});
				sortAzItem.setIcon("ui/images/sort_name.png");
				sortAzItem.addEventListener('click', function(e){
					rows.sort(function(a,b){
						if (a.track.toLowerCase() > b.track.toLowerCase()) return 1;
						if (a.track.toLowerCase() < b.track.toLowerCase()) return -1;
						return 0;
					});
					resultTbl.setData(rows);
				});
				var sortVotesItem = menu.add({title:"Sort Votes"});
				sortVotesItem.setIcon("ui/images/sort_votes.png");
				sortVotesItem.addEventListener('click', function(e){
					rows.sort(function(a,b){
						Ti.API.info('a:'+a.plays+' - b:'+b.plays);
						if (parseInt(a.plays) > parseInt(b.plays)) return -1;
						if (parseInt(a.plays) < parseInt(b.plays)) return 1;
						return 0;
					});
					resultTbl.setData(rows);
				});
				var shuffleItem = menu.add({title:"Shuffle"});
				shuffleItem.setIcon("ui/images/shuffle.png");
				shuffleItem.addEventListener('click', function(e){
					rows = shuffle(rows);
					resultTbl.setData(rows);
				});
				
			}
		}
	});
	
	
	self.addEventListener('androidback', function(e){
		_args.tabGroup.setActiveTab(0);
	});
	
	var LastFm = require('classes/LastFm');
	var VK = require('classes/VK');
	var Helper = require('classes/Helper');
	
	var Player = Ti.Media.createSound();
	
	var rows = [],
		curRow = null,
		curIdx = null,
		tracks = [],
		curTrack = 0,
		curAlbum = "";
	
	
	self.getTracks = function(q, album) {
		if (q == "") return;
		Ti.App.global.artist = q;
		curAlbum = album;
		if (typeof album !== 'undefined' && album !== null) {
			LastFm.getAlbumTracks(q, album, self.loadTracks);
			resultTbl.headerTitle = "Tracks for "+album+' ('+q+')';
		} else {
			LastFm.getTracks(q, self.loadTracks);	
			resultTbl.headerTitle = "Tracks for "+q;
		}
		
		
	}
	
	/* controls */
	var playBtn = Ti.UI.createButton({height:32, width:32, top:5, left:5, backgroundImage:'images/playback_play.png', backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius:5}),
		nextBtn =   Ti.UI.createButton({height:32, width:32, top:5, left: 45, backgroundImage:'images/playback_ff.png',backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius: 5}),
		
		sourceBtn =  Ti.UI.createButton({height:32, width:32, top:5, left:85, backgroundImage:'images/playback_reload.png',backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius: 5}),
		volBtn =  Ti.UI.createButton({height:32, width:32, top:5, left:125, backgroundImage:'images/sound_low.png', backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius: 5}),
		
		favBtn =  Ti.UI.createButton({height:32, width:32, top:5, left:165, backgroundImage:'images/star_fav.png', backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius: 5}),
		dlBtn =  Ti.UI.createButton({height:32, width:32, top:5, left:205, backgroundImage:'images/download.png', backgroundColor:'#111', borderColor: '#444', borderWidth:2, borderRadius: 5});	
	
	
	playBtn.addEventListener('click', function(){
		if (!Player.playing) {
			Player.play();
			playBtn.backgroundImage = 'images/playback_pause.png';
		} else {
			Player.pause();
			playBtn.backgroundImage = 'images/playback_play.png';
		}
	});
	
	volBtn.addEventListener('click', function(){
		switch(Player.getVolume()) {
			case 1:
				Player.setVolume(0);
				volBtn.backgroundImage = 'images/sound_mute.png';
				break;
			case 0:
				Player.setVolume(0.5);
				volBtn.backgroundImage = 'images/sound_low.png';
				break;
			default:
				Player.setVolume(1);
				volBtn.backgroundImage = 'images/sound_high.png';
				break;
		}
	});
	
	var Anim = {
		matrix: Ti.UI.create2DMatrix(),
		deg: 0,
		spin: function(){
			this.deg += 360;
			this.matrix = this.matrix.rotate(this.deg);
		}
	}
		
	sourceBtn.addEventListener('click', function(){
		if (!isset(curRow)) return;
		if (tracks.length > curTrack+1) {
			curTrack++;
		} else {
			curTrack = 0;
		}
		
		Anim.spin();
		//Anim.matrix = Anim.matrix.rotate(Anim.deg);
		
		sourceBtn.animate(Ti.UI.createAnimation({
			transform: Anim.matrix,
			duration: 2000
		}));
		
		curRow.children[1].text = Helper.mktime(tracks[curTrack].dur);
		curRow.children[0].text = mktitle(tracks[curTrack].title);
		setupPlayer(tracks[curTrack].url);
	});
	
	var mktitle = function(q) {
		q = q.replace('&amp;','&');
		var s = q.match(/(\(|\[).+?(\)|\])/);
		if (s !== null) {
			return curRow.track + ' '+s[0]; 	
		} else {
			return curRow.track;
		}
	}
	
	
	nextBtn.addEventListener('click', function(){
		
		if (isset(curRow)) curRow.backgroundColor = '#222';
		favBtn.backgroundImage = "images/star_fav.png";
		curIdx++;
		curRow = rows[curIdx];
		
		if (typeof curRow !== 'undefined') {
			curRow.backgroundColor = '#333';
			VK.getFiles(curRow.artist+' '+curRow.track, playMusic);	
		}
	});
	
	favBtn.addEventListener('click', function(){
		favBtn.backgroundImage = "images/star_or.png";
		_args.tabGroup.tabs[2].window.addTrack(curRow);
	});
	
	dlBtn.addEventListener('click', function(){
		var url = curRow.url;
		var fname = curRow.artist+' - '+curRow.children[0].text+'.mp3';
		download(fname, url, function(r){
			pb.hide();
			if (r.error) {
				var toast = Ti.UI.createNotification({
	    			message:"Error: "+r.error,
	    			duration: Ti.UI.NOTIFICATION_DURATION_SHORT
				});
				toast.show();
			} else {
				var toast = Ti.UI.createNotification({
	    			message:"Track saved to: "+r.path,
	    			duration: Ti.UI.NOTIFICATION_DURATION_SHORT
				});
				toast.show();
			}
		}, function(p){
			//Ti.API.info(p);
		});
	});
		
	var resultTbl = Ti.UI.createTableView({top:70, left: 0, headerTitle:"Tracks"});
	
	var pb = Titanium.UI.createProgressBar({
    	height:40, top:27, width:'99%', min:0, max:1, value:0, color:'#888', message:''
    });
	
	self.add(playBtn);
	self.add(nextBtn);
	
	self.add(volBtn);
	self.add(sourceBtn);
		
	self.add(favBtn);	
	self.add(dlBtn);
	self.add(pb);

    pb.hide();
    pb.visible = false;
	
	self.add(resultTbl);
		
	resultTbl.addEventListener('click',function(e){
		if (curRow == e.row) {
			if (!Player.playing) {
				Player.play();
				playBtn.backgroundImage = 'images/playback_pause.png';
			} else {
				Player.pause();
				playBtn.backgroundImage = 'images/playback_play.png';
			}
		} else {
			if (isset(curRow)) curRow.backgroundColor = '#222';
			favBtn.backgroundImage = "images/star_fav.png";
			curRow = e.row;
			curIdx = e.index;
			curRow.backgroundColor = '#333';
			VK.getFiles(e.rowData.artist+' '+e.rowData.track, playMusic);	
		}
		
	});
	
	var playMusic = function(data) {
		if (typeof data == 'undefined' || data == null || data.length == 0 || typeof data.error !== 'undefined') {
			curRow.children[0].font = {fontSize:18};
			curRow.children[0].color = '#aaa';
		//	nextBtn.fireEvent('click');
			return;
		}
		tracks = data;
		curRow.backgroundColor = '#DE6400';
		curRow.children[1].text = Helper.mktime(tracks[0].dur);
		curRow.children[0].text = mktitle(tracks[0].title);
		curRow.children[0].font = {fontSize: 18};
		curRow.url = tracks[0].url;
		setupPlayer(tracks[0].url);
		showNotification(tracks[0].artist+' - '+tracks[0].title);
	}
	
	var setupPlayer = function(url) {
		Player.stop();
		Player = Ti.Media.createSound({url:url, volume: 0.5, allowBackground: true});
		Player.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;
		playBtn.backgroundImage = 'images/playback_pause.png';
		Player.addEventListener('complete',function(e){
			nextBtn.fireEvent('click');	
		});
		Player.play();
	
	}
	
	var showNotification = function(track) {
		var intent = Ti.Android.createIntent({
			action : Ti.Android.ACTION_MAIN,
        	//className: 'me.airy.muziq.MuziqActivity',
        	className : 'org.appcelerator.titanium.TiActivity',
        	packageName: 'me.airy.muziq',
        	flags: Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
		});
		
		intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);

		var pending = Titanium.Android.createPendingIntent({
		    activity: Titanium.Android.currentActivity,
		    intent: intent,
		    type: Titanium.Android.PENDING_INTENT_FOR_ACTIVITY,
		    flags: Titanium.Android.FLAG_UPDATE_CURRENT
		});
		
		var notification = Titanium.Android.createNotification({
		        icon: 0x7f020000,
		        contentTitle: 'Now Playing',
				contentText : track,
		        contentIntent: pending
		});
		Titanium.Android.NotificationManager.notify(1, notification);
	}
	
	var isset = function(q){
		return (typeof q !== 'undefined' && q !== null);
	}
	
	self.loadTracks = function(data) {
		var rowlist = [];
		for(var i in data) {
			var label = Ti.UI.createLabel({
				text: data[i].track, color: '#eee', left: 10, width: 420, font:{fontSize:22}
			});
			var time = Ti.UI.createLabel({
				text: '', color: '#ddd', right: 5, width: 32, font:{fontSize:16}
			});
			var row = Ti.UI.createTableViewRow({height: 30, artist:data[i].artist, track:data[i].track, plays:data[i].plays});
			row.add(label);
			row.add(time);
			rowlist.push(row);
		}
		rows = rowlist;
		resultTbl.setData(rows);
		_args.tabGroup.setActiveTab(1);
		_args.tabGroup.tabs[0].window.allDone();
		
	}
	
	var download =  function(filename, url, fn_end, fn_progress ) {
    	var ret = {file:filename, url:url, path: null};
    	if (!Ti.Filesystem.isExternalStoragePresent()) {
    		ret.error = "No SD card found";
    		fn_end(ret);
    		return;
    	}

    	
    	var sd = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory);
    	var dir = Ti.Filesystem.getFile(sd.getParent().nativePath, 'Muziq');
    	if (!dir.exists()) {
    		dir.createDirectory();
    	}
    	ret.path = 'SD:/Muziq';
    	var file = Ti.Filesystem.getFile(dir.nativePath, filename);
    	
	    if (file.exists()) {
	        ret.error = "File exists";
	        fn_end(ret);
	    } else {	    	
        	var c = Titanium.Network.createHTTPClient();
        	pb.show();
            c.setTimeout(10000);
            c.onload = function() {
 	           if (c.status == 200) {
                    var f = file;
                    f.write(this.responseData);
                } else {
                    ret.error = 'Error: 404';
                }
                fn_end(ret);
            };
            c.ondatastream = function(e) {
                //if (fn_progress) fn_progress(e.progress);
                pb.value = e.progress;
            };
            c.error = function(e) {
                ret.error = e.error;
                fn_end(ret);
            };
            c.open('GET',url);
            c.send();            
	    }
	};
	
	var shuffle = function(o) { 
    	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){};
    	return o;
	};
	
	return self;
}

module.exports = TracksWindow;
