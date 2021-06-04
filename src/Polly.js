const axios = require('axios');
const arrayBufferToAudioBuffer = require('arraybuffer-to-audiobuffer');

const speak = (text, voice, ssml) => {
    return new Promise((resolve, reject) => {
        console.log(text);
        const data = {
            'Text': text,
            'OutputFormat': 'mp3',
            'VoiceId': voice
        }
        if(ssml){
            data.TextType = "ssml"
        }
        axios.post('https://axleweb.tech/dialogflow/polly', data)
        .then(data => {
            console.log(data);
            var uInt8Array = new Uint8Array(data.data.data.AudioStream.data);
            var arrayBuffer = uInt8Array.buffer;
            arrayBufferToAudioBuffer(arrayBuffer)
            .then(audioBuffer => {
                resolve(audioBuffer);
            })
        })
        .catch(err => console.log(err));
    })
}

module.exports = {
    speak
};