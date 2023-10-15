
function json_filter(target, data){
    let result = []
    switch (target) {
        case 'options':
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
        case 'game':
            result = [{
                'min_cpu': 'None',
                'min_gpu': 'None',
                'min_ram': 'None',
                'rec_cpu': 'None',
                'rec_gpu': 'None',
                'rec_ram': 'None'
            }];
            if ('platforms' in data){
                for(let i = 0; i < data['platforms'].length; ++i){
                    if('platform' in data['platforms'][i]){
                        if(data['platforms'][i]['platform']['id'] === 4){
                            analyze_requrements(result[0], data['platforms'][i]['requirements']);
                        }
                    }
                }
            }
            console.log(result)
            return result;
        }
    return result;
}

function analyze_requrements(result, data){
    result['min_cpu'] = data['minimum'];
    result['rec_cpu'] = data['recommended'];

}

function combine_url(api_url, params){
    let result = api_url + '?';
    for(let i in params){
        result += i + '=' + params[i] + '&';
    }
    result.substring(0, result.length - 1)
    return result;
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

export async function get_game_info(game_id){
    let api_url = `https://api.rawg.io/api/games/${game_id}`;
    let params = {
        'key': 'f51c080731c746f09f0a18e6f78f5360'
    };
    try {
        const data = await send_request(combine_url(api_url, params));
        return json_filter('game', data.result)
    } catch(error) {
        console.log(error.error); 
        return [{Model: 'ERROR'}];
    }
}

