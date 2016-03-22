// Configuration variable
const BASIC_URL = 'http://api-orders.herokuapp.com';
const APPLICATION_ID = 5;

var GET_URL = BASIC_URL + "/ext/get/" + APPLICATION_ID;
var ORDER_URL = BASIC_URL + "/ext/order/" + APPLICATION_ID;



var arrayOrders = [];

var vm_name;
var vm_escription;
var vm_menu;
var vm_orderList;
var vm_price;

$(document).ready(function () {

    vm_menu = $("#menu");
    vm_orderList = $("#order-list");
    vm_name = $("#name");
    vm_escription = $("#description");
    vm_price = $("#totalPrice");

    $("#notEmpty").hide();
    $("#form").hide();
    $("#success").hide();
    $("#error").hide();

    fetchData();

});

function fetchData() {
    $.getJSON(GET_URL, function (data) {

        vm_name.html(data.name);
        vm_escription.html(data.description);

        var types = data.types;

        types.forEach(function (type) {
            vm_menu.append('<h3>' + type.name + '</h3><hr>');
            type.products.forEach(function (product) {
                vm_menu.append('<h4>' + product.name + '</h4><h5>' + product.description + '</h5>');
                product.prices.forEach(function (item) {
                    a = document.createElement('a');
                    a.innerHTML = item.type + ' (' + item.value + 'zł )';
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
    $("#empty").hide();
    $("#notEmpty").show();


    vm_orderList.empty();
    vm_price.empty();

    var totalPrice = 0;

    for (var i = 0; i < orders.length; i++) {
        vm_orderList.append('<div>' + (i + 1) + '. ' + orders[i].product + ' (' + orders[i].type + ') ' + '<span class="pull-right">' + orders[i].price + 'zł</span></div>');
    }
    for (i = 0; i < orders.length; i++) {
        totalPrice += Number(orders[i].price);
    }
    vm_price.append('<h4>Całkowity koszt: ' + totalPrice + 'zł</h4>');
}

function showForm() {
    $("#form").show();
    $("#acceptButton").hide();
}

function submit() {
    if (validForm()) {
        sendOrder();
    }
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
