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