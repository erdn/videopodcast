/**
* Funcion llamada cuando DOM ha terminado de cargar
*/
$(document).ready(function() {
	var pos = 0,
		item = 0,
		items = 13;

	var container = $("#ul-container"),
		lista = $("#episode-list");
		

	//Asigno listener evento de teclas
	$(document).keydown(function(event){
		console.log(event.keyCode);
		
		switch(event.keyCode){
			case 38:
			// dpad up
			if(0===pos && 0 < item){
				toggleFocus(item);
				item--;
				pos--;
				scroll(item-3);
				toggleFocus(item);
			}else if(0!==pos){
				toggleFocus(item);
				item--;
				pos--;
				toggleFocus(item);
			}

			break;
			case 40:
			// dpad down
			if(3===pos && item < items){
				toggleFocus(item);
				item++;				
				scroll(item-3);
				toggleFocus(item);
			}else if(3!==pos){
				toggleFocus(item);
				item++;
				pos++;
				toggleFocus(item);
			}
			break;
			case 13:
			// enter
			//TODO con el item en el que estamos
			// extraemos los datos del objeto js y pintamos
			// donde corresponde
			break;
		}

	});

	/**
	* Funcion que hace scroll sobre elemento
	*
	* @pos Integer Elemento sobre el que queremos que el scroll
	* se desplace
	*/
	function scroll(pos){
		//magicnumber height + 2 px de bordes
		container.scrollTop(111*pos);
	}

	/**
	* Funcion que pone y quita foco 
	*
	* @pos Integer Elemento sobre el que queremos modificar
	* el foco
	*/
	function toggleFocus(pos){
		lista.children().eq(pos).toggleClass("focused");		
	}
});
/**
* Funcion a la que pasamos una url, carga el video, y cuando esta listo
* oculta distractor y reproduce el video
*
* @url String con url al video
*/
function setVideo(url){
 video.src=url;
 video.load();
 video.onload=function(){
  console.log("cargado");
  video.play();
 }();
}
