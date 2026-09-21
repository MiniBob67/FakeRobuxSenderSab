let username = "";
let amount = "";
let userId = "";
let avatarUrl = "";

let searchTimer = null;
let searchRequestId = 0;

const steps =
  document.querySelectorAll(".screen");

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


/* =========================================
   STEP CONTROL
========================================= */

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


/* =========================================
   USERNAME INPUT
========================================= */

usernameInput.addEventListener(
  "input",
  function () {

    const keyword =
      usernameInput.value.trim();

    clearTimeout(searchTimer);

    searchRequestId++;

    results.innerHTML = "";

    error.style.display =
      "none";

    continueButton.disabled =
      true;

    userId = "";
    username = "";
    avatarUrl = "";


    if (keyword.length === 0) {

      searchStatus.textContent =
        "";

      return;
    }


    if (keyword.length < 2) {

      searchStatus.textContent =
        "Type at least 2 characters.";

      return;
    }


    searchStatus.textContent =
      "Searching Roblox...";


    const requestId =
      searchRequestId;


    searchTimer =
      setTimeout(
        function () {

          searchRoblox(
            keyword,
            requestId
          );

        },
        350
      );

  }
);


/* =========================================
   SEARCH ROBLOX
========================================= */

async function searchRoblox(
  keyword,
  requestId
) {

  try {

    /*
      Exact username lookup
    */

    let exactUsers = [];

    try {

      const exactResponse =
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


      if (exactResponse.ok) {

        const exactData =
          await exactResponse.json();


        if (
          exactData.data &&
          Array.isArray(
            exactData.data
          )
        ) {

          exactUsers =
            exactData.data.map(
              user => ({
                id: user.id,
                name: user.name,
                displayName:
                  user.displayName
              })
            );

        }

      }

    } catch (exactError) {

      console.log(
        "Exact Roblox search unavailable:",
        exactError
      );

    }


    /*
      Normal keyword search
    */

    const searchUrl =
      "https://users.roblox.com/v1/users/search" +
      "?keyword=" +
      encodeURIComponent(keyword) +
      "&limit=10";


    const searchResponse =
      await fetch(searchUrl);


    if (!searchResponse.ok) {

      throw new Error(
        "Roblox search failed: " +
        searchResponse.status
      );

    }


    const searchData =
      await searchResponse.json();


    if (
      requestId !==
      searchRequestId
    ) {
      return;
    }


    let users = [];


    /*
      Exact result first
    */

    exactUsers.forEach(
      user => {

        if (
          !users.some(
            existing =>
              existing.id === user.id
          )
        ) {

          users.push(user);

        }

      }
    );


    /*
      Then normal search results
    */

    if (
      searchData.data &&
      Array.isArray(
        searchData.data
      )
    ) {

      searchData.data.forEach(
        user => {

          if (
            !users.some(
              existing =>
                existing.id === user.id
            )
          ) {

            users.push({
              id: user.id,
              name: user.name,
              displayName:
                user.displayName
            });

          }

        }
      );

    }


    /*
      Limit to 10
    */

    users =
      users.slice(0, 10);


    results.innerHTML =
      "";


    if (users.length === 0) {

      searchStatus.textContent =
        "No Roblox users found.";

      return;
    }


    searchStatus.textContent =
      "Select a Roblox user:";


    /*
      Load avatars
    */

    const ids =
      users
        .map(user => user.id)
        .join(",");


    const avatarResponse =
      await fetch(
        "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
        "?userIds=" +
        encodeURIComponent(ids) +
        "&size=150x150" +
        "&format=Png" +
        "&isCircular=false"
      );


    let avatarMap = {};


    if (avatarResponse.ok) {

      const avatarData =
        await avatarResponse.json();


      if (
        avatarData.data &&
        Array.isArray(
          avatarData.data
        )
      ) {

        avatarData.data.forEach(
          item => {

            avatarMap[
              item.targetId
            ] =
              item.imageUrl;

          }
        );

      }

    }


    if (
      requestId !==
      searchRequestId
    ) {
      return;
    }


    /*
      Create result cards
    */

    users.forEach(
      user => {

        createResultCard(
          user,
          avatarMap[user.id] || ""
        );

      }
    );

  } catch (err) {

    console.error(
      "Roblox search error:",
      err
    );


    if (
      requestId !==
      searchRequestId
    ) {
      return;
    }


    searchStatus.textContent =
      "";


    error.textContent =
      "Roblox search is currently unavailable.";


    error.style.display =
      "block";

  }

}


/* =========================================
   RESULT CARD
========================================= */

function createResultCard(
  user,
  avatar
) {

  const card =
    document.createElement("button");


  card.type =
    "button";


  card.className =
    "result-card";


  card.innerHTML = `
    <div class="result-avatar">
      <img
        src="${escapeAttribute(avatar)}"
        alt=""
      >
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


/* =========================================
   SAFE HTML
========================================= */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    String(text ?? "");

  return div.innerHTML;

}


/* =========================================
   SAFE ATTRIBUTE
========================================= */

function escapeAttribute(text) {

  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================================
   SELECT USER
========================================= */

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


  results.innerHTML =
    "";


  searchStatus.textContent =
    "Selected: " +
    username;

}


/* =========================================
   STEP 1 → STEP 2
========================================= */

continueButton.addEventListener(
  "click",
  function () {

    if (!userId) {
      return;
    }

    showStep("step2");

  }
);


/* =========================================
   STEP 2
========================================= */

document
  .getElementById("recipientContinue")
  .addEventListener(
    "click",
    function () {

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


/* =========================================
   AMOUNT
========================================= */

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


/* =========================================
   STEP 3 → STEP 4
========================================= */

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


/* =========================================
   BACK BUTTONS
========================================= */

document
  .getElementById("backToRecipient")
  .addEventListener(
    "click",
    function () {

      showStep("step2");

    }
  );


document
  .getElementById("backToAmount")
  .addEventListener(
    "click",
    function () {

      showStep("step3");

    }
  );


/* =========================================
   SEND
========================================= */

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


/* =========================================
   RESET
========================================= */

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
