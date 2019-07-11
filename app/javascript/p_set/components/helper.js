export function changeAudioPlayerState(){
    var player = document.getElementsByClassName("react-audio-player")[0];
    if (player == undefined){
      return;
    }
    if (player.paused){
      player.play();
    } else {
      player.pause();
    }
  }