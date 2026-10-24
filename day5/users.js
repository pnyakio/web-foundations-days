const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store all users returned by the API
let allUsers = [];

// Display any array of users on the page
function renderUsers(users) {
    usersList.replaceChildren();

    if (users.length === 0) {
        statusText.textContent = "No users match your filter.";
        return;
    }

    users.forEach((user) => {
        const li = document.createElement("li");

        const name = document.createElement("h2");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        li.append(name, email, city, company);
        usersList.appendChild(li);
    });
}

// Fetch users from the API
async function loadUsers() {
    statusText.textContent = "Loading users...";
    loadButton.disabled = true;
    usersList.replaceChildren();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const users = await response.json();

        allUsers = users;
        renderUsers(allUsers);

        statusText.textContent = `Loaded ${allUsers.length} users.`;
    } catch (error) {
        statusText.textContent = "Could not load users. Please try again.";
        console.error("Error loading users:", error);
    } finally {
        loadButton.disabled = false;
    }
}

// Load users when the button is clicked
loadButton.addEventListener("click", loadUsers);

// Filter the stored users without making another API request
filterInput.addEventListener("input", () => {
    const searchText = filterInput.value.trim().toLowerCase();

    const filteredUsers = allUsers.filter((user) =>
        user.name.toLowerCase().includes(searchText)
    );

    renderUsers(filteredUsers);
});
