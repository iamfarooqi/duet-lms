
// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCG-3j3OQUd-VK-V6djAuwmTuwEoKPQs-Y",
//   authDomain: "duet-lms.firebaseapp.com",
//   projectId: "duet-lms",
//   storageBucket: "duet-lms.appspot.com",
//   messagingSenderId: "570514159435",
//   appId: "1:570514159435:web:4fc59b129986fc9c981ace"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// document.getElementById('file').addEventListener('change', (event) => {
//     const file = event.target.files[0];
//     const storageRef = firebase.storage().ref('images/' + file.name);

//     storageRef.put(file).on('state_changed', (snapshot) => {
//         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log(progress);
//         const progressBar = document.getElementById('progress_bar');
//         progressBar.value = progress;
//     });

//     storageRef.getDownloadURL().then(function(url){
//         const image = document.getElementById('image');
//         console.log(url);
//         image.src = url
//     });
// });

