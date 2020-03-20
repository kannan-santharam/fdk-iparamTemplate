var datapais = {};
$(document).ready(function () {
    app.initialized()
        .then(function (_client) {
            window.client = _client;
            client.events.on('app.activated', function () {
                getDataAPIs()
            });
        });
});
function getDataAPIs() {
    let dataAPI = getAllDataAPIDetails();
    Promise.all(dataAPI).then(function (data) {
        datapais["iparams"] = data[0];
        datapais["loggedInAgent"] = data[1];
        uploadEvent();
        add_row();
    }).catch(function (err) {
        console.error(err);
        showNotify("danger", err);
    });
}
function getAllDataAPIDetails() {
    let dataAPI = [];
    dataAPI.push(client.iparams.get());
    dataAPI.push(client.data.get("loggedInUser"));
    return dataAPI;
}
