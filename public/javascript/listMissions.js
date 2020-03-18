customFalseFmt = function(cell){
    var cellValue = cell.getValue();
    var cellElement = cell.getElement();
    if (cellValue === "false" || cellValue === "") {
        return "<span style='font-style: italic'>Non renseigné</span>";
    }
    else {
        return cell.getValue();
    }
};


const table = new Tabulator("#missionsList", {
    ajaxURL:"/missions/list", //ajax URL
    placeholder:"No Data Available",
    //height:400,
    //layout:"fitDataStretch",
    movableColumns: true,
    /*
    persistence:{
        sort:true,
        filter:true,
        columns:true,
    },
    */
    columns:[
        {title:"Type de jeu", field:"gameType", headerFilter:true, formatter:customFalseFmt},
        {title:"Jouable", field:"missionIsPlayable", formatter:"tickCross"},
        {title:"Titre", field:"missionTitle", formatter:"link"},
        //{title:"Pbo de mission", field:"missionPbo"},
        {title:"Date de publication", field:"pboFileDateM", align:"right", formatter:"datetime", formatterParams:{outputFormat:"DD/MM/YYYY"}},
        //{title:"Taille du pbo", field:"pboFileSize", formatter:"money", formatterParams:{precision:0, thousand:" "}},
        {title:"Version", field:"missionVersion", align:"right"},
        {title:"Carte", field:"missionMap", headerFilter:true},
        {title:"Auteur", field:"author", headerFilter:true, formatter:customFalseFmt},
        {title:"Minimum de joueurs", field:"minPlayers", align:"right", formatter:customFalseFmt},
        {title:"Maximum de joueurs", field:"maxPlayers", align:"right", formatter:customFalseFmt},
        //{title:"texte Mission", field:"onLoadName"},
        {title:"Texte lobby", field:"overviewText", formatter:customFalseFmt},

    ]
});