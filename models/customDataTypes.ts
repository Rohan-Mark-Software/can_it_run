export interface SystemRequirement {
    cpu: string,
    gpy: string,
    ram: string,
    dx: string,
    os: string,
    sto: string,
    net: string
}

export interface GameInfo {
    game_name: string,
    minimum_requirement: SystemRequirement,
    recommended_requirement: SystemRequirement
}

