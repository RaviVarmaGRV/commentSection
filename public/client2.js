var socket=io();

var firstVideo=document.getElementById('yourVideo');
var secondVideo=document.getElementById('otherVideo');
var startButton=document.getElementById('start');

let localStream;

let peerConnection;

const configurations={
    iceServer:[{urls:"stun:stun.l.google.com:19302"}]
};

async function getLocalStream() {

    try {
        localStream=await navigator.mediaDevices.getUserMedia({video:true, audio:true});
        firstVideo.srcObject=localStream;
    } catch (error) {
        console.log('an error occured');
        
    }
    
}
getLocalStream();

function createPeerConnection() {
    peerConnection=new RTCPeerConnection(configurations);

    //to add loacal track

    localStream.getTracks().forEach((track)=>{
        peerConnection.addTrack(track,localStream);
    })

    //on receiveing

    peerConnection.ontrack=(event)=>{
        secondVideo.srcObject=event.streams[0];
    }

    //after offer and answer
    peerConnection.onicecandidate=(event)=>{
        if(event.candidate){
            socket.emit('candidate',event.candidate);
        }
    }

}

var count1=0;
// var element=document.getElementById('one');
document.querySelectorAll('i').forEach((element)=>{

    element.addEventListener('click',()=>{
        if (count1==0) {
            count1=1;
            element.classList.remove('fa-pause');
            element.classList.add('fa-play');
            element.previousElementSibling.pause();
        }
        else{
            count1=0;
            element.classList.remove('fa-play');
            element.classList.add('fa-pause');
            element.previousElementSibling.play();
        }
        
    })
})

socket.on('offer',async(offer)=>{
    createPeerConnection();

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer=await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('answer',answer);
})

socket.on('answer',async(answer)=>{
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
})


socket.on('candidate',async(candidate)=>{
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        
    } catch (error) {
        console.log(error);
        
    }
})


document.getElementById('start').addEventListener('click', async()=>{
    createPeerConnection();

    const offer=await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('offer',offer);
})