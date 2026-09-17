```javascript
const usernameInput = document.getElementById("username");
const amountInput = document.getElementById("amount");

const findButton = document.getElementById("findButton");
const sendButton = document.getElementById("sendButton");

const userBox = document.getElementById("userBox");
const foundUsername = document.getElementById("foundUsername");

const processing = document.getElementById("processing");
const success = document.getElementById("success");

const successText = document.getElementById("successText");
const closeButton = document.getElementById("closeButton");

let selectedUser = "";


/* FIND USER */

findButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (!username) {
        userBox.classList.add("hidden");
        selectedUser = "";
        updateButton();
        return;
    }

    selectedUser = username;

    foundUsername.textContent = username;
    userBox.classList.remove("hidden");

    updateButton();
});


/* AMOUNT */

amountInput.addEventListener("input", () => {
    updateButton();
});


/* ENABLE SEND */

function updateButton() {
    const amount = Number(amountInput.value);

    sendButton.disabled = !selectedUser || !amount || amount <= 0;
}


/* SEND */

sendButton.addEventListener("click", () => {
    const amount = Number(amountInput.value);

    if (!selectedUser || !amount || amount <= 0) {
        return;
    }

    processing.classList.remove("hidden");

    setTimeout(() => {
        processing.classList.add("hidden");

        successText.textContent =
            formatNumber(amount) +
            " Fake Robux were simulated as sent to " +
            selectedUser +
            ".";

        success.classList.remove("hidden");
    }, 1800);
});


/* CLOSE */

closeButton.addEventListener("click", () => {
    success.classList.add("hidden");
});


/* ESC */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        processing.classList.add("hidden");
        success.classList.add("hidden");
    }
});


/* NUMBER FORMAT */

function formatNumber(number) {
    return number.toLocaleString("en-US");
}
```
