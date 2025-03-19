var clientSocket=io();



var msg = document.querySelectorAll('.textArea')[document.querySelectorAll('.textArea').length-1];
var commentedMesgBox=document.getElementById('commentWindow');

var count=0;

var usrName=prompt('Enter your name');

var send = document.getElementById('send');
send.addEventListener('click',()=>{
    clientSocket.emit('addMessage',msg.value,commentedMesgBox.id,usrName,'comment'+(count+1),0,new Date().toISOString().split('T')[0].split('-').join("/"));
    msg.value=null;
});


msg.addEventListener('keydown',function(event) {
    if (event.key=='Enter') { 
    console.log('comment'+(count+1));        

        clientSocket.emit('addMessage',msg.value,commentedMesgBox.id,usrName,'comment'+(count+1),0,new Date().toISOString().split('T')[0].split('-').join("/"));        
        msg.value=null;
    }
})

var reply=document.querySelector(".optionsClass");

reply.addEventListener('click',()=>{
    clientSocket.emit('addReplyBox',reply.id);

});

var defaultPlus=document.querySelector('.plus');
var defaultMinus=document.querySelector('.minus');
defaultPlus.addEventListener('click',()=>{   
    var toVote=defaultPlus.parentElement;
    if (toVote.dataset.vote=="on") {
        toVote.dataset.vote="off";
        clientSocket.emit("upVote",defaultPlus.parentElement.children[1].id); 
    }     
})

defaultMinus.addEventListener('click',()=>{   
    var toMinusVote=defaultMinus.parentElement;
    if (toMinusVote.dataset.vote=="off") {
        toMinusVote.dataset.vote="on";
        clientSocket.emit("downVote",defaultMinus.parentElement.children[1].id); 
    }     
})

clientSocket.on("increaseVote",(id)=>{
    var clickedElemnt=document.getElementById(id);
    clickedElemnt.textContent=(+clickedElemnt.textContent)+1;
});

clientSocket.on("decreaseVote",(id)=>{
    var clickedElemnt=document.getElementById(id);
    clickedElemnt.textContent=(+clickedElemnt.textContent)-1;
});


clientSocket.on('addASendReplyOption',(id)=>{    
    addReplyTypeBox(id);
})

clientSocket.on('msgAdd',(msg,id,usrName,commentId,likesCount,date)=>{    
    addMsg(msg,id,usrName,commentId,likesCount,date);
})

clientSocket.on('deleteEle',(commentId)=>{    
    remove(commentId);
})

clientSocket.on('editElement',(commentId,msg)=>{    
    edit(commentId,msg);
})

function addMsg(msg,elToApend,userName,commentId,likesCount,date){    
    count+=1;
    var elementToAppend=document.getElementById(elToApend);
    var fullCommentCont=document.createElement('div');
    fullCommentCont.classList.add('messBox');
    fullCommentCont.id=commentId;
    var voteDiv=document.createElement('div');
    voteDiv.dataset.vote="on";
    voteDiv.classList.add('voteDiv');

    var plusIcon=document.createElement('div');
    var plusImage=document.createElement('img');
    plusImage.classList.add('plus');
    plusImage.src='./images/icon-plus.svg';
    plusIcon.title="upvote";
    plusIcon.classList.add('iconBox');
    plusIcon.appendChild(plusImage);

    var voteCount=document.createElement('p');
    voteCount.textContent=likesCount;
    voteCount.id='mes'+(count);

    var minusIcon=document.createElement('div');
    var minusImage=document.createElement('img');
    minusImage.classList.add('minus');
    minusImage.src='./images/icon-minus.svg';
    minusIcon.title="downvote";
    minusIcon.classList.add('iconBox');
    minusIcon.appendChild(minusImage);

    plusIcon.addEventListener('click',()=>{   
        var toVote=plusIcon.parentElement;
        if (toVote.dataset.vote=="on") {
            toVote.dataset.vote="off";
            clientSocket.emit("upVote",plusIcon.parentElement.children[1].id); 
        }     
    })
    minusIcon.addEventListener('click',()=>{   
        var toMinusVote=minusIcon.parentElement;
        if (toMinusVote.dataset.vote=="off") {
            toMinusVote.dataset.vote="on";
            clientSocket.emit("downVote",minusIcon.parentElement.children[1].id); 
        }     
    })

    voteDiv.appendChild(plusIcon);
    voteDiv.appendChild(voteCount);
    voteDiv.appendChild(minusIcon);

    var mainContents=document.createElement('div');
    mainContents.classList.add('rightOfComment');
    var msgBoxHeader=document.createElement('div');
    msgBoxHeader.classList.add('msgBoxHeader');


    if (elToApend.split("").indexOf('W')==-1) {
        msgBoxHeader.style.width="100%";
        voteDiv.style.width="35px";
    }


    var userInfo=document.createElement('div');
    userInfo.classList.add('flex');

    var userImg=document.createElement('img');
    userImg.classList.add('personImg');
    userImg.src='./images/avatars/image-juliusomo.png';
    var usersName=document.createElement('h4');
    usersName.classList.add('flexAlCent');
    usersName.textContent=userName;
    var timeFromSent=document.createElement('p');
    timeFromSent.classList.add('flexAlCent');
    timeFromSent.textContent=date;

    userInfo.appendChild(userImg);
    userInfo.appendChild(usersName);
    userInfo.appendChild(timeFromSent);

    msgBoxHeader.appendChild(userInfo);

    

    //
    if(userName!=usrName){
        var reply=document.createElement('div');
        reply.classList.add('optionsClass');
        reply.id="replyNum"+count;

        var replySvg=document.createElement('img');
        replySvg.classList.add('replySvg');
        replySvg.src='./images/icon-reply.svg';
        var replyTxt=document.createElement('p');
        replyTxt.classList.add('reply');
        replyTxt.textContent="Reply";

        reply.appendChild(replySvg);
        reply.appendChild(replyTxt);

        
        msgBoxHeader.appendChild(reply);

        reply.addEventListener('click',()=>{
            clientSocket.emit('addReplyBox',reply.id);
        });
    }
    else{

        var options=document.createElement('div');
        options.style.display="flex";
        options.style.gap='20px';

        var edit=document.createElement('div');
        edit.classList.add('optionsClass');
        // edit.id="replyNum"+count;

        var editSvg=document.createElement('img');
        editSvg.classList.add('editSvg');
        editSvg.src='./images/icon-edit.svg';
        var editTxt=document.createElement('p');
        editTxt.classList.add('reply');
        editTxt.textContent="Edit";

        edit.appendChild(editSvg);
        edit.appendChild(editTxt);

        //
        var remove=document.createElement('div');
        remove.classList.add('optionsClass');
        // remove.id="replyNum"+count;

        var removeSvg=document.createElement('img');
        removeSvg.classList.add('removeSvg');
        removeSvg.src='./images/icon-delete.svg';
        var removeTxt=document.createElement('p');
        removeTxt.classList.add('remove');
        removeTxt.textContent="Delete";

        remove.appendChild(removeSvg);
        remove.appendChild(removeTxt);

        remove.addEventListener('click',()=>{
            clientSocket.emit('removeEle',remove.parentElement.parentElement.parentElement.parentElement.id);
        })

        edit.addEventListener('click',()=>{
            console.log(edit.parentElement.parentElement.nextElementSibling.firstChild);
            console.log(edit.parentElement.parentElement.parentElement);

            var rightOfVoteDiv=edit.parentElement.parentElement.parentElement;
            

            var elementToChange=edit.parentElement.parentElement.nextElementSibling.firstChild;

            var updateButton=document.createElement('button');
            updateButton.innerText="Update";

            rightOfVoteDiv.appendChild(updateButton);

            elementToChange.contentEditable=true;
            console.log(elementToChange.contentEditable);
            
            // elementToChange.preventdefault();
            elementToChange.style.marginBottom="20px";
            elementToChange.style.border="1px solid";
            elementToChange.focus();

            var oldContent=elementToChange.textContent;

            setTimeout(()=>(document.addEventListener('click',toRemoveUpdate),100))
            

            function toRemoveUpdate(e){
                const element = e.target;
                if (!(element==elementToChange||element==updateButton||element==mainContents)) {
                    elementToChange.contentEditable=false;
                    elementToChange.style.border="none";
                    elementToChange.style.marginBottom="0px";
                    elementToChange.textContent=oldContent;
                    updateButton.remove();
                    document.removeEventListener('click',toRemoveUpdate);                    
                }                
            }

            elementToChange.addEventListener('keydown',function(event) {

                if (event.key=='Enter') {
                    elementToChange.contentEditable=false;
                    elementToChange.style.marginBottom="0px";
                    elementToChange.style.border="none";
                    updateButton.remove();
                    document.removeEventListener('click',toRemoveUpdate);
                    clientSocket.emit('editEle',edit.parentElement.parentElement.parentElement.parentElement.id,elementToChange.textContent);
                }
            })

            updateButton.addEventListener('click',()=>{
                elementToChange.contentEditable=false;
                elementToChange.style.marginBottom="0px";
                elementToChange.style.border="none";
                updateButton.remove();
                document.removeEventListener('click',toRemoveUpdate);
                clientSocket.emit('editEle',edit.parentElement.parentElement.parentElement.parentElement.id,elementToChange.textContent);
        })
            
            
            console.log(edit.parentElement.parentElement.parentElement.parentElement.id);
            
        })

        options.appendChild(remove);
        options.appendChild(edit);

        msgBoxHeader.appendChild(options);

    }





    var msgContentBox=document.createElement('div');
    var content=document.createElement('p');
    content.textContent=msg;
    msgContentBox.appendChild(content);

    mainContents.appendChild(msgBoxHeader);
    mainContents.appendChild(msgContentBox);

    fullCommentCont.appendChild(voteDiv);
    fullCommentCont.appendChild(mainContents);

    fullCommentCont.dataset.reply="on";
    
    elementToAppend.appendChild(fullCommentCont);

    var forReplies=document.createElement('div');
    forReplies.classList.add('allRepliesOfAComment');

    var sideLine=document.createElement('hr');
    sideLine.classList.add('line');

    var allrepliesDiv=document.createElement('div');
    allrepliesDiv.id='repBox'+count;
    allrepliesDiv.classList.add('allRepliesBoxRight');
    
    forReplies.appendChild(sideLine);
    forReplies.appendChild(allrepliesDiv);
    elementToAppend.appendChild(forReplies);

    // plusIcon.addEventListener('click',()=>{        
    //     clientSocket.emit("upVote",plusIcon.parentElement.children[1].id);
    // });

    
}

function addReplyTypeBox(elementId) {
    
    // var replyBoxOld=document.querySelector('.msgSenderDiv');
    
    // if (replyBoxOld) {
    //     replyBoxOld.parentElement.parentElement.previousElementSibling.dataset.reply="on";

    //     replyBoxOld.remove();
    // }
    var element=document.getElementById(elementId);

    var bigParent=element.parentElement.parentElement.parentElement
    
        if (bigParent.dataset.reply=="on") {
            var replyBox=document.createElement('div');
            var senderImg=document.createElement('img');
            senderImg.classList.add('personImg');
            senderImg.src='./images/avatars/image-juliusomo.png';
            var textBox=document.createElement('textarea');
            textBox.classList.add('textArea');

            textBox.addEventListener('keydown',function(event) {

                if (event.key=='Enter') {
                    console.log("comment"+count);
                    
                    clientSocket.emit('addMessage',textBox.value,bigParent.nextElementSibling.lastElementChild.id,usrName,"comment"+(count+1),"0",new Date().toISOString().split('T')[0].split('-').join("/"));
                    replyBox.remove();
                    bigParent.dataset.reply="on"; 
                }
            })
            var replyButton=document.createElement('button');
            replyButton.textContent="Reply";
            replyBox.appendChild(senderImg);
            replyBox.appendChild(textBox);
            replyBox.appendChild(replyButton);
            replyBox.classList.add('msgSenderDiv');

            bigParent.nextElementSibling.lastElementChild.appendChild(replyBox);
            
            bigParent.dataset.reply="off";

            textBox.focus();

            document.addEventListener('click',(e)=>{
                toRemove(e.target);
            });

            function toRemove(element){
                if (!(element==replyBox||replyBox.contains(element))) {
                    replyBox.remove();
                    bigParent.dataset.reply="on"; 
                    document.removeEventListener('click',toRemove);
                }
            }
            
            replyButton.addEventListener('click',()=>{    
                clientSocket.emit('addMessage',textBox.value,bigParent.nextElementSibling.lastElementChild.id,usrName);
                replyBox.remove();
                bigParent.dataset.reply="on";                
            });
        }
}

function remove(id){
    var elToRv=document.getElementById(id);
    elToRv.nextElementSibling.remove();
    elToRv.remove();
}

function edit(id,msg){
    var comment=document.getElementById(id);
    comment.lastElementChild.lastElementChild.firstChild.textContent=msg    
}