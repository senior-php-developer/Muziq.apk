function PlaylistWindow(_args) {
	var curList = "";
	
	var self = Ti.UI.createWindow({
		title:'Playlists',
		backgroundColor:'#222',
		activity: {
			onCreateOptionsMenu: function(e){
				var menu = e.menu;
				var playItem = menu.add({title:"Play"});
				playItem.setIcon("ui/images/play_or.png");
				playItem.addEventListener('click', function(e){
					var data = tracksTbl.getData();
					var rows = [];
					for(var i in data[0].rows) {
						rows.push({artist: data[0].rows[i].artist, track: data[0].rows[i].track});
					}
					_args.tabGroup.tabs[1].window.loadTracks(rows);
				});
				var newItem = menu.add({title:"New"});
				newItem.setIcon("ui/images/new_or.png");
				newItem.addEventListener('click', function(e){
					var listFld = Ti.UI.createTextField({});
 					var nameDlg  = Ti.UI.createOptionDialog({
    					androidView:listFld,
    					buttonNames:['Create']
					});
					nameDlg.addEventListener('click', function(e) {
        				var name = listFld.value;
        				curList = name;
						tracksTbl.headerTitle = 'Playlist: '+name;
						tracksTbl.setData([]);
    				});
    				nameDlg.show();
					
				});
				var saveItem = menu.add({title:"Save"});
				saveItem.setIcon("ui/images/save_or.png");
				saveItem.addEventListener('click', function(e){
					// show prompt with curList as default
					var listFld = Ti.UI.createTextField({value:curList});
 					var nameDlg  = Ti.UI.createOptionDialog({
    					androidView:listFld,
    					buttonNames:['Save']
					});
					nameDlg.addEventListener('click', function(e) {
        				var name = listFld.value;
        				var db = Ti.Database.open('playlist.db');
        				//db.execute('BEGIN');
        				db.execute('DELETE FROM lists WHERE playlist = ?', name);
        				var tblData = tracksTbl.getData();
        				for(var i in tblData[0].rows) {
							var track = [name, tblData[0].rows[i].artist, tblData[0].rows[i].track];
							db.execute('INSERT INTO lists (playlist, artist, title) VALUES(?, ?, ?)', track);
						}
						//db.execute('COMMIT');
						db.close();
						loadLists();
						tracksTbl.headerTitle = 'Playlist: '+name;
    				});
    				nameDlg.show();
					
				});
				var delItem = menu.add({title:"Delete"});
				delItem.setIcon("ui/images/trash_or.png");
				delItem.addEventListener('click', function(e){
					if (curList == null || curList == "") return;
					var nameDlg  = Ti.UI.createOptionDialog({
						message: "Delete playlist "+curList+"?",
    					buttonNames:['Yes','No']
					});
					nameDlg.addEventListener('click', function(e) {
        				if (e.index == 0) {
        					var db = Ti.Database.open('playlist.db');
							db.execute('DELETE FROM lists WHERE playlist = ?', curList);
							db.close();
							curList = null;
							tracksTbl.headerTitle = "Untitled Playlist";
							tracksTbl.setData([]);
							loadLists();
								
        				}       				
        			});
					nameDlg.show();
				});
			}
		}
	});
	
	self.addEventListener('androidback', function(e){
		_args.tabGroup.setActiveTab(1);
	});
	
	var listsTbl = Ti.UI.createTableView({top:0, left: 0, height: '40%', headerTitle:"Playlists"});	
	var tracksTbl = Ti.UI.createTableView({top:'42%', left: 0, height: '56%', headerTitle:"Untitled Playlist", allowsSelection:false});
	
	
	
	self.add(tracksTbl);
	self.add(listsTbl);
	
	// selecting a playlist
	//
	listsTbl.addEventListener('click',function(e){
		var data = e.rowData;
		var db = Ti.Database.open('playlist.db');
		var rows = db.execute('SELECT artist, title FROM lists WHERE playlist = ?', data.list);
		curList = data.list;
		var data = [];
		while(rows.isValidRow()){
 		    var trackName = rows.fieldByName('artist')+' - '+rows.fieldByName('title');
	 		var row = Ti.UI.createTableViewRow({artist:rows.fieldByName('artist'), track:rows.fieldByName('title'), 
	 			title:trackName, font:{fontSize:16}, height:22, selectionStyle:'none'
	 		});
 		 	data.push(row);
     		rows.next();
		}
		rows.close();
		db.close();
		tracksTbl.headerTitle = 'Playlist: '+curList;
		tracksTbl.setData(data);
	});
	
	var loadLists = function(){
		var db = Ti.Database.open('playlist.db');
		var rows = db.execute('SELECT DISTINCT playlist FROM lists');
		var data = [];
		var i = 1;
		while(rows.isValidRow()){
 		    var listName = rows.fieldByName('playlist');
 		    var row = Ti.UI.createTableViewRow({list:listName, title:i+'. '+listName, font:{fontSize:18},height:24});
 		 	data.push(row);
     		rows.next();
     		i++;
		}
		rows.close();
		db.close();
		listsTbl.setData(data);
	}
	
	loadLists();
	
	self.addTrack = function(res) {
		var trackName = res.artist+' - '+res.track;
		var row = Ti.UI.createTableViewRow({artist:res.artist, track:res.track, title:trackName, font:{fontSize:16}, height:22});
		tracksTbl.appendRow(row);
		var toast = Ti.UI.createNotification({
    		message:"Track added to playlist",
    		duration: Ti.UI.NOTIFICATION_DURATION_SHORT
		});
		toast.show();
	}
		
	return self;
}
module.exports = PlaylistWindow;
