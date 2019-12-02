// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();

// we can use this single api request multiple times
const feed = api.getFeed();

// feed
// .then(posts => {
//     posts.reduce((parent, post) => {

//         parent.appendChild(createPostTile(post));
        
//         return parent;

//     }, document.getElementById('large-feed'))
// });

// Potential example to upload an image
const input = document.querySelector('input[type="file"]');

//input.addEventListener('change', uploadImage);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//compare function used to sort an post array by published time
const compare = function compare(x,y){
	if (parseFloat(x.meta.published) < parseFloat(y.meta.published)){
		return 1;
	} else if (parseFloat(x.meta.published) > parseFloat(y.meta.published)){
		return -1;
	} else {
		return 0;
	}
};

//check if user is logged in
(async function isLogin(){
	if (window.localStorage.getItem('AUTH_KEY') != null){
		initalize();
	} else {
		document.getElementById('loginDiv').style.display = 'block';
		login();
	}
}());


//signup function
(function signup() {
	const regsiterPage = document.getElementById('regsiterPage');
	regsiterPage.addEventListener('click', async function(){
		document.getElementById('popBox-demo').style.display = 'block';
	})
	const regsiterBtn = document.getElementById('regsiterBtn');
	regsiterBtn.addEventListener('click', async function() {
		const username = document.getElementById('username');
		const password = document.getElementById('password');
		const email = document.getElementById('email');
		const name = document.getElementById('name');
		fetch('http://localhost:5000/auth/signup', {
			method: 'POST',
			body: JSON.stringify({
	                username: username.value,
	                password: password.value,
	                email: email.value,
	                name: name.value
	            }),
			headers: {'Content-Type' : 'application/json'}
		})
		.then((response) => response.json())
		.then((response) => {
			//window.alert("Success!");
			if (response.message != null){
				throw new Error(response.message);
			}
			console.log(response.token);
			window.alert("token: "+response.token);
		})
		.catch((e) => {
			window.alert(e)
		});
		document.getElementById('popBox-demo').style.display = 'none';
		username.value = '';
		password.value = '';
		email.value = '';
		name.value = '';
	});
	
}());


//the user login function
function login(){
	//isLogin();
	const loginBtn = document.getElementById('loginBtn');
	const usernameLogin = document.getElementById('usernameLogin');
	const passwordLogin = document.getElementById('passwordLogin'); 
	loginBtn.addEventListener('click', async () => {
		fetch('http://localhost:5000/auth/login', {
			method: 'POST',
			body: JSON.stringify({
	                username: usernameLogin.value,
	                password: passwordLogin.value
	            }),
			headers: {'Content-Type' : 'application/json'}
		})
		.then((response) => response.json())
		.then((response) =>{
			if (response.message != null){
				throw new Error(response.message);
			}
			console.log(response.token);
			window.localStorage.setItem('AUTH_KEY', response.token);
			//window.localStorage.setItem('username', usernameLogin.value);
			document.getElementById('loginDiv').style.display = 'none';
			initalize();
		})
		.catch((e) =>{
			window.alert(e)
		});
	});
};

//inialize the frontend HTML and profile of the current user
async function initalize(){
	console.log(window.localStorage.getItem('AUTH_KEY'));
	const profile = await fetch('http://localhost:5000/user',{
			method: 'GET',
			headers:{'Content-Type' : 'application/json', 
					'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
				}
		})
		.then((response) => response.json());
		//console.log(profile);
	window.localStorage.setItem('username', profile.username);
	window.localStorage.setItem('id',profile.id);

	document.getElementById('loginDiv').style.display = 'none';
	document.getElementById('followDiv').style.display ='block';
	document.getElementById('postDiv').style.display = 'block';
	document.getElementById('greeting').innerHTML = "Hello, "+profile.name;
	const profileBtn = document.getElementById('profileBtn');
	
	profileBtn.addEventListener('click', getProfile);

	const logoutBtn = document.getElementById('logoutBtn');
	logoutBtn.disabled = false;
	profileBtn.disabled = false;
	logoutBtn.addEventListener('click', function(){
		localStorage.clear();
		window.location.href="/index.html";
	});
	getFeed(window.localStorage.getItem('AUTH_KEY'));
}

//get profile
async function getProfile(){
	//console.log(window.localStorage.getItem('AUTH_KEY'));
	const profile = await fetch('http://localhost:5000/user',{
			method: 'GET',
			headers:{'Content-Type' : 'application/json', 
					'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
				}
		})
		.then((response) => response.json());

	document.getElementById('popBox-profile').style.display= 'block';
	const closeProfileBtn = document.getElementById('closeProfileBtn');
	const updateProfileBtn = document.getElementById('updateProfileBtn');
	
	const passwordProfile = document.getElementById('passwordProfile');
	const emailProfile = document.getElementById('emailProfile');
	const nameProfile = document.getElementById('nameProfile');

	const profileUsername = document.getElementById('profileUsername');
	const profilePosts = document.getElementById('profilePosts');
	const profileFollwing = document.getElementById('profileFollwing');
	const profileFollowedBy = document.getElementById('profileFollowedBy');

	profileUsername.innerHTML ="Username: "+ profile.username+"\t";
	profilePosts.innerHTML ="Total Posts: "+ profile.posts.length;
	profileFollwing.innerHTML ="Following: "+ profile.following.length;
	profileFollowedBy.innerHTML ="Followed By: "+ profile.followed_num;


	emailProfile.value = profile.email;
	nameProfile.value = profile.name;
	closeProfileBtn.addEventListener('click', ()=>{
		document.getElementById('popBox-profile').style.display= 'none';
	});

	updateProfileBtn.addEventListener('click', ()=>{
		fetch ('http://localhost:5000/user/',{
			method: 'PUT',
			body:JSON.stringify({
				email: emailProfile.value,
  				name: nameProfile.value,
  				password: passwordProfile.value
			}),
			headers:{
				'Content-Type' : 'application/json', 
					'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
			}
		})
		.then(response => response.json())
		.then(function(response){
			if (response.message != null){
				window.alert(response.message);
			} else{
				window.alert(response.msg);
				document.getElementById('popBox-profile').style.display= 'none';
			}
		});
	});

};

//if logged in, get relevant posts
async function getFeed(e){
	// const feedJSON = (feedurl, option) => 
	const myPosts = await fetch('http://localhost:5000/user',{
		method: 'GET',
		headers: {
			'Content-Type' : 'application/json', 
			'Authorization': 'Token '+ e
		}
	})
	.then((response) => response.json())
	.then(function(response){
		return response.posts;
	});

	var myPostsInfo = await Promise.all(myPosts.map(id => {
            return fetch(`http://localhost:5000/post/?id=${id}`,{
                method: 'GET',
                headers: {
                	'Content-Type' : 'application/json', 
                    'Authorization': 'Token '+ e
                    }
                })
                .then((response) => response.json());
            })
        );

	fetch('http://localhost:5000/user/feed',{
			method: 'GET',
			headers: {
				'Content-Type' : 'application/json', 
				'Authorization': 'Token '+ e
				}
		})
		.then(posts => posts.json())
		.then(posts => {
			//console.log(myPostsInfo);
			myPostsInfo = myPostsInfo.concat(posts.posts);		
	    	myPostsInfo.sort(compare).reduce((parent, post) => {
	    		//console.log(myPostsInfo);
		        parent.appendChild(createPostTile(post));
		        return parent;
	    	}, document.getElementById('large-feed'))
		});
}

//user post their own content
(async function post(){
	const postBtn = document.getElementById('postBtn');
	const postText = document.getElementById('postText');
	const postFile = document.getElementById('postFile');
	
	postBtn.addEventListener('click', ()=>{
		if ((postText.value == "") && (postFile.value == "") ){
			window.alert("Cannot published empty post!");
		} else {

			const src = uploadImage(postFile.files);
			src.then(function(result){
				fetch('http://localhost:5000/post/',{
				method: 'POST',
				body: JSON.stringify({
					description_text: postText.value,
					src: result.split(',')[1]
				}),
				headers: {
					'Content-Type' : 'application/json', 
					'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
					}
				})
				.then(posts => posts.json())
				.then(function(post){
					console.log(post);
					if (post.message != null){
						window.alert(post.message);
					} else {
						window.alert("Success");
					}
					
				});
			});
			
			const myPostImg = document.getElementById('myPostImg');
			console.log(myPostImg);			
		}
	});
}());


//iser follow and unfollow other users
(async function follow(){
	const followBtn = document.getElementById('followBtn');
	const unfollowBtn = document.getElementById('unfollowBtn');
	const followInput = document.getElementById('followInput');

	followBtn.addEventListener('click', async ()=>{
		fetch(`http://localhost:5000/user/follow?username=${followInput.value}`,{
			   method:'PUT',
			   headers:{
			   	'Authorization':'Token ' + window.localStorage.getItem('AUTH_KEY'),
			   	'Content-Type': 'application/json'
			   }
		  })
		  .then(response =>response.json())
		  .then(function(response){
			   if(response.message !="success"){
			    throw new Error(data.message);
		   		}
			   window.alert("success");
			   window.location.reload();
		  }).catch(function(error){
		   	window.alert(error);
		 });
	});

	unfollowBtn.addEventListener('click', async ()=>{
		fetch(`http://localhost:5000/user/unfollow?username=${followInput.value}`,{
			   method:'PUT',
			   headers:{
			   	'Authorization':'Token ' + window.localStorage.getItem('AUTH_KEY'),
			   	'Content-Type': 'application/json'
			   }
		  })
		  .then(response =>response.json())
		  .then(function(response){
			   if(response.message !="success"){
			    throw new Error(response.message);
		   		}
			   window.alert("success");
			   window.location.reload();
		  }).catch(function(error){
		   	window.alert(error);
		 });
	});
}());