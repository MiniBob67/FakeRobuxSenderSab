let username = "";
let amount = "";
let userId = "";
let avatarUrl = "";

let searchTimer = null;

const steps = document.querySelectorAll(".step");

const usernameInput = document.getElementById("username");
const results = document.getElementById("results");
const searchStatus = document.getElementById("searchStatus");
const error = document.getElementById("error");

const continueButton =
  document.getElementById("continueButton");

const selectedUsername =
  document.getElementById("selectedUsername");

const selectedAvatar =
  document.getElementById("selectedAvatar");

const amountUsername =
  document.getElementById("amountUsername");

const amountAvatar =
  document.getElementById("amountAvatar");

const reviewUsername =
  document.getElementById("reviewUsername");

const reviewRecipient =
  document.getElementById("reviewRecipient");

const reviewAmount =
  document.getElementById("reviewAmount");

const reviewAvatar =
  document.getElementById("reviewAvatar");

const selectedAmount =
  document.getElementById("selectedAmount");

const reviewButton =
  document.getElementById("reviewButton");

const successText =
  document.getElementById("successText");

const amountOptions =
  document.querySelectorAll(".amount-option");


function showStep(step) {

  steps.forEach(section => {
    section.classList.remove("active");
  });

  step.classList.add("active");
}


/* SEARCH ROBLOX USERS */

usernameInput.addEventListener("input", function () {

  const keyword = usernameInput.value.trim();

  clearTimeout(searchTimer);

  results.innerHTML = "";
  error.style.display = "none";

  continueButton.disabled = true;

  if (keyword.length < 2) {

    searchStatus.textContent =
      "Type at least 2 characters.";

    return;
  }

  searchStatus.textContent =
    "Searching...";

  searchTimer = setTimeout(() => {

    searchUsers(keyword);

  }, 350);

});


async function searchUsers(keyword) {

  try {

    const url =
      "https://users.roblox.com/v1/users/search" +
      "?keyword=" +
      encodeURIComponent(keyword) +
      "&limit=10";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    results.innerHTML = "";

    if (!data.data || data.data.length === 0) {

      searchStatus.textContent =
        "No users found.";

      return;
    }

    searchStatus.textContent =
      "Select a user:";

    const ids = data.data
      .map(user => user.id)
      .join(",");

    const avatarResponse = await fetch(
      "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
      "?userIds=" +
      ids +
      "&size=150x150&format=Png&isCircular=false"
    );

    const avatarData =
      await avatarResponse.json();

    const avatarMap = {};

    if (avatarData.data) {

      avatarData.data.forEach(item => {
        avatarMap[item.targetId] =
          item.imageUrl;
      });

    }


    data.data.forEach(user => {

      const card =
        document.createElement("button");

      card.className =
        "result-card";

      const avatar =
        avatarMap[user.id] || "";

      card.innerHTML = `
        <div class="result-avatar">
          <img src="${avatar}" alt="Avatar">
        </div>

        <div class="result-info">

          <div class="result-username">
            ${escapeHtml(user.name)}
          </div>

          <div class="result-id">
            User ID: ${user.id}
          </div>

        </div>
      `;


      card.addEventListener("click", function () {

        selectUser(
          user,
          avatar
        );

      });

      results.appendChild(card);

    });

  } catch (err) {

    searchStatus.textContent = "";

    error.textContent =
      "Could not search Roblox users.";

    error.style.display = "block";

  }

}


/* PROTECT TEXT INSERTION */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


/* SELECT USER */

function selectUser(user, avatar) {

  userId = user.id;

  username = user.name;

  avatarUrl = avatar;

  selectedUsername.textContent =
    username;

  selectedAvatar.src =
    avatarUrl;

  amountUsername.textContent =
    username;

  amountAvatar.src =
    avatarUrl;

  reviewUsername.textContent =
    username;

  reviewRecipient.textContent =
    username;

  reviewAvatar.src =
    avatarUrl;

  continueButton.disabled =
    false;

  results.innerHTML = "";

  searchStatus.textContent =
    "Selected: " + username;

}


/* CONTINUE TO RECIPIENT */

continueButton.addEventListener("click", function () {

  if (!userId) {
    return;
  }

  showStep(
    document.getElementById("step2")
  );

});


/* RECIPIENT CONTINUE */

document
  .getElementById("recipientContinue")
  .addEventListener("click", function () {

    showStep(
      document.getElementById("step3")
    );

  });


/* BACK TO SEARCH */

document
  .getElementById("backToSearch")
  .addEventListener("click", function () {

    showStep(
      document.getElementById("step1")
    );

  });


/* AMOUNT */

amountOptions.forEach(option => {

  option.addEventListener("click", function () {

    amountOptions.forEach(button => {
      button.classList.remove("selected");
    });

    option.classList.add("selected");

    amount =
      option.dataset.amount;

    selectedAmount.textContent =
      "Selected: R$ " +
      Number(amount)
        .toLocaleString("en-US");

    reviewButton.disabled =
      false;

  });

});


/* REVIEW */

reviewButton.addEventListener("click", function () {

  reviewUsername.textContent =
    username;

  reviewRecipient.textContent =
    username;

  reviewAmount.textContent =
    "R$ " +
    Number(amount)
      .toLocaleString("en-US");

  reviewAvatar.src =
    avatarUrl;

  showStep(
    document.getElementById("step4")
  );

});


/* BACK TO RECIPIENT */

document
  .getElementById("backToRecipient")
  .addEventListener("click", function () {

    showStep(
      document.getElementById("step2")
    );

  });


/* BACK TO AMOUNT */

document
  .getElementById("backToAmount")
  .addEventListener("click", function () {

    showStep(
      document.getElementById("step3")
    );

  });


/* SEND */

document
  .getElementById("confirmButton")
  .addEventListener("click", function () {

    showStep(
      document.getElementById("step5")
    );

    setTimeout(function () {

      successText.textContent =
        "The simulated transfer of R$ " +
        Number(amount)
          .toLocaleString("en-US") +
        " to " +
        username +
        " has been completed.";

      showStep(
        document.getElementById("step6")
      );

    }, 3000);

  });


/* RESET */

document
  .getElementById("doneButton")
  .addEventListener("click", function () {

    username = "";
    amount = "";
    userId = "";
    avatarUrl = "";

    usernameInput.value = "";

    results.innerHTML = "";

    searchStatus.textContent = "";

    error.style.display = "none";

    continueButton.disabled =
      true;

    selectedUsername.textContent =
      "Username";

    selectedAvatar.src = "";

    amountUsername.textContent =
      "Username";

    amountAvatar.src = "";

    reviewUsername.textContent =
      "Username";

    reviewRecipient.textContent =
      "";

    reviewAmount.textContent =
      "";

    reviewAvatar.src = "";

    amountOptions.forEach(option => {
      option.classList.remove("selected");
    });

    selectedAmount.textContent =
      "Select an amount";

    reviewButton.disabled =
      true;

    showStep(
      document.getElementById("step1")
    );

  });
