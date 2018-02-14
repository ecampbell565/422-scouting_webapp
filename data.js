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


function get_relevant_teams() {
  return fetch_data(`/team/${constants.TEAM_KEY}/events/2018/keys`).then((res) => {
    keys = JSON.parse(res[1]);
    event_queries = [];

    keys.forEach((key) => {
      event_queries.push(fetch_data(`/event/${key}/teams/keys`));
    });

    return Promise.all(event_queries);
  }).then((queries) => {
    return queries.map(q => q[1]);
  }).then((teams) => {
    relevant_teams = [];
    teams.forEach((event_teams) => {
      //change string with \ns to array
      event_teams = event_teams.replace(/[\\n \[\]"]/, '').split(",");
      console.log(event_teams.map((mess) => {
        mess.replace(/[n]/, '');
      }))

      if(!(team in relevant_teams)) {
        relevant_teams.push(team)
      }
    });

    return relevant_teams;
  }).catch((err) => {
    console.log(err);
  });
}

get_relevant_teams().then((teams) => {
  // console.log(teams);
});
