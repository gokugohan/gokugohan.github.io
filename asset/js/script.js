var map,panelInfo, selectControl, countryListPanel;

var BASE_ENDPOINT_URL = "https://corona-stats.online/";
var redCircleOption = {color:"#f00000",opacity:0.85}, greenCircleOption = {color:"#00ff00",opacity:0.3};

$("#copyright-year").html(new Date().getFullYear());

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


var southWest = L.latLng(-44.46515101351963, -62.05078125000001),northEast = L.latLng(66.79190947341796, 62.05078125000001);
var mapBoundaries = L.latLngBounds(southWest, northEast);



map = L.map("map", {
    // maxBounds:mapBoundaries,
    // center:[-8.787519, 125.946401],
    // zoom:9,
    zoom: 3,
    center:[0,0],
    zoomControl: false,
    scrollWheelZoom:false,
    attributionControl: false
});
L.tileLayer(
    'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
  attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: <a href="http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer" target="_blank">Esri World_Imagery</a>'
}).addTo(map);


$("#btn-refresh").on("click",function(){
    initial_data_load();
});

function _show_quote(){
    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    M.toast({html: randomQuote, classes: 'rounded'});
}

initial_data_load();

var countryData;


function initial_data_load(){
    map.spin(true, {lines: 50, length: 100});
    $.ajax({
        url:BASE_ENDPOINT_URL + "?format=json",
        type:"get",
        success:function(response){
            // $("#loading").hide();
            countryData = response.worldStats
        
            // add_panel_info("topright",countryData);
            set_covid_data_span(countryData);
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
    }).done(function(){
        map.spin(false);
    });
} //initial_data_load

function add_panel_info(position,data){
    
    if(panelInfo!=null){
        panelInfo.remove(map);
    }

    panelInfo = L.control({ position: position });
    
    panelInfo.onAdd = function (map) {
        
        
        var div = L.DomUtil.create('div', 'info legend');
        
        var html = '<div class="card">';
        
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
        html += '<span class="owner">@Goku</span></small>';

        html += '</div>';
        html += '</div>';

        div.innerHTML = html;
        div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
        
        return div;
    };
    panelInfo.addTo(map);

} //add_panel_info



function _update_panel_country_info(data){
    // console.log(data);
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
     
     set_covid_data_span(data);
     

}// _update_panel_info

function formatNumber(x)
{
    return x.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


function set_covid_data_span(data){

    $(".disp-total-cases").html(formatNumber(data.cases));
    $(".disp-today-cases").html(formatNumber(data.todayCases));
    $(".disp-total-deaths").html(formatNumber(data.deaths));
    $(".disp-today-deaths").html(formatNumber(data.todayDeaths));
    $(".disp-recovered").html(formatNumber(data.recovered));
    $(".disp-active").html(formatNumber(data.active));
    $(".disp-critical").html(formatNumber(data.critical));
    $(".disp-cases-permillion").html(formatNumber(data.casesPerOneMillion));
    $(".disp-confirmed").html(formatNumber(data.confirmed));    
}

function draw_circle_by_country(data){
    
    var latLng  = new L.LatLng(data.countryInfo.lat, data.countryInfo.long);
    
    if(data.countryInfo.lat==0 && data.countryInfo.long==0){
        _get_latLong(data);
    }else{
        _draw_circle(data,latLng);
    }
}// draw_circle_by_country


function _draw_circle(data,latLng){
    
    let radius = (data.cases/1000)*20;// (data.cases*1.2);
    // console.log(radius);
    var cases_circle = L.circle(latLng, {
        color: redCircleOption.color,
        fillColor: redCircleOption.color,
        fillOpacity: redCircleOption.opacity,
        radius: radius
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

    // var tooltip = L.tooltip({ className: 'll-tooltip' })
    //     .setContent(tooltipContent);

    // cases_circle.bindTooltip(tooltip).openPopup();

    cases_circle.addTo(map);

    cases_circle.on("mouseover",function(){
        _update_panel_country_info(data);
    });
    cases_circle.on("mouseout",function(){
        _update_panel_country_info(countryData);
    });

}//_draw_circle



function draw_list_of_countries() {
    map.spin(true, {lines: 50, length: 100});
    let latLngs = [];

    $.ajax({
        url: "https://corona-stats.online/?format=json",
        type: "get",
        success: function (response) {
            var countries = response.data;
            var latlng;
            countries.forEach(item=>{
                draw_circle_by_country(item);
            });
            render_countries_to_tab_panel(countries);
            display_countries_data(countries);

        },
        error: function (error) {

        }
    }).done(function(){
        map.spin(false);
    });
}//draw_list_of_countries

function render_countries_to_tab_panel(countries){
    
    var html = "";
     countries.forEach(item=> {
        // console.log(item);
        var li = '<li class="collection-item avatar btn-goto-country-and-view-graph hoverable" data-country="' + item.countryCode + '" data-lat="' + item.countryInfo.lat +'" data-lng="' + item.countryInfo.long +'">' + '<img class="circle" src="' + item.countryInfo.flag + '"/>';
        li += '<span class="title">'+ item.country + '</span>';
        li += '<p><span class="blue-text">Cases ' + item.cases + '</span><br>';
        li += '<span class="green-text">Recovered '+item.recovered + '</span><br>';
        li += '<span class="red-text">Deaths '+item.deaths + '</span></p>';
        
        li += '</li>';
        html +=li;
     });

     $("#list-of-countries").html(html);


}



function _get_latLong(data){
    
    var country_code = data.countryCode;
    
    if(country_code == undefined){
        country_code = data.country;
    }
    
    console.log("Country code: " + country_code);
    if(country_code !==""){
        
        $.ajax({
            url:"https://restcountries.eu/rest/v2/alpha/" + country_code + "?fields=name;cioc;latlng",
            type:"get",
            success:function(response){
                var latLng  = new L.LatLng(response.latlng[0], response.latlng[1]);
                _draw_circle(data,latLng);
            },
            error:function(error){
                console.log("The is no associate coordenate link to " + country_code + ".Not found!");
            }
        });
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



$("body").on("keyup", "#input-search", function () {
  var value = $(this).val().toLowerCase();
  $("#list-of-countries li").show().filter(function () {
      return ($(this).text().toLowerCase().trim().indexOf(value) == -1);
  }).hide();
});


function getWorldData(){
    $.ajax({
        url: "https://corona-stats.online/TL?format=json",
        type: "get",
        success: function (response) {
            if (temp_code == global_code) {
                render_pie(response.worldStats);
                $("#modal-graph-title").html(response.country);
            } else if (temp_code == "all") {
                render_bar(response.data);
                $("#modal-graph-title").html("All countries");
            } else {
                render_pie(response.data[0]);
                $("#modal-graph-title").html(response.data[0].country);
            }
            
            $("#modal-graph").modal("open");

        },
        error: function (error) {
            Swal.fire({
               title: 'Error!',
               html: error.responseText,
               icon: 'error',
               confirmButtonText: '<i class="material-icons">thumb_down</i>'
            })
        }
    });
}



$('#btn-view-tls-table').on("click", function () {
    $("#modal-tls-table").modal("open");
});

$("#btn-view-tls-download").on("click", function () {
    $("#modal-tls-download").modal("open");
});

$('#btn-view-world-table').on("click", function () {
    $("#modal-world-table").modal("open");
});

$('#btn-view-world-graph').on("click", function () {
    $("#modal-countries").modal("open");
});


$("body").on("click",".btn-goto-country",function(){
     map.flyTo(new L.LatLng($(this).data("lat"),$(this).data("lng")),7);
     $("#modal-world-table").modal('close');
});

$("body").on("click",".btn-goto-country-and-view-graph",function(){

    $('.sidenav').sidenav('close');
    map.flyTo(new L.LatLng($(this).data("lat"),$(this).data("lng")),7);

    var code = $(this).data("country");
    var temp_code = code;
    var global_code = "world";
    if (temp_code == global_code) {
        code = "TL";
    }

    $.ajax({
        url: "https://corona-stats.online/" + code + "?format=json",
        type: "get",
        success: function (response) {
            if (temp_code == global_code) {
                render_pie(response.worldStats);
                $("#modal-graph-title").html(response.country);
            } else if (temp_code == "all") {
                render_pie(response.data);
                $("#modal-graph-title").html("All countries");
            } else {
                render_pie(response.data[0]);
                $("#modal-graph-title").html(response.data[0].country);
            }
            
            $("#modal-graph").modal("open");

        },
        error: function (error) {
            Swal.fire({
               title: 'Error!',
               html: error.responseText,
               icon: 'error',
               confirmButtonText: '<i class="material-icons">thumb_down</i>'
            })
        }
    });
});


function render_pie(data) {

    Highcharts.chart('canvas', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Covid-19 actual data ' + data.country
        },
        subtitle: {
            text: 'Source: https://www.worldometers.info/coronavirus/ & https://corona-stats.online/'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y} people</b>'
        },
        accessibility: {
            point: {
                valueSuffix: 'people'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        //var series_data = [data.cases,data.todayCases,data.deaths,data.todayDeaths,data.recovered,data.active,data.critical,data.confirmed];
        series: [{
            name: data.country,
            colorByPoint: true,
            data: [{
                name: 'Cases',
                y: data.cases,
                sliced: true,
                selected: true
            }, {
                name: 'Today cases',
                y: data.todayCases
            }, {
                name: 'Deaths',
                y: data.deaths
            }, {
                name: 'Today deaths',
                y: data.todayDeaths
            }, {
                name: 'Recovered',
                y: data.recovered
            },
            {
                name: 'Active',
                y: data.active
            },
            {
                name: 'Critical',
                y: data.critical
            },
            {
                name: 'Confirmed',
                y: data.confirmed
            }
            ]
        }]
    });
}


function display_countries_data(data) {
    var table = $("#countries-table-body");
    var html = "";

    var selectitem = '<li class="list-inline-item"><a class="waves-effect waves-teal btn-flat btn-view-graph" href="#!" data-country="world">Global</a></li>';
    data.forEach(item => {
        //selectitem += '<option value="' + item.countryCode + '">' + item.country + '</option>';
        selectitem += '<li class="list-inline-item"><a class="waves-effect waves-teal btn-flat btn-view-graph" href="#!" data-country="' + item.countryCode + '">' + item.country + '</a></li>';
        html += '<tr class="btn-goto-country" data-country="' + item.countryCode + '" data-lat="' + item.countryInfo.lat +'" data-lng="' + item.countryInfo.long +'">';
        html += "<td>" + item.country + "</td>";
        html += "<td>" + formatNumber(item.cases) + "</td>";
        html += "<td>" + formatNumber(item.deaths) + "</td>";
        html += "<td>" + formatNumber(item.todayDeaths) + "</td>";
        // html += "<td>" + formatNumber(item.critical) + "</td>";
        html += "<td>" + formatNumber(item.recovered) + "</td>";
        //html += "<td>" + item.confirmed + "</td>";


        html += "</tr>";
    });

    table.html(html);
    // $("#input-select-country").html(selectitem);
    $('#table-countries').DataTable({
        "bDestroy": true,
        "order": [[1, "desc"]]
    });
}// display_countries_data



