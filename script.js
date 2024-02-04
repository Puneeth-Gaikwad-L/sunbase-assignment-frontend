const logInForm = document.getElementById("login-Form");
const logInScreen = document.getElementById("login-Screen");

logInForm.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Login");
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(username, password);

    const AuthObj = {
        "email": username,
        "password": password
    }
    // api url to generate auth token
    const authApi = "http://localhost:8080/auth/login"

    fetch(authApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(AuthObj),
    })
        .then(response => {
            // Checking if the response status is in the success range (200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // saving the token from the response
            console.log('Response data:', data.jwtToken);
            localStorage.setItem("jwtToken", data.jwtToken);
            logInScreen.style.display = 'none';
            document.getElementById("view-cust").style.display = "block";
            getCustomers(1, 5, "firstName");
        })
        .catch(error => {
            // Handle errors 
            console.error('Error:', error);
        });

})


function getCustomers(pageNo, rowsCount, sortBy) {

    const apiUrl = `http://localhost:8080/customer/getCustomers?pageNo=${pageNo}&rowsCount=${rowsCount}&sortBy=${sortBy}`;

    // Get the authentication token from localStorage
    const authToken = localStorage.getItem('jwtToken');

    console.log(authToken);

    // Making a GET request using fetch
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            // Checking if the response status is in the success range (200-299)

            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            // Handle the data from the response
            console.log('Response data:', data.content);
            addCustomersToTable(data.content);
        })
        .catch(error => {
            // Handle errors during the fetch operation
            console.error('Error:', error);
        });
}

const table = document.getElementById("customer-table");

function addCustomersToTable(customers) {
    customers.forEach(element => {
        console.log(element);

        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${element.firstName}</td>
        <td>${element.lastName}</td>
        <td>${element.address}</td>
        <td>${element.city}</td>
        <td>${element.state}</td>
        <td>${element.email}</td>
        <td>${element.phone}</td>
        <td>
            <div class="actions">
                <button onclick="deleteCust(event)" data-email= ${element.email} class="del-btn"><i class="fa-solid fa-trash"></i></button>
                <button data-email= ${element.email} class="edit-btn"><i class="fas fa-edit"></i></button>
            </div>
        </td>`

        table.appendChild(tr);

    });
}


const addCustomerForm = document.getElementById("addCustomer-form");
let formData = {}
addCustomerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("submitted");
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const street = document.getElementById("street").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("State").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    console.log(firstName, lastName, address, city, state, email, phone);
    formData = {
        "firstName": firstName,
        "lastName": lastName,
        "street": street,
        "address": address,
        "city": city,
        "state": state,
        "email": email,
        "phone": phone,
    }
    console.log(formData);
    const authToken = localStorage.getItem('jwtToken');

    // Replace 'http://localhost:8080/customer/create' with the actual API endpoint
    const apiUrl = 'http://localhost:8080/customer/create';


    // Make the POST request using fetch
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            // Check if the response status is in the success range (200-299)
            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            // Handle the data from the response
            console.log('Response data:', data);
        })
        .catch(error => {
            // Handle errors during the fetch operation
            console.error('Error:', error);
        });

})

function deleteCust(event) {

    const email = event.target.getAttribute("data-email");
    console.log(email);

    const authToken = localStorage.getItem('jwtToken');

    const apiUrl = `http://localhost:8080/customer/delete?email=${email}`

    fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            // Handle the data from the response
            console.log('Response data:', data);
        })
        .catch(error => {
            // Handle errors during the fetch operation
            console.error('Error:', error);
        });
}

const syncBtn = document.getElementById("sync-btn");
syncBtn.addEventListener("click", async () => {
    console.log("sync");
    await hitAuthenticationAPI();
    await getCustomerList();
})

async function hitAuthenticationAPI() {
    const apiUrl = 'https://qa.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp';

    // Data to be sent in the request body
    const requestBody = {
        login_id: 'test@sunbasedata.com',
        password: 'Test@123'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        // Parse the JSON from the response
        const responseData = await response.json();

        // Handle the data from the response
        localStorage.setItem('accessToken',responseData.access_token)
        console.log('Response data:', responseData.access_token);

        // You can return the response data or perform other actions as needed
        return responseData;
    } catch (error) {
        // Handle errors during the fetch operation
        console.error('Error:', error);

        // You can throw the error or handle it in a different way based on your requirements
        throw error;
    }
}

async function getCustomerList() {
    const apiUrl = 'https://qa.sunbasedata.com/sunbase/portal/api/assignment.jsp';
    const accessToken = localStorage.getItem("accessToken");

    // Data to be sent in the request body
    const requestBody = {
        login_id: 'test@sunbasedata.com',
        password: 'Test@123'
    };

    try {
        const response = await fetch(`${apiUrl}?cmd=get_customer_list`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        });

        // Parse the JSON from the response
        const responseData = await response.json();

        // Handle the data from the response
        console.log('Response data:', responseData);

        // You can return the response data or perform other actions as needed
        return responseData;
    } catch (error) {
        // Handle errors during the fetch operation
        console.error('Error:', error);

        // You can throw the error or handle it in a different way based on your requirements
        throw error;
    }
}


