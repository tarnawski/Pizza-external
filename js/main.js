
// Configuration variable
//#############################################################################

//const BASIC_URL = 'https://api-orders.herokuapp.com';
const BASIC_URL = 'http://pizza.dev/app_dev.php';
const APPLICATION_ID = 1;
const GET_URL = BASIC_URL + "/ext/get/" + APPLICATION_ID;
const ORDER_URL = BASIC_URL + "/ext/order/" + APPLICATION_ID;
const PROMOCODE_URL =BASIC_URL + "/ext/promocode/" + APPLICATION_ID;
const SHOW_APP_NAME = true;
const SHOW_APP_DESC = true;

//#############################################################################

var arrayOrders = [];
var totalPrice = 0;
var totalPriceWithPromo = 0;

var vm_name;
var vm_description;
var vm_menu;
var vm_orderList;
var vm_price;
var vm_loader;
var vm_main;
var vm_promo;



$(document).ready(function () {

    vm_menu = $("#menu");
    vm_orderList = $("#order-list");
    vm_name = $("#name");
    vm_description = $("#description");
    vm_price = $("#totalPrice");
    vm_loader = $("#loader");
    vm_main = $("#main");
    vm_promo = $("#price-with-promo");

    vm_main.hide()
    $("#notEmpty").hide();
    $("#form").hide();
    $("#success").hide();
    $("#error").hide();

    fetchData();

    $("#promoCode").on('input',function() {
        var data = {
            code: $("#promoCode").val()
        };
        $.ajax({
                method: "POST",
                url: PROMOCODE_URL,
                data: JSON.stringify(data),
                dataType: "json"
            })
            .done(function( response ) {
                console.log($("#promoCode").val());
                console.log(response);
                if(response.status == 'Not found'){
                    $("#promocode-field")[0].className = 'form-group has-error';
                }else{
                    $("#promocode-field")[0].className = 'form-group has-success';
                    calculate(response);
                }
            });
    });

});

function calculate(promoCode){
    if (promoCode.overall) {
        totalPriceWithPromo = totalPrice - promoCode.value;
    } else if (promoCode.percent) {
        var discount = totalPrice/100 * promoCode.value;
        totalPriceWithPromo = totalPrice - discount;
    }
    vm_promo.html('<h3> <p class="text-success">Koszt po rabacie:' + totalPriceWithPromo.toFixed(2) + ' zł</p></h3>');
}


function fetchData() {
    $.getJSON(GET_URL, function (data) {

        hideLoader();
        if(SHOW_APP_NAME) {
            vm_name.html(data.name);
        }
        if(SHOW_APP_DESC) {
            vm_description.html(data.description);
        }
        var types = data.types;

        types.forEach(function (type) {
            vm_menu.append('<h3>' + type.name + '</h3><hr>');
            type.products.forEach(function (product) {
                vm_menu.append('<h4>' + product.name + '</h4><h5>' + product.description + '</h5>');
                product.prices.forEach(function (item) {
                    a = document.createElement('a');
                    a.innerHTML =  '<button type="button" class="btn btn-default">' + item.type + '<br>' + item.value + 'zł</button>';
                    a.onclick = function () {
                        arrayOrders.push(
                            {
                                product: product.name,
                                product_id: product.id,
                                type: item.type,
                                price: item.value,
                                price_id: item.id
                            }
                        );
                        refreshOrder(arrayOrders);
                    };
                    vm_menu.append(a);
                    vm_menu.append(' ');
                });

            })
        });
    });
}

function refreshOrder(orders) {
    vm_orderList.empty();
    vm_price.empty();

    if(orders.length != 0){
        $("#empty").hide();
        $("#notEmpty").show();



    totalPrice = 0;

    for (var i = 0; i < orders.length; i++) {
        vm_orderList.append('<div>' + (i + 1) + '. ' + orders[i].product + ' (' + orders[i].type + ') ' + '<span class="pull-right">' + orders[i].price + 'zł <a onclick="deleteItem(' + i + ')"><span class="glyphicon glyphicon-remove"></span></a></span></div>');
    }
    for (i = 0; i < orders.length; i++) {
        totalPrice += Number(orders[i].price);
    }
    vm_price.append('<h4>Całkowity koszt: ' + totalPrice.toFixed(2) + 'zł</h4>');

    } else {
        $("#empty").show();
        $("#notEmpty").hide();
        $("#form").hide();
        $("#acceptButton").show();
    }

    scrollUp();
}

function showForm() {
    $("#form").show();
    $("#acceptButton").hide();
    $("#promocode-field").hide();
}

function showPromoCodeField(){
    $("#promocode-field").show();
    $("#promocode-question").hide();
}

function submit() {
    if (validForm()) {
        sendOrder();
    }
}

function hideLoader() {
    vm_loader.hide();
    vm_main.show();
}

function deleteItem(i) {
    arrayOrders.splice(i, 1);
    refreshOrder(arrayOrders);
}

function validForm() {

    var valid = true;

    var firstNameGroup = $("#form-group-first-name")[0];
    var firstNameValue = $("#firstName").val();

    var lastNameGroup = $("#form-group-last-name")[0];
    var lastNameValue = $("#lastName").val();

    var emailGroup = $("#form-group-email")[0];
    var emailValue = $("#email").val();

    var phoneGroup = $("#form-group-phone")[0];
    var phoneValue = $("#phone").val();

    var addressGroup = $("#form-group-address")[0];
    var addressValue = $("#address").val();

    if (arrayOrders.length <= 0) {
        valid = false;
    }

    if (firstNameValue == '') {
        firstNameGroup.className += ' has-error';
        valid = false;
    } else {
        firstNameGroup.className = 'form-group has-success';
    }
    if (lastNameValue == '') {
        lastNameGroup.className += ' has-error';
        valid = false;
    } else {
        lastNameGroup.className = 'form-group has-success';
    }
    if (emailValue == '') {
        emailGroup.className += ' has-error';
        valid = false;
    } else {
        emailGroup.className = 'form-group has-success';
    }
    if (phoneValue == '') {
        phoneGroup.className += ' has-error';
        valid = false;
    } else {
        phoneGroup.className = 'form-group has-success';
    }
    if (addressValue == '') {
        addressGroup.className += ' has-error';
        valid = false;
    } else {
        addressGroup.className = 'form-group has-success';
    }

    return valid;
}


function sendOrder() {
    var data;
    data = {
        first_name: $("#firstName").val(),
        last_name: $("#lastName").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
        address: $("#address").val(),
        description: $("#additional").val(),
        promoCode: $("#promoCode").val(),
        "item": []
    };

    for (var i = 0; i < arrayOrders.length; i++) {
        data.item.push({
            "product_id": arrayOrders[i].product_id,
            "price_id": arrayOrders[i].price_id,
            "count": 1
        });
    }


    console.log(JSON.stringify(data));


    $.post( ORDER_URL, JSON.stringify(data))
        .done(function( response ) {
            $("#order").hide();
            $("#success").show();
        })
        .fail(function( response ) {
            console.log(response);
            $("#order").hide();
            $("#error").show();
    });
}

function scrollUp() {
    window.scrollTo(0, 0);
}