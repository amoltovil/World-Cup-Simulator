# Explicación breve del funcionamiento del World Cup Simulator

Los nombres de los equipos los obtengo del siguiente archivo .json:
https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.teams.json

He subido al repo el archivo teams.js, aunque no es necesario porque no se utiliza.
También he subido .vscode aunque no seria necesario, ya que es un archivo de configuración de cada instalación de vscode.

Están implementadas las liguillas de grupos para luego pasar a la fase de eliminatorias (playoffs) con los 16 equipos clasificados, los dos mejores de cada grupo.

He creado una clase WorldLeague que tiene de particular para cada una de las 8 ligas el nombre del grupo. Para jugar las eliminatorias me baso también en esta clase y voy almacenando todos los partidos y resumenes de todas las fases (octavos, cuartos, semifinales, tercer y cuarto puesto y final).