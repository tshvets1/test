(function () {
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    var loadCSS = document.querySelectorAll('link-defer');
    if (loadCSS.length) {
        [].forEach.call(loadCSS, function (tag) {
            var styleFor = tag.getAttribute("for");
            if ((styleFor === "modern" && window["isIE8"])
                || (styleFor === "ie8" && !window["isIE8"])) {
                return;
            }

            var styleTag = document.createElement("link");
            styleTag.rel = "stylesheet";
            styleTag.href = tag.getAttribute("href");
            styleTag.type = "text/css";
            head.appendChild(styleTag);
            tag.parentNode.removeChild(tag);
        });
    }

    var loadScripts = document.querySelectorAll('execute-with-jquery');

    if (loadScripts.length) {
        [].forEach.call(loadScripts, function (tag) {
            var scriptTag = document.createElement("script");
            scriptTag.innerHTML = tag.innerHTML;
            body.appendChild(scriptTag);
            tag.parentNode.removeChild(tag);
        });
    }
})();

//////  INITIALIZE PARTIALS & PLUGINS ////////
var additionalClasses = "no-touch";
if ("ontouchstart" in window) {
    additionalClasses = "touch";
    FastClick.attach(document.body);
}

if ($("#scPageExtendersForm").length) {
    additionalClasses += " scEditPreview";
}

//set adv cookie
(function () {
    if (window.location.search.length) {
        var parameters = window.location.search.replace("?", "").split("&");

        var isCidExist = false;
        var isIBExist = false;
        var trackingData = "";
        var cid = "";
        var mediaChannel = "";
        var mediaSourceRef = "";

        for (var i = 0; i < parameters.length; i++) {
            var urlparam = parameters[i].split("=");

            if (urlparam[0] == "src") {
                cookies().set("adv", urlparam[1], 360, "/", $('body').data('cookie'));
            }
            if (urlparam[0] == "cid") {
                cid = urlparam[1];
                isCidExist = true;
            }
            if (urlparam[0] && urlparam[0].toLowerCase() == "ib") {
                //[0-3] digits, remove leading zeros
                mediaChannel = parseInt(urlparam[1].substring(0, 3), 10);
                //[4-10] digits, remove leading zeros
                mediaSourceRef = parseInt(urlparam[1].substring(3, 10), 10);
                isIBExist = true;
            }
        }
        if (isCidExist && isIBExist) {
            trackingData = "mediachannelid=" + mediaChannel;
            trackingData += "&mediasourceid=" + mediaSourceRef;
            trackingData += "&txtWebSourceRef=" + cid;
            trackingData += "&txtSearchTerm=" + getSearchTerms();
            trackingData += "&txtWebSourceURL=" + getReferrer();

            cookies().set("tracking", trackingData, 360, "/", $('body').data('cookie'));
        }
    }
})();

misc(); // Contains back to top, custom selectbox, Remove if empty, toggle password, Password validation

function addAdditionalClasses() {
    $("body").addClass(additionalClasses);
    if ($.viewport.isDesktop()) {
        $("body").removeClass("touch").addClass("no-touch");
    }
}

function getRefQueryParam(a) {
    a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    a = RegExp("[\\?&]" + a + "=([^&#]*)").exec(document.referrer);
    return a == null ? "" : a[1]
}

function getReferrer() {
    return ((document.referrer != null) ? document.referrer : '');
}

function getSearchTerms() {
    //Yahoo search
    var searchTermsFromP = getRefQueryParam('p').toString();
    //Google search and Bing
    var searchTermsFromQ = getRefQueryParam('q').toString();
    //Lycos
    var searchTermsFromQuery = getRefQueryParam('query').toString();
    if (searchTermsFromP.length > 0) {
        return searchTermsFromP;
    }

    if (searchTermsFromQ.length > 0) {
        return searchTermsFromQ;
    }

    if (searchTermsFromQuery.length > 0) {
        return searchTermsFromQuery;
    }
    return "";
}

addAdditionalClasses();
$(window).on("resize", function () {
    addAdditionalClasses();
});

$(function () {
    //initialize header
    $("#header").header();

    if ($(".tabs__list").length) {
        productTabs();
    }

    $(".key-benefits-section").each(function () {
        keyBenefits(this);
    });

    if ($(".platform-comparison-section").length) {
        platformComparison();
    }

    if ($(".education-article-detail-filter").length) {
        articleDetailFilter();
    }

    $(".multi-col-section").length && multiColModule();

    if ($(".latest-research-section").length) {
        latestResearch($(".latest-research-section"));
    }

    if ($(".conquer-markets-section").length) {
        conquerTheMarkets();
    }

    if ($(".webinar-registration-section").length) {
        selectDates();
    }

    if ($(".platform-handbooks-filter-module").length) {
        platformHandbooks($(".platform-handbooks__platform"));
    }

    if ($(".team-section").length) {
        $(".team-section img").unveil(200);
    }

    if ($(".trading-hours__module").length) {
        tradingHours();
    }

    if ($(".live-trading-right-rail-module").length) {
        selectDates();
    }

    if ($(".live-trading-sessions-section").length) {
        liveTradingSessionsConfirmation($(".live-trading-sessions-section"));
    }

    if ($(".knowledge-center-section").length) {
        knowledgeCenter($(".knowledge-center-section"));
    }

    if ($(".my-account-login-modal-section").length) {
        myAccount(".my-account-login-modal-section .installLink");
        form(".my-account-login-modal-section form.my-account-login__form", {
            mustValidate: true
        });
    }

    if ($(".economic-calendar-section").length) {
        economicCalendar(calendarOptions);
    }

    if ($(".gft-deposit").length) {
        crossDomainIframe().message("http://localhost:2622", function (height) {
            $("#frameGFT").height(height);
        });
    }

    if ($(".gft-withdrawal").length) {
        gftWithdrawal();
        form("form.gft-withdrawal__form", {
            mustValidate: true,
            mustHideLabelsForMobile: true
        });
    }

    $(".newsletter-section, .newsletter-module").each(function () {
        newsletter(this);
    });

    $(".listing-section").filter(":odd").addClass("nth-of-type-odd");

    if ($(".redirect-modal-section").length) {
        var $modal = $(".redirect-modal-section");
        $modal.find(".continueToRead").click(function (e) {
            e.preventDefault();
            cookies().sessionCookie($modal.data('cookieAdvised'), '0;path=/');
            geoPopup.close();
        });
        $modal.find(".takeToUserEntity").attr('href', $modal.data('adivcedUrl'));
        var geoPopup = $modal.remodal({ closeOnEscape: false, closeOnAnyClick: false });
        geoPopup.open();
        $(".multi-col-section").length && multiColModule();
        $(".redirect-modal-section.remodal .remodal-close").hide();
    }

    if ($(".international-section").length) {
        internationalLandingPage($(".international-section"));
    }

    typeof bannerArea !== "undefined" && bannerArea($(".banner-area-section"));

    typeof blocks !== "undefined" && blocks($(".block__group"));

    $(".tabs-switch-module > .wrapper").tabsSwitch();

    typeof productSummaryDetails !== "undefined" && productSummaryDetails($(".product-summary-details"));
});