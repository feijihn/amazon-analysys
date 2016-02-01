function initiateTimeOut(i) {
  setTimeout(function() { doStuff(i) }, 1000);
}
function doStuff(i) {
    console.log(i);
    i++;
    if (i <= 10) {
        initiateTimeOut(i); 
    }
}

initiateTimeOut(0);
