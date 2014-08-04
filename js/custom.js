function hoverMainImageItem(_this, isHover) {
    var uiBlockX = $(_this).hasClass("ui-block-a") ? ".ui-block-a" : ".ui-block-b";
    if (isHover) {
        var $whiteCont = $(_this).parents(".mainImage").find(uiBlockX + ".whiteCont");
        $whiteCont.stop(true);
        $whiteCont.fadeTo(50, 1, function() {
            $whiteCont.addClass("active");
            $(_this).addClass("active");
        });

    } else {
        var $whiteCont = $(_this).parents(".mainImage").find(uiBlockX + ".whiteCont");
        $whiteCont.stop(true);
        $whiteCont.removeClass("active");
        $(_this).removeClass("active");
        $whiteCont.fadeTo(250, 0, function() {

        });


    }
}
$(function() {
    $(".mainImage .container > .ui-block-a, .mainImage .container > .ui-block-b").hover(
        function() {
            hoverMainImageItem(this, true)
        }, function() {
            hoverMainImageItem(this, false)
        }
    );
});
$(document).on("pageinit", ".thisPage", function() {
    $(document).on("swiperight", ".thisPage", function(e) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($.mobile.activePage.jqmData("panel") !== "open" && $(window).width() < 768) {
            $("#leftMenu").panel("open");
        }
    });
});