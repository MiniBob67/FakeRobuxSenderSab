let username = "";
let amount = "";
let userId = "";
let avatarUrl = "";

const steps = document.querySelectorAll(".step");

const usernameInput = document.getElementById("username");
const error = document.getElementById("error");

const userCard = document.getElementById("userCard");
const foundUsername = document.getElementById("foundUsername");

const userAvatar = document.getElementById("userAvatar");
const amountAvatar = document.getElementById("amountAvatar");
const reviewAvatar = document.getElementById("reviewAvatar");

const amountUsername = document.getElementById("amountUsername");

const reviewUsername = document.getElementById("reviewUsername");
const reviewRecipient = document.getElementById("reviewRecipient");
const reviewAmount = document.getElementById("reviewAmount");

const successText = document.getElementById("successText");

const amountOptions = document.querySelectorAll(".amount-option");
const selectedAmount = document.getElementById("selectedAmount");
const reviewButton = document.getElementById("reviewButton");


function showStep(step) {

  steps.forEach(section => {
    section.classList.remove("active");
  });

  step.classList.add("active");
}


/* FIND ROBLOX USER */

document.getElementById("findButton").addEventListener("click", async function () {

  username = usernameInput.value.trim();

  if (username === "") {

    error.textContent = "Enter a username.";
    error.style.display = "block";

    return;
  }

  error.style.display = "none";

  const button = document.getElementById("findButton");

  button.disabled = true;
  button.textContent = "Searching...";

  try {

    const response = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false
        })
      }
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {

      error.textContent = "User not found.";
      error.style.display = "block";

      button.disabled = false;
      button.textContent = "Continue";

      return;
    }

    const user = data.data[0];

    userId = user.id;
    username = user.name;


    /* GET AVATAR */

    const avatarResponse = await fetch(
      "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" +
      userId +
      "&size=150x150&format=Png&isCircular=false"
    );

    const avatarData = await avatarResponse.json();

    if (
      avatarData.data &&
      avatarData.data.length > 0 &&
      avatarData.data[0].imageUrl
    ) {

      avatarUrl = avatarData.data[0].imageUrl;

      userAvatar.src = avatarUrl;
      amountAvatar.src = avatarUrl;
      reviewAvatar.src = avatarUrl;
    }


    foundUsername.textContent = username;

    userCard.classList.remove("selected");

    showStep(document.getElementById("step2"));

  } catch (err) {

    error.textContent =
      "Could not find the Roblox account.";

    error.style.display = "block";
  }

  button.disabled = false;
  button.textContent = "Continue";

});


/* SELECT USER */

userCard.addEventListener("click", function () {

  userCard.classList.toggle("selected");

});


document.getElementById("selectButton").addEventListener("click", function () {

  userCard.classList.add("selected");

  amountUsername.textContent = username;

  showStep(document.getElementById("step3"));

});


/* AMOUNT */

amountOptions.forEach(option => {

  option.addEventListener("click", function () {

    amountOptions.forEach(button => {
      button.classList.remove("selected");
    });

    option.classList.add("selected");

    amount = option.dataset.amount;

    selectedAmount.textContent =
      "Selected: R$ " +
      Number(amount).toLocaleString("en-US");

    reviewButton.disabled = false;

  });

});


/* REVIEW */

reviewButton.addEventListener("click", function () {

  reviewUsername.textContent = username;

  reviewRecipient.textContent = username;

  reviewAmount.textContent =
    "R$ " +
    Number(amount).toLocaleString("en-US");

  showStep(document.getElementById("step4"));

});


/* BACK */

document.getElementById("backToUsername").addEventListener("click", function () {

  showStep(document.getElementById("step1"));

});


document.getElementById("backToUser").addEventListener("click", function () {

  showStep(document.getElementById("step2"));

});


document.getElementById("backToAmount").addEventListener("click", function () {

  showStep(document.getElementById("step3"));

});


/* SEND */

document.getElementById("confirmButton").addEventListener("click", function () {

  showStep(document.getElementById("step5"));

  setTimeout(function () {

    successText.textContent =
      "The simulated transfer of R$ " +
      Number(amount).toLocaleString("en-US") +
      " to " +
      username +
      " has been completed.";

    showStep(document.getElementById("step6"));

  }, 3000);

});


/* RESET */

document.getElementById("doneButton").addEventListener("click", function () {

  username = "";
  amount = "";
  userId = "";
  avatarUrl = "";

  usernameInput.value = "";

  userCard.classList.remove("selected");

  amountOptions.forEach(option => {
    option.classList.remove("selected");
  });

  selectedAmount.textContent =
    "Select an amount";

  reviewButton.disabled = true;

  userAvatar.src = "";
  amountAvatar.src = "";
  reviewAvatar.src = "";

  showStep(document.getElementById("step1"));

});
