/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}
////////////////////////////////////////////////////--My Code--////////////////////////////////////////////////////////////////////

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(post) {
    var date = new Date(post.meta.published);

    const section = createElement('section', null, { class: 'post' });

    section.appendChild(createElement('h2', post.meta.author, { class: 'post-title' }));

    var postImg = createElement('img', null, 
        { src: "data:image/png;base64,"+post.src, alt: post.meta.description_text, class: 'post-image' });
    section.appendChild(postImg);

    var postDisc = createElement('lable', post.meta.description_text, {class: 'post-discription'});
    section.appendChild(postDisc);

////////////////////////------update button & delet button----------///////////////////////////

    if (post.meta.author == window.localStorage.getItem('username')){
        var updatePostBtn = createElement('button', 'Update', {class:'button', style:"float: right;"});
        var deletePostBtn = createElement('button', 'Delete', {class:'button', style:"float: right;"});
        deletePostBtn.addEventListener('click', async () =>{
            fetch(`http://localhost:5000/post/?id=${post.id}`,{
                method: 'DELETE',
                headers:{'Content-Type' : 'application/json', 
                        'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
                        }
                })
            .then(response=>response.json())
            .then((response)=>{
                    window.alert(response.message);
                    window.location.reload();
                })
            });
        updatePostBtn.addEventListener('click', ()=>{
            var updatePost = createElement('input', null, {value:post.meta.description_text, class:'input'});
            var updateFile = createElement('input', null, {type:'file'});
        
            postDisc.appendChild(updatePost);
            postDisc.appendChild(updateFile);
            var submitBtn = createElement('button', 'Submit', {class: 'button', style:"float: right;"});
            postDisc.appendChild(submitBtn);
            updatePostBtn.style.display = 'none';
            deletePostBtn.style.display = 'none';
            submitBtn.addEventListener('click', ()=>{
                if (updateFile.value != ''){
                    const src = uploadImage(updateFile.files);
                    src.then(function(result){
                        fetch(`http://localhost:5000/post/?id=${post.id}`,{
                            method: 'PUT',
                            body: JSON.stringify({
                                description_text: updatePost.value,
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
                } else { 
                    fetch(`http://localhost:5000/post/?id=${post.id}`,{
                            method: 'PUT',
                            body: JSON.stringify({
                                description_text: updatePost.value,
                                src: post.src
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
                }
                updatePostBtn.style.display = 'block';
                deletePostBtn.style.display = 'block';
                submitBtn.remove();
                updateFile.remove();
                updatePost.style.display = 'none';
                //window.location.reload();
            });
        });
        
        section.appendChild(deletePostBtn);
        section.appendChild(updatePostBtn);
        
    }

    section.appendChild(createElement('p', new Date(1000*parseFloat(post.meta.published)).toLocaleString(), {class: 'post-published'}));


//////////////////////------show like button & show comment button----------////////////////////
   
    var likeSrc = 'images/like.png';
    var commentSrc = 'images/comment.png';

    var likesBtn = createElement('button',post.meta.likes.length, {style:"text-decoration:none;color:blue;font-weight:bold;" });
    likesBtn.onclick = async function showLikes() {
        console.log(post.meta.likes);
        var likesInfo = await Promise.all(post.meta.likes.map(id => {
            return fetch(`http://localhost:5000/user/?id=${id}`,{
                method: 'GET',
                headers: {'Content-Type' : 'application/json', 
                    'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
                    }
                })
                .then((response) => response.json());
            })
        );
        var tempString = '';
        var inLikes= 0;
        for (var i in likesInfo){
            if ((likeSrc === 'images/like.png') && (likesInfo[i].username == window.localStorage.username)){
                //console.log(likesInfo[i].username);
                continue;
            }
            if (likesInfo[i].username === window.localStorage.username){
                inLikes = 1;
            }
            if (tempString != ''){
                tempString = tempString+", "+likesInfo[i].username;
            } else {
                tempString += likesInfo[i].username;
            }
        }
        if (likeSrc === 'images/unlike.png' && !inLikes ){
                tempString = tempString+", "+ window.localStorage.username;
            }
        var tempElement = createElement('div', tempString);
        section.appendChild(tempElement);
        //likesBtn.disabled = true;
    };

    var commentsBtn = createElement('button', post.comments.length,{style:"text-decoration:none;color:blue;font-weight:bold;" });
    var temp = createElement('div');
    commentsBtn.onclick = async function showComments() {
        console.log('showComments');
        const commentsList = await fetch(`http://localhost:5000/post/?id=${post.id}`,{
            method: 'GET',
            headers: {'Content-Type' : 'application/json', 
                    'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
                    }
        })
        .then(response => response.json())
        .then((response)=> {
            //console.log(response.comments);
            return response.comments;
        })
        //console.log(commentsList);
        for (var i in commentsList){
            console.log( commentsList[i]['author']);
            temp.appendChild(createElement('p', commentsList[i]['author'] +": "+commentsList[i]['comment']+' at '+ new Date(1000*parseFloat(commentsList[i]['published'])).toLocaleString()));
        }
        section.appendChild(temp);
    }
    var showDiv = createElement('div');



//////////////////////////------like button & comment button----------///////////////////////////
    
    for (var i in post.meta.likes){
        if (window.localStorage.getItem('id') == post.meta.likes[i]){
            likeSrc = 'images/unlike.png';
        }
    }
    var likeBtn = createElement('img', null, {src:likeSrc, class:'post-like'});
    var commentBtn = createElement('img', null, {src:commentSrc, class:'post-like'});
    var url='';
    likeBtn.addEventListener('click', async () => {
        if (likeSrc === 'images/like.png'){
            url = 'http://localhost:5000/post/like?id='+post.id; 
        } else {
            url = 'http://localhost:5000/post/unlike?id='+post.id; 
        }
        fetch(url, {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json', 
                    'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
                    }
        })
        .then((response) => response.json())
        .then(function(response){
            if (response.message == 'success'){
                console.log(response.message);
            } else {
                throw new Error(response.message);
            }
        })
        .catch((e) =>{
            window.alert(e)
        });

        if (likeSrc === 'images/like.png'){
            likeSrc = 'images/unlike.png'; 
            likeBtn.src = 'images/unlike.png';
            likesBtn.innerHTML = parseInt(likesBtn.innerHTML)+1; 
            //console.log(likesBtn);
        } else {
            likeSrc = 'images/like.png'; 
            likeBtn.src = 'images/like.png'; 
            likesBtn.innerHTML = parseInt(likesBtn.innerHTML)-1; 
        }
    });

    commentBtn.addEventListener('click', async ()=>{
        const commentInput = createElement('input', null, {placeholder:'Say something...', class:'input'});
        showDiv.appendChild(commentInput);

        const submitCommentBtn = createElement('button', 'Submit', {class: 'button', style:"float: right;"});
        submitCommentBtn.addEventListener('click', async ()=>{
            fetch(`http://localhost:5000/post/comment/?id=${post.id}`,{
                method:'PUT',
                body:JSON.stringify({
                    author: window.localStorage.username,
                    published: parseFloat(Date.parse(new Date()))/1000,
                    comment: commentInput.value
                }),
                headers:{
                    'Content-Type' : 'application/json', 
                    'Authorization': 'Token '+ window.localStorage.getItem('AUTH_KEY')
                }
            })
            .then(response=>response.json())
            .then((response)=>{
                if (response.message != 'success'){
                    throw new Error(response.message);
                }
                commentInput.style.display = 'none';
                submitCommentBtn.style.display = 'none';
                commentsBtn.innerHTML = parseInt(commentsBtn.innerHTML)+1;

            })
            .catch((e)=>{
                window.alert(e);
            })
        });

        showDiv.appendChild(submitCommentBtn);
    });
    section.appendChild(likeBtn);
    section.appendChild(commentBtn);



///////////////////////////////------show like button append----------/////////////////////////////////
    

    showDiv.appendChild(createElement('lable',"Show "));
    showDiv.appendChild(likesBtn);
    showDiv.appendChild(createElement('lable'," Likes and "));
    showDiv.appendChild(commentsBtn);
    showDiv.appendChild(createElement('lable'," Comments."));
    section.appendChild(showDiv);

    return section;
}



// Given an input element of type=file, grab the data uploaded for use
export async function uploadImage(files) {
    const [ file ] = files;

    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    return new Promise(function(resolve,reject){
        const reader = new FileReader();
    
        reader.onload = function(){
            resolve(reader.result);
        }
        reader.readAsDataURL(file);
    });
    
}

/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null

}