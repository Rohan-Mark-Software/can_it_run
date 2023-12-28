document.addEventListener("DOMContentLoaded", function () {
    function handleInputFocus(type) {
        setTimeout(() => {
            const suggestionsContainer = document.getElementById(`${type}_suggestions`);
            suggestionsContainer.style.display = "none";
        }, 200);
    }

    document.getElementById('game').addEventListener('focusout', () => handleInputFocus('game'));
    document.getElementById('cpu').addEventListener('focusout', () => handleInputFocus('cpu'));
    document.getElementById('gpu').addEventListener('focusout', () => handleInputFocus('gpu'));

});

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
            console.log(data)

            for (const item of data.data){
                console.log(item)
                suggestions.push(item[0]);
            }

            const suggestionItems = suggestions.map(suggestion => {
                return `<div class="suggestion-item" onclick="setSuggestion(${type}.id, '${suggestion}')">${suggestion}</div>`;
            });

            suggestionsContainer.innerHTML = suggestionItems.join('');
            loading.style.display = "none";
            suggestionsContainer.style.display = "block";

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

