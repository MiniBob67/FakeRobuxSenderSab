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
   DEBUG MESSAGE
========================================= */

function showDebug(message) {

  console.log(
    "[Roblox Search]",
    message
  );

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
      "Searching Roblox...";


    const currentRequest =
      searchRequestId;


    searchTimer =
      setTimeout(
        function () {

          searchRoblox(
            keyword,
            currentRequest
          );

        },
        400
      );

  }
);


/* =========================================
   ROBLOX SEARCH
========================================= */

async function searchRoblox(
  keyword,
  currentRequest
) {

  showDebug(
    "Starting search for: " +
    keyword
  );


  try {

    /*
    ========================================
    1. EXACT USERNAME SEARCH
    ========================================
    */

    let exactUsers = [];


    try {

      showDebug(
        "Trying exact username endpoint..."
      );


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


      showDebug(
        "Exact endpoint status: " +
        exactResponse.status
      );


      if (
        exactResponse.ok
      ) {

        const exactData =
          await exactResponse.json();


        console.log(
          "[Roblox Search] Exact response:",
          exactData
        );


        if (
          exactData.data &&
          Array.isArray(
            exactData.data
          )
        ) {

          exactUsers =
            exactData.data.map(
              user => ({

                id:
                  user.id,

                name:
                  user.name,

                displayName:
                  user.displayName,

                requestedUsername:
                  user.requestedUsername

              })
            );

        }

      }

    } catch (exactError) {

      console.error(
        "[Roblox Search] Exact endpoint error:",
        exactError
      );

    }


    /*
    ========================================
    2. NORMAL SEARCH
    ========================================
    */

    let normalUsers = [];


    try {

      showDebug(
        "Trying normal search endpoint..."
      );


      const normalResponse =
        await fetch(
          "https://users.roblox.com/v1/users/search" +
          "?keyword=" +
          encodeURIComponent(keyword) +
          "&limit=10"
        );


      showDebug(
        "Normal endpoint status: " +
        normalResponse.status
      );


      if (
        normalResponse.ok
      ) {

        const normalData =
          await normalResponse.json();


        console.log(
          "[Roblox Search] Normal response:",
          normalData
        );


        if (
          normalData.data &&
          Array.isArray(
            normalData.data
          )
        ) {

          normalUsers =
            normalData.data.map(
              user => ({

                id:
                  user.id,

                name:
                  user.name,

                displayName:
                  user.displayName

              })
            );

        }

      }

    } catch (normalError) {

      console.error(
        "[Roblox Search] Normal endpoint error:",
        normalError
      );

    }


    /*
    ========================================
    CHECK REQUEST
    ========================================
    */

    if (
      currentRequest !==
      searchRequestId
    ) {

      showDebug(
        "Ignoring old search request."
      );

      return;

    }


    /*
    ========================================
    COMBINE RESULTS
    ========================================
    */

    const combinedUsers = [];
    const seenIds = new Set();


    exactUsers.forEach(
      user => {

        if (
          !seenIds.has(user.id)
        ) {

          seenIds.add(user.id);

          combinedUsers.push(user);

        }

      }
    );


    normalUsers.forEach(
      user => {

        if (
          !seenIds.has(user.id)
        ) {

          seenIds.add(user.id);

          combinedUsers.push(user);

        }

      }
    );


    /*
    ========================================
    NO RESULTS
    ========================================
    */

    if (
      combinedUsers.length === 0
    ) {

      showDebug(
        "Roblox returned zero users."
      );


      searchStatus.textContent =
        "No Roblox users found.";


      error.innerHTML = `
        <div>
          Roblox returned no matching accounts.
        </div>

        <div
          style="
            margin-top:6px;
            font-size:11px;
            color:#71717a;
          "
        >
          Open the browser console with F12
          for search diagnostics.
        </div>
      `;


      error.style.display =
        "block";


      return;

    }


    /*
    ========================================
    LIMIT
    ========================================
    */

    const users =
      combinedUsers.slice(0, 10);


    /*
    ========================================
    STATUS
    ========================================
    */

    searchStatus.textContent =
      "Select a Roblox user:";


    /*
    ========================================
    AVATARS
    ========================================
    */

    const ids =
      users
        .map(user => user.id)
        .join(",");


    let avatarMap = {};


    try {

      showDebug(
        "Loading avatars..."
      );


      const avatarResponse =
        await fetch(
          "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
          "?userIds=" +
          encodeURIComponent(ids) +
          "&size=150x150" +
          "&format=Png" +
          "&isCircular=false"
        );


      showDebug(
        "Avatar endpoint status: " +
        avatarResponse.status
      );


      if (
        avatarResponse.ok
      ) {

        const avatarData =
          await avatarResponse.json();


        console.log(
          "[Roblox Search] Avatar response:",
          avatarData
        );


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

    } catch (avatarError) {

      console.error(
        "[Roblox Search] Avatar error:",
        avatarError
      );

    }


    /*
    ========================================
    CREATE RESULT CARDS
    ========================================
    */

    results.innerHTML = "";


    users.forEach(
      user => {

        createResultCard(
          user,
          avatarMap[user.id] || ""
        );

      }
    );


    showDebug(
      "Displayed " +
      users.length +
      " Roblox result(s)."
    );


  } catch (err) {

    console.error(
      "[Roblox Search] FATAL ERROR:",
      err
    );


    if (
      currentRequest !==
      searchRequestId
    ) {

      return;

    }


    searchStatus.textContent =
      "";


    error.innerHTML = `
      <div>
        Roblox search could not be completed.
      </div>

      <div
        style="
          margin-top:6px;
          font-size:11px;
          color:#71717a;
        "
      >
        Press F12 and open Console
        to see the exact error.
      </div>
    `;


    error.style.display =
      "block";

  }

}


/* =========================================
   CREATE RESULT CARD
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

      ${
        avatar
          ? `
            <img
              src="${escapeAttribute(avatar)}"
              alt=""
            >
          `
          : `
            <div
              style="
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#71717a;
                font-size:12px;
              "
            >
              ?
            </div>
          `
      }

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


  results.appendChild(
    card
  );

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
    avatar || "";


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


  error.style.display =
    "none";

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(text ?? "");


  return div.innerHTML;

}


/* =========================================
   ESCAPE ATTRIBUTE
========================================= */

function escapeAttribute(
  text
) {

  return String(
    text ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    );

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


    showStep(
      "step2"
    );

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

      if (!userId) {
        return;
      }


      showStep(
        "step3"
      );

    }
  );


document
  .getElementById("backToSearch")
  .addEventListener(
    "click",
    function () {

      showStep(
        "step1"
      );

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
          Number(
            amount
          ).toLocaleString(
            "en-US"
          );


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
      Number(
        amount
      ).toLocaleString(
        "en-US"
      );


    reviewAvatar.src =
      avatarUrl;


    showStep(
      "step4"
    );

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

      showStep(
        "step2"
      );

    }
  );


document
  .getElementById("backToAmount")
  .addEventListener(
    "click",
    function () {

      showStep(
        "step3"
      );

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


      showStep(
        "step5"
      );


      setTimeout(
        function () {

          successText.textContent =
            "The fictional transfer of R$ " +
            Number(
              amount
            ).toLocaleString(
              "en-US"
            ) +
            " to " +
            username +
            " has been completed.";


          showStep(
            "step6"
          );

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


      showStep(
        "step1"
      );

    }
  );
