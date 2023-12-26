function getSuggestions(target){

}

function toggleLoading(target){
    const obj = document.getElementById("game_name_loading");
    if (obj.style.display === 'none' || obj.style.display === '') {
        obj.style.display = 'flex';
    } else {
        obj.style.display = 'none';
    }
}