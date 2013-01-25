function ArtistsWindow(_args) {
	var self = Ti.UI.createWindow({
		title:'Artist Search',
		backgroundColor:'#222'
	});
	
	var curRow = null;

	self.addEventListener('androidback', function(e){
		_args.tabGroup.setActiveTab(2);
	/*
		var exitDlg  = Ti.UI.createOptionDialog({
			message: "Exit the program?",
    		buttonNames:['Yes','No']
		});
		exitDlg.addEventListener('click', function(e) {
			if (e.index == 0) {
				
			}
			
        });
		exitDlg.show();
	*/	
	});
	
	
	
	var LastFm = require('classes/LastFm');
	
	var searchFld = Ti.UI.createTextField({hintText:'artist or genre', width:'80%', top:5, center:'50%', font:{fontSize:25}, height:40}),
		artistBtn =  Ti.UI.createButton({title:'Artist', height:25, width:55, top:50, center:'20%', font:{fontSize:18}, backgroundColor:'#aaa', borderRadius:5}),
		albumsBtn =  Ti.UI.createButton({title:'Albums', height:25, width:55, top:50, center:'40%', font:{fontSize:18}, backgroundColor:'#aaa', borderRadius:5}),
		genreBtn = Ti.UI.createButton({title:'Genre', height:25, width:55, top:50, center:'60%', font:{fontSize:18}, backgroundColor:'#aaa', borderRadius:5}),
		similarBtn = Ti.UI.createButton({title:'Similar', height:25, width:55, top:50, center:'80%', font:{fontSize:18}, backgroundColor:'#aaa', borderRadius:5}),
		resultTbl = Ti.UI.createTableView({top:100, left: 0, headerTitle:"Found Artists"});
		
	artistBtn.addEventListener('click', function(){
		if (searchFld.value == "") return;
		LastFm.getArtists(searchFld.value, addArtists);
	});
	
	albumsBtn.addEventListener('click', function(){
		if (searchFld.value == "") return;
		LastFm.getAlbums(searchFld.value, addAlbums);
	});
	
	genreBtn.addEventListener('click', function(){
		if (searchFld.value == "") return;
		LastFm.getGenres(searchFld.value, addArtists);
	});
	
	similarBtn.addEventListener('click', function(){
		if (searchFld.value == "") return;
		LastFm.getSimilar(searchFld.value, addArtists);
	});
	
	
	resultTbl.addEventListener('click',function(e){
		var data = e.rowData;
		var tracksTab = _args.tabGroup.tabs[1].window;
		curRow = e.row;
		curRow.backgroundColor = '#333';
		// loading hour glass image
			var img = Ti.UI.createImageView({image:'../ui/images/loading.png', width:22, height:22, right:5});
			curRow.add(img);
			var matrix2d = Ti.UI.create2DMatrix();
			matrix2d = matrix2d.rotate(180); // in degrees
			var a = Ti.UI.createAnimation({
				transform: matrix2d,
				duration: 2000,
				delay: 800,
				repeat: 10
			});
			img.animate(a);
		//
		if (typeof (e.rowData.album) !== 'undefined') {
			tracksTab.getTracks(e.rowData.artist, e.rowData.album);
		} else {
			tracksTab.getTracks(e.rowData.artist);	
		}
		
	});
	
	self.allDone = function(){
		curRow.backgroundColor = '#222';

		curRow.remove(curRow.children[2]);
	}
	
	self.add(searchFld);	
	self.add(artistBtn);
	self.add(albumsBtn);
	self.add(genreBtn);
	self.add(similarBtn);
	self.add(resultTbl);
	
	var addArtists = function(data) {
		var res = [];
		for(var i in data) {
			var image = Ti.UI.createImageView({
				image: data[i].image, height: 50, width: 50, left: 0
			});
			var label = Ti.UI.createLabel({
				text: data[i].artist, color: '#eee', left: 60
			});
			var row = Ti.UI.createTableViewRow({height: 50, artist:data[i].artist});
			row.add(label);
			row.add(image);
			res.push(row);
		}
		resultTbl.setData(res);
	}
	
	var addAlbums = function(data) {
		var res = [];
		for(var i in data) {
			var image = Ti.UI.createImageView({
				image: data[i].image, height: 50, width: 50, left: 0
			});
			var label = Ti.UI.createLabel({
				text: data[i].album, color: '#eee', left: 60
			});
			var row = Ti.UI.createTableViewRow({height: 50, album:data[i].album, artist:data[i].artist});
			row.add(label);
			row.add(image);
			res.push(row);
		}	
		resultTbl.headerTitle = "Albums for "+data[0].artist;
		resultTbl.setData(res);
	}
	
	
	
	return self;
}

module.exports = ArtistsWindow;
