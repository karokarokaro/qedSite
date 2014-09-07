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
SearchEngine = {
    _cache: {},
    params: {},
    _refreshCache: function(){
        var sCache = ObjectCache.get(Config.cacheSearch);
    },
    init: function() {
        this.params = {
            type: "111|1221"
        };
    },
    pushParams: function(object) {
        object.type = this.params.type;
        return object;
    },
    search: function(searchBox, query, callbackSuccess) {
        this._refreshCache();
        if (typeof this._cache[query] != "undefined") {
            callbackSuccess(this._cache[query]);
            return;
        }
        searchBox.find(".searchInput").addClass("loading");
        $.ajax({
            url: Config.URLajaxSearch,
            dataType: "json",
            data: this.pushParams({
                query: query
            }),
            success: function(response) {
                if (typeof response.result != "undefined") {
                    SearchEngine._cache[response.query] = response.result;
                    ObjectCache.set(Config.cacheSearch, SearchEngine._cache);
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
                SearchEngine._cache[response.query] = response;
                ObjectCache.set(Config.cacheSearch, SearchEngine._cache);
                callbackSuccess(response, searchBox);
//                callbackError(response, searchBox);
            },
            complete: function() {
                searchBox.find(".searchInput").removeClass("loading");
            }
        });
    }

};
$(document).on("pagecreate", ".thisPage", function(e) {
    $(".mainImage .container > .ui-block-a, .mainImage .container > .ui-block-b").on("mouseenter",
        function() {
            hoverMainImageItem(this, true)
        }
    );
    $(".mainImage .container > .ui-block-a, .mainImage .container > .ui-block-b").on("mouseleave",
        function() {
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
    SearchEngine.init();
    initSearch($($(e.target).find(".searchBox")[0]));
    if (e.target.id == "searchPage") {
        initSearch($($(e.target).find(".searchBox")[1]));
    }
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
    initAdviceHandlers(res);
    return res;

}
function initAdviceHandlers(advice) {
    var searchBox = advice.closest(".searchBox");
    advice.on("click", function(e){
        var advice = $(this);
        var searchBox = advice.closest(".searchBox");
        if (advice.find("input.text").val() != "") {
            searchBox.find(".searchInput").val(advice.find("input.text").val());
        }
        if (advice.find("input.url").val() != "") {
            $.mobile.changePage(advice.find("input.url").val());
        }
    });
    advice.on("mouseenter", function(e){
        var searchBox = $(this).closest(".searchBox");
        searchBox.find(".advice").removeClass("active");
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
    if (adviceBox.find(".advice").length > 0) {
        adviceBox.addClass("active");
        adviceBox.slideDown();
    }
}
function tryAdvice(searchBox, callback) {
    SearchEngine.search(searchBox, searchBox.find(".searchInput").val(), function(response) {
        if (searchBox.find(".searchInput").val() == response.query) {
            var adviceBox = searchBox.find(".adviceBox");
            adviceBox.html("");
            for (var i = 0; i < response.result.items.length; ++i) {
                var elem = createAdviceLi(response.result.items[i]);
                initAdviceHandlers(elem);
                adviceBox.append(elem);
            }
            if (!searchBox.find(".adviceBox").is(".active")) showAdvices(searchBox);
            searchBox.find('input[name="searchQuery"]').val(response.query);
            if (typeof callback != "undefined") callback(searchBox);
        }

    });
}
function initSearch(searchBox) {
    searchBox.find(".searchInput").on("input click", function(e){
        var searchBox = $(this).closest(".searchBox");
        if (searchBox.find('input[name="searchQuery"]').val() != searchBox.find(".searchInput").val()) {
            searchBox.find(".adviceBox").html("");
            searchBox.find('input[name="searchQuery"]').val("");
            tryAdvice(searchBox);
        } else {
            if (searchBox.find('input[name="searchQuery"]').val() == "") {
                hideAdvices();
            } else {
                if (!searchBox.find(".adviceBox").is(".active")) {
                    showAdvices(searchBox);
                }
            }

        }
        e.preventDefault();
        e.stopPropagation();
    });
    searchBox.on("keydown", function(e) {
        var searchBox = $(this);
        if (!$(document.activeElement).is(".searchInput")) return;
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
                searchBox.closest(".thisPage").click();
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
                        tryAdvice(searchBox, function(searchBox){
                            var adviceBox = searchBox.find(".adviceBox");
                            if (adviceBox.find(".advice").length > 0) {
                                adviceBox.addClass("active");
                                adviceBox.show();
                                searchBox.find(".advice").removeClass("active");
                                $(adviceBox.find(".advice")[adviceBox.find(".advice").length-1]).addClass("active");
                            }
                        });
                    } else {
                        adviceBox.find(".advice").removeClass("active");
                        $(adviceBox.find(".advice")[adviceBox.find(".advice").length-1]).addClass("active");
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 40: // стрелка вниз
                if (isActive) {
                    var advice = searchBox.find(".advice.active");
                    if(adviceBox.find(".advice").length > 1){
                        var subl = advice.next();
                        if (subl == null || !subl.is(".advice")) {
                            subl = $(adviceBox.find(".advice")[0]);
                        }
                        searchBox.find(".advice").removeClass("active");
                        subl.addClass("active");
                    }
                } else {
                    if (!isActiveBox) {
                        tryAdvice(searchBox, function(searchBox){
                            var adviceBox = searchBox.find(".adviceBox");
                            if (adviceBox.find(".advice").length > 0) {
                                adviceBox.addClass("active");
                                adviceBox.show();
                                searchBox.find(".advice").removeClass("active");
                                $(adviceBox.find(".advice")[0]).addClass("active");
                            }
                        });
                    } else {
                        adviceBox.find(".advice").removeClass("active");
                        $(adviceBox.find(".advice")[0]).addClass("active");
                    }
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