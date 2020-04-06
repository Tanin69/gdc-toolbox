/**
 *
 * Displays the list of missions by calling /mission/list route on the server
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
    cellData = cellData.briefingSqfFound.isOK;
    cellValue = cell.getValue();
    if (cellData===false) {
        cellValue = "";
    } else {
        cellValue ="<span class='w3-tag w3-blue w3-center'>OK</span>";
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
    window.open("/mission/show/" + cell.getData().missionPbo.val, "_blank");   
};

/* Updates data and synchronizes database */
//TODO: make a generic function
updateCol = function(event,cell) {
  
    if (confirm ("La mission est jouable: " + cell.getValue() + "\n\n\nVoulez-vous changer l'état de la mission ?")) {
        if (cell.getValue()) {
            cell.setValue(false);
        } else {
            cell.setValue(true);
        }
    }
    console.log (cell.getValue());

    queryString = ("/mission/update/" + cell.getData().missionPbo.val + "?missionIsPlayable=" + cell.getValue());
    console.log (queryString); 

    fetch(queryString, {
        method: "PUT",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(cell.getRow().getData()),
    })
    .then (function (response) {
        if (response.ok) {
            console.log(response.status);
        }
        else {
          alert(`Huho... Somethin' went wrong. Server responded :\n${response.status} (${response.message})`);
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
    ajaxURL:"/mission/list", //ajax URL
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

        {title:"Type de jeu", field:"gameType.val", width: 90, headerFilter:true, formatter: customUpcaseFmt},
        {title:"Jouable", field:"missionIsPlayable.val", width: 95, formatter:"tickCross", cellClick: updateCol},
        {title:"Titre", field:"missionTitle.val", width: 250, responsive:0},
        {title:"Briefing", field:"briefingSqfFound.isOK", width: 90, responsive:0, formatter: customBrfFmt, cellClick: callShowMission},
        //{title:"Pbo de mission", field:"missionPbo"},
        {title:"Date de publication", field:"pboFileDateM.val", align:"right", width: 140, responsive:3, formatter:"datetime", formatterParams:{outputFormat:"DD/MM/YYYY"}},
        //{title:"Taille du pbo", field:"pboFileSize", formatter:"money", formatterParams:{precision:0, thousand:" "}},
        {title:"Version", field:"missionVersion.val", width: 90, align:"right"},
        {title:"Carte", field:"missionMap.val", width: 110, headerFilter:true},
        {title:"Auteur", field:"author.val", width: 110, headerFilter:true, formatter:customFalseFmt},
        {title:"Minimum de joueurs", field:"minPlayers.val", width: 40, align:"right", responsive:3, formatter:customFalseFmt},
        {title:"Maximum de joueurs", field:"maxPlayers.val", width: 40, align:"right", responsive:3, formatter:customFalseFmt},
        //{title:"texte Mission", field:"onLoadName"},
        {title:"Texte lobby", field:"overviewText.val", width: 810, tooltip:true, responsive:3, formatter:customFalseFmt},

    ]
});
