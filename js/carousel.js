// Waits for the HTML file to be parsed to make sure the slides exist.
document.addEventListener("DOMContentLoaded", function (event) {
    var slide_index = 1;
    show_slide(slide_index);
});

// Next and previous controls.
function plus_slide(n) {
    show_slide(slide_index + n);
}

// Slide control. Shows and hides as requested.
function show_slide(wanted_slide) {
    // Collect slides and bars.
    var slides = document.getElementsByClassName("slide");
    var bars = document.getElementsByClassName("bar");

    // Set slide_index. Loop back around if needed.
    if (wanted_slide > slides.length) {
        slide_index = 1
    } else if (wanted_slide < 1) {
        slide_index = slides.length
    } else {
        slide_index = wanted_slide
    }

    // Show wanted slide, hide others.
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slide_index - 1].style.display = "block";

    // Add active class to active bat, others lose active class.
    for (var i = 0; i < bars.length; i++) {
        bars[i].className = bars[i].className.replace(" active", "");
    }
    bars[slide_index - 1].className += " active";
}