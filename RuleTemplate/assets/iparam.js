let ticketfields = '';
let counter = 0;
let client = {};
$(document).ready(function () {
    app.initialized().then(function (_client) {
        client = _client
        $("#verifyFreshdesk").click(function () {
            if($("#fdurl").val().length < 10){
                showErrorMessage("e","Please enter Freshdesk URL, eg: https://domain.freshdesk.com");
                return false;
            }
            $("#verifyFreshdesk").html("<i>Verifying Freshdesk Account... </i>");
            $("#verifyFreshdesk").attr("disabled", "disabled");
            var url = $("#fdurl").val() + "/api/v2/ticket_fields";
            getTicketFields(url);
        })
       

    });
})
function getHeaders() {
    return {
        Authorization: "Basic " + btoa($("#api_key").val() + ":*")
    };
}
function errorHandler(err) {
    showErrorMessage("e", err);
}
function apiCall(url) {
    var options = {
        headers: getHeaders()
    }
    return client.request.get(url, options)

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
function getTicketFields(url) {
    apiCall(url).then(function (data) {
        ticketfields = JSON.parse(data.response);
        addNewTemplate();
        addAnotherRule()
        //prePopulateValues();
        hideFdInput();
    }).catch(errorHandler)
}
function addNewTemplate() {
    var settingPage = $($("#addOptionTemplate").html());
    settingPage.closest(".counter").attr("id", "counter_" + counter);
    $(".autocreateRules .rules").append(settingPage);
    $(".autocreateRules .rules #counter_" + counter +
        ".parentSelector select.parentSelect,.autocreateRules .rules #counter_" + counter +
        ".childSelector select.childSelect").html("<option value='0'>--</option>");
    $(settingPage).find(".heading label input[type='radio']").attr("name", `rAnd_${counter}`)
    addOptionClick();
    removeRuleClick();
    orAndChangeEvent(settingPage);
    fillFieldsList(settingPage);
    $(settingPage).find(`.rulemapping .addOption`).trigger("click");
    counter = counter + 1;
}
function fillFieldsList(settingPage) {
    $(settingPage).find(".fieldsListSection select").html(getAllFields()).select2({
        closeOnSelect: false
    });
    $(settingPage).find(".fieldsListSection select").on("select2:select", function (evt) {
        var element = evt.params.data.element;
        var $element = $(element);
        $element.detach();
        $(this).append($element);
        $(this).trigger("change");
    });
}
function addOptionClick() {
    $(".rulemapping .addOption").off().click(function () {
        $(this).parent().parent().find(".addOptionDiv").append($("#rowHeaderTemplate").html());
        fillParentSelector($(this));
        removeOptionClick();
        onParentSelect();
        //$(".rulemapping .parentSelect").last().select2();
    })
    $(".fieldmapping .addOption").off().click(function () {
        $(this).parent().parent().find(".addOptionDiv").append($("#fielMappingChildTemplate").html());
    })
}

function fillParentSelector(selector) {
    var selectors = selector.parentsUntil(".counter").parent().find(".addOptionDiv .header .parentSelect").last();
    let fields = getDropdownFields();
    $(selectors).last().append(fields);
}

function removeRuleClick() {
    $(".removeRule").off().click(function () {
        $(this).parent().parent().remove();
    })
}

function getAllFields() {
    return ticketfields.reduce(function (content, field) {
        if (field.name !== "requester") {
            content += `<option value='${field.name}'>${field.label}</option>`;
        }
        return content;
    }, `<option value='none'>--</option>`);
}

function getDropdownFields() {
    return ticketfields.reduce(function (content, field) {
        if (field.choices) {
            content += `<option value='${field.name}'>${field.label}</option>`;
        }
        return content;
    }, "");
}

function orAndChangeEvent(settingPage) {
    $(settingPage).find(".heading label input[type='radio']").off().change(function () {
        if ($(this).attr("id") === "matchAll") {
            $(this).parentsUntil(".counter").parent()
                .find(".addOptionDiv .separator .match-operator").text("AND");
        } else {
            $(this).parentsUntil(".counter").parent()
                .find(".addOptionDiv .separator .match-operator").text("OR");
        }
    });
}

function removeOptionClick() {
    $(".header .removeOption").off().click(function () {
        var previousRowHeader = $(this).parent();
        previousRowHeader.next().remove(); //remove seperator
        previousRowHeader.remove();
    });
    $(".header .removeFieldOption").off().click(function () {
        $(this).parent().parent().remove();
    });
}

function onParentSelect() {
    $(".rulemapping .parentSelect").off().change(function () {
        var _this = $(this);
        _this.parent().parent().find(".childSelector").empty();
        var selectedParent = _this.val();
        selectedParent ? setChildOptions(selectedParent, _this) : "";
    })
}

function setChildOptions(selectedParent, _this) {

    ticketfields.filter(function (v) {
        if ((v.name).toLowerCase() === selectedParent.toLowerCase()) {
            routeBasedonType(v, _this);
        }
    })
}

function routeBasedonType(v, _this) {
    switch (v.type) {
        case "default_company":
        case "default_subject":
        case "custom_text":
            {
                _this.parent().parent().find(".childSelector").append(`<input type="text" class="childSelect"/>`)
                break;
            }
        case "default_description":
            _this.parent().parent().find(".childSelector").append(`<textarea id="childSelect" rows="4" cols="50"> </textarea>`);
            break;
        case "default_ticket_type":
        case "custom_dropdown":
            handleCustomDropDown(v, _this);
            break;
        case "default_status":
            handleDefaultStatus(v, _this);
            break;
        case "default_source":
        case "default_priority":
        case "default_product":
        case "default_group":
        case "default_agent":
            handleDefaultAgentGroupProduct(v, _this);
            break;
        case "nested_field":
            handleNestedField(v, _this);
            break;
    }
}

function handleCustomDropDown(v, _this) {
    _this.parent().parent().find(".childSelector").append(`<select  multiple="multiple" class="js-example-basic-multiple childSelect"> < option val = 0 > --</option ></select >`);
    _this.parent().parent().find(".childSelector .childSelect").select2({
        closeOnSelect: false
    });
    var choices = v.choices;
    for (var i = 0; i < choices.length; i++) {
        _this.parent().parent().find(".childSelect").append(`<option  value='${choices[i]}'>${choices[i]}</option>`);
    }
}

function handleDefaultStatus(v, _this) {
    _this.parent().parent().find(".childSelector").append(`<select multiple="multiple" class="js-example-basic-multiple childSelect"> < option val = 0 > --</option ></select >`)
    _this.parent().parent().find(".childSelector .childSelect").select2({
        closeOnSelect: false
    });
    var choices = v.choices;
    var choicesKeys = Object.keys(choices);
    for (var i = 0; i < choicesKeys.length; i++) {
        var code = choicesKeys[i];
        var name = choices[choicesKeys[i]][0];
        _this.parent().parent().find(".childSelect").append(`<option  value='${code}'>${name}</option>`);
    }
}

function handleDefaultAgentGroupProduct(v, _this) {
    _this.parent().parent().find(".childSelector").append(`<select multiple="multiple" class="js-example-basic-multiple childSelect"> < option val = 0 > --</option ></select >`)
    _this.parent().parent().find(".childSelector .childSelect").select2({
        closeOnSelect: false
    });
    var choices = v.choices;
    var choicesKeys = Object.values(choices);
    for (var i = 0; i < choicesKeys.length; i++) {
        var code = choicesKeys[i];
        var name = Object.keys(choices).find(key => choices[key] === code);
        _this.parent().parent().find(".childSelect").append(`<option  value='${code}'>${name}</option>`);
    }
}

function handleNestedField(v, _this) {
    var choices = v.choices;
    fillFirstLevel(choices, v, _this);
}

function fillFirstLevel(choices, v, _this) {
    var firstLevelOptions = Object.keys(choices);
    firstLevelOptions.unshift("--");
    _this.parent().parent().find(".childSelector").append(`<select data-type='nested' class="childSelect firstLevel"> < option val = 0 > --</option ></select >`)
    for (var i = 0; i < firstLevelOptions.length; i++) {
        _this.parent().parent().find(".childSelect").append(`<option  value='${firstLevelOptions[i]}'>${firstLevelOptions[i]}</option>`);
    }
    onFirstLevelChange(_this, choices, v);
}

function onFirstLevelChange(_this, choices, v) {
    _this.parent().parent().find(".firstLevel").off().change(function () {
        var selectedFirstLevel = _this.parent().parent().find(".firstLevel option:selected").text();
        _this.parent().parent().find(".childSelector .secondLevel").remove();
        _this.parent().parent().find(".childSelector .thirdLevel").remove();
        //remove select span element
        _this.parent().parent().find(".childSelector .thirdLevel").next().remove();
        _this.parent().parent().find(".childSelector .secondLevelLabel").remove();
        _this.parent().parent().find(".childSelector .thirdLevelLabel").remove();
        choices[selectedFirstLevel] ? fillSecondLevel(choices[selectedFirstLevel], _this, v) : "";
    })
}

function fillSecondLevel(secondLevelChoices, _this, v) {
    v.nested_ticket_fields[0] ?
        _this.parent().parent().find(".childSelector").append(`<label id='${v.nested_ticket_fields[0].name}' class="secondLevelLabel" for=".secondLevel">${v.nested_ticket_fields[0].label}`) : "";
    _this.parent().parent().find(".childSelector").append(`<select class="childSelect secondLevel"> < option val = 0 > --</option ></select >`);
    var secondLevelOptions = Object.keys(secondLevelChoices);
    secondLevelOptions.unshift("--");
    for (var i = 0; i < secondLevelOptions.length; i++) {
        _this.parent().parent().find(".secondLevel").append(`<option  value='${secondLevelOptions[i]}'>${secondLevelOptions[i]}</option>`);
    }
    onSecondLevelChange(_this, secondLevelChoices, v);
}

function onSecondLevelChange(_this, secondLevelChoices, v) {
    _this.parent().parent().find(".secondLevel").off().change(function () {
        var selectedSecondLevel = _this.parent().parent().find(".secondLevel option:selected").text();
        _this.parent().parent().find(".childSelector .thirdLevel").remove();
        _this.parent().parent().find(".childSelector .thirdLevel").next().remove();
        _this.parent().parent().find(".childSelector .thirdLevelLabel").remove();
        secondLevelChoices[selectedSecondLevel] ? fillThirdLevel(secondLevelChoices[selectedSecondLevel], _this, v) : "";
    })
}

function fillThirdLevel(thirdLevelOptions, _this, v) {
    v.nested_ticket_fields[1] ?
        _this.parent().parent().find(".childSelector").append(`<label id='${v.nested_ticket_fields[1].name}' class="thirdLevelLabel" for=".thirdLevel">${v.nested_ticket_fields[1].label}`) : "";
    _this.parent().parent().find(".childSelector").append(`<select class="childSelect thirdLevel"> < option val = 0 > --</option ></select >`);
    let options = '';
    for (var i = 0; i < thirdLevelOptions.length; i++) {
        options = options + `<option  value='${thirdLevelOptions[i]}'>${thirdLevelOptions[i]}</option>`;
    }
    _this.parent().parent().find(".thirdLevel").append(options).select2({
        multiple: true,
        closeOnSelect: false
    });
    _this.parent().parent().find(".thirdLevel").val([]).trigger("change");
}

function addAnotherRule() {

    $(`#addAnotherRule`).off().click(function () {
        // var settingPage = $($("#addOptionTemplate").html());
        // settingPage.closest(".counter").attr("id", "counter_" + counter);
        // $(`.autocreateRules .rules`).append(settingPage);
        addNewTemplate();
    });
}
