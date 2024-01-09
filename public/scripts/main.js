function getSuggestions(type, target) {

    const loading = document.getElementById(type + "_loading");

    const suggestions = [];
    const suggestionsContainer = document.getElementById(`${type}_suggestions`);
    suggestionsContainer.innerHTML = "";
    if (target === ""){
        suggestionsContainer.style.display = "none";
        loading.style.display = "none";
        return;
    } 
    suggestionsContainer.style.display = "none";
    loading.style.display = "flex";

    fetch(`http://localhost:3000/suggestions?tableName=${type+"_INFO"}&targetColumn=${type+"_name"}&target=${target}&column=${type+"_name"}`)
        .then(response => response.json())
        .then(data => {

            for (const item of data.data){
                suggestions.push(item[0]);
            }
            let suggestionItems;
            if(type === "game"){
                suggestionItems = suggestions.map(suggestion => {
                    return `<div class="suggestion-item" onclick="setSuggestion(${type}.id, '${suggestion}'); resizeInput.call(document.getElementById('game'));">${suggestion}</div>`;
                });
            }else{
                suggestionItems = suggestions.map(suggestion => {
                    return `<div class="suggestion-item" onclick="setSuggestion(${type}.id, '${suggestion}')">${suggestion}</div>`;
                });
            }

            suggestionsContainer.innerHTML = suggestionItems.join('');
            loading.style.display = "none";
            suggestionsContainer.style.display = "flex";

        })
        .catch(error => {
            console.error('Error fetching game suggestions:', error);
        })
        .finally(() => {
            
        });
}

function setSuggestion(id, value){
    document.getElementById(id).value = value;
    document.getElementById(`${id}_suggestions`).style.display = "none";
}

function databaseCheck(type, value){
    fetch(`http://localhost:3000/getData?tableName=${type+"_INFO"}&targetColumn=${type+"_name"}&target=${value}&column=*`)
    .then(response => response.json())
    .then(data => {
        if(value.toLowerCase() === data.data[0].toLowerCase()){
            return true;
        }else{
            return false;
        }
    })
    .catch(error => {
        console.error('Error fetching infos:', error);
    });

}

function validateForm() {
    var gameInput = document.getElementById('game').value.trim();
    var cpuInput = document.getElementById('cpu').value.trim();
    var gpuInput = document.getElementById('gpu').value.trim();
    var ramInput = document.getElementById('ram').value.trim();

    if (gameInput === ""){
        alert('Please enter a game name.');
        return false;
    }else if (databaseCheck('GAME', gameInput)){
        alert('Please enter a valid game name.');
        return false;
    }else if ((cpuInput !== "") || (gpuInput !== "") || (ramInput !== "")){
        if(!((cpuInput !== "") && (gpuInput !== "") && (ramInput !== ""))){
            if(cpuInput === ""){
                alert('Please enter a cpu name to complete yout system specification.');
                return false;
            }else if(gpuInput === ""){
                alert('Please enter a gpu name to complete yout system specification.');
                return false;
            }else if(ramInput === ""){
                alert('Please enter a ram name to complete yout system specification.');
                return false;
            }
        }
    }
    if(databaseCheck('CPU', cpuInput)){
        alert('Please enter a valid cpu name.');
        return false;
    }else if(databaseCheck('GPU', gpuInput)){
        alert('Please enter a valid gpu name.');
        return false;
    }else if(ramInput < 0){
        alert('Please enter a valid ram info.');
        return false;
    }

    return true;
}

function toggle() {
    const button = document.getElementById("user_info_toggle_button");
    button.classList.toggle("clicked");
    const input_area = document.getElementById("user_info_input_area");
    if(input_area.style.display === "none"){
        input_area.style.display = "block";
    }else{
        input_area.style.display = "none";
    }
}
