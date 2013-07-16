/**
* Funcion llamada cuando DOM ha terminado de cargar
*/
$(document).ready(function() {
	var pos = 0,
		item = 0,
		itemSelected =0,
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
				scroll(item);
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
			if(3===pos && item < items -1 ){
				toggleFocus(item);
				item++;				
				scroll(item-3);
				toggleFocus(item);
			}else if(3!==pos && item < items -1 ){
				toggleFocus(item);
				item++;
				pos++;
				toggleFocus(item);
			}
			break;
			case 13:
			// enter
			toggleSelect(itemSelected);
			itemSelected=item;
			toggleSelect(itemSelected);
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

	/**
	* Funcion que pone y quita borde seleccion
	*
	* @pos Integer Elemento sobre el que queremos modificar
	* el foco
	*/
	function toggleSelect(pos){
		lista.children().eq(pos).toggleClass("selected");		
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
