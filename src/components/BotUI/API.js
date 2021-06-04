const axios = require('axios');
const api_host = 'https://axleweb.tech/dialogflow';
const random = require('random');
const sessionId = random.int(0, 1000);

const getProjectData = (project) => {
    return new Promise((resolve, reject) => {
        axios.get(`${api_host}/settings?project=${project?project:'bondstreetpawnbrokersweb'}`)
        .then(result => {
            resolve(result.data.response)
        })
        .catch(err => reject(err));
    })
}

const getDialogflowData = (message, project) => {
    return new Promise((resolve, reject) => {
        axios.get(`${api_host}/query/${encodeURIComponent(message)}?project=${project?project:'bondstreetpawnbrokersweb'}&sessionId=${sessionId}`)
        .then(result => {
            resolve(result.data.response)
        })
        .catch(err => reject(err));
    })
}

module.exports = {
    getProjectData,
    getDialogflowData
}