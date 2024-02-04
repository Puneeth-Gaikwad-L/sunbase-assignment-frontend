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
    table.innerHTML = '';
    const tableHead = document.createElement("tr");
    tableHead.innerHTML = `
    <th>First Name</th>
    <th>Last Name</th>
    <th>Address</th>
    <th>City</th>
    <th>State</th>
    <th>Email</th>
    <th>Phone</th>
    <th>Actions</th>`

    table.appendChild(tableHead);

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
                <button onclick="deleteCust(this)" data-email= ${element.email} class="del-btn"><i class="fa-solid fa-trash"></i></button>
                <button onclick="editRow(this)" data-email= ${element.email} class="edit-btn"><i class="fas fa-edit"></i></button>
            </div>
        </td>`

        table.appendChild(tr);

    });
}

function displayAddcustomerForm() {
    document.getElementById("addCustomer-form").style.display = "flex";
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
            getCustomers(1, 5, "firstName");
        })
        .catch(error => {
            // Handle errors during the fetch operation
            console.error('Error:', error);
        });

    addCustomerForm.reset()
    addCustomerForm.style.display = 'none';

})

function deleteCust(event) {

    const email = event.getAttribute("data-email");
    console.log(event.getAttribute("data-email"));

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
            getCustomers(1, 5, "firstName");
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

let selectElement = document.getElementById("selectField")
selectElement.addEventListener("change", function () {
    // Get the selected value
    let selectedValue = selectElement.value;
    getCustomers(1, 5, selectedValue);
    // Do something with the selected value
    console.log("Selected value: " + selectedValue);
});
const syncBtn = document.getElementById("sync-btn");
syncBtn.addEventListener("click", async () => {
    console.log("sync");
    await hitAuthenticationAPI();
    await getCustomerList();
})

const editCustomerForm = document.getElementById("editCustomer-form");

function editRow(btn) {
    editCustomerForm.style.display = "flex";
    const row = btn.parentNode.parentNode.parentNode;
    console.log(row);
    const firstName = row.cells[0].innerText;
    const lastName = row.cells[1].innerText;
    const address = row.cells[2].innerText;
    const city = row.cells[3].innerText;
    const state = row.cells[4].innerText;
    const email = row.cells[5].innerText;
    const personToupdate = row.cells[5].innerHTML
    const phone = row.cells[6].innerText;

    console.log(firstName, lastName, address, city, state, email, phone);

    document.getElementById("editfirstName").value = firstName;
    document.getElementById("editlastName").value = lastName;
    document.getElementById("editaddress").value = address;
    document.getElementById("editcity").value = city;
    document.getElementById("editState").value = state;
    document.getElementById("editemail").value = email;
    document.getElementById("editphone").value = phone;

    editCustomerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("submitted");
        const firstName = document.getElementById("editfirstName").value;
        const lastName = document.getElementById("editlastName").value;
        const address = document.getElementById("editaddress").value;
        const city = document.getElementById("editcity").value;
        const state = document.getElementById("editState").value;
        const email = document.getElementById("editemail").value;
        const phone = document.getElementById("editphone").value;

        const formData = {
            "firstName": firstName,
            "lastName": lastName,
            "address": address,
            "city": city,
            "state": state,
            "email": email,
            "phone": phone,
        };

        const authToken = localStorage.getItem('jwtToken');
        const apiUrl = `http://localhost:8080/customer/update/${personToupdate}`;
        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);


                document.getElementById("editCustomer-form").style.display = "none";

                getCustomers(1, 5, "firstName");
            })
            .catch(error => {

                console.error('Error:', error);
            });
    });


}


