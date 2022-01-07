
///SignUP
const url = "http://localhost:5000"
function signup() {


    axios({
        method: 'post',
        url: "http://localhost:5000/signup",
        data: {
            userName: document.getElementById("name").value,
            userDept: document.getElementById("dept").value,
            userBatch: document.getElementById("batch").value,
            userEmail: document.getElementById("email").value,
            userPassword: document.getElementById("password").value,
            userPhone: document.getElementById("phone").value


        }//, withCredentials: true

    }).then(function (response) {
        console.log(response.data.message);
        alert(response.data.message);
        window.location.href = "login.html"
    })

        .catch(function (error) {
            console.log(error);
            alert(response.message)
        });

    return false;
}


///Login

function login() {
    // idhar login karogay to token milega usko localstorage mai save karana
    axios({
        method: 'post',
        url: "http://localhost:5000/login",
        data: {
            email: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value,
        }, withCredentials: true

    }).then((response) => {
        console.log(response);
        // alert(response.user)
        alert(response.data.message)
        // !!! idhr
        localStorage.setItem('token', response.data.token)

        window.location.href = "./dashboard.html"
    }, (error) => {
        console.log(error);
        alert(error)
    });

    return false;
}

function Profile() {
    axios({
        method: "get",
        url: "http://localhost:5000/profile",
        headers: {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
            // aur ayaha par token bhejogay har reqeust pr ok
            authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true

    })
        .then((response) => {

            document.getElementById('name1').innerHTML = response.data.userData.name;
            document.getElementById('name2').innerHTML = response.data.userData.name;
            document.getElementById('phone').innerHTML = response.data.userData.phone;
            document.getElementById('dept').innerHTML = response.data.userData.dept;
            document.getElementById('batch').innerHTML = response.data.userData.batch;
console.log(response.data)
        },
            (error) => {
                console.log(error.message);
            });
    return false

}

//FORGET STEP-1

function forgot1() {

    axios({
        method: 'post',
        url: "http://localhost:5000/forget-password",
        data: {
            email: document.getElementById("your-email").value,
        }
        // withCredentials: true
    }).then((response) => {
        if (response.data.status === 200) {
            console.log(response.data.message);
            alert(response.data.message);
            window.location.href = "forget2.html"
        } else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log(error);
    });

    return false;

}


function forgot2() {
    axios({
        method: 'post',
        url: "http://localhost:5000/forget-password-step-2",
        data: {
            email: document.getElementById("email2").value,
            newPassword: document.getElementById("password2").value,
            otp: document.getElementById("otp").value,
        }
    }).then((response) => {

        console.log(response.data.message);
        alert(response.data.message);
        window.location.href = "login.html"


    }, (error) => {
        console.log(error);
    });
    return false;

}


