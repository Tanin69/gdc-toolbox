var servResponse = "";

Dropzone.options.myDZ = {
  //Client side controls
  maxFiles: 1,
  acceptedFiles: ".pbo",
  maxFilesize: 20, // MB
  dictDefaultMessage: "Pbo dropzone here ! (or click to choose a file)",

  init: function() {
  
    // The file was correctly analyzed, eventually with mission  : we open a modal that displays mission infos : 202 if errors, 200 if no error.
    this.on("success", function(file, response) {
      /*Important trick : these two lines of code print function arguments in the console !
      var args = Array.prototype.slice.call(arguments);
      console.log(args); 
      */
      //console.log(file.xhr.status);
      //console.log(response);
      servResponse = response;
      if (file.xhr.status === 202) {
        //Server response : we get a 202 if any control has failed
        loadFailure(response);
      } else if (file.xhr.status === 200) {
        //Server response : we get a 200 if everything is OK
         loadSuccess(response);
      }
      
    });
    
    //@TODO: server error
    this.on("error", function( file, errorMsg, res ) {
      console.log(res);
    });

    var _this = this;

  },
};

function loadSuccess(response) {
    //console.log(response);
    printInfo(author, response.author, "non renseigné", "w3-text-orange");
    printInfo(gameType, response.gameType, "non renseigné", "w3-text-orange");
    printInfo(minPlayers, response.minPlayers, "non renseigné", "w3-text-orange");
    printInfo(maxPlayers, response.maxPlayers, "non renseigné", "w3-text-orange");
    printInfo(missionMap, response.missionMap, "non renseigné", "w3-text-orange");
    printInfo(missionTitle, response.missionTitle, "non renseigné", "w3-text-orange");
    printInfo(missionVersion, response.missionVersion, "non renseigné", "w3-text-orange");
    printInfo(overviewText, response.overviewText, "non renseigné", "w3-text-orange");
    missionPbo.innerText = response.missionPbo;
    pboFileDateM.innerText = new Date(response.pboFileDateM).toLocaleDateString("fr-FR", {hour:"2-digit", minute:"2-digit"});
    pboFileSize.innerText = new Intl.NumberFormat().format(response.pboFileSize);
    printInfo(onLoadMission, response.onLoadMission, "non renseigné", "w3-text-orange");
    printInfo(loadScreen, response.loadScreen, "absente", "w3-text-orange");
    printInfo(onLoadName, response.onLoadName, "non renseigné", "w3-text-orange");
    document.getElementById("modalSuccess").style.display="block";
}

function loadFailure(response) {
    printInfo(pboDoesntExist, response.pboDoesntExist, "un pbo avec le même nom de fichier a déjà été publié dans les missions", "w3-text-red");
    printInfo(briefingSqfFound, response.briefingSqfFound, "absent", "w3-text-red");
    printInfo(fileExtensionIsOk, response.fileExtensionIsOk, "l'extenion n'est pas \".pbo\"", "w3-text-red");
    printInfo(fileIsPbo, response.fileIsPbo, "le fichier n'est pas un pbo ou est corrompu", "w3-text-red");
    printInfo(fileNameConventionIsOk, response.fileNameConventionIsOk, "le nom de fichier ne respecte pas la convention de nommage", "w3-text-red");
    document.getElementById("modalFailure").style.display="block";
}

function printInfo(info, responseInfo, txtNR, fmtErr) {
    if (!responseInfo || responseInfo === null || responseInfo === NaN || responseInfo === "") {
        info.classList.remove("w3-text-black");
        info.classList.add(fmtErr);
        info.innerText = txtNR;
    } else {
        info.classList.remove(fmtErr);
        info.classList.add("w3-text-black");
        info.innerText = responseInfo;
    }
}

function resetPage() {
      //Clears dropzone and cancel uploads
      let myDropzone = Dropzone.forElement("#myDZ");
      myDropzone.removeAllFiles(true);
      /*
      //@TODO: Removes file from server
      var name = file.name;        
      $.ajax({
          type: 'POST',
          url: 'delete.php',
          data: "id="+name,
          dataType: 'html'
      });
      */
}

/**
 *
 * Publishes the mission to the server and saves the mission information in the database
 * 
 */
function publishMission() {
  //console.log(JSON.stringify(servResponse));
  fetch("/missions/add/confirm", {
    method: "POST",
    headers: { "content-type": "application/json"},
    body: JSON.stringify(servResponse),
  })
  .then (function (response) {
    if (response.ok) {
        showHide("msgOK");
        setTimeout(function(){ showHide("msgOK");}, 5000);
        document.getElementById("modalSuccess").style.display="none";
        resetPage();
    }
    else {
      console.log("Huho... Somethin' went wrong. Server has responded :");
      console.log(response.status);
    }
  })
  .catch(function(error) {
    document.getElementById("modalSuccess").style.display="none";
    errMsg.innerText = error;
    showHide("msgError");
    setTimeout(function(){ showHide("msgError");}, 10000);
  });
}
