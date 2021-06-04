import React, { Component } from 'react';
import Airtable from './Airtable';
import Messages from "./Messages";
import Input from "./Input";
const uuidv4 = require('uuid/v4');

const axios = require('axios');
const qs = require('query-string');
// const random = require('random');
// global.sessionId = random.int(0, 100000);
global.sessionId = uuidv4();
global.project = '';
const from = {
  bot: "Bot",
  user: "User"
};

const api_host = 'https://axleweb.tech/dialogflow';

class Chatbot extends Component {
    state = {
        api_host: api_host,
        project: '',
        background: '',
        default_message: '',
        send_button_color: '',
        tts_button_color: '',
        stt_button_color: '',
        top_bar_color: '',
        top_bar_text: '',
        menu_flow: '',
        show_tts: false,
        show_stt: true,
        lang: '',
        voice: '',
        recognition_lang: '',
        ssml: false,
        auto_play_video: false,
        enable_auto_scroll: true,
        show_typing: false,
        time_delay: 1000,
        messages: [
          {
            id: 0,
            text: 'typing...',
            member: {
              color: '',
              text_color: '',
              username: '',
              avatar: '',
              avatar_size: '',
              avatar_shape: '',
              link_button_color: '',
              quick_reply_button_color: ''
            }
          }
        ],
        member: {
          id: '',
          username: '',
          color: '',
          text_color: ''
        }
      }

      componentDidMount() {
        const { project } = qs.parse(this.props.location.search);
        global.project = project;

        const messages = [
          {
            id: 0,
            text: 'typing...',
            member: {
              color: '',
              username: '',
              avatar: '',
              avatar_size: '',
              avatar_shape: '',
              link_button_color: '',
              quick_reply_button_color: ''
            }
          }
        ];

        const member = {
          id: 0,
          username: '',
          color: '',
          text_color: ''
        }

        axios.get(`${api_host}/settings?project=${project}`)
        .then(res => {
          messages[0].text = res.data.response.bot.initial_message;
          messages[0].member.color = res.data.response.bot.avatar_color;
          messages[0].member.username = res.data.response.bot.name;
          messages[0].member.avatar = res.data.response.bot.avatar_url;
          messages[0].member.avatar_size = res.data.response.bot.avatar_size ? res.data.response.bot.avatar_size : "30px";
          messages[0].member.avatar_shape = res.data.response.bot.avatar_shape ? res.data.response.bot.avatar_shape : "circle";
          messages[0].member.text_color = res.data.response.bot.text_color;
          messages[0].member.quick_reply_button_color = res.data.response.bot.quick_reply_button_color;
          messages[0].member.link_button_color = res.data.response.bot.link_button_color;
          member.username = res.data.response.user.name;
          member.text_color = res.data.response.user.text_color;
          this.setState({
            project: project,
            default_message: res.data.response.bot.default_message,
            backgroud: res.data.response.bot.background_color ? res.data.response.bot.background_color: "none",
            messages: messages, 
            member: member,
            auto_play_video: res.data.response.bot.auto_play_video ? res.data.response.bot.auto_play_video: false,
            enable_auto_scroll: res.data.response.bot.enable_auto_scroll,
            time_delay: res.data.response.bot.time_delay ? res.data.response.bot.time_delay : 1000,
            send_button_color: res.data.response.bot.send_button_color,
            tts_button_color: res.data.response.voice_options.tts.tts_button_color,
            stt_button_color: res.data.response.voice_options.stt.stt_button_color,
            top_bar_color: res.data.response.top_bar.color,
            top_bar_text: res.data.response.top_bar.text,
            menu_flow: res.data.response.bot.menu_flow ? res.data.response.bot.menu_flow : "vertical",
            show_tts: res.data.response.voice_options.tts.show_tts_button,
            show_stt: res.data.response.voice_options.stt.show_stt_button,
            stt_button_text: res.data.response.voice_options.stt.stt_button_text,
            lang: res.data.response.voice_options.tts.lang,
            recognition_lang: res.data.response.voice_options.stt.lang,
            voice: res.data.response.voice_options.tts.voice,
            ssml: res.data.response.voice_options.tts.enable_ssml
          });
          // if(res.data.response.bot.auto_say_hi){
          //   setTimeout(() => {
          //     this.onSendMessage("hi");
          //   }, 1000) ;
          // } else {
          if(res.data.response.bot.auto_say_hi){
            Airtable.writer(global.project, global.sessionId, from.bot, 'hi');
            axios.get(this.dialogflowEndpoint('hi'))
            .then((res) => {             
              console.log("res",res) 
            const fulfillmentMessages = this.getMessages(res.data.response.fulfillmentMessages);
            fulfillmentMessages.forEach((item, index) => setTimeout(() => {
              if(item.text){
                Airtable.writer(global.project, global.sessionId, from.bot, item.text.text[0]);
                this.setState({show_typing: true})
                messages.push({
                  id: this.state.messages.length,
                  text: item.text.text[0],
                  member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              }
              else if(item.payload){
                console.log("item.payload",item.payload);
                  if(item.payload.fields.buttons){
                    this.setState({show_typing: false})
                      messages.push({
                          id: this.state.messages.length,
                          buttons: item.payload.fields.buttons.listValue.values,
                          member: this.state.messages[0].member
                      })
                      this.setState({messages: messages})
                  } else if (item.payload.fields.linkButtons){
                      this.setState({show_typing: false})
                      messages.push({
                          id: this.state.messages.length,
                          linkButtons: item.payload.fields.linkButtons.listValue.values,
                          member: this.state.messages[0].member
                      })
                      this.setState({messages: messages})
                  } else if (item.payload.fields.videos){
                    messages.push({
                        id: this.state.messages.length,
                        videos: item.payload.fields.videos.listValue.values,
                        member: this.state.messages[0].member
                    })
                    this.setState({messages: messages})
                } else if (item.payload.fields.images){
                  messages.push({
                      id: this.state.messages.length,
                      images: item.payload.fields.images.listValue.values,
                      member: this.state.messages[0].member
                  })
                  setTimeout(() => {
                    this.setState({messages: messages})
                  }, 5000);
                }
              }
            }, index*this.state.time_delay))         
          })
          .catch(err => {
              console.log(err);
          });
          }
        });
      }

      dialogflowEndpoint = (message) => `${api_host}/query/${encodeURIComponent(message)}?project=${this.state.project}&sessionId=${global.sessionId}`;   
      getMessages = (fulfillmentMessages) => fulfillmentMessages.filter(message => message.platform === "PLATFORM_UNSPECIFIED");
      
      onSendMessage = (message) => {
        this.setState({show_typing: true})
        Airtable.writer(global.project, global.sessionId, from.user, message);
        const messages = this.state.messages;
        messages.push({
          id: this.state.messages.length,
          text: message,
          member: this.state.member
        })

        this.setState({messages: messages})
        
        const cards = [];
        axios.get(this.dialogflowEndpoint(message))
          .then((res) => {         
          const fulfillmentMessages = this.getMessages(res.data.response.fulfillmentMessages);
            
          fulfillmentMessages.forEach((item, index) => { 
            this.setState({show_typing: true}); 
            return setTimeout(() => {
            if(item.text){
              Airtable.writer(global.project, global.sessionId, from.bot, item.text.text[0]);
              this.setState({show_typing: true})
              messages.push({
                id: this.state.messages.length,
                text: item.text.text[0],
                member: this.state.messages[0].member
              })
              this.setState({messages: messages})
            } 
            else if(item.message === "card"){
              cards.push(item.card);
              this.setState({messages: messages})
            }
            else if(item.message === "quickReplies"){
              messages.push({
                id: this.state.messages.length,
                buttons: item.quickReplies.quickReplies,
                member: this.state.messages[0].member
              })
             this.setState({messages: messages})
            }
            else if(item.payload){
              if(item.payload.fields.buttons){
                //this.setState({show_typing: true})
                messages.push({
                    id: this.state.messages.length,
                    buttons: item.payload.fields.buttons.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              } 
              else if (item.payload.fields.linkButtons){
                //this.setState({show_typing: true})
                messages.push({
                    id: this.state.messages.length,
                    linkButtons: item.payload.fields.linkButtons.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              }
              else if (item.payload.fields.videos){
                messages.push({
                    id: this.state.messages.length,
                    videos: item.payload.fields.videos.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              } 
              else if (item.payload.fields.images){
                messages.push({
                    id: this.state.messages.length,
                    images: item.payload.fields.images.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              }
              else if (item.payload.fields.iframe){
                messages.push({
                    id: this.state.messages.length,
                    iframe: item.payload.fields.iframe.structValue.fields,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              }
            }
            setTimeout(() => this.setState({show_typing: false}),5000) 
          }, index*this.state.time_delay) } )
          messages.push({
            id: this.state.messages.length,
            card: cards,
            member: this.state.messages[0].member
          })          
        })
        .catch(err => {
            console.log(err);
        });
      }

    render() {
        return (
            <div className="App" style={{background: this.state.backgroud}} >
              <div 
                className="App-header"
                style = {{backgroundColor: this.state.top_bar_color}}
              >
                <h1>{this.state.top_bar_text}</h1>
              </div>
                <Messages
                    enableAutoScroll={this.state.enable_auto_scroll}
                    autoPlayVideo = {this.state.auto_play_video}
                    messages={this.state.messages}
                    currentMember={this.state.member}
                    menuFlow={this.state.menu_flow}
                    onButtonClick={this.onSendMessage}
                    showTyping={this.state.show_typing}
                    showTTS={this.state.show_tts}
                    tts_button_color={this.state.tts_button_color}
                    voice={this.state.voice}
                    ssml={this.state.ssml}
                />
                <Input
                    default_message={this.state.default_message}
                    onSendMessage={this.onSendMessage}
                    send_button_color={this.state.send_button_color}
                    stt_button_color={this.state.stt_button_color}
                    showTTS={this.state.show_tts}
                    showSTT={this.state.show_stt}
                    lang={this.state.recognition_lang}
                    STTButtonText={this.state.stt_button_text}
                />
            </div>
         );
    }
}

export default Chatbot;