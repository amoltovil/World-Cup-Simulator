
import League from './League.js';
import {LOCAL_TEAM, AWAY_TEAM} from './League.js';

export default class PointsBasedLeague extends League{
    //constructor(name, teams=[], rounds = 1, pointsPerWin=3, pointsPerDraw= 1, pointsPerLose=0 ){
        constructor(name, teams=[], config={}){
        //super(name, teams, rounds) // llama al constructor de la clase madre
        super(name, teams, config)
        
        //this.pointsPerWin = pointsPerWin
        //this.pointsPerDraw = pointsPerDraw
        //this.pointsPerLose = pointsPerLose
    }

    setup(config){
        const defaultConfig = {
            rounds: 1, 
            pointsPerWin : 3, 
            pointsPerDraw : 1, 
            pointsPerLose : 0 
        }
        this.config = Object.assign(defaultConfig, config)
    }

    customizeTeam(teamName) {
        const customizeTeam = super.customizeTeam(teamName)
        return {
            points:0,
            goalsFor: 0,
            goalsAgainst:0,
            ...customizeTeam
        }
    }

    generateGoals(){
        return Math.round(Math.random() * 10)
    }

    play(match, sePermiteEmpate) { //, sePuedeEmpatar = false) {
       // console.log('Juego el partido', match)
       const homeGoals = this.generateGoals()
       const awayGoals = this.generateGoals()
       if ((sePermiteEmpate) || (!sePermiteEmpate && (homeGoals != awayGoals))) {
           //console.log('devuelve el resultado')
           //console.log('no empatan', homeGoals, awayGoals)
            return {
                homeTeam: match[LOCAL_TEAM],
                homeGoals,
                awayTeam: match[AWAY_TEAM], 
                awayGoals
            }
        } else if (!sePermiteEmpate && (homeGoals === awayGoals)) { //tendrán que jugar hasta que homeGoals y awayGoals no sean iguales
           // console.log('empatan', !sePermiteEmpate, homeGoals, awayGoals)
            return this.play(match, sePermiteEmpate)
        }
       
    }

    getTeamForName(name){
        // Devuelve el primer nombre que cumpla la condición
        return this.teams.find(team => team.name == name)
    }

    updateTeams(result){
        //console.log('updateTeams', result)
         // buscar el equipo por su nombre en el array de equipos
        // 1ª manera -- > con filter
        /*const filteredTeams = this.teams.filter(function(team){
            //console.log ('----------->>>>>>>>', team.name, result.homeTeam, team.name == result.homeTeam, team.name, result.awayTeam, team.name == result.awayTeam, team.name == result.homeTeam || team.name == result.awayTeam )
            return team.name == result.homeTeam || team.name == result.awayTeam // si es true lo devuelve, sino no
        })
        console.log('filteredTeams', filteredTeams) */
        // 2ª manera -- > con find, solo devuelve un elemento
       /* const homeTeam = this.teams.find(function(team) {
            return result.homeTeam == team.name
        })*/
        const homeTeam = this.getTeamForName(result.homeTeam)
        /*const awayTeam = this.teams.find(function(team) {
            return result.awayTeam == team.name
        })*/
        const awayTeam = this.getTeamForName(result.awayTeam)
        if (homeTeam && awayTeam) { // si encuentra ambos equipos --> evita el equipo DESCANSA q devolverá undefined
            // sumar los goles a favor y goles en contra de cada equipo
            homeTeam.goalsFor += result.homeGoals
            homeTeam.goalsAgainst += result.awayGoals
            awayTeam.goalsFor += result.awayGoals
            awayTeam.goalsAgainst += result.homeGoals
            // añadir 3 puntos al equipo que gana y sumar los partidos ganados, empatados o perdidos
            if (result.homeGoals > result.awayGoals) {  // gana equipo local
                homeTeam.points += this.config.pointsPerWin
                homeTeam.matchesWon += 1
                awayTeam.points += this.config.pointsPerLose
                awayTeam.matchesLost += 1
            } else if (result.homeGoals < result.awayGoals) { // gana equipo visitante
                homeTeam.points += this.config.pointsPerLose
                homeTeam.matchesLost += 1
                awayTeam.points += this.config.pointsPerWin
                awayTeam.matchesWon += 1
            } else { // empate --> añadir 1 punto a los equipos si empatan
                homeTeam.points += this.config.pointsPerDraw
                homeTeam.matchesDrawn +=1
                awayTeam.points += this.config.pointsPerDraw
                awayTeam.matchesDrawn +=1
            }
        }
      //  console.log('TEAMS', homeTeam, awayTeam)
    }

    existeMatch(teamA, teamB){
        console.log('estoy aqui')
        if ((teamA.name == this.summaries.results.homeTeam && teamB.name == this.summaries.results.awayTeam) ||
            (teamB.name == this.summaries.results.homeTeam && teamA.name == this.summaries.results.awayTeam)) {
            return true    
        } else {
            return false
        }
    }

    getMatchBetweenTeams(teamA, teamB){
        // Devuelve la tupla que cumpla la condición
        return this.summaries.results.filter(existeMatch(teamA, teamB))
    }

    /*getMatchBetweenTeams(teamA, teamB, summaries){
        // encontrar los partidos jugados entre ellos 
        console.log('entro en la función')
    
        return(summaries.map ( matchDay =>{
            return matchDay.results.find(result => 
                (result.homeTeam == teamA.name && result.awayTeam == teamB.name) 
                || (result.homeTeam == teamB.name && result.awayTeam == teamA.name) 
            )
        })).filter(item => {
            return item != null
        })
    }*/

    /* Criterios de ordenación de los equipos:
     1º Por mayor nº de puntos ganados
     2º En caso de empates a puntos, buscaremos el/los partidos jugados entre ambos equipos 
     3º En caso de empate a nº de partidos ganados entre si, ordenaremos por mayor diferencia de goles 
     4º En último caso, por orden alfabético de nombre de equipo */
    getStandings(){ 
        this.teams.sort(function(teamA, teamB){
            // ordenamos por puntos
            if (teamA.points > teamB.points){
                return -1
            } else if (teamA.points < teamB.points){
                return 1
            } /*else {   //this.find () --> encontrar el partido
                console.log('Existe partido', this.existeMatch(teamA, teamB))
                if (this.existeMatch(teamA, teamB)) {
                     
                    console.log('Compara goles')
                } */
                //let matchBetweenTeams = this.getMatchBetweenTeams(teamA, teamB);
                /*if ((matchBetweenTeams.homeTeam == teamA.name) && (matchBetweenTeams.homeGoals > matchBetweenTeams.awayGoals)){
                    return -1;
                } else if ((matchBetweenTeams.homeTeam == teamA.name) && (matchBetweenTeams.homeGoals < matchBetweenTeams.awayGoals)){
                    return 1;
                } else if ((matchBetweenTeams.homeTeam == teamB.name) && (matchBetweenTeams.homeGoals > matchBetweenTeams.awayGoals)){
                    return 1;
                } else if ((matchBetweenTeams.homeTeam == teamB.name) && (matchBetweenTeams.homeGoals < matchBetweenTeams.awayGoals)){
                    return -1;
                } */
                else {  // empatan a puntos, el que menor diferencia de goles tenga
                
                    const goalsDiffA = teamA.goalsFor - teamA.goalsAgainst
                    const goalsDiffB = teamB.goalsfor - teamB.goalsAgainst
                
                    if (goalsDiffA > goalsDiffB) {
                        return -1
                    } else if (goalsDiffA < goalsDiffB) {
                        return 1
                    } else {  // POR DIFERENCIA ALFABETICA
                        return teamA.name > teamB.name ? 1 : teamA.name < teamB.name ? -1 : 0
                    }
                }
            //}
        })
        //console.log('standings')
        //console.table(this.teams)
    }

   
}
