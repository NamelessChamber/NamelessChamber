// Supports multiple audio players
// Pauses all audio players if at least one is playing
// Plays all audio players if all are paused
export function changeAudioPlayerState(){
    var players = document.getElementsByClassName("react-audio-player");
    if (!players.length){ return; }
    var paused = true;

    Array.prototype.forEach.call(players, function(player){
      paused = paused && player.paused;
    });

    if (paused){ 
      Array.prototype.forEach.call(players, function(player) {player.play();});
    } else{
      Array.prototype.forEach.call(players, function(player) {player.paused();});
    }
  }