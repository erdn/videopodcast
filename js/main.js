/**
 * Funcion llamada cuando DOM ha terminado de cargar
 */
$(document).ready(function() {
    /* variables  */
    var videoPodcast = 'http://localhost/services/podcasting/ac360/rss.xml',
        pos = 0,
        itemPos = 0,
        itemSel = 0,
        itemNum = 0,
        container = $('#ul-container'),
        lista = $('#episode-list'),
        description = $('#video-description'),
        podcast = {},
        xhr = new XMLHttpRequest(),
        namespaces = {};
        

    /* llamadas inicializacion */
    
    
    //Asigno listener evento de teclas
    $(document).keydown(keyDownListener);

    //recupero el rss
    fetchRSS(videoPodcast);
    
    /* funciones privadas */
    
    /**
    * Listener pulsaciones teclado
    */
    function keyDownListener(event){
        var keyCode = (event.keyCode ? event.keyCode : event.which);
        console.log(keyCode);

        switch (keyCode) {
            case 38:
                // dpad up
                dpadUp();
                break;

            case 40:
                // dpad down
                dpadDown();
                break;
            case 13:
                // enter
                dpadEnter();
                break;
        }

    }
    
    /**
    * Pulsada tecla dpad up
    */
    function dpadUp() {
        if (0 === pos && itemPos > 0) {
            toggleFocus(itemPos);
            itemPos--;
            scroll(itemPos);
            toggleFocus(itemPos);
        } else if (0 !== pos) {
            toggleFocus(itemPos);
            itemPos--;
            pos--;
            toggleFocus(itemPos);
        }
    }

    /**
    * Pulsada tecla dpad down
    */

    function dpadDown() {
        if (3 === pos && itemPos < itemNum - 1) {
            toggleFocus(itemPos);
            itemPos++;
            scroll(itemPos - 3);
            toggleFocus(itemPos);
        } else if (3 !== pos && itemPos < itemNum - 1) {
            toggleFocus(itemPos);
            itemPos++;
            pos++;
            toggleFocus(itemPos);
        }
    }

    /**
     * Pulsada tecla dpad enter
     */
    function dpadEnter() {
        toggleSelect(itemSel);
        itemSel = itemPos;
        toggleSelect(itemSel);

        //pongo descriptcion y video
        description.html(podcast.items[itemPos].description);
        setVideo(podcast.items[itemPos].media);        
    }

    /**
    * Metodo que obtiene el rss y genera un objeto JS
    * con el mismo
    */
    function fetchRSS(url){
               
        //ponemos ruta y enviamos peticon
        xhr.open('GET', url);
        xhr.onreadystatechange = stateChange;
        xhr.send();
    }

    /**
    * Funcion llamada cuando cambia el estado de la conexion
    * async
    */
    function stateChange() {
        if (4 === this.readyState && 200 === this.status) {
            var item = {},              
                xml = this.responseXML,
                attr,
                xmlItems,
                i;

            //extraemos los posibles ns
            namespaces = getNameSpaces(xml);
            
            //extramos los valores del videopodcast
            podcast.title = getTagNameValue("title", xml);
            podcast.description = getTagNameValue("description", xml);
            
            //creamos array para los objetos de item
            podcast.items = [];

            xmlItems = xml.getElementsByTagName("item");

            for (i = 0; i < xmlItems.length; i++) {
                //inicializamos objeto item
                item = {}

                //extraemos los valores y atributos de tags
                item.title = getTagNameValue("title", xmlItems[i]);
                item.pubDate = getTagNameValue("pubDate", xmlItems[i]);
                item.description = getTagNameValue("description", xmlItems[i]);
                item.media = getTagNameAttribute("media:content","url",xmlItems[i]);
                
                //encolamos en array
                podcast.items.push(item);
            }

            // numero maximo de episodios
            itemNum = podcast.items.length;

            // datos de video podcast
            $('#podcast-title').html(podcast.title);
            $('#podcast-description').html(podcast.description);

            // lista de videos, descripcion selecion y foco al primer elemento            
            $("#episode-list").html(Handlebars.templates.item(podcast));
            description.html(podcast.items[itemPos].description);                       
            toggleFocus(itemPos);
            toggleSelect(itemSel);
        }
    }

    /**
    * Funcion que mapea xmlns:ns con su url
    * para poder buscar tags de forma simplificada
    * @xml documento xml de donde se extraeran los xmlns
    *
    * @return namespaces objeto key(ns) value (url ns)
    */
    function getNameSpaces(xml){
        var namespaces = {},
            attr = xml.documentElement.attributes;
        
        for (i=0;i<attr.length;i++){
            namespaces[attr[i].name.split(":")[1]]=attr[i].value;               
        }

        return namespaces;
    }

    /**
     * @tag tag del que queremos extraer su valor
     * @xml
     *
     * @return String Valor del tag o "" si error
     */
    function getTagNameValue(tag, xml) {
        var aux,
            ns,
            retorno;
        
        try{
            //extraemos tag y ns        
            aux = tag.split(":");
            
            if(aux.length>1){
                //hay mas de 1 elemento, ns
                ns=namespaces[aux[0]];
                retorno = xml.getElementsByTagNameNS(ns,aux[1])[0].textContent.toString();
            }else{
                retorno = xml.getElementsByTagName(tag)[0].textContent.toString();
            }
        }catch(e){
            console.log("error recuperando valor "+e);
            retorno = "";
        }

        return retorno;
    }


    /**
     *
     *
     * @tag String Tag del que queremos extraer su valor
     * @attribute String atributo que queremos recuperar
     * @xml 
     *
     * @return String Valor del tag o "" si error
     */
    function getTagNameAttribute(tag,attribute, xml) {
        var aux,
            ns,
            retorno;
        
        try{
            aux = tag.split(":");
            
            if(aux.length>1){
                ns=namespaces[aux[0]];
                retorno = xml.getElementsByTagNameNS(ns,aux[1])[0].getAttribute(attribute);
            }else{
                retorno = xml.getElementsByTagName(tag)[0].getAttribute(attribute);
            }
        }catch(e){
            console.log("error recuperado atributo "+e);
            retorno = "";
        }
        
        return retorno;
    }

    /**
     * Funcion que hace scroll sobre elemento
     *
     * @pos Integer Elemento sobre el que queremos que el scroll
     * se desplace
     */

    function scroll(pos) {
        //magicnumber height + 2 px de bordes
        container.scrollTop(111 * pos);
    }

    /**
     * Funcion que pone y quita foco
     *
     * @pos Integer Elemento sobre el que queremos modificar
     * el foco
     */

    function toggleFocus(pos) {
        lista.children().eq(pos).toggleClass("focused");
    }

    /**
     * Funcion que pone y quita borde seleccion
     *
     * @pos Integer Elemento sobre el que queremos modificar
     * el foco
     */

    function toggleSelect(pos) {
        lista.children().eq(pos).toggleClass("selected");
    }

   
});
/**
 * Funcion a la que pasamos una url, carga el video, y cuando esta listo
 * oculta distractor y reproduce el video
 *
 * @url String con url al video
 */

function setVideo(url) {
    video.src = url;
    video.load();
    video.onload = function() {
        console.log("cargado");
        video.play();
    }();
}
