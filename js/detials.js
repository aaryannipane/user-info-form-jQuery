$(function () {
  let dataObj = JSON.parse(localStorage.getItem("dataObj"));

  for (let k in dataObj) {
    console.log(k);
    $(".details-data-container").append(
      `<p><b>${k}: </b><br> ${dataObj[k]}</p>`
    );
  }
  console.log("hello", dataObj);
  $("#backBtn").on("click", () => {
    location.href = "index.html";
  });
});
