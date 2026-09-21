let username = "";
let amount = "";
let userId = "";
let avatarUrl = "";

let searchTimer = null;
let searchRequestId = 0;

const steps = document.querySelectorAll(".screen");

const usernameInput =
  document.getElementById("username");

const results =
  document.getElementById("results");

const searchStatus =
  document.getElementById("searchStatus");

const error =
  document.getElementById("error");

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


/* =========================
   STEP CONTROL
========================= */

function showStep(id) {

  steps.forEach(step => {
    step.classList.remove("active");
  });

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }
}


/* =========================
   USERNAME INPUT
========================= */

usernameInput.addEventListener(
  "input",
  function () {

    const keyword =
      usernameInput.value.trim();

    clearTimeout(searchTimer);

    searchRequestId++;

    results.innerHTML = "";
    error.style.display = "none";

    continueButton.disabled = true;

    userId = "";
    username = "";
    avatarUrl = "";

    if (keyword.length === 0) {

      searchStatus.textContent = "";

      return;
    }

    if (keyword.length < 2) {

      searchStatus.textContent =
        "Type at least 2 characters.";

      return;
    }

    searchStatus.textContent =
      "Searching...";

    const currentRequest =
      searchRequestId;

    searchTimer = setTimeout(
      () => {
        searchUsers(
          keyword,
          currentRequest
        );
      },
      350
    );

  }
);


/* =========================
   SEARCH USERS
========================= */

async function searchUsers(
  keyword,
  currentRequest
) {

  try {

    /*
      FIRST:
      Exact username lookup.
      This uses Roblox's dedicated
      username endpoint.
    */

    const exactUser =
      await lookupExactUsername(keyword);

    /*
      Ignore old request results
      when the user typed something
      new while this request was running.
    */

    if (
      currentRequest !== searchRequestId
    ) {
      return;
    }


    /*
      SECOND:
      Normal search for similar names.
    */

    const searchUsersData =
      await searchSimilarUsers(keyword);


    if (
      currentRequest !== searchRequestId
    ) {
      return;
    }


    /*
      Combine exact result + normal results.
      Exact match always goes first.
    */

    const combined = [];

    const seenIds =
      new Set();


    if (exactUser) {

      combined.push(exactUser);

      seenIds.add(
        exactUser.id
      );

    }


    searchUsersData.forEach(user => {

      if (!seenIds.has(user.id)) {

        combined.push(user);

        seenIds.add(user.id);

      }

    });


    results.innerHTML = "";


    if (combined.length === 0) {

      searchStatus.textContent =
        "No users found.";

      return;
    }


    searchStatus.textContent =
      "Select a user:";


    /*
      Get avatars for all results.
    */

    const ids =
      combined
        .map(user => user.id)
        .join(",");


    const avatarMap =
      await getAvatars(ids);


    if (
      currentRequest !== searchRequestId
    ) {
      return;
    }


    combined.forEach(user => {

      const avatar =
        avatarMap[user.id] || "";

      createResultCard(
        user,
        avatar
      );

    });


  } catch (err) {

    console.error(
      "Roblox search error:",
      err
    );

    if (
      currentRequest !== searchRequestId
    ) {
      return;
    }

    searchStatus.textContent = "";

    error.textContent =
      "Could not search Roblox users.";

    error.style.display =
      "block";

  }

}


/* =========================
   EXACT USERNAME LOOKUP
========================= */

async function lookupExactUsername(
  keyword
) {

  try {

    const response =
      await fetch(
        "https://users.roblox.com/v1/usernames/users",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body: JSON.stringify({

            usernames: [
              keyword
            ],

            excludeBannedUsers:
              false

          })
        }
      );


    if (!response.ok) {

      console.warn(
        "Exact username lookup failed:",
        response.status
      );

      return null;
    }


    const data =
      await response.json();


    if (
      !data.data ||
      data.data.length === 0
    ) {
      return null;
    }


    /*
      Find exact requested username.
    */

    const exact =
      data.data.find(
        user =>
          user.requestedUsername
            ?.toLowerCase() ===
          keyword.toLowerCase()
      );


    return exact || null;

  } catch (err) {

    console.warn(
      "Exact username lookup error:",
      err
    );

    return null;

  }

}


/* =========================
   NORMAL SEARCH
========================= */

async function searchSimilarUsers(
  keyword
) {

  const url =
    "https://users.roblox.com/v1/users/search" +
    "?keyword=" +
    encodeURIComponent(keyword) +
    "&limit=10";


  const response =
    await fetch(url);


  if (!response.ok) {

    throw new Error(
      "Normal search failed"
    );

  }


  const data =
    await response.json();


  if (
    !data.data ||
    !Array.isArray(data.data)
  ) {
    return [];
  }


  return data.data;

}


/* =========================
   GET AVATARS
========================= */

async function getAvatars(ids) {

  const response =
    await fetch(
      "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
      "?userIds=" +
      encodeURIComponent(ids) +
      "&size=150x150" +
      "&format=Png" +
      "&isCircular=false"
    );


  if (!response.ok) {

    return {};

  }


  const data =
    await response.json();


  const avatarMap = {};


  if (
    data.data &&
    Array.isArray(data.data)
  ) {

    data.data.forEach(item => {

      avatarMap[item.targetId] =
        item.imageUrl;

    });

  }


  return avatarMap;

}


/* =========================
   RESULT CARD
========================= */

function createResultCard(
  user,
  avatar
) {

  const card =
    document.createElement("button");

  card.className =
    "result-card";


  card.type =
    "button";


  card.innerHTML = `
    <div class="result-avatar">
      <img src="${escapeAttribute(avatar)}" alt="">
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


  card.addEventListener(
    "click",
    function () {

      selectUser(
        user,
        avatar
      );

    }
  );


  results.appendChild(card);

}


/* =========================
   SAFE TEXT
========================= */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text ?? "");

  return div.innerHTML;

}


/* =========================
   SAFE ATTRIBUTE
========================= */

function escapeAttribute(text) {

  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================
   SELECT USER
========================= */

function selectUser(
  user,
  avatar
) {

  userId =
    user.id;

  username =
    user.name;

  avatarUrl =
    avatar;


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


/* =========================
   STEP 1 → STEP 2
========================= */

continueButton.addEventListener(
  "click",
  function () {

    if (!userId) {
      return;
    }

    showStep("step2");

  }
);


/* =========================
   STEP 2
========================= */

document
  .getElementById("recipientContinue")
  .addEventListener(
    "click",
    function () {

      if (!userId) {
        return;
      }

      showStep("step3");

    }
  );


document
  .getElementById("backToSearch")
  .addEventListener(
    "click",
    function () {

      showStep("step1");

    }
  );


/* =========================
   STEP 3 — AMOUNT
========================= */

amountOptions.forEach(
  option => {

    option.addEventListener(
      "click",
      function () {

        amountOptions.forEach(
          button => {

            button.classList.remove(
              "selected"
            );

          }
        );


        option.classList.add(
          "selected"
        );


        amount =
          option.dataset.amount;


        selectedAmount.textContent =
          "Selected: R$ " +
          Number(amount)
            .toLocaleString("en-US");


        reviewButton.disabled =
          false;

      }
    );

  }
);


/* =========================
   STEP 3 → STEP 4
========================= */

reviewButton.addEventListener(
  "click",
  function () {

    if (!amount) {
      return;
    }


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


    showStep("step4");

  }
);


/* =========================
   BACK TO RECIPIENT
========================= */

document
  .getElementById("backToRecipient")
  .addEventListener(
    "click",
    function () {

      showStep("step2");

    }
  );


/* =========================
   BACK TO AMOUNT
========================= */

document
  .getElementById("backToAmount")
  .addEventListener(
    "click",
    function () {

      showStep("step3");

    }
  );


/* =========================
   SEND
========================= */

document
  .getElementById("confirmButton")
  .addEventListener(
    "click",
    function () {

      if (
        !username ||
        !amount
      ) {
        return;
      }


      showStep("step5");


      setTimeout(
        function () {

          successText.textContent =
            "The fictional transfer of R$ " +
            Number(amount)
              .toLocaleString("en-US") +
            " to " +
            username +
            " has been completed.";


          showStep("step6");

        },
        3000
      );

    }
  );


/* =========================
   RESET
========================= */

document
  .getElementById("doneButton")
  .addEventListener(
    "click",
    function () {

      username = "";
      amount = "";
      userId = "";
      avatarUrl = "";


      usernameInput.value =
        "";


      results.innerHTML =
        "";


      searchStatus.textContent =
        "";


      error.style.display =
        "none";


      continueButton.disabled =
        true;


      selectedUsername.textContent =
        "Username";


      selectedAvatar.src =
        "";


      amountUsername.textContent =
        "Username";


      amountAvatar.src =
        "";


      reviewUsername.textContent =
        "Username";


      reviewRecipient.textContent =
        "";


      reviewAmount.textContent =
        "";


      reviewAvatar.src =
        "";


      amountOptions.forEach(
        option => {

          option.classList.remove(
            "selected"
          );

        }
      );


      selectedAmount.textContent =
        "Select an amount";


      reviewButton.disabled =
        true;


      showStep("step1");

    }
  );
