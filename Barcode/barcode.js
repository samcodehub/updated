// nav btn
const open_btn = document.querySelector('.open-btn')
const close_btn = document.querySelector('.close-btn')
const nav = document.querySelectorAll('.nav')
open_btn.addEventListener('click', () => {
    nav.forEach(nav_el => nav_el.classList.add('visible'))
})
close_btn.addEventListener('click', () => {
    nav.forEach(nav_el => nav_el.classList.remove('visible'))
})

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA-Kp7Lh6PHGyjnZdY439rVBXheUV_Cxr8",
  authDomain: "comment-section-c268d.firebaseapp.com",
  databaseURL: "https://comment-section-c268d-default-rtdb.firebaseio.com",
  projectId: "comment-section-c268d",
  storageBucket: "comment-section-c268d.appspot.com",
  messagingSenderId: "183451144688",
  appId: "1:183451144688:web:290e0d975f7eab776d8d35",
  measurementId: "G-4Y6Z78LFFV"
};

firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef1 = firebase.database().ref('barcodemessages');

// Listen for form submit
document.getElementById('contactForm').addEventListener('submit', submitForm);

// Listen for value events on the messages reference
messagesRef1.on('value', function(snapshot) {
  var messageList = document.getElementById('messages');

  // Fetch messages and store them in an array
  var messagesArray = [];
  snapshot.forEach(function(childSnapshot) {
    var messageData = childSnapshot.val();
    var messageId = childSnapshot.key;
    messagesArray.push({
      name: messageData.name,
      message: messageData.message,
      timestamp: messageData.timestamp,
      messageId: messageId,
      likes: messageData.likes,
      dislikes: messageData.dislikes
    });
  });

  // Sort messages by timestamp in descending order
  messagesArray.sort(function(a, b) {
    return b.timestamp - a.timestamp;
  });

  // Clear the message list
  messageList.innerHTML = '';

  // Display messages in the sorted order
  messagesArray.forEach(function(messageData) {
    displayMessage(messageData.name, messageData.message, messageData.timestamp, messageData.messageId, messageData.likes, messageData.dislikes);
  });
});

// Submit form
function submitForm(e){
  e.preventDefault();

  var name = getInputVal('name');
  var email = getInputVal('email');
  var message = getInputVal('message');

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  saveMessage1(name, email, message);

  document.getElementById('contactForm').reset();
}

// Function to validate email
function isValidEmail(email) {
  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email);
}

// Function to get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

function displayMessage(name, message, timestamp, messageId, likes, dislikes){
  var messageList = document.getElementById('messages');

  var div = document.createElement('div');
  div.className = 'card';
  var divCardBody = document.createElement('div');
  divCardBody.className = 'card-body';
  var h5 = document.createElement('h3');
  h5.className = 'card-title';
  h5.innerText = name;
  var p = document.createElement('p');
  p.className = 'card-text';
  p.innerText = message;
  var small = document.createElement('small');
  small.className = 'text-muted';
  small.innerText = new Date(timestamp).toLocaleString();

  var likeBtn = document.createElement('button');
  likeBtn.className = 'btn btn-sm';
  likeBtn.innerText = '👍  (' + (likes || 0) + ')';
  likeBtn.addEventListener('click', function() {
    handleLike(messageId, likes);
  });

  var dislikeBtn = document.createElement('button');
  dislikeBtn.className = 'btn btn-sm';
  dislikeBtn.innerText = '👎  (' + (dislikes || 0) + ')';
  dislikeBtn.addEventListener('click', function() {
    handleDislike(messageId, dislikes);
  });

  // Fetch the dislikes count from the database
  var dislikesRef = messagesRef1.child(messageId).child('dislikes');
  dislikesRef.once('value', function(snapshot) {
    var dislikesCount = snapshot.val();
    dislikeBtn.innerText = '👎  (' + (dislikesCount || 0) + ')';
  });

  var replyBtn = document.createElement('button');
  replyBtn.className = 'btn btn-outline-warning btn-sm text-dark fst-italic';
  replyBtn.innerText = 'Reply';
  replyBtn.addEventListener('click', function() {
    var replyMessage = prompt('Enter your reply:');
    if (replyMessage) {
      var commenterName = prompt('Enter your name:');
      if (commenterName) {
        handleReply(messageId, commenterName, replyMessage);
      }
    }
  });

  var repliesList = document.createElement('ol');
  repliesList.className = 'replies-list'; // Apply CSS class to the replies list

  var repliesRef = messagesRef1.child(messageId).child('replies');
  repliesRef.on('value', function(snapshot) {
    repliesList.innerHTML = '';
    snapshot.forEach(function(childSnapshot) {
      var replyData = childSnapshot.val();
      var replyItem = document.createElement('li');
      replyItem.className = 'reply-item'; // Apply CSS class to each reply item
      replyItem.innerText = `${replyData.name}: ${replyData.message}`;
      repliesList.appendChild(replyItem);
    });
  });

  divCardBody.appendChild(h5);
  divCardBody.appendChild(p);
  divCardBody.appendChild(small);
  divCardBody.appendChild(likeBtn);
  divCardBody.appendChild(dislikeBtn);
  divCardBody.appendChild(replyBtn);
  divCardBody.appendChild(repliesList);
  div.appendChild(divCardBody);
  messageList.appendChild(div);
}

function saveMessage1(name, email, message){
  var newMessageRef = messagesRef1.push();
  newMessageRef.set({
    name: name,
    email: email,
    message: message,
    timestamp: Date.now(),
    likes: 0, // Set initial likes count to 0
 
  });
}

// Function to check if a user has already liked/disliked a comment in the current session
function hasUserLikedComment(messageId) {
  return sessionStorage.getItem(`liked_${messageId}`);
}

// Function to handle the like action
function handleLike(messageId, likes) {
  // Check if the user has already liked this comment in the current session
  if (!hasUserLikedComment(messageId)) {
    // Increment the likes count
    likes = likes ? likes + 1 : 1;
    // Update the likes count in the database
    messagesRef1.child(messageId).update({ likes: likes });
    // Mark this comment as liked by the user in the current session
    sessionStorage.setItem(`liked_${messageId}`, 'true');
  }
}

// Function to check if a user has already disliked a comment in the current session
function hasUserDislikedComment(messageId) {
  return sessionStorage.getItem(`disliked_${messageId}`);
}

// Function to handle the dislike action
function handleDislike(messageId, dislikes) {
  // Check if the user has already disliked this comment in the current session
  if (!hasUserDislikedComment(messageId)) {
    // Increment the dislikes count using a Firebase transaction
    messagesRef1.child(messageId).child('dislikes').transaction(function(currentDislikes) {
      return (currentDislikes || 0) + 1;
    });
    // Mark this comment as disliked by the user in the current session
    sessionStorage.setItem(`disliked_${messageId}`, 'true');
  }
}


// Function to handle the reply action
function handleReply(messageId, commenterName, replyMessage) {
  var repliesRef = messagesRef1.child(messageId).child('replies');
  var newReplyRef = repliesRef.push();
  newReplyRef.set({
    name: commenterName,
    message: replyMessage,
    timestamp: Date.now()
  });
}

  // Initialize Firebase for subscription
  const footerFirebaseConfig = {
    apiKey: "AIzaSyCrkr6MbF2Cx9ds0rJzH5ptbWvytTvu9Go",
    authDomain: "footer-section.firebaseapp.com",
    databaseURL: "https://footer-section-default-rtdb.firebaseio.com",
    projectId: "footer-section",
    storageBucket: "footer-section.appspot.com",
    messagingSenderId: "898490602457",
    appId: "1:898490602457:web:aee95228476d3b15d37fc8"
};

const footerFirebaseApp = firebase.initializeApp(footerFirebaseConfig, "footer");
const subscriptionRef = footerFirebaseApp.database().ref("subscription");

document.getElementById("contactForm2").addEventListener("submit", submitSubscriptionForm);

function submitSubscriptionForm(e) {
    e.preventDefault();

    const emailid = getInputVal("emailid");

    if (emailid.trim() === "") {
        alert("Please enter a valid email address.");
        return;
    }

    saveSubscription(emailid);

    // reset the form
    document.getElementById("contactForm2").reset();
}

const saveSubscription = (emailid) => {
    const newSubscriptionRef = subscriptionRef.push();

    newSubscriptionRef.set({
        emailid: emailid,
    }).then(() => {
        // enable alert
        document.querySelector(".alert").style.display = "block";

        // remove the alert
        setTimeout(() => {
            document.querySelector(".alert").style.display = "none";
        }, 5000);
    });
};

// Function to get form values
function getInputVal(id){
    return document.getElementById(id).value;
}


// copy code function
function copyCode(button) {
  const codeElement = button.previousElementSibling.querySelector("code");
  const code = codeElement.innerText;
  navigator.clipboard.writeText(code).then(() => {
    button.innerText = "Code copied!";
    setTimeout(() => {
      button.innerText = "Copy code";
    }, 2000);
  });
}



function sendMail() {
  var params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
  };

  const serviceID = "service_xm3hccj"; // Replace with your EmailJS service ID
  const templateID = "template_634tsok"; // Replace with your EmailJS template ID

  emailjs.send(serviceID, templateID, params)
    .then((res) => {
      // Clear form inputs after submission
      var formInputs = document.querySelectorAll("#contactForm input, #contactForm textarea");
      formInputs.forEach(function (input) {
        input.value = "";
      });

      console.log(res);
   
    })
    .catch((err) => console.log(err));
}