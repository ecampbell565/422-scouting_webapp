const request = require('./helper.js').request;
const constants = require('./constants.js');

//returns a promise
function fetch_data(route) {
  let options = {
    url: constants.BASE_URL + route,
    headers: {
      'User-Agent': 'request',
      'X-TBA-Auth-Key': constants.API_KEY
    }
  };

  return request(options)
}


function get_relevant_teams() { //useless function but good promise practice i guess
  return fetch_data(`/team/${constants.TEAM_KEY}/events/2018/keys`).then((res) => {
    var keys = JSON.parse(res[1]);
    var event_queries = [];

    keys.forEach((key) => {
      event_queries.push(fetch_data(`/event/${key}/teams/keys`));
    });

    return Promise.all(event_queries);
  }).then((queries) => {
    return queries.map(q => JSON.parse(q[1]));
  }).then((all_teams) => {    //this is a multidimensional array of teams for each event
    var relevant_teams = [];
    all_teams.forEach((event_teams) => {
      event_teams.forEach((team) => {
        relevant_teams.push(team);
      });
    });

    //remove any duplicates
    return relevant_teams.filter((item, pos) => {
      return relevant_teams.indexOf(item) == pos;
    });
  }).catch((err) => {
    console.log(err);
  });
}

function get_team_keys(event_key) {
  return fetch_data(`/event/${event_key}/teams/keys`).then((res) => {
    return JSON.parse(res[1]);
  });
}

//blue alliance api only supports year >= 2016
function get_avg_score_by_year(team_key, year) {
  return fetch_data(`/team/${team_key}/events/${year}/keys`).then((res) => {
    var event_keys = JSON.parse(res[1]);

    return Promise.all(event_keys.map((e) => {
      return fetch_data(`/team/${team_key}/event/${e}/matches/simple`).then((res) => {
        return JSON.parse(res[1]);
      })
    }));
  }).then((res) => {
    var event_count = res.length;
    var match_count = 0
    var sum = 0;    //in api scores are seperated by quals and playoffs, for now those are just added together
    res.forEach((event) => {
      event.forEach((match) => {
        match_count += 1;
        if(match.alliances.blue.team_keys.includes(team_key)) {
          sum += match.alliances.blue.score;
        } else {   //TODO: team always red...
          sum += match.alliances.red.score;
        }
      });
    });

    return sum / match_count;
  }).catch(err => console.log(err));
}

get_avg_score_by_year('frc422', 2017).then(avg => console.log(avg));
get_team_keys('2018vapor').then(teams => console.log(teams));
