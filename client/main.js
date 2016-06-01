/////
// template helpers 
/////

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({},{sort:{vote:-1}});
	}
});


/////
// template events 
/////

Template.website_item.events({
	"click .js-upvote":function(event){
		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id;
		var web = Websites.findOne({_id:website_id},);
		increVote(web,1);

		// put the code in here to add a vote to a website!

		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){

		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id;
		console.log("Down voting website with id "+website_id);
		var web = Websites.findOne({_id:website_id},);
		increVote(web,-1);
		// put the code in here to remove a vote from a website!

		return false;// prevent the button from reloading the page
	}
})

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
				vote:Websites.find().count
			});
		}
		return false;// stop the form submit from reloading the page

	}
});


function increVote(website, num) {
	Websites.update({_id:website._id},
					{$set : {vote:website.vote+num}});
}

function exchVote(web1, web2) {
	var tempVote = web1.vote;
	Websites.update({_id:web1._id},
					{$set : {vote:web2.vote}});
	Websites.update({_id:web2._id},
					{$set : {vote:tempVote}});
}

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
	est() 
	if (re.test(str_url)){ 
	    return (true);  
	}else{  
	    return (false);  
	} 
} 