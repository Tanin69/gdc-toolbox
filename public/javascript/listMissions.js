/**
 *
 * Displays the list of missions by calling /missions/list route on the server
 */

/* Custom formatters */

customFalseFmt = function(cell){
    var cellValue = cell.getValue();
    if (cellValue === "false" || cellValue === "") {
        return "<span style='font-style: italic'>Non renseigné</span>";
    }
    else {
        return cell.getValue();
    }
};

customBrfFmt = function(cell) {
    cellData = cell.getData();
    cellData = cellData.missionBriefing;
    cellValue = cell.getValue();
    if (cellData !== "" || cellData === null) {
        cellValue ="<span class='w3-tag w3-blue'>Click me !</span>";
    } else {
        cellValue = "";
    }
    //console.log(cellData);
    //console.log(cellValue);
    return cellValue;
};

customUpcaseFmt = function(cell) {
    return cell.getValue().toUpperCase(); 
};

/* Calls briefing render */

callShowMission = function(e,cell) {
    window.open("/missions/show/" + cell.getData().missionPbo, "_blank");   
};

/* Updates data and synchronizes database */
updateCol = function(event,cell) {
  
    if (confirm ("La mission est jouable: " + cell.getValue() + "\n\n\nVoulez-vous changer l'état de la mission ?")) {
        if (cell.getValue()) {
            cell.setValue(false);
        } else {
            cell.setValue(true);
        }
    }

    //console.log (cell.getRow().getData());

    fetch("/missions/add/confirm", {
        method: "POST",
        headers: { "content-type": "application/json"},
        body: JSON.stringify(cell.getRow().getData()),
    })
    .then (function (response) {
        if (response.ok) {
            console.log(response.status);
        }
        else {
          alert(`Huho... Somethin' went wrong. Server has responded :\n${response.status} (${response.message})`);
          console.log(response.status);
          cell.setValue().cell.getOldValue();
        }
    })
    .catch(function(error) {
        console.log("Error:" + error.status);
    });

};


/* Tabulator construct */

const table = new Tabulator("#missionsList", {
    ajaxURL:"/missions/list", //ajax URL
    placeholder:"No Data Available",
    layout:"fitColumns",
    responsiveLayout:"collapse",
    movableColumns: true,

    persistence:{
        sort:true,
        filter:true,
        columns:true,
    },

    columns:[

        {title:"Type de jeu", field:"gameType", width: 90, headerFilter:true, formatter: customUpcaseFmt},
        {title:"Jouable", field:"missionIsPlayable", width: 95, formatter:"tickCross", cellClick: updateCol},
        {title:"Titre", field:"missionTitle", width: 250, responsive:0},
        {title:"Briefing", field:"missionBriefing", width: 90, responsive:0, formatter: customBrfFmt, cellClick: callShowMission},
        //{title:"Pbo de mission", field:"missionPbo"},
        {title:"Date de publication", field:"pboFileDateM", align:"right", width: 140, responsive:3, formatter:"datetime", formatterParams:{outputFormat:"DD/MM/YYYY"}},
        //{title:"Taille du pbo", field:"pboFileSize", formatter:"money", formatterParams:{precision:0, thousand:" "}},
        {title:"Version", field:"missionVersion", width: 90, align:"right"},
        {title:"Carte", field:"missionMap", width: 110, headerFilter:true},
        {title:"Auteur", field:"author", width: 110, headerFilter:true, formatter:customFalseFmt},
        {title:"Minimum de joueurs", field:"minPlayers", width: 40, align:"right", responsive:3, formatter:customFalseFmt},
        {title:"Maximum de joueurs", field:"maxPlayers", width: 40, align:"right", responsive:3, formatter:customFalseFmt},
        //{title:"texte Mission", field:"onLoadName"},
        {title:"Texte lobby", field:"overviewText", width: 810, tooltip:true, responsive:3, formatter:customFalseFmt},

    ]
});
