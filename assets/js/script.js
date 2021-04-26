var map, layerGroup = L.layerGroup(), panelInfo, selectControl;
var BASE_ENDPOINT_URL = "https://corona-stats.online/";
var redCircleOption = {color:"#f00000",opacity:0.85}, greenCircleOption = {color:"#00ff00",opacity:0.3};


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


/* Basemap Layers */
let baseMap = new L.TileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {attribution: 'Map data &copy; OpenStreetMap contributors'}
);

var southWest = L.latLng(-44.46515101351963, -62.05078125000001),northEast = L.latLng(66.79190947341796, 62.05078125000001);
var mapBoundaries = L.latLngBounds(southWest, northEast);



map = L.map("map", {
    // maxBounds:mapBoundaries,
    zoom: 2,
    center:[0,0],
    zoomControl: false,
    attributionControl: false
});

baseMap.addTo(map);

$("#btn-refresh").on("click",function(){
    initial_data_load();
});

function _show_quote(){
    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    M.toast({html: randomQuote, classes: 'rounded'});
}

initial_data_load();

function initial_data_load(){
    $.ajax({
        url:BASE_ENDPOINT_URL + "?format=json",
        type:"get",
        success:function(response){
            $("#loading").hide();
            var data = response.worldStats;
        
            add_panel_info("topright",data);
            draw_list_of_countries();
            _show_quote();

        },
        error:function(error){
            Swal.fire({
                title: 'Error!',
                html: error.responseText,
                icon: 'error',
                confirmButtonText: '<i class="fa fa-thumbs-down"></i>'
            })
        }
    });
} //initial_data_load


$.getJSON('asset/js/countries.geo.json', function (data) {
    L.geoJson(data, {
        style: function (feature) {
            return {color: "#ffb30f"};
        },
        onEachFeature: function (feature, layer) {
        }
    }).addTo(map);
});

var municipalityLayerItem =


function add_panel_info(position,data){
    
    if(panelInfo!=null){
        panelInfo.remove(map);
    }
    panelInfo = L.control({ position: position });
    
    panelInfo.onAdd = function (map) {
        
        
        var div = L.DomUtil.create('div', 'info legend');
        
        var html = '<div class="card hide-on-med-and-down">';
        
        html += '<div class="card-content ">';
        html += '<h3 class="card-title country-title">' + data.country +  '</h3>'
        
        html += '<ul class="summary-list">';
        html += '<li class="summary-list-item blue">Total cases: <span class="disp-total-cases">' + data.cases + '</span></li>';
        html += '<li class="summary-list-item blue lighten-2">Today cases: <span class="disp-today-cases">' + data.todayCases + '</span></li>';
        html += '<li class="summary-list-item red">Total deaths: <span class="disp-total-deaths">' + data.deaths + '</span></li>';
        html += '<li class="summary-list-item red lighten-2">Todays deaths: <span class="disp-today-deaths">' + data.todayDeaths + '</span></li>';
        html += '<li class="summary-list-item green darken-4">Recovered: <span class="disp-recovered">' + data.recovered + '</span></li>';
        html += '<li class="summary-list-item green">Active: <span class="disp-active">' + data.active + '</span></li>';
        html += '<li class="summary-list-item red">Critical: <span class="disp-critical">' + data.critical + '</span></li>';
        html += '<li class="summary-list-item red lighten-3">Cases per 1M: <span class="disp-cases-permillion">' + data.casesPerOneMillion + '</span></li>';
        html += '<li class="summary-list-item green accent-3">Confirmed: <span class="disp-confirmed">' + data.confirmed + '</span></li>';
        html += '</ul>';
        html += '<small>Source: <br> <a href="https://www.worldometers.info/coronavirus/">https://www.worldometers.info/coronavirus/</a><br><a href="https://corona-stats.online/">https://corona-stats.online/</a><br>';
        html += '<span class="owner">Helder Chebre</span></small>';

        html += '</div>';
        html += '</div>';

        div.innerHTML = html;
        div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
        
        return div;
    };
    panelInfo.addTo(map);

} //add_panel_info



function _update_panel_info(data){
    if($(window).width()<=992){
        // $('.modal').modal('open');
    }
    
    if(data.countryInfo !=undefined &&  data.countryInfo.flag != undefined){
        var html = '<div class="row valign-wrapper"><div class="col s3">'+
          '<img src="' + data.countryInfo.flag + '" alt="' + data.countryInfo.flag + '" class="responsive-img"></div>' +
          '<div class="col s9">'+'<span class="black-text">'+data.country+ '</span>'+ '</div>' + '</div>';

        $(".country-title").html(html);
        
    }else{
        $(".country-title").html(data.country);
    }
     
     $(".disp-total-cases").html(data.cases);
     $(".disp-today-cases").html(data.todayCases);
     $(".disp-total-deaths").html(data.deaths);
     $(".disp-today-deaths").html(data.todayDeaths);
     $(".disp-recovered").html(data.recovered);
     $(".disp-active").html(data.active);
     $(".disp-critical").html(data.critical);
     $(".disp-cases-permillion").html(data.casesPerOneMillion);
     $(".disp-confirmed").html(data.confirmed);

}// _update_panel_info

function draw_circle_by_country(data){
    
    var latLng  = new L.LatLng(data.countryInfo.lat, data.countryInfo.long);
    if(data.countryInfo.lat==0 && data.countryInfo.long==0){
        _get_latLong(data);
    }else{
        _draw_circle(data,latLng);
    }
}// draw_circle_by_country



function _draw_circle(data,latLng){
    
    var cases_circle = L.circle(latLng, {
        // color: redCircleOption.color,
        // fillColor: redCircleOption.color,
        // fillOpacity: redCircleOption.opacity,
        fillColor:getColor(data.cases),
        radius: data.cases
    });

    var tooltipContent = '<div class="card">';
    // tooltipContent += '<strong>' + data.country + '</strong></br>';
    // tooltipContent += '<img class="responsive-img" src="' + data.countryInfo.flag + '"/>';
    tooltipContent += '<ul class="">';
    tooltipContent += '<li class="summary-list-item blue">Total cases: <span class="disp-total-cases">' + data.cases + '</span></li>';
    tooltipContent += '<li class="summary-list-item blue lighten-2">Today cases: <span class="disp-today-cases">' + data.todayCases + '</span></li>';
    tooltipContent += '<li class="summary-list-item red">Total deaths: <span class="disp-total-deaths">' + data.deaths + '</span></li>';
    tooltipContent += '<li class="summary-list-item red lighten-2">Todays deaths: <span class="disp-today-deaths">' + data.todayDeaths + '</span></li>';
    tooltipContent += '<li class="summary-list-item green darken-4">Recovered: <span class="disp-recovered">' + data.recovered + '</span></li>';
    tooltipContent += '<li class="summary-list-item green">Active: <span class="disp-active">' + data.active + '</span></li>';
    tooltipContent += '<li class="summary-list-item red">Critical: <span class="disp-critical">' + data.critical + '</span></li>';
    tooltipContent += '<li class="summary-list-item red lighten-3">Cases per 1M: <span class="disp-cases-permillion">' + data.casesPerOneMillion + '</span></li>';
    tooltipContent += '<li class="summary-list-item green accent-3">Confirmed: <span class="disp-confirmed">' + data.confirmed + '</span></li>';
    tooltipContent += '</ul>';
    tooltipContent += '</div>';

    var tooltip = L.tooltip({ className: 'll-tooltip' })
        .setContent(tooltipContent);

    cases_circle.bindTooltip(tooltip).openPopup();

    // cases_circle.bindPopup(html).openPopup();
    cases_circle.addTo(layerGroup);

    cases_circle.on("click",function(){
        _update_panel_info(data);
    });

    map.addLayer(layerGroup);
}//_draw_circle

function getColor(d) {
    console.log(d);
    return d > 1000 ? '#800026' :
        d > 500  ? '#BD0026' :
            d > 200  ? '#E31A1C' :
                d > 100  ? '#FC4E2A' :
                    d > 50   ? '#FD8D3C' :
                        d > 20   ? '#FEB24C' :
                            d > 10   ? '#FED976' :
                                '#FFEDA0';
}

function draw_list_of_countries() {
    $.ajax({
        url: "https://corona-stats.online/?format=json",
        type: "get",
        success: function (response) {
            var countries = response.data;
            countries.forEach(item=>{
                //draw_circle_by_country(item);
            });
            render_countries_to_tab_panel(countries);
        },
        error: function (error) {

        }
    });
}//draw_list_of_countries

function render_countries_to_tab_panel(countries){
    
    var html = "";
     countries.forEach(item=> {
        var li = '<li class="collection-item avatar btn-goto-country" data-lat="' + item.countryInfo.lat +'" data-lng="' + item.countryInfo.long +'">' + '<img class="circle" src="' + item.countryInfo.flag + '"/>';
        li += '<span class="title">'+ item.country + '</span>';
        li += '<p><span class="blue-text">Cases ' + item.cases + '</span><br>';
        li += '<span class="green-text">Recovered '+item.recovered + '</span><br>';
        li += '<span class="red-text">Deaths '+item.deaths + '</span></p>';
        
        // li += '<a href="#!" class="secondary-content btn-goto-country" >';
        // li += '<i class="material-icons">details</i></a>';
        li += '</li>';
        html +=li;
     });

     $("#tab-list-of-recoveries").html(html);
}



$("body").on("click",".btn-goto-country",function(){
    var lat = $(this).data("lat");
    var lng = $(this).data("lng");

    var latLng = new L.LatLng(lat,lng);
    map.flyTo(latLng,7);
});

function _get_latLong(data){
    console.log(data);
    var country_code = data.countryCode;
    //
    // if(country_code == undefined){
    //     country_code = data.country;
    // }

    // only draw the country that has the code
    if(country_code !==""){
        $.ajax({
            url:"https://restcountries.eu/rest/v2/alpha/" + country_code + "?fields=name;cioc;latlng",
            type:"get",
            success:function(response){
                var latLng  = new L.LatLng(response.latlng[0], response.latlng[1]);
                console.log(result);
                _draw_circle(data,latLng);
            },
            error:function(error){
                console.log("The is no associate coordenate link to " + country_code + ".Not found!");
            }
        })
    }

}//_get_latLong



function _clear_layers(){
    layerGroup.clearLayers();
    if (layerGroup) {
        map.removeLayer(layerGroup);
    }  
}// _clear_layers

function _reload(){
    setInterval(function() {
        initial_data_load();
    }, 15 * 1000); // reload every 15 minutos (by default api will load the data every 15 minutes too)
}//_reload


