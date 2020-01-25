// Debug message to notify that the script has loaded.
// To see it, find the console tab
// console.log("Navigation JavaScript has loaded!");

// Getting the menu button (top-right corner) by ID.
const menuBtn = document.getElementById("nav-btn");
const menuBtnImg = document.getElementById("menu-img");

// Throw an error if no menu button was found.
if (menuBtnImg == null) {
    alert("JavaScript could not find Menu Button");
    throw new Error("Null value was found!");
}

// Collecting the menu itself.
const NavMenuDesk = document.getElementById("nav-desk");
const NavMenu = document.getElementById("navigation");

let exit_img_src = "../../images/icons/close.png"

// Gets default path to menu button image source.
let original_attribute_src = menuBtnImg.getAttribute("src");

// Adding an Event Listener for an action (click on a button) on my object.
// A function is passed in that should be carried out when the event occurs.
menuBtn.addEventListener("click", toggle_menu, false);

// Listen for browser resize.
window.addEventListener("resize", check_resize, false);


// Functions below.

/** 
 * @description Parse {url} string and return the last {len} characters
 * before the last slash (/) in the string.
 * @param {*} url Url that should be parsed.
 * @param {*} len length of part to be returned.
 */
function Parse_Url(url, len) {
    return url.substring(url.lastIndexOf("/") - len, url.lastIndexOf("/"));
}

/**
 * @description Hides and shows our navigation menu after we click the menu button.
 * It toggles (either adds or removes) a class that shows or hides our element.
 * It also adds a blur effect using JavaScript and its powerful events. 
 */
function toggle_menu() {
    // Switches the image sources.
    // If showing menu icon, switch to exit icon.
    if (menuBtnImg.getAttribute("src") == original_attribute_src)
        menuBtnImg.setAttribute("src", exit_img_src);
    // Otherwise, switch to menu icon.
    else menuBtnImg.setAttribute("src", original_attribute_src);

    // Add blur effect to background when menu is visible to shift focus on menu.
    document.querySelector(".content").classList.toggle("blur");
}

/** 
 * @description Deals with issues that can occur when transitioning from
 * mobile viewport to desktop viewport. E.g. When you leave the menu open 
 * on the mobile viewport and move to the desktop viewport, the blur effect 
 * applied by toggle_menu would still be active.
 */
function check_resize() {
    // If in desktop viewport (width needs to be the same as in nav_style.css):
    if (window.innerWidth >= 670 && window.innerWidth <= 1920 && document.querySelector(".content").classList.contains("blur") && document.querySelector(".left").classList.contains("red-wine")) {
        resetPhoneMenu();
    }
    else if (window.innerWidth < 670 && window.innerWidth > 150 && document.querySelector(".content").classList.contains("blur") && !document.querySelector(".left").classList.contains("red-wine")) {
        resetDesktopMenu();
    }
}

/**
 * @description Resets all elements contributing to the phone navigation 
 * to their default state. This is done because check_resize essentially 
 * closes the navigation for us, but we also need to set all the attributes
 * directly.
 */
function resetPhoneMenu() {
    const left = document.querySelector(".left");
    const language_drop = document.querySelector(".language-dropdown");
    const search = document.querySelector(".search-drop");
    const title_cont = document.querySelector(".title");
    const logo_cont = document.querySelector(".logo");
    const logo = document.getElementById("logo");
    const title = document.getElementById("title");

    console.log("Resetting the menu now!");
    left.classList.remove("red-wine");
    search.classList.remove("hidden");
    language_drop.classList.remove("no-display");
    title.classList.remove("title-open-nav");
    logo.classList.remove("logo-img-open-nav");
    logo_cont.classList.remove("logo-open-nav");
    title_cont.classList.remove("title-cont-open-nav");
}

function resetDesktopMenu() {
    const left = document.querySelector(".left");
    const language_drop = document.querySelector(".language-dropdown");
    const search = document.querySelector(".search-drop");
    const title_cont = document.querySelector(".title");
    const logo_cont = document.querySelector(".logo");
    const logo = document.getElementById("logo");
    const title = document.getElementById("title");

    console.log("Resetting the menu now!");
    left.classList.add("red-wine");
    search.classList.add("hidden");
    language_drop.classList.add("no-display");
    title.classList.add("title-open-nav");
    logo.classList.add("logo-img-open-nav");
    logo_cont.classList.add("logo-open-nav");
    title_cont.classList.add("title-cont-open-nav");
}