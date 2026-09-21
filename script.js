let username = "";
let amount = "";

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");
const step5 = document.getElementById("step5");

const usernameInput = document.getElementById("username");
const error = document.getElementById("error");

const foundUsername = document.getElementById("foundUsername");
const amountUsername = document.getElementById("amountUsername");

const reviewUsername = document.getElementById("reviewUsername");
const reviewRecipient = document.getElementById("reviewRecipient");
const reviewAmount = document.getElementById("reviewAmount");

const successText = document.getElementById("successText");

const userCard = document.getElementById("userCard");
const amountOptions = document.querySelectorAll(".amount-option");

const selectedAmount = document.getElementById("selectedAmount");
const reviewButton = document.getElementById("reviewButton");


function showStep(step) {

  document.querySelectorAll(".step").forEach(section => {
    section.classList.remove("active");
  });

  step.classList.add("active");
}


/* STEP 1 */

document.getElementById("findButton").addEventListener("click", function () {

  username = usernameInput.value.trim();

  if (username === "") {
    error.style.display = "block";
    return;
  }

  error.style.display = "none";

  foundUsername.textContent = username;

  userCard.classList.remove("selected");

  showStep(step2);
});


/* SELECT USER */

userCard.addEventListener("click", function () {

  userCard.classList.toggle("selected");

});


document.getElementById("selectButton").addEventListener("click", function () {

  if (!userCard.classList.contains("selected")) {

    userCard.classList.add("selected");

  }

  amountUsername.textContent = username;

  showStep(step3);
});


/* AMOUNT */

amountOptions.forEach(option => {

  option.addEventListener("click", function () {

    amountOptions.forEach(button => {
      button.classList.remove("selected");
    });

    option.classList.add("selected");

    amount = option.dataset.amount;

    const formatted =
      Number(amount).toLocaleString("en-US");

    selectedAmount.textContent =
      "Selected: R$ " + formatted;

    reviewButton.disabled = false;

  });

});


/* REVIEW */

reviewButton.addEventListener("click", function () {

  reviewUsername.textContent = username;
  reviewRecipient.textContent = username;

  reviewAmount.textContent =
    "R$ " + Number(amount).toLocaleString("en-US");

  showStep(step4);

});


/* BACK */

document.getElementById("backToUsername").addEventListener("click", function () {
  showStep(step1);
});


document.getElementById("backToUser").addEventListener("click", function () {
  showStep(step2);
});


document.getElementById("backToAmount").addEventListener("click", function () {
  showStep(step3);
});


/* COMPLETE */

document.getElementById("confirmButton").addEventListener("click", function () {

  successText.textContent =
    `The simulated transfer of R$ ${Number(amount).toLocaleString("en-US")} to ${username} has been completed.`;

  showStep(step5);

});


/* RESET */

document.getElementById("doneButton").addEventListener("click", function () {

  username = "";
  amount = "";

  usernameInput.value = "";

  userCard.classList.remove("selected");

  amountOptions.forEach(option => {
    option.classList.remove("selected");
  });

  selectedAmount.textContent = "Select an amount";

  reviewButton.disabled = true;

  showStep(step1);

});
