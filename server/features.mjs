import { json } from "express";

// import * as server_side_functions from ""
const User = {
    CPU: "",
    GPU: "",
    RAM: "",
    OS: 4
}

const Game = {
    min_CPU: "",
    min_GPU: "",
    min_RAM: "",

    rec_CPU: "",
    rec_GPU: "",
    rec_RAM: "",

    name: "",
    id: "",
    OS: ""
}

const OS_id = {
    // PC means Windows
    PC: 4,
    macOS: 5,
    Linux: 6
}

function update_os_id_from_RAWG(){
    // get os id from database os id table
    // implement this later of project
}

function get_os_id(os){
    switch (os){
        case "macOS":
            return OS_id.macOS;
        case "Windows":
            return OS_id.PC;
        case "Linux":
            return OS_id.Linux;
    }
    return -1;
}

function json_filter(target, data){
    switch (target) {
        case 'options':
            const result = [];
            if('results' in data){
                for(let i = 0;i<data['results'].length; ++i){
                    if('id' in data['results'][i] && 'name' in data['results'][i]){
                        const j = {'id': data['results'][i]['id'],
                        'Model': data['results'][i]['name']}
                        result.push(j)
                    }
                }
            }
            console.log('results are', result);
            return result;
        case 'id':
            Game.id = data.id;
            return;
        case 'game':
            const pcPlatform = data.platforms.find(platform => platform.platform.name === 'PC');
            const minimumRequirements = pcPlatform ? pcPlatform.requirements.minimum : 'Not available';
            const recomandedRequirements = pcPlatform ? pcPlatform.requirements.recommended : 'Not available';
            Game.name = data.name;
            //array
            Game.OS = data.name;
            analyze_requirements(minimumRequirements);
            analyze_requirements(recomandedRequirements);
            return;
    }
}

function analyze_requirements(MorR, requirements){
    let regex = '';
    let match = '';
    switch (MorR){
        case 'min':
            regex = /Processor:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.min_CPU = match ? match[1] : 'Not found';

            regex = /Graphics:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.min_GPU = match ? match[1] : 'Not found';

            regex = /Memory:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.min_RAM = match ? match[1] : 'Not found';
            return;
        case 'rec':
            regex = /Processor:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.rec_CPU = match ? match[1] : 'Not found';

            regex = /Graphics:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.rec_GPU = match ? match[1] : 'Not found';

            regex = /Memory:\s*([^\/\s]+)/;
            match = requirements.match(regex);
            Game.rec_RAM = match ? match[1] : 'Not found';
            return;
    }
}

function combine_url(api_url, params){
    let result = api_url + '?';
    for(let i in params){
        result += i + '=' + params[i] + '&';
    }
    result.substring(0, result.length - 1)
    return result;
}

export function user_info(cpu, gpu, ram, os){
    User.CPU = cpu;
    User.GPU = gpu;
    User.RAM = ram;
    os = get_os_id(os);
    if(os >= 0){
        User.OS = os;
    }else{
        User.OS = 4;
        show_error("Wrong OS name")
    }
}

function show_error(error){
    //show the error to user
    window.alert(error)
}

function send_request(request){
    return new Promise((resolve, reject) => {
        fetch(request)
            .then(response => response.json())
            .then(data => {
                resolve({result: data, error: null});
            })
            .catch(err => {
                reject({result: null, error: err});
            });
    });
}

export async function get_game_by_name(name){
    let api_url = "https://api.rawg.io/api/games";
    let params = {
        'key': 'f51c080731c746f09f0a18e6f78f5360',
        'page_size': 3,
        'search': name,
        'platform': '4'
    };
    
    try {
        const data = await send_request(combine_url(api_url, params));
        //console.log(data.result);
        return json_filter('options', data.result)
    } catch(error) {
        console.log(error.error); 
        return [{Model: 'ERROR'}];
    }
}

function select_game(game){
    json_filter('id', game)
}

export function get_game_info(){
    let api_url = "https://api.rawg.io/api/games";
    let params = {
        'key': 'f51c080731c746f09f0a18e6f78f5360',
        'id': Game.id
    };
    let data = send_request(combine_url(api_url, params));
    if(Object.keys(data[0]).length === 0){
        json_filter("game", data[0]);
    }else{
        show_error(data[1]);
    }}

