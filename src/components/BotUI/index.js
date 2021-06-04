import React, { Component } from 'react';
import API from './API';
import Defaults from './defaults';
import Messages from './Messages';
import Input from './Input';
const qs = require('query-string');

class BotUI extends Component {
    state = {
        project: '',
        default_message: '',
        send_button_color: '',
        tts_button_color: '',
        stt_button_color: '',
        top_bar_color: '',
        top_bar_text: '',
        show_tts: false,
        show_stt: true,
        lang: '',
        voice: '',
        ssml: false,
        recognition_lang: '',
        enable_auto_scroll: true,
        messages: [
          {
            id: 0,
            text: '...',
            member: {
              color: '',
              text_color: '',
              username: '',
              avatar: '',
              link_button_color: '',
              link_text_color: '',
              quick_reply_button_color: '',
              quick_reply_text_color: ''
            }
          }
        ],
        member: {
          id: '',
          username: '',
          color: '',
          text_color: ''
        },
        suggestions: ''
      }

    componentDidMount() {
        const { project } = qs.parse(this.props.location.search);
        const {messages, member} = Defaults;
        API.getProjectData(project)
        .then(data => {
           console.log(data.suggestions)
            messages[0].text = data.bot.initial_message;
            messages[0].member.color = data.bot.avatar_color;
            messages[0].member.username = data.bot.name;
            messages[0].member.avatar = data.bot.avatar_url;
            messages[0].member.text_color = data.bot.text_color;
            messages[0].member.quick_reply_button_color = data.bot.quick_reply_button_color;
            messages[0].member.quick_reply_text_color = data.bot.quick_reply_text_color;
            messages[0].member.link_button_color = data.bot.link_button_color;
            messages[0].member.link_text_color = data.bot.link_text_color;
            member.username = data.user.name;
            member.text_color = data.user.text_color;
            this.setState({
              project: project,
              default_message: data.bot.default_message,
              messages: messages, 
              member: member,
              enable_auto_scroll: data.bot.enable_auto_scroll,
              send_button_color: data.bot.send_button_color,
              tts_button_color: data.voice_options.tts.tts_button_color,
              stt_button_color: data.voice_options.stt.stt_button_color,
              top_bar_color: data.top_bar.color,
              top_bar_text: data.top_bar.text,
              show_tts: data.voice_options.tts.show_tts_button,
              show_stt: data.voice_options.stt.show_stt_button,
              stt_button_text: data.voice_options.stt.stt_button_text,
              lang: data.voice_options.tts.lang,
              voice: data.voice_options.tts.voice,
              recognition_lang: data.voice_options.stt.lang,
              ssml: data.voice_options.tts.enable_ssml,
              suggestions: data.suggestions
            });
        });

      
        API.getDialogflowData('hi', project)
          .then((data) => {              
          data.fulfillmentMessages
          .filter(item => item.platform === "ACTIONS_ON_GOOGLE")
          .forEach(item => {
            console.log(item.message)
            if(item.message === "simpleResponses"){
                if(item.simpleResponses.simpleResponses[0].textToSpeech){
                    messages.push({
                        id: this.state.messages.length,
                        text: item.simpleResponses.simpleResponses[0].textToSpeech,
                        member: this.state.messages[0].member
                    })
                } 
                else if(item.simpleResponses.simpleResponses[0].ssml){
                    messages.push({
                        id: this.state.messages.length,
                        text: item.simpleResponses.simpleResponses[0].ssml,
                        member: this.state.messages[0].member
                      })
                }
            } else
            if(item.message === "basicCard"){
                if(item.basicCard.buttons){
                    messages.push({
                        id: this.state.messages.length,
                        linkButtons: [{ text: item.basicCard.buttons[0].title, url: item.basicCard.buttons[0].openUriAction }],
                        member: this.state.messages[0].member
                    })
                } 
            } 
            if(item.message === "suggestions"){
                console.log(item.suggestions.suggestions.map(button => button.title));
                messages.push({
                    id: this.state.messages.length,
                    buttons: item.suggestions.suggestions.map(button => button.title),
                    member: this.state.messages[0].member
                })
            }
            if(item.message === "linkOutSuggestion"){
              console.log('video', item);
              const uri = item.linkOutSuggestion.uri;
              if(uri.toLowerCase().contains(".mp4")){
                  messages.push({
                    id: this.state.messages.length,
                    videos: item.linkOutSuggestion.uri,
                    member: this.state.messages[0].member
                })
              } else {
                  messages.push({
                    id: this.state.messages.length,
                    linkButtons: [{ text: item.linkOutSuggestion.destinationName, url: item.linkOutSuggestion.uri }],
                    member: this.state.messages[0].member
                })
              }
            }
          });
          this.setState({messages: messages})
        })
        .catch(err => {
            console.log(err);
        });
    }

    getMessages = (fulfillmentMessages) => fulfillmentMessages.filter(message => message.platform === "PLATFORM_UNSPECIFIED");

    onSendMessage = (message) => {
        const messages = this.state.messages;
        messages.push({
          id: this.state.messages.length,
          text: message,
          member: this.state.member
        })
        this.setState({messages: messages})
      
        API.getDialogflowData(message, this.state.project)
          .then((data) => {              
          console.log(data.fulfillmentMessages);
          data.fulfillmentMessages
          .filter(item => item.platform === "ACTIONS_ON_GOOGLE")
          .forEach(item => {
            console.log(item)
            if(item.message === "simpleResponses"){
                if(item.simpleResponses.simpleResponses[0].textToSpeech){
                    messages.push({
                        id: this.state.messages.length,
                        text: item.simpleResponses.simpleResponses[0].textToSpeech,
                        member: this.state.messages[0].member
                    })
                } 
                else if(item.simpleResponses.simpleResponses[0].ssml){
                    messages.push({
                        id: this.state.messages.length,
                        text: item.simpleResponses.simpleResponses[0].ssml,
                        member: this.state.messages[0].member
                      })
                }
            } else
            if(item.message === "basicCard"){
              console.log('basicCard', item);
              if(item.basicCard.buttons.length > 0){
                  messages.push({
                      id: this.state.messages.length,
                      linkButtons: [{ text: item.basicCard.buttons[0].title, url: item.basicCard.buttons[0].openUriAction }],
                      member: this.state.messages[0].member
                  })
              }
              if(item.basicCard.image){
                messages.push({
                    id: this.state.messages.length,
                    images: [{src: item.basicCard.image.imageUri, alt: item.basicCard.image.accessibilityText, width: "50%"}],
                    member: this.state.messages[0].member
                })
              }  
            } 
            if(item.message === "suggestions"){
                console.log(item.suggestions.suggestions.map(button => button.title));
                messages.push({
                    id: this.state.messages.length,
                    buttons: item.suggestions.suggestions.map(button => button.title),
                    member: this.state.messages[0].member
                })
            }
            if(item.message === "linkOutSuggestion"){
              const uri = item.linkOutSuggestion.uri;
              if(uri.toLowerCase().includes(".mp4")){
                  messages.push({
                    id: this.state.messages.length,
                    videos: [{src: item.linkOutSuggestion.uri, width: "90%"}],
                    member: this.state.messages[0].member
                })
              } else {
                  messages.push({
                    id: this.state.messages.length,
                    linkButtons: [{ text: item.linkOutSuggestion.destinationName, url: item.linkOutSuggestion.uri }],
                    member: this.state.messages[0].member
                })
              }
            }
          });
          this.setState({messages: messages})
        })
        .catch(err => {
            console.log(err);
        });
      }
    

    render() {
        return (
            <div className="App">
              <div 
                className="App-header"
                style = {{backgroundColor: this.state.top_bar_color}}
              >
                <h1>{this.state.top_bar_text}</h1>
              </div>
                <Messages
                    enableAutoScroll={this.state.enable_auto_scroll}
                    messages={this.state.messages}
                    currentMember={this.state.member}
                    onButtonClick={this.onSendMessage}
                    showTTS={this.state.show_tts}
                    tts_button_color={this.state.tts_button_color}
                    voice={this.state.voice}
                    ssml={this.state.ssml}
                />
                <Input
                    suggestions={this.state.suggestions}
                    default_message={this.state.default_message}
                    onSendMessage={this.onSendMessage}
                    send_button_color={this.state.send_button_color}
                    stt_button_color={this.state.stt_button_color}
                    showTTS={this.state.show_tts}
                    showSTT={this.state.show_stt}
                    lang={this.state.recognition_lang}
                    margin={this.state.show_stt? "80px": "50px"}
                    STTButtonText={this.state.stt_button_text}
                />
            </div>
        );
    }
}

export default BotUI;