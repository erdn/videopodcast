/**
 * Funcion llamada cuando DOM ha terminado de cargar
 */
$(document).ready(function() {
    /* variables  */

    //var videoPodcast = 'http://rss.cnn.com/services/podcasting/ac360/rss.xml',
    var videoPodcast = 'http://rss.cnn.com/services/podcasting/cnnnewsroom/rss.xml',
        originalDomain = 'http://rss.cnn.com/',
        localDomain = 'http://rss.videopodcast/',
        container = $('#ul-container'),
        description = $('#video-description'),
        listPos = 0,
        itemList = $('#episode-list'),
        itemPos = 0,
        itemSel = 0,
        itemNum = 0,
        socialList = $('#social'),
        social = false,
        socialPos = 0,
        socialNum = socialList.children().length,
        podcast = {},
        itemHeight = 0,        
        scrollStep = 0;


    /* llamadas inicializacion */

    // listener evento de teclas, boton up + boton down, enter lista
    $(document).keydown(keyDownListener);

    $('#up-arrow').click(dpadUp);
    $('#down-arrow').click(dpadDown);
    itemList.click(itemClick);

    //recupero el rss, transformando la url en local para proxy    
    $.get(videoPodcast.replace(originalDomain, localDomain))
        .done(rssFetch)
        .fail(function(e) {console.log("error obteniendo rss "+e);});


    /* funciones privadas */

    /**
     * Listener pulsaciones teclado
     */

    function keyDownListener(event) {
        //compatibilidad entre browsers
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

            case 39:
                // dpad right
                dpadRight();
                break;

            case 37:
                // dpad left
                dpadLeft();
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
        if (!social) {
            if (0 === listPos && itemPos > 0) {
                toggleFocus(itemPos);
                itemPos--;
                scrollToPosition(itemPos);
                toggleFocus(itemPos);
                scrollStep--;
            } else if (0 !== listPos) {
                toggleFocus(itemPos);
                itemPos--;
                listPos--;
                toggleFocus(itemPos);
            }
        }
    }


    /**
     * Pulsada tecla dpad down
     */

    function dpadDown() {
        if (!social) {
            if (3 === listPos && itemPos < itemNum - 1) {
                toggleFocus(itemPos);
                itemPos++;
                scrollToPosition(itemPos - 3);
                toggleFocus(itemPos);
                scrollStep++;
            } else if (3 !== listPos && itemPos < itemNum - 1) {
                toggleFocus(itemPos);
                itemPos++;
                listPos++;
                toggleFocus(itemPos);
            }
        }
    }

    /**
     * Pulsada tecla dpad up
     */

    function dpadRight() {
        //si social y no nos pasamos del maximo
        if (social && socialPos < socialNum - 1) {
            //avanzamos a la derecha
            toggleSocialFocus(socialPos);
            socialPos++;
            toggleSocialFocus(socialPos);
        } else if (!social) {
            //nos metemos en social
            social = !social;
            toggleFocus(itemPos);
            toggleSocialFocus(socialPos);
        }
    }

    /**
     * Pulsada tecla dpad up
     */

    function dpadLeft() {
        if (social && 0 === socialPos) {
            //volvemos a lista
            social = !social;
            toggleFocus(itemPos);
            toggleSocialFocus(socialPos);
        } else if (social) {
            toggleSocialFocus(socialPos);
            socialPos--;
            toggleSocialFocus(socialPos);
        }
    }


    /**
     * Pulsada tecla dpad enter
     */

    function dpadEnter() {
        if (social) {
            window.location.href = socialList.children().eq(socialPos).find('a').attr('href');
        } else {
            toggleSelect(itemSel);
            itemSel = itemPos;
            toggleSelect(itemSel);

            //pongo descriptcion y video
            description.html(podcast.items[itemPos].description);
            setVideo(podcast.items[itemPos].media);
        }
    }

    /**
    * Llamada cuando evento sobre item lista episodios
    */
    function itemClick(event){        
        //extraigo la posicion de la lista del elemento clickeado
        var auxPos = $(event.target).closest("li").index();

        if (social){
            toggleSocialFocus(socialPos);
            socialPos=0;
            toggleSelect(itemSel);
            social = !social;
        }else{            
            toggleFocus(itemPos);            
            toggleSelect(itemSel);
        }
        //Solucion para que funcione tal cual esta
        itemPos = auxPos;
        itemSel = auxPos;
        toggleFocus(itemPos);            
        toggleSelect(itemSel);

        //pongo la posicion sobre la lista visible, para
        //poder recuperar navegacion con teclado
        listPos = auxPos - scrollStep;

        dpadEnter();        
    }


    /**
     * Funcion asincrona llamada cuando $.get(url) ha terminado
     */

    function rssFetch(xml) {
        var item = {},
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
            item.media = getTagNameAttribute("media:content", "url", xmlItems[i]);

            //encolamos en array
            podcast.items.push(item);
        }

        // numero maximo de episodios
        itemNum = podcast.items.length;

        // datos de video podcast
        $('#podcast-title').html(podcast.title);
        $('#podcast-description').html(podcast.description);

        // renderizo template, inserto, foco + select a #0 + inserto selecion
        itemList.html(Handlebars.templates.item(podcast));
        description.html(podcast.items[itemPos].description);
        toggleFocus(itemPos);
        toggleSelect(itemSel);

        // extraigo valor de elemento en lista
        itemHeight=itemList.children().eq(0).outerHeight()

    }


    /**
     * Funcion que mapea xmlns:ns con su url
     * para poder buscar tags de forma simplificada
     * @xml documento xml de donde se extraeran los xmlns
     *
     * @return namespaces objeto key(ns) value (url ns)
     */

    function getNameSpaces(xml) {
        var namespaces = {},
            attr = xml.documentElement.attributes;

        for (i = 0; i < attr.length; i++) {
            namespaces[attr[i].name.split(":")[1]] = attr[i].value;
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

        try {
            //extraemos tag y ns        
            aux = tag.split(":");

            if (aux.length > 1) {
                //hay mas de 1 elemento, ns
                ns = namespaces[aux[0]];
                retorno = xml.getElementsByTagNameNS(ns, aux[1])[0].textContent.toString();
            } else {
                retorno = xml.getElementsByTagName(tag)[0].textContent.toString();
            }
        } catch (e) {
            console.log("error recuperando valor " + e);
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

    function getTagNameAttribute(tag, attribute, xml) {
        var aux,
            ns,
            retorno;

        try {
            aux = tag.split(":");

            if (aux.length > 1) {
                ns = namespaces[aux[0]];
                retorno = xml.getElementsByTagNameNS(ns, aux[1])[0].getAttribute(attribute);
            } else {
                retorno = xml.getElementsByTagName(tag)[0].getAttribute(attribute);
            }
        } catch (e) {
            console.log("error recuperado atributo " + e);
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

    function scrollToPosition(pos) {
        // +2px para que la lista no se desplace
        container.scrollTop((itemHeight +2 ) * pos);
    }


    /**
     * Funcion que pone y quita foco
     *
     * @pos Integer Elemento sobre el que queremos modificar
     * el foco
     */

    function toggleFocus(pos) {
        itemList.children().eq(pos).toggleClass("focused");
    }

    /**
     * Funcion que pone y quita foco a iconos sociales
     *
     * @pos Integer Elemento sobre el que queremos modificar
     * el foco
     */

    function toggleSocialFocus(pos) {
        socialList.children().eq(pos).toggleClass("focused-social");
    }


    /**
     * Funcion que pone y quita borde seleccion
     *
     * @pos Integer Elemento sobre el que queremos modificar
     * el foco
     */

    function toggleSelect(pos) {
        itemList.children().eq(pos).toggleClass("selected");
    }


    /**
     * Funcion a la que pasamos una url, carga el video, y cuando esta listo
     * oculta distractor y reproduce el video
     *
     * @url String con url al video
     */

    function setVideo(url) {
        video.src = url;
        video.play();
        //fix para video
        setTimeout(function(){$("#fix").toggle();},2000);
    }
});
