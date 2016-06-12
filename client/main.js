// routing

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
	this.render('navbar', {
		to : "navbar"
	});
	this.render('website_list', {
		to : "main"
	});
});

Router.route('/:id', function(){
	this.render('navbar', {
		to : "navbar"
	});
	this.render('website_item', {
		to : "main",
		data : function() {
			return Websites.findOne({_id:this.params.id});
		}
	});
	this.render('comments', {
		to : "forum"
	});
});




// accounts-ui config
Accounts.ui.config(
	{passwordSignupFields: "USERNAME_AND_EMAIL"}
	);

// infinitescroll
Session.set("websiteLimit", 10);
lastScrollTop = 0;
$(window).scroll(function(event){
	if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
		var scrollTop = $(this).scrollTop();
		if (scrollTop > lastScrollTop) {
			Session.set("websiteLimit", Session.get("websiteLimit") + 5);
		}
		lastScrollTop = scrollTop;
	}
	// console.log("curLmt "+ Session.get("websiteLimit"));
});

/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		if (Session.get("userFilter")) {
			return Websites.find({createdBy:Session.get("userFilter")},{sort:{vote:-1,createdOn:-1}});
		} else if (Session.get("searchFilter")) {
			Meteor.subscribe("search-websites", Session.get("searchFilter"));
			return Websites.find({score:{"$exists":true}}, { sort: [["score", "desc"]] });
		} else {
			console.log(Websites.find({},{sort:{vote:-1,createdOn:-1}, limit:Session.get("websiteLimit")}));
			return Websites.find({},{sort:{vote:-1,createdOn:-1}, limit:Session.get("websiteLimit")});
		}
	},
	recommends:function(){
		Meteor.subscribe("search-websites", Session.get("recommendFilter"));
		if (Session.get("recommendFilter")) {
			console.log("recommending");
			return Websites.find({score:{"$exists":true}}, { sort: [["score", "desc"]] });
		}
	},
	recommending_websites : function  () {
		if (Session.get("recommendFilter")) {
			return true;
		} else {
			return false;
		}
	},
	username : function(){
		if(Meteor.user()) {
			// console.log(Meteor.user());
			return Meteor.user().username;
		} else {
			return "anonymous";
		}
	},
	getFilterUser : function() {
		if (Session.get("userFilter")){// they set a filter!
		  var user = Meteor.users.findOne(
		    {_id:Session.get("userFilter")});
		  if (user) {
		  	return user.username;
		  }
		} 
		else {
		  return false;
		}
	},
	getSearchFilter : function () {
		if (Session.get("searchFilter")) {
			return Session.get("searchFilter");
		} else {
			return false;
		}
	},
	filtering_websites:function(){
	  if (Session.get("userFilter")){// they set a filter!
	    return true;
	  } 
	  else {
	    return false;
	  }
	},
	searching_websites: function() {
		if (Session.get("searchFilter")) {
			return true;
		} else {
			return false;
		}
	}
});


Template.website_item.helpers({
getUser:function(user_id){
  var user = Meteor.users.findOne({_id:user_id});
  if (user){
    return user.username;
  }
  else {
    return "anon";
  }
}
});

Template.comment.helpers({
	getUser :function(user_id) {
		var user = Meteor.users.findOne({_id:user_id});
		if (user) {
			return user.username;
		} else {
			return "anon";
		}
	}
});

Template.comments.helpers({
	comments : function() {
		// console.log(Websites.findOne({_id:Session.get("websiteDetailID")}));
		var website = Websites.findOne({_id:Session.get("websiteDetailID")});
		var comments = website.comments;
		var author = website.commentBy;
		var result = new Array();
		for (var i = 0,l = comments.length; i < l; i++) {
			result.push({comment : comments[i],
						commentBy : author[i]
							})
		}
		return result;
	}
});

/////
// template events 
/////


Template.navbar.events({
	'submit .js-set-search-website' : function(event){
		var searchStr = event.target.searchStr.value;
		console.log("searching:"+searchStr);
		Session.set("searchFilter", searchStr);
		Session.set("recommendFilter", undefined);
		return false;
	}
});

Template.website_list.events({
	"click .js-unset-website-filter": function(event){
		Session.set("userFilter", undefined);
	},
	'click .js-unset-search-website' : function(event){
		Session.set("searchFilter", undefined);
	}
});

Template.website_item.events({
	"click .js-upvote":function(event){
		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		if (Meteor.user()) {
			// console.log("press like button");
			var website_id = this._id;
			var web = Websites.findOne({_id:website_id},);
			var curUserId = Meteor.user()._id;

			if (!web.wholike.some(function (item, index, array) {
				return (item == curUserId);
			})) {
				Websites.update({_id:web._id},
							{$inc : {vote:1}, $push: {wholike: curUserId}}
						);
				// console.log("like +1")
				if (web.whodislike.some(function (item, index, array) {
					return (item == curUserId)
				})) {
					Websites.update({_id:web._id},
							{$inc : {vote:1}, $pullAll : {whodislike: [curUserId]}}
						)
					// console.log("dislike to like +1");
				}
				console.log(web.title);
				Session.set("recommendFilter",web.title);
			}
		} else {
			alert("Please login to vote!");
		}
		// put the code in here to add a vote to a website!

		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){

		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		if (Meteor.user()) {
			// console.log("press dislike button");
			var website_id = this._id;
			// console.log(this);
			var web = Websites.findOne({_id:website_id},);
			var curUserId = Meteor.user()._id;
			if (!web.whodislike.some(function (item, index, array) {
				return (item == curUserId);
			})) {
				Websites.update({_id:web._id},
							{$inc : {vote:-1}, $push: {whodislike: curUserId}}
						);
				// console.log("dislike -1");
				if (web.wholike.some(function (item, index, array) {
					return (item == curUserId)
				})) {
					Websites.update({_id:web._id},
								{$inc : {vote:-1}, $pullAll : {wholike : [curUserId]}})
					// console.log("like to dislike -1");
				}
			}
		} else {
			alert("Please login to vote!");
		}
		// put the code in here to remove a vote from a website!

		return false;// prevent the button from reloading the page
	},
	"click .js-set-website-filter": function(event) {
		Session.set("userFilter", this.createdBy);
	},
	"click .js-set-website-detail" : function(event) {
		Session.set("websiteDetailID",this._id);
	}
});

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){

		// here is an example of how to get the url out of the form:
		var url = event.target.url.value;
		console.log("The url they entered is: "+url);
		console.log(url.indexOf("http://"));
		
		var title = event.target.title.value;
		var description = event.target.description.value;

		if (!isURL(url)) {
			alert("incorrect URL address, Please check.");
		} else if (!title) {
			alert("incorrect title, Please check.");
		} else if (!description) {
			alert("Your website need a description :)");
		} else {
			Websites.insert({
				title:title, 
				url:url,
				description:description,
				createdOn:new Date(),
				vote:0,
				createdBy:Meteor.user()._id,
				wholike:new Array(),
				whodislike:new Array(),
				comments: new Array(),
				commentBy: new Array()
			});
			$("#website_form").toggle('slow');
		}
		console.log("added ok");
		return false;// stop the form submit from reloading the page

	},
	"click .js-http-autofill" : function(event) {
		var url = document.getElementById("url").value;

		if (!isURL(url)) {
			alert("incorrect URL address, Please check.");
		} else {
			Meteor.call('remoteHttpGet', url,{
			// options
			},function(err,res){
				if (err) {
					console.log(err);
				} else {
					// console.log(res.content);
					var title = getTitle(res.content);
					var description = getDescription(res.content);
					console.log(title);
					console.log(description);
					document.getElementById("title").value = title;
					document.getElementById("description").value = description;
					// $("#website_form").title.value = title;
					// console.log(getDescription(res.content));
					// console.log("****************");
					// console.log(getTitle(res.content));
				}
			})
		}
		
	}
});

Template.comment_form.events({
	"submit .js-save-comment-form" : function(event) {
		var comment = event.target.comment.value;
		if (comment) {
			// console.log("comment: "+comment);
			var authorID = Meteor.user()._id;
			// console.log(authorID);
			var website = Websites.findOne({_id:Session.get("websiteDetailID")});
			// console.log(Session.get("websiteDetailID"));
			
			Websites.update({_id:Session.get("websiteDetailID")},
							{$push : {comments:comment, commentBy:authorID}});
			// console.log(website);

		} else {
			alert("write something please.");
		}

		return false;// stop the form submit from reloading the page
	}
});

Template.body.helpers({

}
)


function isURL(str_url){ 
	var strRegex = "^((https|http|ftp|rtsp|mms)?://)"  
	+ "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@  
	+ "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184  
	+ "|" // 允许IP和DOMAIN（域名） 
	+ "([0-9a-z_!~*'()-]+\.)*" // 域名- www.  
	+ "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名  
	+ "[a-z]{2,6})" // first level domain- .com or .museum  
	+ "(:[0-9]{1,4})?" // 端口- :80  
	+ "((/?)|" // a slash isn't required if there is no file name  
	+ "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";  
	var re=new RegExp(strRegex);  
	if (re.test(str_url)){ 
	    return (true);  
	}else{  
	    return (false);  
	} 
}

function getTitle(str_html) {
	var re = /<title>.*<\/title>/;
	if (str_html.search(re) > 0) {
		return str_html.match(re)[0].toString().replace(/<\/?title>/ig,"");
	} else {
		return "";
	}
}

function getDescription(str_html) {
	var re1 = /<meta[ ]+name=["|']description["|'][ ]+content=['|"]/i;
	var re2 = /['|"][ ]*\/>$/i;
	// console.log(str_html.search(re1));
	if (str_html.search(re1) > 0) {
		var str = str_html.match(/<meta[ ]+name=["|']description["|'].*/i)[0];
		return str.replace(re1, "").replace(re2, "");
	} else {
		return "";
	}
}