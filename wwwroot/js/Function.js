const menuLink = document.querySelector(".menu-link");

const subMenu = document.querySelector(".sub-menu");

menuLink.addEventListener("click", function () {

    if (subMenu.style.display === "block") {

        subMenu.style.display = "none";

    }
    else {

        subMenu.style.display = "block";

    }

});
// cAI Assistant

const aiMenu = document.querySelector(".ai-menu-link");

const aiItem = document.querySelector(".ai-menu-item");


aiMenu.addEventListener("click", function () {

    aiItem.classList.toggle("active");

});

