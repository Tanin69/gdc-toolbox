/**
 *
 * Requests the server to publish a mission
 */

var servResponse = "";
var checkedFile = "";

/**
 *
 * Dropzone component init and events
 * 
 */
Dropzone.options.myDZ = {
  //Client side controls
  maxFiles: 1,
  acceptedFiles: ".pbo",
  maxFilesize: 10, // MB
  dictDefaultMessage: "Pbo dropzone here ! (or click to choose a file)",

  init: function() {
  
    //The file was correctly submitted. The client recieves a 202 http code if there were errors during mission check, 201 if no error. We open a modal that displays server response.
    this.on("success", function(file, response) {
      /*Important trick : these two lines of code print function arguments in the console !
      var args = Array.prototype.slice.call(arguments);
      console.log(args); 
      */
      //console.log(file.xhr.status);
      //console.log(response);
      checkedFile = file;
      servResponse = response;
      if (file.xhr.status === 202) {
        //Server response : we get a 202 if some controls failed
        loadFailure(response);
      } else if (file.xhr.status === 200) {
        //Server response : we get a 200 if check returned no blocking error
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

/**
 *
 * Opens a modal if check returned no blocking error (/api/mission/check endpoint)
 * 
 */
function loadSuccess(response) {
    let textNode = "";
    let node = "";
    const list = document.getElementById("msgSuccessContent");
    const classIfFalse = "w3-text-deep-orange";
    const classWarning = "w3-deep-orange";
    for (const key in response) {
      
      switch (key) {
        case "fileIsPbo":
          break;
        case "filenameConvention":
          break;
        case "descriptionExtFound":
          break;
        case "missionSqmFound":
          break;
        case "briefingSqfFound":
          break;
        case "missionSqmNotBinarized":
          break;  
        case "HCSlotFound":
          break;
        case "fileIsPbo":
          break;
        case "missionIsArchived":
          break;
        case "missionBriefing":
          break;
        case "isMissionValid":
          break;
        case "nbBlockingErr":
          break;
        case "missionIsPlayable":
          break;
        case "pboFileSize":
          node = document.createElement("LI");
          textNode = document.createTextNode(response[key].label + " : " + new Intl.NumberFormat().format(response[key].val));
          break;
        case "pboFileDateM":
          node = document.createElement("LI");
          fmtDtePublish = new Date(response[key].val).toLocaleDateString("fr-FR", {hour:"2-digit", minute:"2-digit"});
          textNode = document.createTextNode(response[key].label + " : " + fmtDtePublish);
          break;
        case "loadScreen":
          node = document.createElement("LI");
          if (!response[key].val) {
            textNode = document.createTextNode(response[key].label + " : pas d'image de présentation trouvée");
            node.classList.add(classIfFalse);
          } else if (response[key].val === "Image not found") {
            textNode = document.createTextNode(response[key].label + " : l'image référencée dans la mission n'a pas été trouvée");
            node.classList.add(classIfFalse);
          } else {
            textNode = document.createTextNode(response[key].label + " : une image de présentation a été trouvée");
          }
          break;
        case "IFA3mod":
          if (response[key].val === true) {
            node = document.createElement("LI");
            textNode = document.createTextNode(response[key].label);
            node.classList.add(classWarning);
          }
          break;
        default:
          node = document.createElement("LI");
          //Info is missing
          if (response[key].val === false) {       
            textNode = document.createTextNode(response[key].label + " : non renseigné");
            node.classList.add(classIfFalse);
          //Info is present
          } else {
            textNode = document.createTextNode(response[key].label + " : " + response[key].val);
          }
      }
      if (node) {
        node.appendChild(textNode);
        list.appendChild(node);
      }
    }
        
    document.getElementById("modalSuccess").style.display="block";
}

/**
 *
 * Opens a modal if check returned one or more blocking errors (/api/mission/check endpoint)
 * 
 */
function loadFailure(response) {
  
  let textNode = "";
  let node = "";
  const list = document.getElementById("msgFailContent");

  //Print response by traversing JSON response object
  for (const key in response) {
    switch (key) {
      case "nbBlockingErr":
        document.getElementById("msgHead").innerText = "Mission non publiable : " + response.nbBlockingErr + " erreur(s) bloquante(s)";
        break;
      case "isMissionValid":
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
}

/**
 *
 * Publishes the mission to the server (/api/mission/add endpoint)
 * 
 */
function publishMission() {
  //submit file on /api/mission/add endpoint
  const formData = new FormData();
  const request = new XMLHttpRequest();
  formData.set("file", checkedFile);
  request.open("POST", "http://localhost:3000/api/mission/add");
  
  request.onload = function (e) {
    if (request.readyState === 4) {
      if (request.status === 201) {
        showHide("msgOK");
        setTimeout(function(){showHide("msgOK");}, 5000);
        document.getElementById("modalSuccess").style.display="none";
        resetPage("msgSuccessContent");
      } else {
        console.log("Huho... Somethin' went wrong. Server responded :");
        errMsg.innerText = `${request.status}: ${request.statusText})`;
        console.log(request.status);
        showHide("msgError");
        setTimeout(function(){ showHide("msgError");}, 10000);
        document.getElementById("modalSuccess").style.display="none";
        resetPage("msgSuccessContent");
      }
    }
  };
  request.onerror = function (e) {
    console.log("Huho... Somethin' went wrong.");
    errMsg.innerText = "Server could not be reached)";
    console.log(request.status);
    showHide("msgError");
    setTimeout(function(){ showHide("msgError");}, 10000);
    document.getElementById("modalSuccess").style.display="none";
    resetPage("msgSuccessContent");
  };
  request.send(formData);
}

/**
 *
 * Resets page content
 * 
 */
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
}

