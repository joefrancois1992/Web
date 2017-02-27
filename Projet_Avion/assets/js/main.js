/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    INF-2005 - TP2
    Author: ABIJ18039207 Joe Francois Abi Najem
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

var flightApp = new Vue({
	el: '#flight_app',
	data:{
		depart: '',
		arival: '',
		nextTown: '',
		planeSpeed: '',
		timeToleave: '',
		planeHour: '',
		sensInverse: false,
		//---------------
		udepart: '',
		uarival: '',
		escale1: '',
		escale2: '',
		escale3: '',

		//--Our Map
		canadaMap : {
			'montreal' : { 
				name : "Montréal",
				speed: 75,
				point : {
					x: 642,
					y: 720
				}
			},
			'nain' : { 
				name : "Nain",
				speed: 80,
				point : {
					x: 677,
					y: 500
				}
			},
			'albert' : { 
				name : "Albert",
				speed: 60,
				point : {
					x: 458,
					y: 125
				}
			},
			'resolute' : { 
				name : "Resolute",
				speed: 82,
				point : {
					x: 390,
					y: 275
				}
			},
			'inuvik' : { 
				name : "Invik",
				speed: 80,
				point : {
					x: 162,
					y: 313
				}
			},
			'sandylake' : { 
				name : "Sandy Lake",
				speed: 76,
				point : {
					x: 413,
					y: 637
				}
			},
			'iqajut' : { 
				name : "Iqajut",
				speed: 78,
				point : {
					x: 575,
					y: 416
				}
			},
			'dawson' : { 
				name : "Dawson",
				speed: 68,
				point : {
					x: 89,
					y: 346
				}
			},
			'vancouvert' : { 
				name : "Vancouvert",
				speed: 77,
				point : {
					x: 86,
					y: 631
				}
			},
			'fortmcmurray' : { 
				name : "Fort McMurray",
				speed: 86,
				point : {
					x: 240,
					y: 545
				}
			},
			'fornelson' : { 
				name : "Fort Nelson",
				speed: 89,
				point : {
					x: 164,
					y: 483
				}
			},
			'ottawa' : { 
				name : "Ottawa",
				speed: 90,
				point : {
					x: 612,
					y: 734
				}
			},
			'bakerlake' : { 
				name : "Baker Laque",
				speed: 69,
				point : {
					x: 382,
					y: 454
				}
			},
			'princegeorge' : { 
				name : "Prince George",
				speed: 77,
				point : {
					x: 120,
					y: 562
				}
			},
			'churchillfalls' : { 
				name : "Churchill Falls",
				speed: 83,
				point : {
					x: 683,
					y: 554
				}
			},
			'stjohns' : { 
				name : "St. John's",
				speed: 80,
				point : {
					x: 841,
					y: 572
				}
			}
		},
		userReq: [],
		waypoints: [],
		draw_ctx: '',
		distTotal: 0,
		tmpsTotal: 0,
		boostSec: 30, //boost the time
		curentTime: 0,
		dt: 0, //correspondnce dun point par rapport a la distTotal
		wpt: 1, //waypointCompter

		//--UI variables
		showPlanebox: false,
		showDepartBt: true,
		showArivalBt: false,
		showEscales: false,
		showSubmit: true,
		showRestart: false,
		showInfobox: true,
		showPlane: true,
		showBigPlane: false,
		showRecap: false,
		showError: false,
		userError: 'Error!',
		userRecap: '',

		//---Equipage
		persons: [
			{
				name: "Patrice Lumumba",
				title: "Commandant",
				img: 'assets/img/team1.jpg'
			},
			{
				name: "Angelina Joliette",
				title: "Pilote",
				img: 'assets/img/team2.jpg'
			},
			{
				name: "Leila Sabah",
				title: "Hôtesse",
				img: 'assets/img/team0.jpg'
			},
			{
				name: "Donald Krump",
				title: "copilote",
				img: 'assets/img/team3.jpg'
			},
			{
				name: "Hikram Aicha",
				title: "Technicien",
				img: 'assets/img/team4.jpg'
			},
			{
				name: "Obaidax Proul",
				title: "Équipeur",
				img: 'assets/img/team5.jpg'
			}
		]
	},

	//----Methodes-----
	methods:{
		//----------------------------------------------------------------------------
		//-- secToHms() ***Utilitaire*** fonction simple pour convertir secs en h:m:s
		//----------------------------------------------------------------------------
		secToHms: function(secs){
			secs = Number(secs);
			var h = Math.floor(secs / 3600);
			var m = Math.floor(secs % 3600 / 60);
			var s = Math.floor(secs % 3600 % 60);
			return ((h > 0 ? h + "h" + (m < 10 ? "0" : "") : "") + m + "m" )//+ (s < 10 ? "0" : "") + s);
		},

		//----------------------------------------------------------------------------
		//-- distTotal() ***Utilitaire*** Calcul la distance total a parcourir
		//----------------------------------------------------------------------------
		distTotal: function(){
			//cette fonction sert à trouver le temps restant en fonction de distTotal
			//on la retrouve dans pointsBySegment()
			var distTotal = 0;
			for (var i = 1; i < this.userReq.length; i++) {
		    	var prev_town = this.canadaMap[this.userReq[i - 1]],
					curr_town = this.canadaMap[this.userReq[i]];
		        var dx = curr_town.point.x - prev_town.point.x,
		        	dy = curr_town.point.y - prev_town.point.y;
		        distTotal += Math.sqrt( Math.pow(dx, 2) + Math.pow(dy, 2) );
		    }
		    return distTotal;
		},

		//----------------------------------------------------------------------------
		//-- occurence() ***Utilitaire*** compte le nombre doccurences dans userReq
		//----------------------------------------------------------------------------
		occurence: function(v){
			var o = 0;
			for (var i = 0; i < this.userReq.length; i++) {
				if (this.userReq[i] == v) o++;
			}
			return o;
		},

		//----------------------------------------------------------------------------
		//-- getUserRequest() Recuperer la requete du user et validations
		//----------------------------------------------------------------------------
		getUserRequest: function(){
			if(this.escale1 == '' && this.escale2 == '' && this.escale2 == ''){
				this.userError = "<p><i class='fa fa-exclamation-triangle'></i> Vous devez choisir au moins une escale!</p>";
				this.showError = true; console.log(this.userError);
				return false;
			}

			//Ajouter les villes a la file datente
			this.userReq.push(this.udepart);
			if( this.escale1 != '') this.userReq.push(this.escale1);			
			if( this.escale2 != '') this.userReq.push(this.escale2);
			if( this.escale3 != '') this.userReq.push(this.escale3);
			this.userReq.push(this.uarival);

			//Verifier si une escale a ete choisi plus dune fois ou si depart = arrival ou autres
			for (var i = 0; i < this.userReq.length; i++) {
				if(this.occurence(this.userReq[i]) > 1){
					this.userError = "<p><i class='fa fa-exclamation-triangle'></i><span>&nbsp;Instructions:</span><br>- Les escales doivent être différentes. <br>- Le départ différent de l'arrivée. <br>- Départ et Arrivé différents des escales</p>";
					this.showError = true; console.log(this.userError);
					return false;
				}
			}

			//Actualiser linfo box
			this.depart = this.canadaMap[this.udepart].name;
			this.arival = this.canadaMap[this.uarival].name;

			//Resumé de vol
			for (var i = 0; i < this.userReq.length; i++) {
				this.userRecap += "<i class='fa fa-hand-o-right'></i> ";
				this.userRecap += this.canadaMap[this.userReq[i]].name;
				this.userRecap += " <span>Vitesse: ";
				this.userRecap += this.canadaMap[this.userReq[i]].speed*10;
				this.userRecap += " km/h </span>";
				if(i != this.userReq.length -1) this.userRecap += "<br><i class='fa fa-ellipsis-v'></i><i class='fa fa-ellipsis-v fa2'></i><i class='fa fa-angle-down'></i>";
			}

			return true;
		},
		
		//----------------------------------------------------------------------------
		//-- initialize() Prepare le Canvas et trace le trajet
		//----------------------------------------------------------------------------
		initialize: function(){
			//requestAnimationFrame cross browser
			window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

			//Canvas
			var canvas = document.getElementById("canvas");
			this.draw_ctx = canvas.getContext("2d");
			this.draw_ctx.clearRect(0,0,900,843);
			this.draw_ctx.lineCap = "round";

			//-- Dessiner le trajet a parcourrir
			this.draw_ctx.lineWidth = 2;
			this.draw_ctx.strokeStyle = "red";
			this.draw_ctx.beginPath();

			//Se positionner au point de depart
			var x = this.canadaMap[this.userReq[0]].point.x,
				y = this.canadaMap[this.userReq[0]].point.y;
			this.draw_ctx.moveTo(x, y);

			//Tracer le reste du trajet (on commence la boucle a [1])
			for (var i = 1; i < this.userReq.length; i++) {
				this.draw_ctx.lineTo(this.canadaMap[this.userReq[i]].point.x, this.canadaMap[this.userReq[i]].point.y);
			}
		
			// stroke the path
			this.draw_ctx.stroke();
			console.log(this.userReq);
		},

		//----------------------------------------------------------------------------
		//-- pointsBySegment() Calcul des points sur chaque interval du trajet
		//----------------------------------------------------------------------------
		pointsBySegment: function(){
			var waypoints = [];
			//On commence la boucle a [1], car on accede a lelement precedent [i - 1]
		    for (var i = 1; i < this.userReq.length; i++) {
		    	var prev_town = this.canadaMap[this.userReq[i - 1]],	//ville precedente
					curr_town = this.canadaMap[this.userReq[i]];		//ville courrante

		        //dx et dy
		        var dx = curr_town.point.x - prev_town.point.x,
		        	dy = curr_town.point.y - prev_town.point.y;

		        //Sens de lavion
		        var sensInverse = ( dx < 0 ) ? true : false;

		        //Pour chaque interval, creer des points sur le chemin-------------------------------
		        var delta, distance,
		        	speed = curr_town.speed; // On recupere la vitesse de vol dans la ville courrante

		        //distance entre la ville courrante et la suivante: formule de la racine carre
		        distance = Math.sqrt( Math.pow(dx, 2) + Math.pow(dy, 2) );

		        //Pour que le nombre de points pour chaque interval soit proportionnel a la distance et a 
		        //la vitesse fournie, on le calcul en fonction de la distance et la vitesse de chaque ville
		        var boost = 100 //utiliser pour rendre le deplacement plus realiste
		        delta = Math.ceil(distance / speed) * boost ; //delta = nb point par segment

		        //calcul des points (waypoints)
		        for (var j = 0; j < delta; j++) {
		            var x = prev_town.point.x + dx * j / delta;
		            var y = prev_town.point.y + dy * j / delta;
		            waypoints.push({
		                x: x,
		                y: y,
		                town: curr_town.name,
		                speed: speed,
		                sensInverse : sensInverse
		            });
		        }
		    }
		    return (waypoints);
		},

		//----------------------------------------------------------------------------
		//-- animaterz() Animation avec requestAnimationFrame()
		//----------------------------------------------------------------------------
		animaterz: function(){
		    if (this.wpt < this.waypoints.length - 1) {
		        window.requestAnimationFrame(this.animaterz);
		    }

		    // tracer un segment du point precedent vers le courrant
		    this.draw_ctx.beginPath();
		    this.draw_ctx.moveTo(this.waypoints[this.wpt - 1].x, this.waypoints[this.wpt - 1].y);
		    this.draw_ctx.lineTo(this.waypoints[this.wpt].x, this.waypoints[this.wpt].y);
		    this.draw_ctx.stroke();

		    //--Deplacement de lavion et des info
		    var px = 175, py = 5 // utiliser pour ajuster #plane_box avec lorigine du deplacement
		    $("#plane_box").css({
	    		"top" : this.waypoints[this.wpt - 1].y - px,
	    		"left" : this.waypoints[this.wpt - 1].x - py
		    });

		    //--Temps restant en fonction du temps total
		    var tempRest = this.tmpsTotal - (this.dt * this.wpt * this.boostSec);

		    //--Actualiser les infos du vol
		    this.nextTown = this.waypoints[this.wpt].town;
		    this.planeSpeed = this.waypoints[this.wpt].speed * 10  + ' kmh'; // *10 pour afficher en centaine de km
		    this.sensInverse = this.waypoints[this.wpt].sensInverse;
		    
		    //--------Cette version affichera lheure en fonction du vol et peut aller audela de 24h
		    var time = this.curentTime + (this.dt * this.wpt * this.boostSec);
		    this.planeHour = this.secToHms(time);
		    //---------Pour simplifier on affichera simplement lheure systeme
		    //var d = new Date();
		    //this.planeHour = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ';

		    //--End of trajet
		    if(this.wpt == this.waypoints.length - 1){
		    	this.timeToleave = 0;
		    	this.showSubmit = false;
		    	this.showRestart = true;
		    	this.showDepartBt = false;
		    	this.showArivalBt = false;
		    	this.showEscales = false;
		    	this.showRecap = true;
		    }else{this.timeToleave = this.secToHms(tempRest);}

		    //incrementer le wpt au prochain waypoint
		    this.wpt++;
		},

		//----------------------------------------------------------------------------
		//-- processFlight() Fonction Main
		//----------------------------------------------------------------------------
		processFlight: function(){
			delete this.userReq;
			this.userReq = [];
			if( this.getUserRequest() ){
				this.showSubmit = false;
				this.showError = false;
				this.initialize();
				$('select').prop('disabled', 'disabled');

				// changer la couleur de parcours
				this.draw_ctx.lineWidth = 5;
				this.draw_ctx.strokeStyle = "green";

				this.showPlanebox = true;
				this.showPlane = true;
				this.showInfobox = true;
				this.waypoints = this.pointsBySegment();

				//distance total a parcourrir selon le trajet
				this.distTotal = Math.ceil(this.distTotal());
				//dt = correspondnce dun point par rapport a la distTotal
			    this.dt = this.distTotal / this.waypoints.length;
			    //temps total
			    this.tmpsTotal = (this.dt * this.waypoints.length) * this.boostSec;

				var d = new Date();
				this.curentTime = (d.getHours() * 3600) + (d.getMinutes() * 60) + d.getSeconds();

				//---
				var nbj = 0, hArrive_UI = '',
					hArrive = this.tmpsTotal + this.curentTime;
				var resHarrive = hArrive;
				if( hArrive > 86400 ){//86400 = 24h
					nbj = Math.trunc(hArrive/86400);
					resHarrive = hArrive - nbj*86400;
				}
				if(nbj > 0)
					hArrive_UI = (nbj == 1) ? "Lendemain à " : nbj.toString() + "ièm jour à ";
				hArrive_UI += this.secToHms(resHarrive);

			    //--------------
			    this.userRecap += "<div class='rec'><i class='fa fa-clock-o'></i> Heure de départ: <span>";
			    this.userRecap += this.secToHms(this.curentTime);

			    this.userRecap += "</span><br><i class='fa fa-clock-o'></i> Heure d'arrivée: <span>";
			    this.userRecap += hArrive_UI;

			    this.userRecap += "</span><br><i class='fa fa-clock-o'></i> Temps Total: <span>";
			    this.userRecap += this.secToHms(this.tmpsTotal);

			    this.userRecap += "</span><br><i class='fa fa-plane'></i> Distance parcourue: <span>";
			    this.userRecap += this.distTotal*this.boostSec;

			    this.userRecap += " km</span></div>";

				console.log(this.waypoints);
				this.animaterz(this.waypoints);

			}else{console.log("uh oh..., something wrong dude!!!");}
		}
	}
});
//flightApp.processFlight();

//--sliderz
$(document).ready(function(){
	var elm = "#sliderz";
	var slidePerView = 3; //defini le nombre de slides visible dans ul

	var sW = $(elm + ' ul li').outerWidth();
	var sH = $(elm + ' ul li').outerHeight();
	var nbSlide = $(elm + ' ul li').length;
	var sFullW = nbSlide * sW;
	
	//Taille de la partie visible
	$(elm).css({ width: sW*slidePerView, height: sH });
	
	//Taille réelle 
	$(elm + ' ul').css({ width: sFullW, marginLeft: - sW });
	
	//prependTo déplace l'element, il ne le copie pas. Ceci permettra de faire une boucle
	//Ex: elem.prependTo(cible) insère un élément au début de la cible ;
    $(elm + ' ul li:last-child').prependTo(elm + ' ul');

    function moveToLeft() {
        $(elm + ' ul').animate({
            left: + sW
        }, 500, function () {
            $(elm + ' ul li:last-child').prependTo(elm + ' ul');
            $(elm + ' ul').css('left', '');
        });
    };

    function moveToRight() {
        $(elm + ' ul').animate({
            left: - sW
        }, 500, function () {
            $(elm + ' ul li:first-child').appendTo(elm + ' ul');
            $(elm + ' ul').css('left', '');
        });
    };

    $(elm + ' .prev').click(function(){moveToLeft();});
    $(elm + ' .next').click(function(){moveToRight();});
});
