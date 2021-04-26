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

function _reload(){
    setInterval(function() {
        initial_data_load();
    }, 15 * 1000); // reload every 15 minutos (by default api will load the data every 15 minutes too)
}//_reload


