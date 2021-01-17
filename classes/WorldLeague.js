import FootBallLeague from './PointsBasedLeague.js';
import {LOCAL_TEAM, AWAY_TEAM, PLAYOFFS_DRAW_ALLOWED} from './League.js';

export default class WorldLeague extends FootBallLeague{
    
    constructor(name, teams=[], config={}, group){
       
        super(name, teams, config)
        this.groupName = group
        this.matchDayScheduleOctavos = []
        this.matchDayScheduleQuarters = []
        this.matchDayScheduleSemiFinals = []
        this.matchDayScheduleThirdFourth = []
        this.matchDayScheduleFinal=[]
        this.summariesOctavos=[]
        this.summariesQuarters=[]
        this.summariesSemiFinals=[]
        this.summariesThirdFourth=[]
        this.summariesFinal=[]
    }

    getNumberMatchDays(){
        const numberOfMatchDays = this.teams.length - 1
        return numberOfMatchDays
    }

    getClasifyedTeamsPerGroup(group, teams) { 
        // Obtengo para cada grupo un nuevo array con los dos primeros equipos clasificados 
        // ya que estaban ordenados por puntos
        const teamsClasifyed = []//[{group: group, teamsNames}]
        teamsClasifyed.group = group
        //playOffTeams.teams = teams.slice(0, 2)
        teamsClasifyed.teamsNames = teams.slice(0,2).map(team => team.name)
        return teamsClasifyed
    }

    getTotalTeamsClasifyed(teamsClasifyed){
        let totalTeamsGroups = 0 
        for (let teams of teamsClasifyed) {
            totalTeamsGroups += teams.teamsNames.length 
        }
        return totalTeamsGroups
    }
    
    initSchedulePlayOffs(round, teamsClasifyed){
      
        const totalTeamsClasifyed = this.getTotalTeamsClasifyed(teamsClasifyed)
        const numberOfMatchDays = 1 // consideramos que se juegan en una sola jornada
        const numberOfMatchesPerMatchDay = totalTeamsClasifyed / 2 // el nº de partidos de cada jornada
        for (let i =0; i < numberOfMatchDays; i++){
            const matchDayOctavos =[] // jornada vacia
            for (let j =0; j < numberOfMatchesPerMatchDay; j++ ) {
                const matchOctavos = ['Equipo Local','Equipo Visitante']
                matchDayOctavos.push(matchOctavos)
            }
            // una vez añadidos todos los partidos a la jornada
            //this.matchDayScheduleOctavos.push(matchDayOctavos) // añadimos la jornada a la planificación
            
            round.push(matchDayOctavos)
            //console.log(matchDayOctavos)
        }
        
    }
   
   setMatchsTeamsOctavos(round, teamsClasifyed){
        const maxTeams = teamsClasifyed[0].teamsNames.length - 1// nº maximo de equipos de un grupo
        let teamIndex = 0
        
        round.forEach(matchDayOctavos => { // por cada jornada
            let i = 0 
            
            matchDayOctavos.forEach(matchOctavos =>{  // por cada partido de cada jornada
                // establecemos el equipo local y el visitante
                if (i % 2 == 0) {  // partidos de 1ºs de grupo con 2º de grupo contiguo
                    matchOctavos[LOCAL_TEAM] = teamsClasifyed[i].teamsNames[teamIndex]
                    matchOctavos[AWAY_TEAM] = teamsClasifyed[i+1].teamsNames[++teamIndex]
                    teamIndex++
                            
                    if (teamIndex > maxTeams){
                        teamIndex = 0 
                    }   
                
                } else {
                    matchOctavos[LOCAL_TEAM] = teamsClasifyed[i].teamsNames[teamIndex]
                    matchOctavos[AWAY_TEAM] = teamsClasifyed[i-1].teamsNames[++teamIndex]
            
                    teamIndex++
                    if (teamIndex > maxTeams){
                        teamIndex = 0 
                    }   
                }
                i++ // siguiente partido
            })
        })              
    }

    sortTeamsOctavos(round) {
        const bloque1 = []
        const bloque2 = []
        let ordenado = undefined
        //console.log('Rondas desordenadas', round)
        let i = 0
        let j = 0 
        let k = 0
        while (j < round[k].length / 2) {
            
            bloque1[j]= round[k][i] 
            bloque2[j]= round[k][i+1]
            j++
            i=i+2
        
        }
        //console.log('bloque1', bloque1)
        //console.log('bloque2', bloque2)
        ordenado = bloque1.concat(bloque2)
        //console.log('rondas ordenadas', ordenado)
        return ordenado
        
    }
        
    createRoundOctavos(teams){
        
        const newRound = []
        this.initSchedulePlayOffs(newRound, teams)
        this.setMatchsTeamsOctavos(newRound, teams)
        return newRound
    }

    scheduleMatchDaysOctavos(teams){
        
        //enlace de wikipedia
        for (let i=0;i < this.config.rounds; i++){
            const newRound = this.createRoundOctavos(teams)
            
            if (i % 2 != 0) {
                for (const matchDay of newRound) {
                    for (const match of matchDay) {
                        const localTEam = match[LOCAL_TEAM]
                        match[LOCAL_TEAM] = match[AWAY_TEAM]
                        match[AWAY_TEAM] = localTEam
                    }
                }
            }
        
        this.matchDayScheduleOctavos =  this.matchDayScheduleOctavos.concat(newRound)

        // ORDENAMOS LOS PARTIDOS OBTENIDOS PARA QUE NO SE CRUZEN HASTA LA FINAL
        const roundSort = this.matchDayScheduleOctavos.map(matchDayOctavos=>{
            return this.sortTeamsOctavos(newRound)  
        })
        
        this.matchDayScheduleOctavos = this.matchDayScheduleOctavos.concat(roundSort)
        //console.log('añadidas rondas ordenadas', this.matchDayScheduleOctavos)
        this.matchDayScheduleOctavos = this.matchDayScheduleOctavos.slice(1)
        //console.log('despues de quitar el elemento 0 ', this.matchDayScheduleOctavos)
        }
    }

    /*startOctavos(){ // comienzan a jugar Octavos
        
        for (const matchDay of this.matchDayScheduleOctavos){
            // para cada jornada iremos añadiendo los resultados
            const matchDaySummary = { // solo de una jornada
                results: [], // array de objetos resultado
                standings: undefined  // clasificación
                //teamWin:String,  // equipo ganador  
                //teamLose:String // equipo perdedor
            }
            for (const match of matchDay){
                
                const result = this.play(match, PLAYOFFS_DRAW_ALLOWED)
                //console.log('Resultado', result)
                //this.updateTeamsOctavos(result) // actualizamos los equipos con el resultado del partido
                matchDaySummary.results.push(result)
            }
           
           // 'Calcular clasificación'
           //this.getStandings()
           //matchDaySummary.standings = this.teams.map(team => team) // no funciona
           matchDaySummary.standings = this.teams.map(team => Object.assign({}, team)) // crea una copia del objeto en ese momento
           
           // 'Guardar resumen de la jornada'
           this.summariesOctavos.push(matchDaySummary)
        }
    }*/

    initScheduleEliminatory(round, teamsClasifyed){
      
        const totalTeamsClasifyed = teamsClasifyed.length //this.getTotalTeamsClasifyed(teamsClasifyed)
        const numberOfMatchDays = 1 // consideramos que se juegan en una sola jornada
        const numberOfMatchesPerMatchDay = totalTeamsClasifyed / 2 // el nº de partidos de cada jornada
        for (let i =0; i < numberOfMatchDays; i++){
            const matchDay =[] // jornada vacia
            for (let j =0; j < numberOfMatchesPerMatchDay; j++ ) {
                const match = ['Equipo Local','Equipo Visitante']
                matchDay.push(match)
            }
            // una vez añadidos todos los partidos a la jornada
            // añadimos la jornada a la planificación
            round.push(matchDay)
        }
    }

    //createRoundQuarters(teams){
    createRoundEliminatory(teams){  
        
        const newRound = []
        //this.initScheduleQuarters(newRound, teams)
        this.initScheduleEliminatory(newRound, teams)
        //this.setMatchsTeamsQuarters(newRound, teams)
        this.setMatchsTeamsEliminatory(newRound, teams)
        return newRound
    }

    //scheduleMatchDaysQuarters(teams, fase){
    scheduleMatchDaysEliminatory(teams, fase){
        
        for (let i=0;i < this.config.rounds; i++){
           // const newRound = this.createRoundQuarters(teams)
           const newRound = this.createRoundEliminatory(teams)
            if (i % 2 != 0) {
                for (const matchDay of newRound) {
                    for (const match of matchDay) {
                        const localTeam = match[LOCAL_TEAM]
                        match[LOCAL_TEAM] = match[AWAY_TEAM]
                        match[AWAY_TEAM] = localTeam
                    }
                }
            }
            if (fase == 'Quarters') {
                this.matchDayScheduleQuarters = this.matchDayScheduleQuarters.concat(newRound)
            } else if (fase == 'SemiFinals') {
                this.matchDayScheduleSemiFinals = this.matchDayScheduleSemiFinals.concat(newRound)
            } else if (fase =='Third&Fourth') {
                this.matchDayScheduleThirdFourth = this.matchDayScheduleThirdFourth.concat(newRound)
            } else if (fase =='Final') {
                this.matchDayScheduleFinal =  this.matchDayScheduleFinal.concat(newRound)
            }
        }
    }

    /*setMatchsTeamsQuarters(round, teamsClasifyed){
        
        round.forEach(matchDayQuarters => { // por cada jornada
            let i = 0
            matchDayQuarters.forEach(matchQuarter =>{  // por cada partido de cada jornada
                // establecemos el equipo local y el visitante
                matchQuarter[LOCAL_TEAM] = teamsClasifyed[i]
                matchQuarter[AWAY_TEAM] = teamsClasifyed[i+1]
              
                i = i+2 // siguiente partido
            })
        })              
    }*/

    setMatchsTeamsEliminatory(round, teamsClasifyed){
        
        round.forEach(matchDay => { // por cada jornada
            let i = 0
            matchDay.forEach(match =>{  // por cada partido de cada jornada
                // establecemos el equipo local y el visitante
                match[LOCAL_TEAM] = teamsClasifyed[i]
                match[AWAY_TEAM] = teamsClasifyed[i+1]
              
                i = i+2 // siguiente partido
            })
        })              
    }

    startEliminatory(fase) { 

        let matchDaySchedule = []
        if (fase == 'Eighths') {
            matchDaySchedule = this.matchDayScheduleOctavos
        } else if (fase =='Quarters') {
            matchDaySchedule = this.matchDayScheduleQuarters
        } else if (fase =='SemiFinals' ) {
            matchDaySchedule = this.matchDayScheduleSemiFinals
        } else if (fase =='Third&Fourth' ) {
            matchDaySchedule = this.matchDayScheduleThirdFourth
        } else if (fase =='Final' ) {
            matchDaySchedule = this.matchDayScheduleFinal
        }
        
        for (const matchDay of matchDaySchedule){
            // para cada jornada iremos añadiendo los resultados de los partidos
            const matchDaySummary = { results: [] }
            for (const match of matchDay){
                const result = this.play(match, PLAYOFFS_DRAW_ALLOWED)
                //console.log('Resultado', result)
                matchDaySummary.results.push(result)
            }
        
        //  matchDaySummary.standings = this.teams.map(team => Object.assign({}, team)) // crea una copia del objeto en ese momento
           // Guardamos el resumen de la jornada de cada fase
           if (fase == 'Eighths') {
                this.summariesOctavos.push(matchDaySummary)  
           } else if (fase =='Quarters') {
                this.summariesQuarters.push(matchDaySummary)  
            } else if (fase =='SemiFinals' ) {
                this.summariesSemiFinals.push(matchDaySummary)
            } else if (fase =='Third&Fourth' ) {
                this.summariesThirdFourth.push(matchDaySummary)
            } else if (fase =='Final' ) {
                this.summariesFinal.push(matchDaySummary)
            }
        }
    }

}
