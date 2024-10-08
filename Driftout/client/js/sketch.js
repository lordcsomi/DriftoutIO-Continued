// ---------- GLOBALS ----------

// Bulk HTML Access

let mainCanvas = document.getElementById("mainCanvas"),
  gameTitle = document.getElementById("gameTitle"),
  enterGameButton = document.getElementById('enterGameButton'),
  changeClassButton = document.getElementById('changeClassButton')
  menuContainer = document.getElementById("menuContainer"),
  classDisplay = document.getElementById('classDisplay'),
  classImage = document.getElementById('classImage'),
  nameInput = document.getElementById('nameInput'),
  tipsContainer = document.getElementById('tipsContainer'),
  gameGuiContainer = document.getElementById('gameGuiContainer'),
  notificationContainer = document.getElementById('notificationContainer'),
  leaderboardContainer = document.getElementById('leaderboardContainer'),
  leaderboardItem = document.getElementById('leaderboardItem'),
  tabLeaderboard = document.getElementById('tabLeaderboard'),
  boostContainer = document.getElementById('boostContainer'),
  boostContainerCooldown = document.getElementById('boostContainerCooldown'),
  abilityContainer = document.getElementById('abilityContainer'),
  abilityContainerCooldown = document.getElementById('abilityContainerCooldown'),
  abilityHint = document.getElementById('abilityHint'),
  timeContainer = document.getElementById('timeContainer'),
  timeContainerInterior = document.getElementById('timeContainerInterior'),
  bestTimeContainer = document.getElementById('bestTimeContainer'),
  bestTimeContainerInterior = document.getElementById('bestTimeContainerInterior'),
  debugContainer = document.getElementById('debugContainer'),
  upgradeContainer = document.getElementById('upgradeContainer'),
  upgradeItem = document.getElementById('upgradeItem'),
  upgradePointsTitle = document.getElementById('upgradePointsTitle'),
  currentLaps = document.getElementById('currentLaps'),
  currentLapsInterior = document.getElementById('currentLapsInterior'),
  chatToggle = document.getElementById('chatToggle'),
  chatDisplay = document.getElementById('chatDisplay'),
  chatInput = document.getElementById('chatInput'),
  chatContent = document.getElementById('chatContent'),
  metricsData = document.getElementById('metricsData'),
  metricsContainer = document.getElementById('metricsContainer'),
  newsButton = document.getElementById('newsButton'),
  newsContainer = document.getElementById('newsContainer'),
  newsArticle = document.getElementById('newsArticle'),
  newsExitButton = document.getElementById('newsExitButton');

// Global Vars

let dev = false;
let socket;
let playing = false;
let windowDisplay = false;
let allCars;
let allTracks;
let currentTrack;
let allPlayers = [];
let notifications = [];
let messages = [];
let nextNotification = 0;
let currentEntities = [];
let clientPlayerAngle = 0;
let classIndex = 0;
const classEntries = [
  "Racer<br>■■□ Speed<br>■■□ Handling<br>■■□ Durability",
  "Sprinter<br>■■■ Speed<br>■□□ Handling<br>■□□ Durability<br>Ability: Steady",
  "Tank<br>■□□ Speed<br>■■■ Handling<br>■■■ Durability",
  "Prankster<br>■■□ Speed<br>■■□ Handling<br>■□□ Durability<br>Ability: Trap",
  "Bullet<br>■■■ Speed<br>■□□ Handling<br>■■■ Durability<br>Ability: Dash",
  "Fragile<br>■□□ Speed<br>■□□ Handling<br>■□□ Durability<br>Ability: Gift",
  "Spike<br>■□□ Speed<br>■■■ Handling<br>■■□ Durability",
  "Swapper<br>■□□ Speed<br>■■■ Handling<br>■■■ Durability<br>Ability: Switch"
]
let forceDisconnect = 0;
const errors = [
  "Failed to reach server for 3 seconds. Most likely an update, refresh in a minute. :D",
  "This game only functions properly in portrait mode, please rotate your device and refresh :)"
]
const tips = [
  "Boosting from a lower speed increases boost power",
  "Crash other players to earn upgrade points",
  "Press 'q' to open a detailed leaderboard",
  "Some cars are heavier and have reduced knockback",
  "Round modifiers and more cars coming soon :)",
  "This game also has mobile controls, but is resource intensive",
  "Boosts and health refill upon completion of a lap"
]

let tipsCounter = Date.now();
let tipsIndex = Math.floor(Math.random() * tips.length);
let classDisplayAngle = 0;
let numPressed = null;
let totalConnections=0;
let playerNames = [];
let currentRoom = null;
let myName;
let mobileCoords;
let timeOutTick = 0;

class NewsPiece{
  constructor(title, date, content){
    this.title = title;
    this.date = date;
    this.content = content;
  }
}

currentNews = [
  new NewsPiece("Development Continuation", "7/12/24", "Hello everyone!\nI'm excited to announce that I will be continuing the development of Driftout. Unfortunately, Brad has been unable to dedicate time to the project due to his full-time job. My primary goals are to make the game online and live again, and to rework it using the Matter.js.\nI appreciate your support and patience as I make these improvements.\nThank you! ~ Ádám")
];


for(article in currentNews){
  newsContainer.innerHTML += "<div id='newsArticle'><h1>" + currentNews[article].title + "</h1><p>" + currentNews[article].date + "</p><h2>" + currentNews[article].content + "</h2></div>";
}

function preload(){
}

// Called when game is started once
function setup(){
  // Client setup
  allPlayers = [];
  myId = 0;
  currentTrack = allTracks.DragStrip;

  nameInput.focus();
  nameInput.select();

  frameRate(30);

  menuContainer.style.visibility = "visible";
  menuContainer.style.opacity = "1";

  classDisplay.innerHTML = "<div id='classImageBlock'></div>" + classEntries[classIndex];

  socket = io();

  socket.on("myID", function(data) {
      myId = data.id;
  });

  socket.on("roomUpdate", function(data){
    if(playing){
      if(currentRoom == null){
        currentRoom = data.rooms[data.roomIndex];
      }
      if(data.roomIndex == currentRoom.roomIndex){
        currentRoom = data.rooms[data.roomIndex];
      }
    }
  })

  socket.on("initPlayer", function(data){
    if(playing){
      if(data.room == currentRoom.roomIndex){
        var newCar = Object.entries(allCars).filter(car => car[0] == data.initPack.car.name)[0][1];
        var player = new Player(data.initPack.id, data.initPack.name, data.initPack.x, data.initPack.y, newCar, dev);
        allPlayers.push(player);
      }
    }
  });


  // initialize client side with server side entries and current track
  socket.on("initPack", function(data) {
    if(data.room == currentRoom.roomIndex){
        for(var i in data.initPack) {
            var newCar = Object.entries(allCars).filter(car => car[0] == data.initPack[i].car.name)[0][1];
            var player = new Player(data.initPack[i].id, data.initPack[i].name, data.initPack[i].x, data.initPack[i].y, newCar, dev);
            allPlayers.push(player);
            dupeCheck();
        }
        if(data.currentTrack.name == "Square"){
          currentTrack = allTracks.Square;
        }
        if(data.currentTrack.name == "DragStrip"){
          currentTrack = allTracks.DragStrip;
        }
        if(data.currentTrack.name == "Left, Right"){
          currentTrack = allTracks.LeftRight;
        }
      }
  });

  // rapid update pack socket
  socket.on("updatePack", function(data) {
    if(currentRoom != null){
      if(data.i == currentRoom.roomIndex){
        for(var i in data.updatePack) {
          for(var j in allPlayers) {
            if(allPlayers[j].id === data.updatePack[i].id) {
              allPlayers[j].x = data.updatePack[i].x;
              allPlayers[j].y = data.updatePack[i].y;
              allPlayers[j].angle = data.updatePack[i].angle;
              allPlayers[j].HP = data.updatePack[i].HP;
              allPlayers[j].maxHP = data.updatePack[i].maxHP;
              allPlayers[j].alive = data.updatePack[i].alive;
              allPlayers[j].laps = data.updatePack[i].laps;
              allPlayers[j].boosts = data.updatePack[i].boosts;
              allPlayers[j].canBoost = data.updatePack[i].canBoost;
              allPlayers[j].boostCooldown = data.updatePack[i].boostCooldown;
              allPlayers[j].canAbility = data.updatePack[i].canAbility;
              allPlayers[j].abilityCooldown = data.updatePack[i].abilityCooldown;
              allPlayers[j].upgradePoints = data.updatePack[i].upgradePoints;
              allPlayers[j].lapTime = data.updatePack[i].lapTime;
              allPlayers[j].topLapTime = data.updatePack[i].topLapTime;
              allPlayers[j].god = data.updatePack[i].god;
              allPlayers[j].kills = data.updatePack[i].kills;
              if (allPlayers[j].car.name == "Prankster"){
                allPlayers[j].trapSize = data.updatePack[i].trapSize;
              }
              if (allPlayers[j].car.name == "Spike"){
                allPlayers[j].bodySize = data.updatePack[i].bodySize;
              }
              if (allPlayers[j].car.name == "Swapper"){
                allPlayers[j].form = data.updatePack[i].form;
                console.log(data.updatePack[i].form)
              }
            }
          }
        }
      }
    }
    timeOutTick = 0;
  });

  // update socket for entities
  socket.on("syncedData", function(data) {
    if(data.notification.length > 0 && currentRoom != null){
      if(data.notification[0] == currentRoom.roomIndex){
        notifications.push(data.notification[1]);
      }
    }
    if(data.message.length > 0 && currentRoom != null){
      if(data.message[0] == currentRoom.roomIndex){
        messages.push(data.message[1]);
      }
    }
    if(playing == true && currentRoom != null){
      if(data.currentEntities[0] == currentRoom.roomIndex){
        currentEntities = data.currentEntities[1];
        if (currentEntities.length == 0 && data.currentEntities[1].length > 0){
          data.currentEntities.map(entity => entity.newEntity = true);
        }
        for (var i in data.currentEntities[1]){
          if (data.currentEntities[1][i].newEntity == true){
            currentEntities.push(data.currentEntities[1][i]);
          }
          else{
            if(currentEntities.length > 0){
              currentEntities[i].x = data.currentEntities[1][i].x;
              currentEntities[i].y = data.currentEntities[1][i].y;
              currentEntities[i].vX = data.currentEntities[1][i].vX;
              currentEntities[i].vY = data.currentEntities[1][i].vY;
            }
          }
        }
      }
      for (var i in currentEntities){
        if (currentEntities[i].name == "Trap" && typeof currentEntities[i].draw == "undefined"){
          var setDraw = allCars.Prankster.ability(currentEntities[i].x,currentEntities[i].y,currentEntities[i].angle);
          Object.assign(currentEntities[i], {draw : setDraw.draw});
        }
      }
    }
  });

  // socket.on("restartGame"){
  //
  // }

  socket.on("someoneLeft", function(data) {
      for(var i in allPlayers) {
          if(allPlayers[i].id === data.id) {
              allPlayers.splice(i, 1);
          }
      }
  });

  socket.on("returnData", function(data){
    if(data.name == "metrics"){
      totalConnections = data.totalConnections;
      playerNames = data.playerNames;
    }
  })

  socket.emit("specifcData", "metrics");

  var mainCanvas = createCanvas(windowWidth, windowHeight);
  mainCanvas.parent("mainCanvas");
}

// Check if device is mobile (p5js setup function cannot call global functions on startup)
let isMobile = mobileCheck()? true : false;
if(isMobile){
  var mouseWithinJoystickRadius = false;
  abilityHint.innerHTML = "";
}

function draw() {
  // Resize canvas to correct dimensions (non-functional on mobile?)
  resizeCanvas(windowWidth, windowHeight);

  // Render game only if player exists within room
  if (playing == true && allPlayers.filter(player => player.id === myId).length == 1){

    // Start counting up from last packet recieved
    timeOutTick++;

    // If no packets recieved in 3 seconds (30FPS * 3 = 90 ticks), exit game
    if(timeOutTick > 90){
      exitGame();
      forceDisconnect = 1;
      enterGameButton.setAttribute('onClick', '');
      return;
    }

    // Render background and GUI's
    background(37, 150, 190);
    refreshDisplays();

    // Send keyboard/mouse inputs to server
    sendInputData();

    // Translate screen to match assinged player and exit if player is not alive
    for(var i in allPlayers) {
        if(allPlayers[i].id == myId) {
          allPlayers[i].angle = clientPlayerAngle;
          if(allPlayers[i].alive == false){
            exitGame();
          }
          translate(width/2 - allPlayers[i].x, height/2 - allPlayers[i].y);
        }
    }

    // Draw track in current room
    currentTrack.drawMap();

    // Draw entities only if they exist
    for(var i in currentEntities){
      if (typeof currentEntities[i].draw != "undefined"){
        currentEntities[i].draw(currentEntities[i].x, currentEntities[i].y, currentEntities[i].size/20);
      }
    }

    // Draw mobile controls if device is classed as mobile
    if(isMobile == true){
      drawMobileControls();
    }

    // Draw player
    for(var i in allPlayers) {
      if(allPlayers[i].alive == true){
        allPlayers[i].draw();
        smooth(4);
        if(allPlayers[i].bodySize){
          scale(allPlayers[i].bodySize);
        }
      }
    }

    if(allPlayers.filter(player => player.id === myId).length == 0){
      exitGame();
    }
  }
  else{
    var carChoice = '';
    if(classIndex == 0){
      carChoice = allCars.Racer;
    }
    if(classIndex == 1){
      carChoice = allCars.Sprinter;
    }
    if(classIndex == 2){
      carChoice = allCars.Tank;
    }
    if(classIndex == 3){
      carChoice = allCars.Prankster;
    }
    if(classIndex == 4){
      carChoice = allCars.Bullet;
    }
    if(classIndex == 5){
      carChoice = allCars.Fragile;
    }
    if(classIndex == 6){
      carChoice = allCars.Spike;
    }
    if(classIndex == 7){
      carChoice = allCars.Swapper;
    }
    if(!windowDisplay){
      if(windowWidth < 1024){
        if(isMobile){
          carChoice.drawCar(windowWidth/2 - 200, windowHeight/1.5, classDisplayAngle, 3);
        }
        else{
          carChoice.drawCar(windowWidth/2 - 70, windowHeight/1.55, classDisplayAngle);
        }
      }
      else{
        carChoice.drawCar(windowWidth/2 - 70, windowHeight - 165, classDisplayAngle)
      }
      classDisplayAngle+=0.04;
      if(Date.now() > tipsCounter){
        if(tipsIndex >= tips.length-1){
          tipsIndex = 0;
        }
        else{
          tipsIndex++;
        }
        if(forceDisconnect == 1){
          tipsContainer.innerHTML = errors[0];
        }
        if(forceDisconnect == 2){
          tipsContainer.innerHTML = errors[1];
        }
        else{
          tipsContainer.innerHTML = tips[tipsIndex];
        }
        tipsCounter = Date.now() + 3500;
      }
    }
  }
}

function mobileCheck(){
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function drawMobileControls(){
  for(var i in allPlayers) {
      if(allPlayers[i].id == myId) {
        strokeWeight(5);
        fill(100);
        circle(allPlayers[i].x + (windowWidth*0.3),  allPlayers[i].y + (windowHeight*0.3), 100);
        fill(50);
        if(mouseWithinJoystickRadius){
          line(allPlayers[i].x + (windowWidth*0.3), allPlayers[i].y + (windowHeight*0.3), allPlayers[i].x + mouseX - (windowWidth/2),allPlayers[i].y + mouseY - (windowHeight/2))
          circle(allPlayers[i].x + mouseX - (windowWidth/2),  allPlayers[i].y + mouseY - (windowHeight/2), 65);
        }
        else{
          circle(allPlayers[i].x + (windowWidth*0.3),  allPlayers[i].y + (windowHeight*0.3), 65);
        }
        fill(100);
        rect(allPlayers[i].x - (windowWidth*0.5),  allPlayers[i].y + (windowHeight*0.2), 200, 100);
        fill(200);
        textSize(50);
        textStyle(BOLDITALIC);
        text("Boost", allPlayers[i].x - (windowWidth*0.5) + 100,  allPlayers[i].y + (windowHeight*0.2) + 65);
        if(allPlayers[i].car.ability != null){
          strokeWeight(5);
          fill(100);
          rect(allPlayers[i].x - (windowWidth*0.5),  allPlayers[i].y + (windowHeight*0.2) + 150, 200, 100);
          fill(200);
          text("Ability", allPlayers[i].x - (windowWidth*0.5) + 100,  allPlayers[i].y + (windowHeight*0.2) + 215);
        }
        strokeWeight(0);
      }
  }
  mouseWithinJoystickRadius = false;
}

function debugDraw(debugText){
  //[[-1000, -200, -600, 3000], [-1000, -600, -600, -200], [2600, 3000, -600, -200], [2600, 3000, 2600, 3000]]
  textSize(20);
  textAlign(CENTER);
  textStyle(BOLD);
  fill(0,0,0);
  text(debugText, windowWidth/2,windowHeight/2);
}

function dupeCheck(){
  var dupeCheck = [];
  for(var i in allPlayers){
    if(!dupeCheck.includes(allPlayers[i].id)){
      dupeCheck.push(allPlayers[i].id);
    }
    else{
      allPlayers.splice(i,1);
    }
  }
}

function exitGame(){
  notificationContainer.style.opacity = "0";
  menuContainer.style.visibility = "visible";
  menuContainer.style.opacity = "1";
  gameGuiContainer.style.visibility = "hidden";
  gameGuiContainer.style.opacity = "0";
  playing = false;
  socket.emit("removePlayerServer", {id:myId, index:currentRoom.roomIndex});
  enterGameButton.setAttribute('onClick', 'enterGame()');
  allPlayers=[];
  refreshDisplays();
  currentRoom = null;
}

// Executed on main menu 'race' button,

function enterGame(){
  var carChoice = '';
  playing = true;
  if(classIndex == 0){
    carChoice = allCars.Racer;
  }
  if(classIndex == 1){
    carChoice = allCars.Sprinter;
  }
  if(classIndex == 2){
    carChoice = allCars.Tank;
  }
  if(classIndex == 3){
    carChoice = allCars.Prankster;
  }
  if(classIndex == 4){
    carChoice = allCars.Bullet;
  }
  if(classIndex == 5){
    carChoice = allCars.Fragile;
  }
  if(classIndex == 6){
    carChoice = allCars.Spike;
  }
  if(classIndex == 7){
    carChoice = allCars.Swapper;
  }

  socket.emit("ready", {name: nameInput.value, car: carChoice, dev: dev}); // maybe url encode the name to prevent XSS

  notifications = [];
  enterGameButton.setAttribute('onClick', '');
  menuContainer.style.visibility = "hidden";
  menuContainer.style.opacity = "0";
  gameGuiContainer.style.visibility = "visible";
  gameGuiContainer.style.opacity = "1";
  var upgradeBlocks = "";
  var displayNum = 0;
  for(var j in Object.entries(carChoice.upgrades)){
    displayNum++;
    if(isMobile){
      upgradeBlocks += "<button id='upgradeItem' style='width:fit-content' onClick = numPress(" + displayNum + ") type = 'button'>" + Object.keys(carChoice.upgrades)[j] + "</div>";
    }
    else{
      upgradeBlocks += "<div id='upgradeItem'>" + "<span style='color:#02f6fa'>" + displayNum + "</span><br>" + Object.keys(carChoice.upgrades)[j] + "</div>";
    }
  }
  upgradeContainer.innerHTML = upgradeBlocks;
}

function setName(){
  for(var i in currentRoom.allPlayers){
    if (currentRoom.allPlayers[i].id == myId){
      myName = currentRoom.allPlayers[i].name;
    }
  }
}

function changeClass(){
  classIndex++;
  if(classIndex >= Object.keys(allCars).length){
    classIndex=0;
  }
  classDisplay.innerHTML = "<div id='classImageBlock'></div>" + classEntries[classIndex];
}

function toggleChat(){
  if (chatDisplay.style.display === "block") {
    chatDisplay.style.display = "none";
  } else {
    chatDisplay.style.display = "block";
    chatToggle.style.backgroundColor = "rgba(30, 30, 30, 0.6)";
  }
}

function toggleNewsOn(){
  if(!windowDisplay){
    newsContainer.style.opacity = "1";
    newsContainer.style.visibility = "visible";
    windowDisplay = true;
  }
}

function toggleNewsOff(){
  newsContainer.style.visibility = "hidden";
  newsContainer.style.opacity = "0";
  windowDisplay = false;
}

function toggleMetricsOn(){
  if(!windowDisplay){
    metricsContainer.style.opacity = "1";
    metricsContainer.style.visibility = "visible";
    socket.emit("specifcData", "metrics");
    if(totalConnections == 0 && playerNames == []){
      metricsData.innerHTML = "Loading...";
    }
    else{
      var playerNameList = "";
      for(var i in playerNames){
        playerNameList+=playerNames[i] + ", ";
      }
      metricsData.innerHTML = "Total page vists since restart: " + totalConnections + "</br>All player names: " + playerNameList;
    }
    windowDisplay = true;
  }
}

function toggleMetricsOff(){
    metricsContainer.style.opacity = "0";
    metricsContainer.style.visibility = "hidden";
    windowDisplay = false;
}

function numPress(num){
  numPressed = num;
}

function refreshDisplays(){
  // Notification Overlay
  if (notifications.length > 0){
    if (millis() > nextNotification){
      notificationContainer.style.opacity = "1";
      if(notifications[0].includes(allPlayers.filter(player=>player.id==myId)[0].name)){
        notificationContainer.innerHTML = "<span style='color:#02f6fa'>" + notifications[0] + "</span>";
      }
      else{
        notificationContainer.innerHTML = notifications[0];
      }
      nextNotification = millis() + 1600;
      notifications.shift();
    }
  }
  else{
    if (millis() > nextNotification){
      notificationContainer.style.opacity = "0";
    }
  }

  tabLeaderboard.style.visibility = "hidden";
  tabLeaderboard.style.opacity = "0";
  leaderboardContainer.innerHTML = "Leaderboard";
  tabLeaderboard.innerHTML = "Leaderboard";
  var text = "<table width='100%'><tr><th>Leaderboard</th></tr>";
  var tabText = "<table width='100%'><tr><th>Name</th><th>Laps</th><th>Best Time</th><th>Kills</th></tr>";

  if(keyIsDown(81)){
    tabLeaderboard.style.visibility = "visible";
    tabLeaderboard.style.opacity = "1";
  }

  if(keyIsDown(67) && chatDisplay.style.display != "block"){
    toggleChat();
  }

  if(keyIsDown(13) && chatInput.value != ""){
    for(var i in currentRoom.allPlayers){
      if (currentRoom.allPlayers[i].id == myId){
        myName = currentRoom.allPlayers[i].name;
      }
    }
    socket.emit("recieveMessage", {roomIndex:currentRoom.roomIndex, author:myName, message:chatInput.value});
    chatInput.value = "";
  }

  if(messages.length > 0){
      var chatText = "";
      for(var i in messages){
        chatText += messages[i] + "<br>"
      }
      //chatText += "</table>";
      chatContent.innerHTML = chatText;
      if(chatDisplay.style.display != "block"){
        chatToggle.style.backgroundColor = "yellow";
      }
  }

  var order = 0;
  allPlayers.sort(function(a, b){return b.laps - a.laps});
  for(var i in allPlayers){
    order++;

    // Game End Leaderboard
    if(allPlayers[i].laps >= currentRoom.lapsToWin){
      tabLeaderboard.style.visibility = "visible";
      tabLeaderboard.style.opacity = "1";
    }

    // Laps Overlay
    if(allPlayers[i].id === socket.id){
        currentLaps.innerHTML = "<div id='currentLapsInterior'>" + allPlayers[i].laps + "/20</div>";
    }

    // Upgrade Overlay
    if(allPlayers[i].id === socket.id){

      upgradePointsTitle.innerHTML = "<span style='color:#02f6fa'>" + allPlayers[i].upgradePoints + "</span>" + (allPlayers[i].upgradePoints > 1 ? " Upgrade Points" : " Upgrade Point");
      if(allPlayers[i].upgradePoints > 0){
        upgradeContainer.style.opacity = "1";
        upgradePointsTitle.style.opacity = "1";
      }
      else{
        upgradeContainer.style.opacity = "0";
        upgradePointsTitle.style.opacity = "0";
      }
    }

    // Leaderboard and tab leaderboard Overlay
    if(allPlayers[i].alive == true){
      text += "<tr><td>" + order + ". " + allPlayers[i].name + "</td><td>" + allPlayers[i].laps + "</td></tr>";
      tabText += "<tr style='text-align:center'><td>" + allPlayers[i].name + "</td><td>" + allPlayers[i].laps + "</td><td>" + allPlayers[i].topLapTime/1000 + "</td><td>" + allPlayers[i].kills + "</td></tr>";
    }
    else{
      allPlayers.splice(i, 1);
    }

    // Check array still defined
    if(allPlayers[i]){


      // Ability Overlay
      if(allPlayers[i].id === socket.id){
        if(allPlayers[i].ability != null){
          abilityContainerCooldown.innerHTML = allPlayers[i].ability().name;
          abilityContainer.style.opacity = "1";
          if(allPlayers[i].canAbility > Date.now()){
            abilityContainerCooldown.style.backgroundColor = "rgba(180, 30, 30, 0.6)";
            var abilityFiredAt = allPlayers[i].canAbility - allPlayers[i].abilityCooldown;
            abilityContainerCooldown.style.width = ((((Date.now() - abilityFiredAt) / (allPlayers[i].canAbility - abilityFiredAt))*100)-10) + "%";
          }
          else{
            abilityContainerCooldown.style.backgroundColor = "rgba(30, 30, 30, 0.6)";
            abilityContainerCooldown.style.width = "90%";
          }
        }
        else{
          abilityContainer.style.opacity = "0";
        }

      // Time Overlay
        timeContainerInterior.innerHTML = "Lap  " +  Math.round(allPlayers[i].lapTime * 100.0 / 1000) / 100;
        bestTimeContainerInterior.innerHTML = "Best  " + Math.round(allPlayers[i].topLapTime * 100.0 / 1000) / 100;


      // Boost Overlay
        boostContainerCooldown.innerHTML = allPlayers[i].boosts;
        if(allPlayers[i].boosts == 0){
          boostContainerCooldown.style.backgroundColor = "rgba(180, 30, 30, 0.6)";
        }
        else{
          boostContainerCooldown.style.backgroundColor = "rgba(30, 30, 30, 0.6)";
          if(allPlayers[i].canBoost > Date.now()){
            boostContainerCooldown.style.backgroundColor = "rgba(180, 30, 30, 0.6)";
            var boostFiredAt = allPlayers[i].canBoost - allPlayers[i].boostCooldown;
            boostContainerCooldown.style.width = ((((Date.now() - boostFiredAt) / (allPlayers[i].canBoost - boostFiredAt))*100)-10) + "%";
          }
          else{
            boostContainerCooldown.style.width = "90%"
            boostContainerCooldown.style.backgroundColor = "rgba(30, 30, 30, 0.6)"
          }
        }
      }
    }
  }
  leaderboardContainer.innerHTML = text + "</table>";
  tabLeaderboard.innerHTML = tabText + "</table>";
}


function createMapBorders(borderArray){
  for(var i in borderArray){
    mapLine(borderArray[i][0], borderArray[i][1], borderArray[i][2], borderArray[i][3], [230, 0, 0]);
  }
}

function mapLine(x1, y1, x2, y2, colour1 = [0,0,0], colour2 = [220,220,220], thickness = 30){
  var count = 0;
  var max = 0;
  var isColour = true;

  strokeCap(ROUND);
  strokeWeight(thickness);

  max = Math.sqrt(((x2-x1)**2)+((y2-y1)**2)) / 75

  while(count<21){
    if (isColour == true){
      stroke(colour1);
      isColour = false;
    }
    else{
      stroke(colour2);
      isColour = true;
    }
    line(x1+(((x2-x1)/21)*count),y1+(((y2-y1)/21)*count),x2,y2);
    strokeCap(SQUARE);
    count++;
  }
  strokeCap(ROUND);
  strokeWeight(0);
  stroke(0,0,0);
}

function sendInputData() {
    var mouseClick = false;
    var spacePressed = false;
    if(isMobile == true){

      // Check tap location is within button radius
      if(mouseIsPressed === true){
        for(var i in allPlayers) {
          if(allPlayers[i].id == myId) {
            //allPlayers[i].x - (windowWidth*0.5),  allPlayers[i].y + (windowHeight*0.3), 200, 100
            //if((mouseX > allPlayers[i].x - (windowWidth*0.5) && mouseX < allPlayers[i].x - (windowWidth*0.5) + 200) &&
          //(mouseY > allPlayers[i].y - (windowHeight*0.5) && mouseY < allPlayers[i].y - (windowHeight*0.5) + 100)){
            if(mouseX < 200 && mouseY > windowHeight * 0.7 && mouseY < (windowHeight * 0.7) + 100){
              mouseClick = true;
            }
            if(allPlayers[i].ability != null && mouseX < 200 && mouseY > (windowHeight * 0.7) + 150 && mouseY < (windowHeight * 0.7) + 250){
              spacePressed = true;
            }
          }
        }
      }

      // Check tap location is within joystick radius
      if(mouseX > windowWidth * 0.4 && mouseY > windowHeight * 0.6 && mouseY < windowHeight * 0.95){
        clientPlayerAngle = atan2(mouseY - windowHeight*0.8, mouseX - windowWidth*0.8)
        mouseWithinJoystickRadius = true;
      }
    }
    else{
      clientPlayerAngle = atan2(mouseY - windowHeight/2, mouseX - windowWidth/2);
      if (mouseIsPressed === true){
        mouseClick = true;
      }
      if (keyIsDown(49)){
        numPressed = 1;
      }
      if (keyIsDown(50)){
        numPressed = 2;
      }
      if (keyIsDown(51)){
        numPressed = 3;
      }
      if (keyIsDown(52)){
        numPressed = 4;
      }
      if (keyIsDown(53)){
        numPressed = 5;
      }
      if (keyIsDown(54)){
        numPressed = 6;
      }
      if (keyIsDown(32)){
        spacePressed = true;
      }
    }
    //var mouseDistanceToCar = Math.abs(Math.sqrt((windowHeight/2 - mouseY)**2+(windowHeight/2 - mouseY)**2));
    var mouseDistanceToCar = Math.abs((windowHeight/2 + windowWidth/2) - (mouseX+mouseY));
    socket.emit("inputData", {mouseX, mouseY, clientPlayerAngle, windowWidth, windowHeight, mouseClick, mouseDistanceToCar, spacePressed, numPressed});
    numPressed = null;
}


// ----------- OBJECTS ---------------------------------------------------

// The player object constructor
var Player = function(id, name, x, y, car, dev) {
  this.id = id;
  this.name = name;
  this.dev = dev;
  this.x = x;
  this.y = y;
  this.vX = 0;
  this.vY = 0;
  this.angle = 0;
  this.car = car;
  this.maxHP = car.maxHP;
  this.HP = car.maxHP;
  this.maxSpeed = car.maxSpeed;
  this.maxBoosts = car.maxBoosts;
  this.boosts = car.maxBoosts;
  this.acceleration = car.acceleration;
  this.alive = true;
  this.ability = car.ability;
  this.canAbility = Date.now();
  this.drawCar = car.drawCar;
  this.boostPower = car.boostPower;
  this.mass = car.mass;
  this.canBoost = true;
  this.boostCooldown = 0;
  this.laps = 0;
  this.upgradePoints = 1;
  this.upgrades = [];
  this.lapTime = 0;
  this.topLapTime = 0;
  this.god = true;
  this.form = false;

  for (var x in this.car.upgrades){
    this.upgrades.push([0]);
  }

  this.draw = function() {
    // Player's car
    if(this.bodySize){
      this.drawCar(this.x, this.y, this.angle, this.bodySize);
    }
    if(this.car.name == "Swapper"){
      this.drawCar(this.x, this.y, this.angle, 1, this.form);
      console.log(this.form);
    }
    else{
      this.drawCar(this.x, this.y, this.angle);
    }

    // ForceField
    if (this.god){
      if (Date.now()%2==0){
        fill(255,255,200,100);
      }
      else{
        fill(255,255,230,100);
      }
      circle(this.x, this.y, this.car.size*3);
    }

    // Player's name
    textAlign(CENTER);
    if(this.dev){
      textSize(22);
      fill(100,0,0);
      textStyle(BOLDITALIC);
      text("Dev | " + this.name, this.x, this.y + 60);
    }
    else{
      textSize(20);
      fill(0,0,0)
      textStyle(BOLD);
      text(this.name, this.x, this.y + 60);
    }

    // Player's health
    if (this.HP < this.maxHP && this.HP > 0){
      push();
      strokeWeight(12);
      stroke(120,120,120)
      line(this.x - 20, this.y + 70, this.x + 20, this.y + 70);
      strokeWeight(8);
      stroke(80, 80, 80);
      line(this.x - 20, this.y + 70, this.x + 20, this.y + 70);
      if (this.HP < (this.maxHP / 4)){
        stroke(220, 0, 0);
      }
      else{
        stroke(0, 220, 0);
      }
      line(this.x - (this.HP / (this.maxHP / 20)), this.y + 70, this.x + (this.HP / (this.maxHP / 20)),
          this.y + 70);
      pop();
      }
    }

    return this;
  }


// The map object constructor
var Track = function(name, drawMap){
  this.name = name;
  this.drawMap = drawMap;
}

allTracks = {
  Square : new Track(
    "Square",
    function(){
      push();
      fill(200);
      strokeWeight(5);
      beginShape();
      vertex(-200, -200);
      vertex(-200, 2000);
      vertex(2000, 2000);
      vertex(2000, -200);
      endShape(CLOSE);

      fill(37, 150, 190);
      beginShape();
      vertex(200, 200);
      vertex(200, 1600);
      vertex(1600, 1600);
      vertex(1600, 200);
      endShape(CLOSE);
      pop();

      push();
      mapLine(1020, -200, 1020, 200, [0,0,0], [230, 230, 230], 20);
      mapLine(1000, -200, 1000, 200, [230,230,230], [0,0,0], 20);
      mapLine(980, -200, 980, 200, [0,0,0], [230, 230, 230], 20);
      pop();

      createMapBorders([[-200, -200, 2000, -200], [-200, 2000, -200, -200], [-200, 2000, 2000, 2000], [2000, -200, 2000, 2000],
        [200, 200, 1600, 200], [200, 1600, 200, 200], [200, 1600, 1600, 1600], [1600, 200, 1600, 1600]]);
    }
  ),
  DragStrip : new Track(
    "DragStrip",
    function(){
      push();
      fill(200);
      strokeWeight(5);
      beginShape();
      vertex(-1000, -200);
      vertex(-1000, 1000);
      vertex(3000, 1000);
      vertex(3000, -200);
      endShape(CLOSE);

      fill(37, 150, 190);
      beginShape();
      vertex(-600, 200);
      vertex(-600, 600);
      vertex(2600, 600);
      vertex(2600, 200);
      endShape(CLOSE);
      pop();

      push();
      mapLine(1020, -200, 1020, 200, [0,0,0], [230, 230, 230], 20);
      mapLine(1000, -200, 1000, 200, [230,230,230], [0,0,0], 20);
      mapLine(980, -200, 980, 200, [0,0,0], [230, 230, 230], 20);
      pop();

      createMapBorders([[-1000, -200, 3000, -200], [-1000, 1000, -1000, -200], [-1000, 1000, 3000, 1000], [3000, -200, 3000, 1000],
        [-600, 200, 2600, 200], [-600, 600, -600, 200], [-600, 600, 2600, 600], [2600, 200, 2600, 600]]);
    }
  ),
  LeftRight : new Track(
    "Left, Right",
    function(){
      push();
      fill(200);
      strokeWeight(0);
      beginShape();
      vertex(-200, -200);
      vertex(-200, 2000);
      vertex(2000, 2000);
      vertex(2000, -200);
      endShape(CLOSE);

      fill(37, 150, 190);
      beginShape();
      vertex(200, 200);
      vertex(200, 1600);
      vertex(1600, 1600);
      vertex(1600, 200);
      endShape(CLOSE);

      fill(200);
      strokeWeight(0);
      beginShape();
      vertex(400, 400);
      vertex(1400, 400);
      vertex(1400, 2000);
      vertex(400, 2000);
      endShape(CLOSE);

      fill(37, 150, 190);
      strokeWeight(0);
      beginShape();
      vertex(800, 800);
      vertex(1000, 800);
      vertex(1000, 2000);
      vertex(800, 2000);
      endShape(CLOSE);
      pop();

      push();
      mapLine(1020, -200, 1020, 200, [0,0,0], [230, 230, 230], 20);
      mapLine(1000, -200, 1000, 200, [230,230,230], [0,0,0], 20);
      mapLine(980, -200, 980, 200, [0,0,0], [230, 230, 230], 20);
      pop();

      createMapBorders([[-200, -200, 2000, -200], [-200, 2000, -200, -200], [-200, 2000, 800, 2000], [1000, 2000, 2000, 2000],
        [2000, -200, 2000, 2000], [200, 200, 1600, 200], [200, 1600, 200, 200], [200, 1600, 400, 1600], [200, 1600, 400, 1600],
        [1600, 200, 1600, 1600], [1000, 800, 1000, 2000], [800, 800, 800, 2000], [400, 400, 400, 1600], [1400, 400, 1400, 1600],
        [1400, 1600, 1600, 1600], [800, 800, 1000, 800], [400, 400, 1400, 400]]);
    }
  )
}

// The car object constructor
var Car = function(name, maxHP, maxSpeed, maxBoosts, upgrades, acceleration, boostPower, size, mass, abilityCooldown, ability, drawCar){
  this.name = name;
  this.maxHP = maxHP;
  this.maxSpeed = maxSpeed;
  this.maxBoosts = maxBoosts;
  this.upgrades = upgrades;
  this.acceleration = acceleration;
  this.drawCar = drawCar;
  this.boostPower = boostPower;
  this.mass = mass;
  this.size = size;
  this.ability = ability;
  this.abilityCooldown = abilityCooldown;
}

allCars = {
  Racer : new Car('Racer', 150, 6, 5, {
    MaxHP : 12,
    RegenHP : 0.05,
    MaxBoosts: 1,
    MoveSpeed : [0.01, 0.5],
    SingleHeal : 0.4,
    SingleBoost : 7.5
  }, 0.11, 2.5, 25, 5, null, null, function(x, y, angle, size=1){
    push();
    fill(20,20,200);
    translate(x, y);
    scale(size);
    rotate(angle);
    stroke(100,100,255);
    strokeWeight(5);
    strokeJoin(ROUND);
    beginShape();
    vertex(25, 0);
    vertex(-25, 20);
    vertex(-25, -20);
    endShape(CLOSE);
    smooth(4);
    pop();
  }),
  Prankster : new Car('Prankster', 120, 6, 4, {
    MaxHP : 10,
    RegenHP : 0.05,
    TrapDamage: 8,
    TrapCooldown : 0.6,
    TrapSize : 3,
    SingleHeal : 0.4
  }, 0.1, 2, 20, 4, 4000, function(x, y, angle){
    return {
      name : "Trap",
      x : x,
      y : y,
      vX : Math.cos((angle + 180) % 360) * 10,
      vY : Math.sin((angle + 180) % 360) * 10,
      size : 20,
      damage : 40,
      cooldown : 4000,
      ownerId : "",
      newEntity : true,
      createdAt : 0,
      draw : function(x, y, size){
        push();
        translate(x, y);
        scale(size);
        strokeWeight(5);
        fill(50,255,150);
        stroke(0,150,50);
        beginShape();
        vertex(0, 20);
        vertex(5, 5);
        vertex(20, 0);
        vertex(5, -5);
        vertex(0, -20);
        vertex(-5, -5);
        vertex(-20, 0);
        vertex(-5, 5);
        endShape(CLOSE);
        smooth();
        pop();
      }
    };
  }, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(5);
    strokeJoin(ROUND);
    fill(50,255,150);
    stroke(0,150,50);
    beginShape();
    vertex(-10, 10);
    vertex(-10, -10);
    vertex(-25, -20);
    vertex(-25, 20);
    endShape(CLOSE);
    fill(200,0,200);
    stroke(255,100,255);
    beginShape();
    vertex(30, 20);
    vertex(-10, 20);
    vertex(-10, -20);
    vertex(30, -20);
    endShape(CLOSE);
    smooth();
    pop();
  }),
  Bullet : new Car('Bullet', 100, 12, 3, {
    MaxHP : 10,
    RegenHP : 0.08,
    MaxBoosts: 1,
    MoveSpeed : [0.005, 0.8],
    DashResist : 3,
    DashPower : 10
  }, 0.08, 2.5, 25, 7, 3000, function(){
    return {
    name : "Dash",
    dashResist : 30,
    dashPower : 10
  }
}, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(5);
    strokeJoin(ROUND);
    fill(230,230,10);
    stroke(125,125,0);
    beginShape();
    vertex(30, -10);
    vertex(30, 10);
    vertex(15, 20);
    vertex(-30, 20);
    vertex(-30, -20);
    vertex(15, -20);
    endShape(CLOSE);
    smooth();
    pop();
  }),
  Tank : new Car('Tank', 200, 4, 4, {
    MaxHP : 14,
    RegenHP : 0.04,
    MaxBoosts: 1,
    BoostPower : 0.4,
    BouncePower : 0.1,
    SingleHeal : 0.25
  }, 0.08, 3, 35, 10, null, null, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(5);
    strokeJoin(ROUND);
    fill(50,255,150);
    stroke(0,150,50);
    circle(0,0,70);
    smooth();
    pop();
  }),
  Sprinter : new Car('Sprinter', 80, 12, 5, {
    MaxHP : 8,
    RegenHP : 0.05,
    MaxBoosts: 1,
    SteadyHandling : 0.05,
    SingleHeal : 0.4,
    SingleBoost : 6
  }, 0.14, 2, 25, 2, 6000, function(){
    return {
      name : "Steady",
      handling : 2
    }
  }, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(5);
    strokeJoin(ROUND);
    fill(255,0,0);
    stroke(125,0,0);
    beginShape();
    vertex(30, 0);
    vertex(-30, 18);
    vertex(-30, -18);
    endShape(CLOSE);
    smooth();
    pop();
  }),
  Fragile : new Car('Fragile', 70, 6, 3, {
    MaxHP : 20,
    RegenHP : 0.06,
    MaxBoosts: 2,
    MoveSpeed : [0.015, 0.6],
    GiftCooldown : 0.8,
    SingleBoost : 7.5
  }, 0.1, 2.5, 25, 1, 26000, function(){
    return {
    name : "Gift"
    }
  }, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(5);
    strokeJoin(ROUND);
    fill(255, 210, 120);
    stroke(100, 100, 100);
    beginShape();
    vertex(0, 25);
    vertex(25, 0);
    vertex(0, -25);
    vertex(-25, 0);
    endShape(CLOSE);
    smooth();
    pop();
  }),
  Spike : new Car('Spike', 150, 5, 3, {
    MaxHP : 12,
    RegenHP : 0.03,
    MaxBoosts: 1,
    MoveSpeed : [0.01, 0.4],
    CollisionDamage : 15,
    BodySize : 0.1
  }, 0.12, 3, 30, 8, null, null, function(x, y, angle, size=1){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(3);
    strokeJoin(ROUND);
    fill(150, 150, 150);
    stroke(50, 50, 50);
    beginShape();
    vertex(0, 32);
    vertex(27, -18);
    vertex(-27, -18);
    endShape(CLOSE);
    beginShape();
    vertex(0, -32);
    vertex(-27, 18);
    vertex(27, 18);
    endShape(CLOSE);
    beginShape();
    vertex(-32, 0);
    vertex(18, 27);
    vertex(18, -27);
    endShape(CLOSE);
    beginShape();
    vertex(32, 0);
    vertex(-18, 27);
    vertex(-18, -27);
    endShape(CLOSE);
    fill(0, 0, 0);
    circle(0,0,40);
    pop();
  }),

  Swapper : new Car('Swapper', 75, 9, 3, {
    MaxHP : 12,
    RegenHP : 0.2,
    MaxBoosts : 1,
    OffenseSpeed : [0.014, 0.5],
    DefenseResist : 3,
    SwitchCooldown : 120
  }, 0.13, 3, 25, 2, 5000, function(){
    return {
    name : "Switch"
    }
  }, function(x, y, angle, size=1, form){
    push();
    translate(x, y);
    scale(size);
    rotate(angle);
    strokeWeight(7);
    strokeJoin(ROUND);
    fill(100, 100, 100);
    if(form){
      stroke(250, 100, 100);
    }
    else{
      stroke(100, 250, 100);
    }
    beginShape();
    vertex(30, 0);
    vertex(10, 30);
    vertex(-30, 20);
    vertex(-30, -20);
    vertex(10, -30);
    endShape(CLOSE);
    smooth();
    pop();
  })
};
