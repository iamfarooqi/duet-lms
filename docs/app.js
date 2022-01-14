const url = "http://localhost:5000"

///SignUP


function signup() {
    axios({
        method: 'post',
        url: url + "/signup",
        data: {
            userName: document.getElementById("name").value,
            userDept: document.getElementById("dept").value,
            userBatch: document.getElementById("batch").value,
            userEmail: document.getElementById("email").value,
            userPassword: document.getElementById("password").value,
            userPhone: document.getElementById("phone").value
        }, withCredentials: true
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
        url: url +"/login",
        data: {
            email: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value,
        }, withCredentials: true

    }).then((response) => {
        // console.log(response);
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
        url: url + "/profile",
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
            // console.log(response.data)
        },(error) => {
                console.log(error.message);
            });
    return false
}


// LOGOUT

function logout() {
    axios({
        method: 'post',
        url: url + "/logout",
        headers: {
            // Accept: 'application/json',
            // 'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
            // aur ayaha par token bhejogay har reqeust pr ok
            authorization: `Bearer ${localStorage.getItem("token")}`,
        },withCredentials: true
        
    }).then((response) => {
        console.log(response);
        window.location.href = "login.html"
    }, (error) => {
        console.log(error.message);
    });
    return false
}





