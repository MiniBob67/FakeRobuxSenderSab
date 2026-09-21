let username = "";
let amount = "";

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const usernameInput = document.getElementById("username");
const amountInput = document.getElementById("amount");

const error = document.getElementById("error");

const reviewUsername = document.getElementById("reviewUsername");
const reviewAmount = document.getElementById("reviewAmount");

const successText = document.getElementById("successText");

const continueButton = document.getElementById("continueButton");
const confirmButton = document.getElementById("confirmButton");
const backButton = document.getElementById("backButton");
const doneButton = document.getElementById("doneButton");


function showStep(step) {
  step1.classList.remove("active");
  step2.classList.remove("active");
  step3.classList.remove("active");

  step.classList.add("active");
}


continueButton.addEventListener("click", function () {

  username = usernameInput.value.trim();
  amount = amountInput.value.trim();

  if (
    username === "" ||
    amount === "" ||
    Number(amount) <= 0
  ) {
    error.style.display = "block";
    return;
  }

  error.style.display = "none";

  reviewUsername.textContent = username;
  reviewAmount.textContent = "R$ " + amount;

  showStep(step2);
});


backButton.addEventListener("click", function () {
  showStep(step1);
});


confirmButton.addEventListener("click", function () {

  successText.textContent =
    `The simulated transfer of R$ ${amount} to ${username} has been completed.`;

  showStep(step3);
});


doneButton.addEventListener("click", function () {

  usernameInput.value = "";
  amountInput.value = "";

  username = "";
  amount = "";

  error.style.display = "none";

  showStep(step1);
});
