/**
 *
 * Requests the server to publish a mission
 * @TODO: this script is a piece of shit -> to refactor ASAP
 */

var servResponse = "";

Dropzone.options.myDZ = {
  //Client side controls
  maxFiles: 1,
  acceptedFiles: ".pbo",
  maxFilesize: 20, // MB
  dictDefaultMessage: "Pbo dropzone here ! (or click to choose a file)",

  init: function() {
  
    //The file was correctly submitted. The client recieves a 202 htpp code if there were errors during mission check, 200 if no error. We open a modal that displays server response.
    this.on("success", function(file, response) {
      /*Important trick : these two lines of code print function arguments in the console !
      var args = Array.prototype.slice.call(arguments);
      console.log(args); 
      */
      //console.log(file.xhr.status);
      //console.log(response);
      servResponse = response;
      if (file.xhr.status === 202) {
        //Server response : we get a 202 if some controls failed
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
  
  let textNode = "";
  let node = "";
  const list = document.getElementById("msgFailContent");

  //Print response by traversing JSON response object
  for (const key in response) {
    switch (key) {
      case ("nbBlockingErr"):
        document.getElementById("msgHead").innerText = "Mission non publiable : " + response.nbBlockingErr + " erreur(s) bloquante(s)";
        break;
      case ("isMissionValid"):
        break;
      default:
        node = document.createElement("LI");
        //check reported an error
        if (response[key].isOK === false) {       
          //this is a blocking error
          if (response[key].isBlocking) {
            textNode = document.createTextNode(response[key].label + " : NON (erreur bloquante)");
            node.appendChild(textNode);
            node.classList.add("w3-red");
          //this is NOT a blocking error
          } else {
            textNode = document.createTextNode(response[key].label + " : NON (erreur non bloquante)");
            node.appendChild(textNode);
            node.classList.add("w3-orange");
          }
          //node.appendChild(textNode);
          list.appendChild(node);
        //check reported NO error
        } else {
          node = document.createElement("LI");
          textNode = document.createTextNode(response[key].label + " : OK !");
        }
        node.appendChild(textNode);
        list.appendChild(node);
    }
  }
    
  document.getElementById("modalFailure").style.display="block";

  //Print key and value in html
  /*
    printInfo(pboDoesntExist, response.pboDoesntExist, "un pbo avec le même nom de fichier a déjà été publié dans les missions", "w3-text-red");
    printInfo(briefingSqfFound, response.briefingSqfFound, "absent", "w3-text-red");
    printInfo(fileExtensionIsOk, response.fileExtensionIsOk, "l'extenion n'est pas \".pbo\"", "w3-text-red");
    printInfo(fileIsPbo, response.fileIsPbo, "le fichier n'est pas un pbo ou est corrompu", "w3-text-red");
    printInfo(fileNameConventionIsOk, response.fileNameConventionIsOk, "le nom de fichier ne respecte pas la convention de nommage", "w3-text-red");
  */

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

function resetPage(elID) {
      //Clears dropzone and cancel uploads
      let myDropzone = Dropzone.forElement("#myDZ");
      myDropzone.removeAllFiles(true);
      if (elID) {
        const elToRemove = document.getElementById(elID);
        while (elToRemove.hasChildNodes()) {  
          elToRemove.removeChild(elToRemove.firstChild);
        }
      }
      
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
  fetch("/mission/add/confirm", {
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
