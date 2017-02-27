/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    INF-2005 - TP1
    Author: ABIJ18039207 Joe Francois Abi Najem
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

$(document).ready(function(){
	//------------
	$(".socs_icons a").click(function(){
		event.preventDefault();
	});
	//------------
	$('.navlink').click(function(event) {
		event.preventDefault();
		//var target = $(this).data('target')
        //$('html,body').animate({scrollTop: ($(target).offset().top - 105)}, 600, 'easeInOutExpo');
    });

    //------------
    var choices = [
    	{
	    	'title': "Pâtes 19.99$",
	    	'img' : "assets/img/pates.jpg",
	    	'price': 19.99
	    },
	    {
	    	'title': "Pizzas 14.99$",
	    	'img' : "assets/img/pizza.jpg",
	    	'price': 14.99
	    },
	    {
	    	'title': "Hamburgers 9.99$",
	    	'img' : "assets/img/hamb.jpg",
	    	'price': 9.99
	    }
    ];

 	var garnitures = [
    	{
	    	'title': "Peperoni",
	    	'price': 5
	    },
	    {
	    	'title': "Olives",
	    	'price': 3
	    },
	    {
	    	'title': "Bacon",
	    	'price': 6
	    },
	    {
	    	'title': "Jambon",
	    	'price': 4
	    }
    ];
    //console.log(garnitures);

    //---Choice
    $(".cmd_wrap aside .block").click(function(){
    	var id = parseInt($(this).data('choice'));
    	$(".cmd_container .cmd h3").text(choices[id].title);
    	$(".cmd_container .thmb img").attr('src', choices[id].img);
    	$(".none").slideUp();
    	if( !$(".cmd_container .order").is(":visible") ) $(".next_btn").slideDown();
    	$(".cmd_container .order").slideDown();
    	$("#hid_choiceID")[0].value = id;

    	$(".cmd_wrap aside .block").removeClass('bxselect');
    	$(this).addClass('bxselect');
    })

    //----Next step
    $(".next_btn .inkbtn").click(function(){
    	$(this).parent().slideUp();
    	$(".step2, .submit_btn").slideDown();
    })

    //----print
    $("#fact_print").click(function(){
    	//$(".bill_wraper").print();
    	window.print();
    })


    //---Submit Process--------------------------------------------------------------------
	var restaurant_address = '405 Rue Sainte-Catherine Est, Montréal';
    var grand_total = 0, total = 0, total_garniture = 0, qty = 1, dest_adress = '';

    $("#cmdOrder").submit(function(e){
    	e.preventDefault();
    	var dataz = $(this).serializeArray();

    	$.each(dataz, function(index, data){
    		if(data.name == "nom")
    			$(".bill .infos .name b").text(data.value);
    		if(data.name == "mail")
    			$(".bill .infos .mail b").text(data.value);
    		if(data.name == "phone")
    			$(".bill .infos .tel b").text(data.value);

    		if(data.name == "choice"){
    			$(".bill table.items .nourit .f").text("Nourriture - " + choices[data.value].title);
    			$(".bill table.items .nourit .s").text(choices[data.value].price + "$");
    			$(".bill .fact .thmb img").attr('src', choices[data.value].img);
    			total = choices[data.value].price;
    		}
    		if(data.name == "garniture"){
    			$(".bill table.items").append("<tr><td class=f>Garniture - "+ garnitures[data.value].title + "</td><td class=s>" + garnitures[data.value].price + "$</td></tr>");
    			total_garniture += garnitures[data.value].price;
    			//console.log(garnitures[data.value]);
    		}

    		if(data.name == "qty"){
    			$(".bill .infos .qty b").text(data.value);
    			qty = data.value;
    		}

    		if(data.name == "adress"){
    			dest_adress = data.value;
    			$(".bill .driection .dest b").text(dest_adress);
    		}
    	});

    	total += total_garniture;
    	grand_total += total * qty;
    	$(".bill table.total .s").text(Math.round(total*100)/100 + " * " + qty + " = " + Math.round(grand_total*100)/100);


    	$(".cmd_wrap, .instruc span, .instruc p").slideUp();
   		$(".bill").slideDown();
    	setTimeout(function(){
    		$(".bill .spin").hide();
    		$(".bill .bill_wraper").slideDown();
    		get_direction(dest_adress);
    		$('html,body').animate({scrollTop: ($('.big_wrapper').offset().top)}, 1000, 'easeInOutExpo');
    	}, 2100);
    })

   		//$(".bill").slideDown();
		//$(".bill .bill_wraper").slideDown();
		//get_direction('Montreal');
    //-----GMAP API
    function get_direction(destination){
		var dirService = new google.maps.DirectionsService();
		var dirDisplay = new google.maps.DirectionsRenderer();

		var map = new google.maps.Map(document.getElementById('mappz'), {
			zoom:7,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoomControl: true,
			scaleControl: false,
			scrollwheel: false
		});

		dirDisplay.setMap(map);
		dirDisplay.setPanel(document.getElementById('mapdir'));

		var request = {
			origin: restaurant_address, 
			destination: destination,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

		dirService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				dirDisplay.setDirections(response);
			}else{
				alert("Direction non trouvé");
			}
		});
    }
});