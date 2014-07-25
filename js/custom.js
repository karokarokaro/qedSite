function hoverMainImageItem(_this, isHover) {
    var uiBlockX = $(_this).hasClass("ui-block-a") ? ".ui-block-a" : ".ui-block-b";
    if (isHover) {
        $(_this).parents(".mainImage").find(uiBlockX + ".whiteCont").addClass("active")
        $(_this).addClass("active");
    } else {
        $(_this).parents(".mainImage").find(uiBlockX + ".whiteCont").removeClass("active");
        $(_this).removeClass("active");
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