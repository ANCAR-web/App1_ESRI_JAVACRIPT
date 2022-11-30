//funcion que llama nuestro elemento div del map
const containermapvier = document.getElementById("viewDiv");
//agregar modulos necesario de la api de ESRI
require(["esri/config",
         "esri/Map",
         "esri/views/MapView",
         "esri/widgets/BasemapToggle",
         "esri/widgets/Locate",
         "esri/layers/FeatureLayer",
         "esri/rest/locator",
         "esri/Graphic"],(
            esriConfig,
            Map,
            MapView,
            BasemapToggle,
            Locate,
            FeatureLayer,
            locator,
            Graphic
         )=>{
        // mi apikey para poder usar los metodos de la libreria de esri 
        let apikey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";
        esriConfig.apiKey = apikey;
        //mapa base por defecto que pondre
        let mapabase1 = "arcgis-imagery";
        //usar el metodo Map para crear un mapa 
        const map = new Map({
            basemap:mapabase1
        });
        //usar el metodo MapView para crear las vistas y propiedades del mapa
        const view = new MapView({
            container: containermapvier,
            map:map,
            center:[-87.17929083855614,14.064041972386855],
            zoom:16
        });

        //agregaremos un mapa base diferente
        const basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: "arcgis-navigation"
         });

         //agregamos a nuestra variable view el objeto basemapToggle y se visualizara en el mapa
          view.ui.add(basemapToggle,"bottom-left");
        //agregaremos un botom para agregar nuestra localizacion
        const locate = new Locate({
            view: view,
            useHeadingEnabled: false,
            goToOverride: (view, options) =>{
            options.target.scale = 2000;
            return view.goTo(options.target);
            }
          });
          //agregamos el botom al mapa
          view.ui.add(locate,"top-left");

          //agregamos una capa del portal o de arcgis online pasamos como parametro el url de arcgis server
          //primero agregar un objeto que almacenara las propiedades y campos para hacer un popup
          const Popup_predios = {
            "title":"Clave catastral: {clave_cat}",
            "content":[{
                "type":"fields",
                "fieldInfos":[
                    {
                        "fieldName": "sector",
                        "label": "Sector",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {"fieldName": "manzana",
                    "label": "Manzana",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": null,
                    "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "lote",
                        "label": "Lote",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "clave_cat",
                        "label": "Clave Catastral",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "nom_col",
                        "label": "Nombre colonia",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    },
                    {
                        "fieldName": "zon_21",
                        "label": "Zona",
                        "isEditable": true,
                        "tooltip": "",
                        "visible": true,
                        "format": null,
                        "stringFieldOption": "text-box"
                    }
                ]
            }]};
         //crear una funcion para los estilos de la capa retornara un objeto que dara las propiedades de estilo
         const lotes = (value,color)=>{
            return{
                "value": value,
                "symbol": {
                          "color": color,
                          "type": "simple-fill",
                          "style": "solid",
                          "outline": {
                            "style": "1px solid black"}},
                "label": value}};
        //creamos un objeto que tendra una propiedad que recibe la funcion lote creada
        const estilo_lote = {
            type: "unique-value",
            field: "Tipo",
           uniqueValueInfos:[lotes("Area verde","#49DA13"),
                             lotes("Lote","#E0EA08"),
                             lotes("No datos","#9B0EE7"),
                             lotes("Servidumble","#EE8A09")]};

        const Lotes_Kennedy = new FeatureLayer({
                                url:"https://services7.arcgis.com/BkBWluvkeY0YU2ux/arcgis/rest/services/Kennedy/FeatureServer",
                                outFields: ["sector","manzana","lote","clave_cat","nom_col","zon_21"],
                                popupTemplate:Popup_predios,
                                renderer:estilo_lote,
                                opacity:0.5});
        map.add(Lotes_Kennedy,0);
      
        
       const array_hotel = ["Escoge ubicaciones...","Parks and Outdoors", "Coffee shop", "Gas station", "Food", "Hotel"];
       const contenedor_hoteles = document.createElement("select"," ");
       contenedor_hoteles.setAttribute("class","contenedor_hoteles");
       contenedor_hoteles.setAttribute("style",`
                                              width:200px; 
                                              heigth:150px;
                                              font-family: 'Avenir Next W00';
                                              font-size:1rem;
                                              color:white;
                                              background-color:rgba(0,0,0,0.9);`);
      array_hotel.forEach((p)=>{
      const parrafo = document.createElement("option");
      parrafo.innerHTML = p;
      contenedor_hoteles.value = p;
      contenedor_hoteles.appendChild(parrafo);});
      view.ui.add(contenedor_hoteles,"bottom-left");

     const locatorUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
     const findplaces1 = (category, pt)=>{
    locator.addressToLocations(locatorUrl,{
        location: pt,
        categories: [category],
        maxLocations: 100,
        outFields: ["Place_addr", "PlaceName"]})
        .then(function(results){
            view.popup.close();
            view.graphics.removeAll();
      
            results.forEach(function(result){
              view.graphics.add(
                new Graphic({
                  attributes: result.attributes,  
                  geometry: result.location, 
                  symbol: {
                    "type": "picture-marker",
                    "url": "https://cdn-icons-png.flaticon.com/512/854/854878.png",
                    "width": "25px",
                    "height": "25px"
                  },
                  popupTemplate: {
                    title: "{PlaceName}", 
                    content: "{Place_addr}"
                  }
               }));
            });
      
          });

 };

 view.watch("stationary", function(val) {
    if (val) {
        findplaces1(contenedor_hoteles.value, view.center);
    }
    });
    contenedor_hoteles.addEventListener('change', function (event) {
    findplaces1(event.target.value, view.center);
  });


                

        
        



});