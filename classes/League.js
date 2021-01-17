Array.prototype.shuffle = function()
{
	var i = this.length;
	while (i)
	{
		var j = Math.floor(Math.random() * i);
		var t = this[--i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
}

export const LOCAL_TEAM = 0
export const AWAY_TEAM = 1
export const GROUPS_DRAW_ALLOWED = true
export const PLAYOFFS_DRAW_ALLOWED = false

export default class League {
    constructor (name, teams=[], config ={}){
        this.name = name
        //this.teams = teams
        this.matchDaySchedule = []
        this.setup(config)
        this.setupTeams(teams)
        this.summaries = [] // Resumen de todas las jornadas de cada liga
    }

    setup(config) {
        const defaultConfig = { rounds: 1 }
        this.config = Object.assign(defaultConfig, config)
    }

    setupTeams(teamNames){
        this.teams=[]
        for (const teamName of teamNames) {
            // const team = {
            //     name: teamName, 
            //     matchesWon: 0,
            //     matchesDrawn: 0,
            //     matchesLost: 0
            // }
            const team = this.customizeTeam(teamName)
            this.teams.push(team)
        }
        //this.teams.shuffle()  // desordenamos los equipos al inicio y no aqui
    }

    customizeTeam(teamName) {
        return {
            name: teamName, 
            matchesWon: 0,
            matchesDrawn: 0,
            matchesLost: 0
        }
    }

    initSchedule(round){
        // el nº de jornadas es el nº de equipos - 1
        const numberOfMatchDays = this.teams.length -1
        const numberOfMatchesPerMatchDay = this.teams.length / 2
        for (let i =0; i < numberOfMatchDays; i++){
            const matchDay =[] // jornada vacia
            for (let j =0; j < numberOfMatchesPerMatchDay; j++ ) {
                const match = ['Equipo Local','Equipo Visitante']
                matchDay.push(match)

            }
            // una vez añadidos todos los partidos a la jornada
            //this.matchDaySchedule.push(matchDay) // añadimos la jornada a la planificación
            round.push(matchDay)
        }
    }

    getTeamNames(){
        return this.teams.map(team => team.name)
    }

    getTeamNamesForSchedule() {
        const teamNames = this.getTeamNames()
        if (teamNames.length % 2 == 0 ) { // son pares
            return teamNames
        } else { 
            return [...teamNames, null] // incluimos el equipo que descansa
        }
    }

    setLocalTeams(round){
        //const teamNames= this.getTeamNames()
        const teamNames= this.getTeamNamesForSchedule()
        //const maxHomeTeams = this.teams.length - 2 // nº maximo de equipos locales
        const maxHomeTeams = teamNames.length - 2 // nº maximo de equipos locales
        let teamIndex = 0
      //  this.matchDaySchedule.forEach(matchDay => { // por cada jornada
          round.forEach(matchDay => { // por cada jornada
            matchDay.forEach(match =>{  // por cada partido de cada jornada
                // establecemos el equipo local
                match[LOCAL_TEAM]= teamNames[teamIndex]
                teamIndex++
                if (teamIndex > maxHomeTeams){
                    teamIndex = 0 
                }
            })
        })   
    }

    setAwayTeams(round){
        //const teamNames = this.getTeamNames()
        const teamNames = this.getTeamNamesForSchedule()
        //const maxAwayTeams = this.teams.length -2 
        const maxAwayTeams = teamNames.length -2 
        let teamIndex = maxAwayTeams
        //this.matchDaySchedule.forEach(matchDay =>{
        round.forEach(matchDay =>{
            let isFirstMatch = true
            matchDay.forEach(match =>{
                if (isFirstMatch) {
                    isFirstMatch = false  // lo pone a false porque ya ha pasado por él
                } else {
                    match[AWAY_TEAM] = teamNames[teamIndex]
                    teamIndex --
                    if (teamIndex < 0 ){
                        teamIndex = maxAwayTeams
                    }
                }
            })
        })
    } 
    
    fixLastTeamSchedule(round){
        let matchDayNumber = 1
        //const teamNames = this.getTeamNames()
        const teamNames = this.getTeamNamesForSchedule()
        const lastTeamName = teamNames[teamNames.length-1]
        //this.matchDaySchedule.forEach(matchDay =>{
        round.forEach(matchDay =>{
            const firstMatch = matchDay[0]
            // establecer el último equipo de la lista como visitante o laical alternativamente
            if (matchDayNumber % 2 == 0 ) { //si jornada par  --> juega en casa
                firstMatch[AWAY_TEAM] = firstMatch[LOCAL_TEAM]
                firstMatch[LOCAL_TEAM] = lastTeamName
            } else { // jornada impar --> juega fuera 
                firstMatch[AWAY_TEAM]  = lastTeamName
            }
            matchDayNumber++  // aumentamos el día del partido
        })
    }

    //scheduleMatchDays(){
        //https://es.wikipedia.org/wiki/Sistema_de_todos_contra_todos
     /*   this.initSchedule()
        this.setLocalTeams()
        this.setAwayTeams()    
        this.fixLastTeamSchedule() // poner el ultimo equipo
        console.log('PLAN ORIGINAL', this.matchDaySchedule) */
        // si hay más de una ronda
       /*if (this.config.rounds > 1 ) {
            console.log('Hay más de una ronda')
            // nos saltamos la 1ª ronda que ya la tenemos
            // por cada ronda extra, creamos una copia de la 1ª ronda
            for (let i=1 ; i < this.config.rounds; i++) {
               // console.log('Ronda extra', i)
               const newRound = [...this.matchDaySchedule]  // hace una copia de la planificación
               //newRound.forEach(item => {
                   //this.matchDaySchedule.push(item) // añadir partidos de nueva ronda al final
                   if ( i % 2 != 0) { // es impar 
                       // dar la vuelta a los partidos, recorrer cada jornada y en cada partido cambiamos el orden de los equipos
                       for (const matchDay of newRound) {
                           for (const match of matchDay) {
                               const localTeam= match[LOCAL_TEAM]
                               match[LOCAL_TEAM] = match[AWAY_TEAM]
                               match[AWAY_TEAM] = localTeam
                           }
                       }

                   }
                   this.matchDaySchedule= this.matchDaySchedule.concat(newRound)  // añadir un array al final 
               
            }*/
        scheduleMatchDays(){
            for (let i = 0; i<this.config.rounds; i++){
                const newRound = this.createRound()

                // si la jornada es par, invertir los partidos
                if (i%2 !=0 ) {
                    for (const matchDay of newRound) {
                        for (const match of matchDay) {
                            const localTeam= match[LOCAL_TEAM]
                            match[LOCAL_TEAM] = match[AWAY_TEAM]
                            match[AWAY_TEAM] = localTeam
                        }
                    }
                }
                this.matchDaySchedule = this.matchDaySchedule.concat(newRound)
                
            }
            //const secondRound = this.createRound()
            //this.matchDaySchedule = this.matchDaySchedule.concat(secondRound)
        }
        
        createRound(){
            //https://es.wikipedia.org/wiki/Sistema_de_todos_contra_todos
        
            const newRound = []
            this.initSchedule(newRound)
            this.setLocalTeams(newRound)
            this.setAwayTeams(newRound)    
            this.fixLastTeamSchedule(newRound) // poner el ultimo equipo
            return newRound
        }

        // solución mejorada de como copiar jornadas
        scheduleMatchDays2(){
            const newRound = this.createRound()
            const i = 1
            this.matchDaySchedule = this.matchDaySchedule.concat(newRound)
            if (this.config.rounds > 1 ) {
                const secoundRound = this.matchDaySchedule.map(matchDay=>{
                    return matchDay.map(match =>{
                        const newMatch = [...match]  // copiamos los valores en un nuevo array
                        if (i%2 != 0) {
                            const localTeam = newMatch[LOCAL_TEAM]
                            newMatch[LOCAL_TEAM] = newMatch[AWAY_TEAM]
                            newMatch[AWAY_TEAM]= localTeam
                        }
                        return newMatch
                    })
                })
                this.matchDaySchedule = this.matchDaySchedule.concat(secoundRound)
            }
        }

    start(){ // comienza la liga 
        
        for (const matchDay of this.matchDaySchedule){
            // para cada jornada iremos añadiendo los resultados
            const matchDaySummary = { // solo de una jornada
                results: [], // array de objetos resultado
                standings: undefined // clasificación
            }
            for (const match of matchDay){
                //console.log('Jugar partido', match)
                const result = this.play(match, GROUPS_DRAW_ALLOWED)
                //console.log('Resultado', result)
                this.updateTeams(result) // actualizamos los equipos con el resultado del partido
                matchDaySummary.results.push(result)
            }
           
           // 'Calcular clasificación'
           this.getStandings()
           //matchDaySummary.standings = this.teams.map(team => team) // no funciona
           matchDaySummary.standings = this.teams.map(team => Object.assign({}, team)) // crea una copia del objeto en ese momento
          // matchDaySummary.standings.push({name: 'holaaaaaa'})
           // 'Guardar resumen de la jornada'
           this.summaries.push(matchDaySummary)
        }
    }

    getStandings(){
        throw new Error('getStandings method not implemented')
    }

    updateTeams(result){
        throw new Error('updateTeams method not implemented')
    }

    play(match){
        throw new Error('play method not implemented')
    }
    
    getMatchBetweenTeams(){
        throw new Error('getMatchBetweenTeams method not implemented')
    }
    
    existeMatch(){
        throw new Error('existeMatch method not implemented')
    }
}
