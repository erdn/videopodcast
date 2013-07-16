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
