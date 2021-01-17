//import request from 'request'
//import { worldCupTeamsNames, worldCupGroupsNames} from './teams.js'

import axios from 'axios'
import WorldCupLeague from './classes/WorldLeague.js'
import shuffle from './utils.js'
import {LOCAL_TEAM, AWAY_TEAM} from './classes/League.js';

const worldCupGroupsNames =['A', 'B', 'C', 'D', 'E', 'F', 'G','H']

const url= 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.teams.json'
try {
    const response = await axios.get(url)
 
    const worldCupTeamsNames = response.data.teams.map(team => team.name)
    
    const config = {rounds: 1}
    const TEAMSGROUP = 4

    // Validaciones del Juego
    const worldCupGroups = new Array (worldCupGroupsNames.length)
    const worldTeamsPerGroup = worldCupTeamsNames.length / worldCupGroupsNames.length
    if (worldTeamsPerGroup != TEAMSGROUP ) {
        //console.error("No se podrá jugar el torneo porque el nº de equipos entre el nº de grupos no son", TEAMSGROUP)
        throw new Error(`No se podrá jugar el torneo porque el nº de equipos entre el nº de grupos no son ${TEAMSGROUP}`)
    } 

    if (worldCupTeamsNames.length % worldCupGroupsNames.length != 0 ) {
        throw new Error("Error al configurar los equipos por grupos")   
    } 

    //const mundial = new WorldCupLeague('Liga Mundial', worldCupTeamsNames, config, worldCupGroupsNames)
    //console.log('equipos', worldCupTeamsNames)
    // Desordenamos los equipos aleatoriamente
    worldCupTeamsNames.shuffle()
    //console.log('equipos desordenados', worldCupTeamsNames)

    console.log("Grupos y equipos")
    console.log("================================\r\n")
    // creamos las ligas por grupos y asignamos los equipos de cada grupo de cuatro en cuatro
    const mundial = []
    let i = 0 
    let j = TEAMSGROUP
    let k = 0
    for (let group of worldCupGroupsNames) {
        
        if (k < 8) {
            mundial[k] = new WorldCupLeague('Liga Grupo ' + group, worldCupTeamsNames.slice(i, j), config, group)
            console.log(`Grupo ${mundial[k].groupName}`)
            console.log('------------------------------')
            for (let l=i;l<j; l++) {
                console.log(worldCupTeamsNames[l])
            }

            i = j 
            j = j + TEAMSGROUP
            console.log ('')
            //console.log(mundial[k].getTeamNames()) // pintame los equipos de cada grupo
            
            mundial[k].scheduleMatchDays2()
            //console.table(mundial[k].matchDaySchedule)
            
            let ind = 1
            mundial[k].matchDaySchedule.forEach(matchDay => { // para cada jornada
                
                console.log (`Jornada ${ind}:`)
                matchDay.forEach(match =>{  // para cada partido de cada jornada
                    // pintamos los partidos entre equipos
                    //console.log(`- ${match[LOCAL_TEAM]} vs ${match[AWAY_TEAM]} `)    
                    //console.log('-', match.join (' vs '))  // une los valores del array
                    const home = match[LOCAL_TEAM] !=null ? match[LOCAL_TEAM] :'DESCANSA'
                    const away = match[AWAY_TEAM] !=null ? match[AWAY_TEAM] :'DESCANSA'
                    console.log('-', `${home} vs ${away}`)
                })
                ind ++
                console.log('')
            })
        k++
        }  
    }
    
    console.log('================================================================')
    console.log('===================== COMIENZA EL MUNDIAL ======================')
    console.log('================================================================\r\n')

    //console.log('nº de jornadas grupo A', mundial[1].getNumberMatchDays('A'))

    for (k= 0; k<worldCupGroupsNames.length; k++) {
        mundial[k].start()  // juega cada una de las ligas y todas sus jornadas
    }

    // Muestro por pantalla los resultados para los grupos y jornadas
    for (i= 0; i< mundial[i].getNumberMatchDays('A'); i++) {
        for (k= 0; k<worldCupGroupsNames.length; k++) {
    
            console.log(`Grupo ${mundial[k].groupName} - Jornada ${i+1}:`)
            console.log('----------------------')
            mundial[k].summaries[i].results.forEach(result => {
                    
                console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam}`)
        
            })
        //console.log(`${mundial[k].summaries[i].result.homeTeam} ${mundial[k].summaries[i].result.homeGoals} - ${mundial[k].summaries[i].result.awayGoals} ${mundial[k].summaries[i].result.awayTeam}`)
        console.table(mundial[k].summaries[i].standings.map(team =>{
            return {
                Equipo: team.name, 
                Puntos: team.points, 
            /* PlayedMatches: team.matchesWon + team.matchesDrawn + team.matchesLost, 
                Won: team.matchesWon, 
                Drawn: team.matchesDrawn, 
                Lost: team.matchesLost, */
               "Goles a favor": team.goalsFor, 
                "Goles en contra": team.goalsAgainst,
                "Diferencia goles": team.goalsFor - team.goalsAgainst
            }
        }))
    // console.table(mundial[k].teams)
        }
    }

    console.log('================================================================')
    console.log('========== COMIENZO DE LA FASE DE ELIMINATORIAS ================')
    console.log('================================================================')

    const playOffTeamsMundial = []
    const playOffTeams = []
    const quarterFinalTeams = []
    const semiFinalTeams=[]
    const thirdFourthTeams=[]
    const finalTeams=[]
    // Obtenemos los equipos clasificados de las liguillas
    for (k= 0; k<worldCupGroupsNames.length; k++) {
        
        playOffTeamsMundial.push(mundial[k].getClasifyedTeamsPerGroup(mundial[k].groupName, mundial[k].teams))
        //playOffTeamsMundial[k] = mundial[k].getClasifyedTeamsPerGroup(mundial[k].groupName, mundial[k].teams)
        //console.log('Grupo', playOffTeamsMundial[k].group, ':')
        for (let i = 0; i < playOffTeamsMundial[k].teamsNames.length; i++){
        // console.log(`${i+1}º ${playOffTeamsMundial[k].teamsNames[i]}`)    
            playOffTeams.push(playOffTeamsMundial[k].teamsNames[i])
        }

    }
    //console.log('playOffTeamsMundial', playOffTeamsMundial)   
    //console.log('playOffTeams', playOffTeams ) 
    //console.log('Equipos clasificados:', playOffTeams)

    console.log('\r\n====== OCTAVOS DE FINAL =======\r\n')
    i = 0  // hago la llamada a la clase WordlLeague con el indice 0

    mundial[i].scheduleMatchDaysOctavos(playOffTeamsMundial)
    //console.log(mundial[i].matchDayScheduleOctavos)

    let fase = 'Eighths'
    //mundial[i].startOctavos()
    mundial[i].startEliminatory(fase)

    mundial[i].summariesOctavos[i].results.forEach(result => {

        if (result.homeGoals > result.awayGoals) {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.homeTeam}`)
            quarterFinalTeams.push(result.homeTeam)
        } else {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.awayTeam}`)
            quarterFinalTeams.push(result.awayTeam)
        }    

    })

    console.log('\r\n====== CUARTOS DE FINAL =======\r\n')
    //console.log('Equipos de cuartos', quarterFinalTeams)
    //mundial[i].scheduleMatchDaysQuarters(quarterFinalTeams)
    fase ='Quarters'
    mundial[i].scheduleMatchDaysEliminatory(quarterFinalTeams, fase)
    //console.log(mundial[i].matchDayScheduleQuarters)

    //mundial[i].startQuarters()
    mundial[i].startEliminatory(fase)
    // Mostramos los partidos de cuartos de final
    mundial[i].summariesQuarters[i].results.forEach(result => {

        if (result.homeGoals > result.awayGoals) {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.homeTeam}`)
            semiFinalTeams.push(result.homeTeam)
        } else {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.awayTeam}`)
            semiFinalTeams.push(result.awayTeam)
        }    
    })

    //console.log('Equipos de semifinales', semiFinalTeams)
    console.log('\r\n====== SEMIFINALES =======\r\n')

    fase ='SemiFinals'
    mundial[i].scheduleMatchDaysEliminatory(semiFinalTeams, fase)
    //console.log(mundial[i].matchDayScheduleSemiFinals)
    mundial[i].startEliminatory(fase)

    mundial[i].summariesSemiFinals[i].results.forEach(result => {

        if (result.homeGoals > result.awayGoals) {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.homeTeam}`)
            finalTeams.push(result.homeTeam)
            thirdFourthTeams.push(result.awayTeam)
        } else {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.awayTeam}`)
            finalTeams.push(result.awayTeam)
            thirdFourthTeams.push(result.homeTeam)
        }    
    })

    console.log('\r\n====== TERCER Y CUARTO PUESTO =======\r\n')
    fase ='Third&Fourth'
    mundial[i].scheduleMatchDaysEliminatory(thirdFourthTeams, fase)
    //console.log(mundial[i].matchDayScheduleThirdFourth)
    mundial[i].startEliminatory(fase)

    mundial[i].summariesThirdFourth[i].results.forEach(result => {

        if (result.homeGoals > result.awayGoals) {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.homeTeam}`)
        } else {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.awayTeam}`)
        }    
    })

    console.log('\r\n====== FINAL =======\r\n')
    fase ='Final'
    mundial[i].scheduleMatchDaysEliminatory(finalTeams, fase)
    //console.log(mundial[i].matchDayScheduleFinal)
    mundial[i].startEliminatory(fase)

    let winning_team =''
    mundial[i].summariesFinal[i].results.forEach(result => {

        if (result.homeGoals > result.awayGoals) {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.homeTeam}`)
            winning_team = result.homeTeam
        } else {
            console.log(`${result.homeTeam} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeam} => ${result.awayTeam}`)
            winning_team = result.awayTeam
        }    
    })

    console.log('\r\n======================================')
    console.log(`¡${winning_team} campeón del mundo!`)
    console.log('======================================')

} catch(error){
    console.error('ERROR', error)
}
