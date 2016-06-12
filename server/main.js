Meteor.startup(function () {
	// code to run on server at startup
	Websites._ensureIndex({
		"title" : "text",
		"url" : "text",
		"description" : "text"
		});	
	seed();
});
Meteor.publish("search-websites", function(searchField){
	console.log("Searching for ", searchField);
	return Websites.find({$text : { $search : searchField}},
	{
		fields : {
			score : {$meta : "textScore"}
		},
		sort : {
			score : {$meta : "textScore"}
		}
	});
});
Meteor.methods({
	'remoteHttpGet' : function(url, options) {
		return HTTP.get(url, options);
	}
});

function seed() {
	if (!Websites.findOne()){
		console.log("No websites yet. Creating starter data.");
		  Websites.insert({
			title:"Goldsmiths Computing Department", 
			url:"http://www.gold.ac.uk/computing/", 
			description:"This is where this course was developed.", 
			createdOn:new Date(),
			createdBy:"admin",
			vote:0,
			wholike:new Array(),
			whodislike:new Array(),
			comments: new Array(),
			commentBy: new Array()
		});
		 Websites.insert({
			title:"University of London", 
			url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
			description:"University of London International Programme.", 
			createdOn:new Date(),
			createdBy:"admin",
			vote:0,
			wholike:new Array(),
			whodislike:new Array(),
			comments: new Array(),
			commentBy: new Array()
		});
		 Websites.insert({
			title:"Coursera", 
			url:"http://www.coursera.org", 
			description:"Universal access to the world’s best education.", 
			createdOn:new Date(),
			createdBy:"admin",
			vote:0,
			wholike:new Array(),
			whodislike:new Array(),
			comments: new Array(),
			commentBy: new Array()
		});
		Websites.insert({
			title:"Google", 
			url:"http://www.google.com", 
			description:"Popular search engine.", 
			createdOn:new Date(),
			createdBy:"admin",
			vote:0,
			wholike:new Array(),
			whodislike:new Array(),
			comments: new Array(),
			commentBy: new Array()
		});
	}
}