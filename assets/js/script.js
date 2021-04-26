var BASE_ENDPOINT_URL = "https://corona-stats.online/";
var redCircleOption = {color: "#f00000", opacity: 0.85}, greenCircleOption = {color: "#00ff00", opacity: 0.3};
var map;

$(window).resize(function () {
    sizeLayerControl();
});

function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
} //sizeLayerControl

$('select').formSelect();
$('.modal').modal();
$('.fixed-action-btn').floatingActionButton();
$('.sidenav').sidenav();
$('.tabs').tabs();


let darkMap = new L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 25,
    minZoom: 1,
    id: 'mapbox/dark-v10',
    accessToken: 'pk.eyJ1IjoiaG1lbmV6ZXMiLCJhIjoiY2tsMW5jZHBiMWF2ZTJwbW9kOWFqMndzaCJ9.QvZQfwhDtaEhzZN7a2huOA'
});

map = L.map("map", {
    zoom: 9,
    center: [-8.811796526762704, 125.82092285156251],
    layers: [darkMap],
    zoomControl: false,
    attributionControl: false,
});

map.addControl(new L.Control.Fullscreen());

function _show_quote() {
    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    $(".daily-quote").html(randomQuote);
    M.toast({html: randomQuote, className: "circle"});

}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<div id="info-content"></div>';
};

info.addTo(map);

_show_quote();

// load_covid_tls_data("TL");
load_covid_all_country_data();

function load_covid_all_country_data() {
    $.ajax({
        url: BASE_ENDPOINT_URL + "?format=json",
        type: "get",
        success: function (response) {
            $("#loading").hide();
            var worldData = response.worldStats;

            var allData = response.data;
            let li = '';
            for (let i = 0; i < allData.length - 1; i++) {
                let countryData = allData[i];
                if (countryData.countryCode === "TL") {
                    let result = get_data_into_ul(countryData, false);
                    $("#info-content").html(result);
                }
                add_country_flag_to_map(countryData);

                li += '<li><a href="#!" data-lat="' + countryData.countryInfo.lat + '" ' +
                    'data-long="' + countryData.countryInfo.long + '" ' +
                    'class="waves-effect view-country-data">' +
                    '<img class="responsive-img country-flag" src="' + countryData.countryInfo.flag + '"/>' +
                    '<span class="country-name"> ' + countryData.country + ' (' + formatNumber(countryData.cases) + ')</span></a></li>';
            }
            $("#list-of-countries").html(li);

            Swal.fire({
                title: 'World',
                html: get_data_into_ul(worldData, true),
                icon: 'success'
            });


        },
        error: function (error) {
            Swal.fire({
                title: 'Error!',
                html: error.responseText,
                icon: 'error',
                confirmButtonText: '<i class="fa fa-thumbs-down"></i>'
            })
        }
    }).done(function () {
        hidePreLoader();
    });
} //load_covid_all_country_data


function get_data_into_ul(data, isWorldData) {

    let html = '<ul class="covid-list">';
    if (!isWorldData) {
        html += "<li class='covid-list-item'>" + data.country + "</li>";
    }
    html += "<li class='covid-list-item'>Active: " + formatNumber(data.active) + "</li>";
    html += "<li class='covid-list-item'>Cases: " + formatNumber(data.cases) + "</li>";
    html += "<li class='covid-list-item'>Today cases: " + formatNumber(data.todayCases) + "</li>";
    html += "<li class='covid-list-item'>deaths: " + formatNumber(data.deaths) + "</li>";
    html += "<li class='covid-list-item'>Today deaths: " + formatNumber(data.todayDeaths) + "</li>";
    html += "<li class='covid-list-item'>Critical: " + formatNumber(data.critical) + "</li>";
    html += "<li class='covid-list-item'>Recovered: " + formatNumber(data.recovered) + "</li>";

    if (!isWorldData) {
        html += "<li class='covid-list-item'>Today recovered: " + formatNumber(data.todayRecovered) + "</li>";

        html += "<li class='covid-list-item'>Tests: " + formatNumber(data.tests) + "</li>";
        html += "<li class='covid-list-item'>Population: " + formatNumber(data.population) + "</li>";
    }


    html += "<li class='covid-list-item'>Confirmed: " + formatNumber(data.confirmed) + "</li>";


    html += '</ul>';
    return html;


} //get_data_into_ul

function add_country_flag_to_map(data) {

    const markerIcon = L.icon({
        iconUrl: data.countryInfo.flag,
        iconSize: [35, 30], // size of the icon
        iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
    });

    var marker = L.marker([data.countryInfo.lat, data.countryInfo.long], {
        icon: markerIcon
    });

    let html = get_data_into_ul(data);
    marker.bindPopup(html);

    marker.on("mouseover", function () {
        marker.openPopup();
    });
    marker.on("mouseout", function () {
        marker.closePopup();
    });
    marker.addTo(map);
} //add_country_flag_to_map

$("body").on("keyup", "#btn-search-country", function () {
    var value = $(this).val().toLowerCase();
    console.log(value);
    $("#list-of-countries li").show().filter(function () {
        return ($(this).text().toLowerCase().trim().indexOf(value) == -1);
    }).hide();
});

$("body").on("click", ".view-country-data", function () {
    map.flyTo([$(this).data("lat"), $(this).data("long")], 7);
});
$("body").on("click", "#btn-disclaimer", function () {
    Swal.fire({
        title: 'Disclaimer!',
        text: 'Please remind that you can copy the source code and customize it according to your needs and there is no need to contact me. If ' +
            'you wish to learn how develop this kind of application then then you are welcome too contact me to help you, other wise #laolakontihadeit.',
        imageUrl: 'assets/images/matebian.jpg',
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
    });
});

function formatNumber(n) {
    return Intl.NumberFormat('id').format(n);
}

function showPreLoader() {
    $(".please-wait").css('display', 'block');
    $(".load-wrapper").css('opacity', 1);
}

function hidePreLoader() {
    $(".please-wait").css('display', 'none');
    $(".load-wrapper").css('opacity', 0);
}
