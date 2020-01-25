// This file is responsible for human interaction with the navigation such as clicking the hamburger button and a menu pops-up
// Executes functions as soon as the page is fully loaded.
$(document).ready(function () {
    let isDesktop = DesktopCheck();
    let isOverflow = OverflowCheck();

    // This is how variable assignment is done in JavaScript.
    let langBtn = "#langBtn";

    // Set up variables for search.
    let searchBtn = "#search";
    let searchInput = ".search-input";
    let searching = false;

    // Set up variables for logo and title.
    let logo = ".nav-phone .logo";
    let title = ".nav-phone .title";

    // When resizing browser this function checks for desktop viewport and browser
    //  overflow and makes decisions based on the returned values / data
    $(window).resize(function () {
        isDesktop = DesktopCheck();
        isOverflow = OverflowCheck();
        if (isDesktop && searching) {
            slideOut();
            searching = false;
        }
    });

    // Toggles navigation menu on click of the navigation menu button.
    $("#nav-btn").click(function () {
        openMenu(isDesktop);
    });

    function openMenu(isDesktop) {
        if (isDesktop) {
            openDesktopMenu();
        } else {
            openPhoneMenu();
        }
    }

    function openDesktopMenu() {
        // Slides the navigation out / in.
        $(".navbar").slideToggle("fast");
        // Toggles look of menu button (e.g. colour).
        $("#nav-btn").toggleClass("active-nav-btn");
        // Fade out language dropdown.
        $(".dropdown-content").fadeOut(200);
    }

    function openPhoneMenu() {
        // Slides the navigation out / in.
        $(".navbar").slideToggle("fast");
        // Toggles look of menu button (e.g. colour).
        $("#nav-btn").toggleClass("active-nav-btn");
        // Fade out language dropdown.
        $(".dropdown-content").fadeOut(200);
        // Make language dropdown disappear / reappear.
        $(".language-dropdown").toggleClass("no-display");
        // Make 'left' elements toggle their colour.
        $(".left").toggleClass("red-wine");
        // Hide / Show the search bar.
        $(".search-drop").toggleClass("hidden");
        // Toggles colour of school name.
        $("#title").toggleClass("title-open-nav");
        // Adjusts logo's margin-left.
        $(".logo").toggleClass("logo-open-nav");
        // Adjusts padding and margin of div with school name.
        $(".title").toggleClass("title-cont-open-nav");
        // Adjusts padding and margin of logo image.
        $("#logo").toggleClass("logo-img-open-nav");
    }

    // Hooking a click event listener into langBtn.
    $(langBtn).click(function () {
        if (isDesktop) { return; }
        $(".language-dropdown-content").fadeToggle(200);
        return;
    });

    $(langBtn).hover(
        function () { if (!isDesktop) { return; } $(".language-dropdown-content").slideDown("fast"); },
        function () {
            if (!$(".language-dropdown-content").is(":hover")) {
                $(".language-dropdown-content").slideUp("fast");
            }
        });

    $(".language-dropdown-content").hover(null, function () {
        if (!$(langBtn).is(":hover"))
            $(".language-dropdown-content").slideUp("fast");
    });

    // Manages search button sliding on click.
    $(searchBtn).click(function () {
        isDesktop = DesktopCheck();
        if (!searching) {
            slideIn(isDesktop);

            // TEMPORARY SOLUTION.
            searching = true;
        } else {
            slideOut();

            // TEMPORARY SOLUTION.            
            searching = false;
        }
        return;
    });

    // Closes elements when clicking on other parts of the website.
    $(document).click(function () {
        // Fades out the language dropdown if it is shown.
        if (!$(".language-dropdown-content").is(":hover") &&
            !$(".language-dropdown-content").is(":hidden") &&
            !$(langBtn).is(":hover")) {

            $(".language-dropdown-content").fadeOut(200);

            // Slides out the search bar if it is shown.
        } else if (!$(searchInput).is(":hover") &&
            !$(searchInput).is(":hidden") &&
            !$(searchBtn).is(":hover")) {

            slideOut();
            searching = false;
        }
    });

    /**
     * @description Controls the slide-in animation for the {selector}.
     * @param {*} selector
     * @param {Boolean} isDesktop
     */
    function slideIn(isDesktop, selector = searchInput) {
        let width;
        if (isDesktop) {
            width = "208px";
        } else {
            width = "40vw";
        }

        if (width.length <= 0) {
            console.error("NullReferenceException: Object reference not set to an instance of an object.");
            return;
        }
        // Show and slide in the {selector}.
        $(selector).show();
        $(selector).delay(0).animate({
            "width": width,
            "opacity": .9
        }, 400);
        // Hides logo and title.
        if ($(window).width() < 1035) {
            $(logo).addClass("no-display");
            $(title).addClass("no-display");
        }
    };

    /**
     * @description Controls the slide-out animation for the {selector}.
     * @param {*} selector
     */
    function slideOut(selector = searchInput) {
        // Hide and slide away the {selector}.
        $(selector).animate({
            "width": "0",
            "opacity": 0,
        }, 400);
        $(selector).hide(500);
        // Show logo and title.
        $(logo).removeClass("no-display");
        $(title).removeClass("no-display");
    };

    function DesktopCheck() {
        let width = $(window).width();
        if (width >= 670)
            return true;
        else
            return false;
    }

    function OverflowCheck() {
        let overflow = document.querySelector("body").scrollHeight > $(window).innerHeight();
        return overflow;
    }
});