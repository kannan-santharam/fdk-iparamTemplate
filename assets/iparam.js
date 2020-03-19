var ticketfields, savedIparams;
function elementEvents() {
    $("#closeError").click(function () {
        $(".errmsg").animate({
            "right": "-100%"
        })
    });
    $("#verifyFreshdesk").click(function () {
        $("#verifyFreshdesk").html("<i>Verifying Freshdesk Account... </i>");
        $("#verifyFreshdesk").attr("disabled", "disabled");
        var url = $("#fdurl").val() + "/api/v2/ticket_fields";
        getTicketFields(url);
    });
}
function changeVerifyButton() {
    $("#verifyFreshdesk").html("Verify Freshdesk Account");
    $("#verifyFreshdesk").removeAttr("disabled");
}
function hideFdInput() {
    changeVerifyButton();
    $(".resetAPI").show();
    $(".mainContainer").removeClass("hide");
    $(".loginSection").hide();
    clickevents();
}
function clickevents() {
    $(".resetAPI a#resetKey").off().click(function () {
        $(".resetAPI").hide();
        $(".loginSection").show();
        $("html,body").animate({
            scrollTop: 0
        }, 100)
    });
}
function apiCall(url) {
    var options = {
        headers: getHeaders()
    }
    return iclient.request.get(url, options)

}
function errorHandler(err) {
    showErrorMessage("e", err);
}
function getHeaders() {
    return {
        Authorization: "Basic " + btoa($("#api_key").val() + ":*")
    };
}
function showErrorMessage(type, message) {
    validation = 0;
    message.response != undefined ? message = message.response.replace(/{|}/g, "") : message;
    $(".errmsg").animate({
        "right": "25px"
    })
    $(".errmsg #errorMessage").html(message);
    if (type != "e") {
        $(".errmsg").addClass("success");
        $(".errmsg i.icircle").addClass("hide");
        $(".errmsg i.success").removeClass("hide");
    } else {
        $(".errmsg i.icircle").removeClass("hide");
        $(".errmsg i.success").addClass("hide");
        $(".errmsg").removeClass("success");
    }
    clearTimeout(setTime);
    var setTime = setTimeout(function () {
        $(".errmsg").animate({
            "right": "-100%"
        })
    }, 6000);
    changeVerifyButton();
}
function getTicketFields(url) {
    apiCall(url).then(function (data) {
        ticketfields = JSON.parse(data.response);
        $("#ticketfields").html("").append(generateOptions(ticketfields))
        $("#ticketfields").select2({
            multiple: true,
        }).val([]).trigger("change");
        prePopulateValues();
        hideFdInput();
    }).catch(errorHandler)
}
function generateTicketFieldOptions(fields) {
    return fields.reduce((c, v) => {
        c = c + `<option value='${v.name}'>${v.label}</option>`;
        return c;
    }, "");
}
/**
 * TODO:your code goes here
 */
function prePopulateValues() {
    if (savedIparams) {
     
    }
}
