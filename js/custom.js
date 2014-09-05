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
ClientCache = {
    get: function(key){
        if (typeof sessionStorage == "undefined") {
            return null;
        }
        return sessionStorage.getItem(key);
    },
    set: function(key, value) {
        if (typeof sessionStorage == "undefined") {
            return;
        }
        var prevValue = this.get(key);
        sessionStorage.setItem(key, value);
        return prevValue;
    }
};
ObjectCache = {
    get: function(key){
        var res = ClientCache.get(key);
        if (res == null) return null;
        return JSON.parse(res);
    },
    set: function(key, value) {
        var prevValue = this.get(key);
        ClientCache.set(key, JSON.stringify(value));
        return prevValue;
    }
};
SearchCache = {
    _cache: {},
    _refreshCache: function(){
        var sCache = ObjectCache.get("search");
    },
    search: function(query, callbackSuccess, callbackError) {
        this._refreshCache();
        if (typeof this._cache[query] != "undefined") {
            callbackSuccess(this._cache[query]);
        }
        $.ajax({
            url: "/search/",
            dataType: "json",
            data: {
                query: query
            },
            success: function(response) {
                if (typeof response.result != "undefined") {
                    SearchCache._cache[response.query] = response.result;
                    ObjectCache.set("search", SearchCache._cache);
                    callbackSuccess(response);
                }
            },
            error: function(response) {
                response = {"query":"a11", "result": {"items":[{
                    header: "qwerty1",
                    description: "1wekyrwuey nu ew e",
                    text: "a11"
                }, {
                    header: "vkontakte",
                    description: "URL",
                    text: "http://vk.com"
                }, {
                    header: "qwerty2",
                    description: "2wekyrwuey nu ew e",
                    url: "http://vk.com"
                }, {
                    header: "vk.com - URL",
                    url: "http://vk.com"
                }, {
                    header: "qwerty2",
                    description: "2wekyrwuey nu ew e",
                    url: "http://vk.com"
                }]}};
                SearchCache._cache[response.query] = response.result;
                ObjectCache.set("search", SearchCache._cache);
                callbackSuccess(response);
//                callbackError(response);
            }
        });
    }

};
$(document).on("pagecreate", ".thisPage", function(e) {
    $(".mainImage .container > .ui-block-a, .mainImage .container > .ui-block-b").hover(
        function() {
            hoverMainImageItem(this, true)
        }, function() {
            hoverMainImageItem(this, false)
        }
    );
    if (e.target.id != "contPage") {
        $(document).on("swiperight", ".thisPage", function(e) {
            // We check if there is no open panel on the page because otherwise
            // a swipe to close the left panel would also open the right panel (and v.v.).
            // We do this by checking the data that the framework stores on the page element (panel: open).
            if ($.mobile.activePage.jqmData("panel") !== "open" && $(window).width() < 768) {
                $("#leftMenu").panel("open");
            }
        });
    }
    initSearch($(e.target));
});
function createAdviceLi(advice) {
    var res = $('<li class="advice">' +
        ('<p class="header">' + ((typeof advice.header != "undefined") ? advice.header : "") + '</p>') +
        ('<p class="description">' + ((typeof advice.description != "undefined") ? advice.description : "&nbsp;") + '</p>') +
        '<input type="hidden" class="url" />' +
        '<input type="hidden" class="text" />' +
        '</li>');
    if (typeof advice.url != "undefined") res.find("input.url").val(advice.url);
    if (typeof advice.text != "undefined") res.find("input.text").val(advice.text);
    initMiniAdviceHandlers(res);
    return res;

}
function initAdviceHandlers(advice) {
    advice.on("click", function(e){
        if (advice.find("input.text").val() != "") {
            advice.closest(".searchBox").find(".searchInput").val(advice.find("input.text").val());
        }
        if (advice.find("input.url").val() != "") {
            $.mobile.changePage(advice.find("input.url").val());
        }
    });
    advice.on("mouseenter", function(e){
        $(".advice").removeClass("active");
        advice.addClass("active");
    });

}
function hideAdvices() {
    $('input[name="searchQuery"]').val("");
    $(".adviceBox").removeClass("active");
    $(".advice").removeClass("active");
    $(".adviceBox").hide();
}
function showAdvices(searchBox) {
    var adviceBox = searchBox.find(".adviceBox");
    adviceBox.addClass("active");
    adviceBox.slideDown();
}


function tryAdvice(searchBox, callback) {
    searchBox.find(".searchInput").addClass("loading");
    SearchCache.search(searchBox.find(".searchInput").val(), function(response) {

        if (searchBox.find(".searchInput").val() == response.query) {
            var adviceBox = searchBox.find(".adviceBox");
            adviceBox.html("");
            for (var i = 0; i < response.result.items.length; ++i) {
                var elem = createMiniAdviceLi(response.result.items[i]);
                initAdviceHandlers(elem);
                adviceBox.append(elem);
            }
            showAdvices(searchBox);
            thisPage.find('.top input[name="searchQuery"]').val(response.query);
            if (typeof callback != "undefined") callback();
        }
        searchBox.find(".searchInput").removeClass("loading");
    }, function(response){
        searchBox.find(".searchInput").removeClass("loading");
    });
}
function initSearch(searchBox) {
    searchBox.find(".searchInput").on("input click", function(e){
        if (searchBox.find('input[name="searchQuery"]').val() != searchBox.find(".searchInput").val()) {
            tryAdvice(searchBox);
        } else {
            if (!searchBox.find(".adviceBox").is(".active")) {
                showAdvices(searchBox);
            }
        }
        e.preventDefault();
        e.stopPropagation();
    });
    $(searchBox).on("keydown", function(e) {
        if (searchBox.find(".adviceBox").is(".active") && searchBox.find(".searchInput").is(":focus")) return;
        var isActive = searchBox.find(".advice").is(".active");
        var isActiveBox = searchBox.find(".adviceBox").is(".active");
        var adviceBox = searchBox.find(".adviceBox");
        switch(e.keyCode) {
            case 13: // enter
                if (isActive) {
                    var advice = searchBox.find(".advice.active");
                    if (advice.find("input.text").val() != "") {
                        searchBox.find(".searchInput").val(advice.find("input.text").val());
                    }
                    if (advice.find("input.url").val() != "") {
                        $.mobile.changePage(advice.find("input.url").val());
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
                hideAdvices();
                break;
            case 27: // escape
                hideAdvices();
                if (isActive) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            case 38: // стрелка вверх
                if (isActive) {
                    var advice = searchBox.find(".advice.active");
                    if(adviceBox.find(".advice").length > 1){
                        var subl = advice.prev();
                        if (subl == null || !subl.is(".advice")) {
                            subl = $(adviceBox.find(".advice")[adviceBox.find(".advice").length-1]);
                        }
                        searchBox.find(".advice").removeClass("active");
                        subl.addClass("active");
                    }
                } else {
                    if (!isActiveBox) {
                        tryAdvice(function(){
                            if (adviceBox.find("li.advice").length > 0) {
                                adviceBox.addClass("active");
                                adviceBox.show();
                                $(".advice").removeClass("active");
                                $(adviceBox.find("li.advice")[adviceBox.find("li.advice").length-1]).addClass("active");
                            }
                        });



                    }
                    $(".advice").removeClass("active");
                    $(adviceBox.find("li.advice")[adviceBox.find("li.advice").length-1]).addClass("active");
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 40: // стрелка вниз
                if (isActive) {
                    var advice = $(".advice.active");
                    var adviceBox = advice.closest("ul.adviceBox");
                    if(adviceBox.find("li").length > 1){
                        var subl = advice.next();
                        if (subl == null || !subl.is("li.advice")) {
                            subl = $(adviceBox.find("li")[0]);
                        }
                        $(".advice").removeClass("active");
                        subl.addClass("active");
                    }
                } else {
                    var adviceBox = thisPage.find(".top .searchInput").closest(".top").find("ul.adviceBox");
                    if (!isActiveBox) {
                        tryMiniAdvice(function(){
                            var adviceBox = thisPage.find(".top .searchInput").closest(".top").find("ul.adviceBox");
                            if (adviceBox.find("li.advice").length > 0) {
                                adviceBox.addClass("active");
                                adviceBox.show();
                                $(".advice").removeClass("active");
                                $(adviceBox.find("li.advice")[0]).addClass("active");
                            }
                        });


                    }
                    $(".advice").removeClass("active");
                    $(adviceBox.find("li.advice")[0]).addClass("active");
                }
                e.preventDefault();
                e.stopPropagation();
                break;
        }

    });

    $('html').on("click", function(e){
        hideAdvices();
        e.preventDefault();
        e.stopPropagation();
    });
}