// get all input fields
let comapanyName = $("#clientCompanyName");
let username = $("#username");
let phone = $("#phone");
let startDate = $("#startDate");
let endDate = $("#endDate");
let email = $("#email");
let domainNames = $("#domainNames");
let domainContainer = $(".domain-container");

//  radio btns
let genderMale = $("#male");
let genderFemale = $("#female");

// checkboxes
let checkBoxes = $(".check-box");

// get all btns
let addDomainBtn = $("#addDomainBtn");
let saveBtn = $("#saveBtn");
let backBtn = $("#backBtn");
let confirmBtn = $("#confirmBtn");

// error messages
let errorMessages = $(".error-message");

// intl input code
const input = document.querySelector("#phone");
const button = document.querySelector("#btn");
const errorMsg = document.querySelector("#error-msg");
const validMsg = document.querySelector("#valid-msg");

let popup = $("#popup");

// initializing arrays for domain and services
// same for flags to check valid and invalid domains
let validDomainsList = [];
let inValidDomainList = [];
let DuplicateDomainList = [];

// array to preserve invalid and duplicate domains ordering
let inValidDuplicateDomainList = [];
let servicesList = [];
let isInvalidDomain = false;
let isDuplicateDomain = false;

// #region intl input

const errorMap = [
  "Invalid number",
  "Invalid country code",
  "Too short",
  "Too long",
  "Invalid number",
];

const iti = window.intlTelInput(input, {
  separateDialCode: true,
  initialCountry: "in",
  nationalMode: true,
  utilsScript: "./intlTelInputWithUtils.min.js",
});

const reset = () => {
  input.classList.remove("input-validation-error");
  errorMsg.innerHTML = "";
  errorMsg.classList.add("d-none");
  validMsg.classList.add("d-none");
};

const showError2 = (msg) => {
  input.classList.add("input-validation-error");
  errorMsg.innerHTML = msg;
  errorMsg.classList.remove("d-none");
};

// on keyup / change flag: reset
input.addEventListener("change", reset);
input.addEventListener("keyup", reset);

//  #endregion

// setting start and end date's min to current date
let currentDate = new Date();
startDate.attr("min", currentDate.toISOString().split("T")[0]);
endDate.attr("min", currentDate.toISOString().split("T")[0]);

// input validations functions
let pattern;
// check company name is correct
function isCompanyNameCorrect(e) {
  // remove error class
  removeErrorClass(comapanyName, errorMessages.eq(0));

  return commonValidationWithRegex(
    comapanyName,
    /^[a-zA-Z\s]+$/,
    "Invalid client company name. Only letters and spaces are allowed"
  );

  // return true;
}
// check username is correct
function isUsernameCorrect(e) {
  removeErrorClass(username, errorMessages.eq(1));
  return commonValidationWithRegex(
    username,
    /^[^\s]+$/,
    "Invalid username: Spaces are not allowed."
  );
}
// itl phone checking
function isPhoneCorrect(e) {
  reset();
  if (!input.value.trim()) {
    showError2("Phone number is required");
    return false;
  } else if (iti.isValidNumber()) {
    pattern = /^\+91[6-9][0-9]{9}$/;
    if (!pattern.test(iti.getNumber())) {
      showError2("Phone number should start with 9,8,7,6");

      return false;
    } else {
      validMsg.classList.remove("d-none");
      return true;
    }
  } else {
    const errorCode = iti.getValidationError();
    const msg = errorMap[errorCode] || "Invalid number";
    showError2(msg);
    return false;
  }
}

// check contract start date is correct
function isStartDateCorrect(e) {
  removeErrorClass(startDate, errorMessages.eq(3));
  if (!commonValidation(startDate)) return false;

  // startDate >= endDate
  if (!(startDate.val() >= currentDate.toISOString().split("T")[0])) {
    startDate.val("");
    showError(
      startDate,
      errorMessages.eq(3),
      "Start date must be on or after today."
    );
    endDate.prop("disabled", true);
    return false;
  }
  // if start date is correct then set endDate  disabled to false
  endDate.prop("disabled", false);
  return true;
}

// check end date is correct
function isEndDateCorrect(e) {
  removeErrorClass(endDate, errorMessages.eq(4));

  if (!commonValidation(endDate)) return false;
  // check if enddate is > start date if not then clear enddate value
  if (!(endDate.val() > startDate.val())) {
    endDate.val("");
    showError(
      endDate,
      errorMessages.eq(4),
      "End date should be greater then start date"
    );
    return false;
  }

  return true;
}
// check email pattern is correct
function isEmailCorrect(e) {
  removeErrorClass(email, errorMessages.eq(5));
  return commonValidationWithRegex(
    email,
    /^[0-9a-zA-Z][a-zA-Z0-9\._-]*@[0-9a-zA-Z]+\.[a-zA-Z]{2,3}$/,
    "Email is invalid"
  );
}

// check gender is selected or not
function isGenderCorrect(e) {
  $("#genderErrorMessage").addClass("d-none");

  // check if male radio btn is checked or female is checked
  if (genderMale.prop("checked")) {
    return true;
  } else if (genderFemale.prop("checked")) {
    return true;
  } else {
    $("#genderErrorMessage").text("Gender is required").removeClass("d-none");
    return false;
  }
}

// check atleast one service is selected or not if selected then filter them out
function isServicesCorrect(e) {
  errorMessages.eq(8).addClass("d-none");

  // filter out selected services in array
  servicesList = checkBoxes
    .filter((idx, elm, arr) => {
      if ($(elm).prop("checked")) {
        return elm;
      }
    })
    .map((idx, elm) => {
      return $(elm).val();
    })
    .get();

  // atleast one service is required
  if (servicesList.length == 0) {
    errorMessages.eq(8).text("Select atleast one service to continue");
    errorMessages.eq(8).removeClass("d-none");
    return false;
  }

  return true;
}

// check if domain is present in input or not
function isDomainCorrect(e) {
  if (domainNames.val() == "") {
    removeErrorClass(domainNames, errorMessages.eq(6));
    isInvalidDomain = false;
    isDuplicateDomain = false;
  }
  if (validDomainsList.length == 0) {
    removeErrorClass(domainNames, errorMessages.eq(6));
    showError(domainNames, errorMessages.eq(6), "Domain name is required");
    return false;
  }

  // check flags and based on it return
  if (isInvalidDomain && isDuplicateDomain) {
    return false;
  } else if (isInvalidDomain) {
    return false;
  } else if (isDuplicateDomain) {
    return false;
  }

  return true;
}

// segregate valid and invalid domains
function segregateDomains(domains) {
  isInvalidDomain = false;
  isDuplicateDomain = false;
  if (domains.length != 0) {
    domains.forEach((domain) => {
      domain = domain.trim();
      pattern = /^[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
      if (pattern.test(domain)) {
        if (validDomainsList.includes(domain)) {
          DuplicateDomainList.push(domain);
          inValidDuplicateDomainList.push(domain);
          isDuplicateDomain = true;
        } else {
          validDomainsList.push(domain);
        }
      } else {
        inValidDomainList.push(domain);
        inValidDuplicateDomainList.push(domain);
        isInvalidDomain = true;
      }
    });
  }
}

// insert valid domains to domain container
function addValidDomains() {
  domainContainer.html("");
  validDomainsList.forEach((val, idx, arr) => {
    let elem = `<div class="small p-1 rounded text-white bg-primary" id="${val}">${val}
    <button class="btn btn-secondary p-1 btn-sm remove-domain">remove</button>
</div>`;
    domainContainer.append(elem);
  });
}

// remove domain from valid domains
function removeDomain() {
  validDomainsList.splice(
    validDomainsList.findIndex((elm) => {
      return elm == $(this).parent().attr("id");
    }),
    1
  );

  if (validDomainsList.length == 0) {
    showError(domainNames, errorMessages.eq(6), "Domain name is required");
  }

  $(this).parent().remove();
}

// get domains then segragate it then add valid domain to container
function addDomainsToContainer() {
  removeErrorClass(domainNames, errorMessages.eq(6));
  if (domainNames.val() == "") {
    showError(domainNames, errorMessages.eq(6), "Domain name is required");
    domainNames.focus();
    return false;
  }
  let inputDomains = domainNames.val().split(",");
  segregateDomains(inputDomains);
  addValidDomains();
  //   set input val to invalid and duplicates if present
  if (inValidDomainList.length > 0 || DuplicateDomainList.length > 0) {
    domainNames.val("");
    // let arr = [...inValidDomainList, ...DuplicateDomainList];
    // domainNames.val(arr.join(" , "));
    domainNames.val(inValidDuplicateDomainList.join(" , "));
    domainNames.focus();
    showErrorOnInvalidOrDuplicateDomain();
    inValidDomainList = [];
    DuplicateDomainList = [];
    inValidDuplicateDomainList = [];
  } else {
    domainNames.val("");
  }
}

// shows error message based on invalid or duplicate domains
function showErrorOnInvalidOrDuplicateDomain() {
  let invalidMsg = "";
  let duplicateMsg = "";

  inValidDomainList.forEach((val, idx) => {
    invalidMsg += `<li>${val}, </li>`;
  });
  DuplicateDomainList.forEach((val, idx) => {
    duplicateMsg += `<li>${val}, </li>`;
  });

  // display invalid and duplicate domains
  if (isInvalidDomain && isDuplicateDomain) {
    showError(
      domainNames,
      errorMessages.eq(6),
      `Invalid and duplicate domains found <br> Invalid domains: <ul>${invalidMsg}</ul> Duplicate domains: <ul>${duplicateMsg}</ul>`
    );
    invalidMsg = "Invalid domains: <br>";
    duplicateMsg = "Duplicate domains: <br>";
  } else if (isInvalidDomain) {
    showError(domainNames, errorMessages.eq(6), "Invalid domains");
  } else if (isDuplicateDomain) {
    showError(domainNames, errorMessages.eq(6), "Duplicate domains");
  }
}

// inserting all valid data to popup
function loadAllDataToPopup(dataObj) {
  $("#popup-data-container").empty();
  for (let k in dataObj) {
    $("#popup-data-container").append(`<p><b>${k}: </b><br> ${dataObj[k]}</p>`);
  }
}

// event on dynamic element
domainContainer.on("click", ".remove-domain", removeDomain);

// on blur event on inputs
comapanyName.on("blur", isCompanyNameCorrect);
username.on("blur", isUsernameCorrect);
phone.on("blur", isPhoneCorrect);
startDate.on("blur", isStartDateCorrect);
endDate.on("blur", isEndDateCorrect);
email.on("blur", isEmailCorrect);
domainNames.on("blur", isDomainCorrect);

// setting start and end date based on input
startDate.on("input", (e) => {
  if (startDate.val() != "") {
    let data = new Date(startDate.val());
    data.setDate(data.getDate() + 1);
    endDate.attr("min", data.toISOString().split("T")[0]);
    endDate.prop("disabled", false);
  } else {
    endDate.attr("min", currentDate.toISOString().split("T")[0]);
    endDate.val("");
    startDate.attr("max", "");
    endDate.prop("disabled", true);
  }
});
endDate.on("input", (e) => {
  if (endDate.val() != "" && endDate.val() >= startDate.val()) {
    startDate.attr("max", endDate.val());
  } else {
    startDate.attr("max", "");
  }
});

// click events
addDomainBtn.on("click", () => {
  addDomainsToContainer();
});

let dataObj = {};
saveBtn.on("click", () => {
  dataObj = {};
  const isCompanyNameCorrectResult = isCompanyNameCorrect();
  const isUsernameCorrectResult = isUsernameCorrect();
  const isPhoneCorrectResult = isPhoneCorrect();
  const isStartDateCorrectResult = isStartDateCorrect();
  const isEndDateCorrectResult = isEndDateCorrect();
  const isEmailCorrectResult = isEmailCorrect();
  const isDomainCorrectResult = isDomainCorrect();
  const isGenderCorrectResult = isGenderCorrect();
  const isServicesCorrectResult = isServicesCorrect();

  if (
    isCompanyNameCorrectResult &&
    isUsernameCorrectResult &&
    isPhoneCorrectResult &&
    isStartDateCorrectResult &&
    isEndDateCorrectResult &&
    isEmailCorrectResult &&
    isDomainCorrectResult &&
    isGenderCorrectResult &&
    isServicesCorrectResult
  ) {
    dataObj["Client Company Name"] = comapanyName.val().trim();
    dataObj["Username"] = username.val();
    dataObj["Contact Phone"] = iti.getNumber();
    dataObj["Contract Start Date"] = startDate.val();
    dataObj["Contract End Date"] = endDate.val();
    dataObj["Contact Email"] = email.val();
    dataObj["Gender"] = genderMale.prop("checked") ? "Male" : "Female";
    dataObj["Domain Name(s)"] = validDomainsList.join(" , ");
    dataObj[
      "Which of the following services are you interested in contracting for?"
    ] = servicesList.join(" , ");

    // popup functionality
    $("body").addClass("popup-open");
    popup.removeClass("d-none");
    loadAllDataToPopup(dataObj);
  }
});
backBtn.on("click", () => {
  $("body").removeClass("popup-open");
  popup.addClass("d-none");
});
confirmBtn.on("click", () => {
  // save data to localstorage
  localStorage.setItem("dataObj", JSON.stringify(dataObj));
  // change location to details page
  location.href = "details.html";
});

domainNames.on("keypress", (e) => {
  if (e.key == "Enter") {
    addDomainsToContainer();
  }
});

function removeGenderError() {
  $("#genderErrorMessage").addClass("d-none");
}
genderMale.on("change", removeGenderError);
genderFemale.on("change", removeGenderError);

$(".check-contianer .check-box").on("change", () => {
  isServicesCorrect();
});

// helper function
function showError(inputElement, errorElement, message) {
  inputElement.addClass("input-validation-error");
  errorElement.html(message);
  errorElement.removeClass("d-none");
}
function removeErrorClass(element, errorElement) {
  element.removeClass("input-validation-error");
  errorElement.addClass("d-none");
}

// function to validate inputs to check if field is empty and to check regex validations
function commonValidationWithRegex(inputRef, regex, errorMessage) {
  let val = inputRef.val().trim();
  let errElm = inputRef.parent().find(".error-message");
  if (commonValidation(inputRef)) {
    if (!regex.test(val)) {
      showError(inputRef, errElm, errorMessage);
      return false;
    }
    return true;
  } else {
    return false;
  }
}

function commonValidation(inputRef) {
  let val = inputRef.val().trim();
  let errElm = inputRef.parent().find(".error-message");
  if (val != "") {
    return true;
  } else {
    showError(inputRef, errElm, `${inputRef.attr("name")} is required`);
    return false;
  }
}
