import React, { Component } from 'react';
import Messages from "./Messages";
import Input from "./Input";
const axios = require('axios');
const qs = require('query-string');

const api_host = 'https://axleweb.tech/dialogflow';

class ChatbotX extends Component {
    state = {
        messages: [],
        showReplyTextBox: true,
        url:''
      }

      componentDidMount() {
        const { project, langCode, utterance } = qs.parse(this.props.location.search);
        global.project = project;
        this.setState({
          langCode: langCode,
          url:window.location
        })

        const messages = [
          {
            id: 0,
            member: {}
          }
        ];

        const member = {
          id: 0,
        }

        axios.get(`${api_host}/settings?project=${project}`)
        .then(res => {
          console.log("res",res)
          messages[0].text = 'HIDDEN';
          messages[0].member.color = res.data.response.bot.avatar_color;
          messages[0].member.username = res.data.response.bot.name;
          messages[0].member.avatar = res.data.response.bot.avatar_url;
          messages[0].member.avatar_size = res.data.response.bot.avatar_size ? res.data.response.bot.avatar_size : "30px";
          messages[0].member.avatar_shape = res.data.response.bot.avatar_shape ? res.data.response.bot.avatar_shape : "circle";
          messages[0].member.text_color = res.data.response.bot.theme.message.text_color;
          messages[0].member.background_color = res.data.response.bot.theme.message.background_color;
          messages[0].member.quick_reply_button_text_color = res.data.response.bot.theme.quick_reply_button.text_color;
          messages[0].member.quick_reply_button_background_color = res.data.response.bot.theme.quick_reply_button.background_color;
          messages[0].member.link_button_text_color = res.data.response.bot.theme.link_button.text_color;
          messages[0].member.link_button_background_color = res.data.response.bot.theme.link_button.background_color;
          member.username = res.data.response.user.name;
          member.text_color = res.data.response.user.theme.message.text_color;
          member.background_color = res.data.response.user.theme.message.background_color;
          this.setState({
            project: project,
            backgroud: res.data.response.generic.body.backgroud ? res.data.response.generic.body.backgroud : "none",
            messages: messages, 
            member: member,
            auto_play_video: res.data.response.bot.auto_play_video ? res.data.response.bot.auto_play_video: false,
            enable_auto_scroll: res.data.response.bot.enable_auto_scroll,
            time_delay: res.data.response.bot.time_delay ? res.data.response.bot.time_delay : 1000,
            menu_flow: res.data.response.bot.menu_flow ? res.data.response.bot.menu_flow : "vertical",
            whenButtonHideReplyTextBox: res.data.response.bot.when_button_hide_reply_box ? res.data.response.bot.when_button_hide_reply_box : false,
            // Send Button
            send_button_text_color: res.data.response.bot.theme.send_button.text_color,
            send_button_background_color: res.data.response.bot.theme.send_button.background_color,
            send_button_text: res.data.response.bot.theme.send_button.text ? res.data.response.bot.theme.send_button.text : "",
            // Header
            top_bar_text_color: res.data.response.generic.header.text_color,
            top_bar_background_color: res.data.response.generic.header.background_color,
            top_bar_text: res.data.response.generic.header.name,
            top_bar_font_size: res.data.response.generic.header.font_size,
            top_bar_logo: res.data.response.generic.header.logo_url,
            top_bar_logo_width: res.data.response.generic.header.logo_width,
            font_weight:res.data.response.generic.header.font_weight?res.data.response.generic.header.font_weight: "normal",
            align:res.data.response.generic.header.align?res.data.response.generic.header.align: "",
            // TTS settings
            show_tts: res.data.response.voice_options.tts.show_tts_button,
            lang: res.data.response.voice_options.tts.lang,
            tts_button_text_color: res.data.response.voice_options.tts.button.text_color,
            tts_button_background_color: res.data.response.voice_options.tts.button.background_color,
            voice: res.data.response.voice_options.tts.voice,
            ssml: res.data.response.voice_options.tts.enable_ssml,
            // STT settings
            show_stt: res.data.response.voice_options.stt.show_button,
            stt_button_text: res.data.response.voice_options.stt.button.text,
            stt_button_text_color: res.data.response.voice_options.stt.button.text_color,
            stt_button_background_color: res.data.response.voice_options.stt.button.background_color,
            recognition_lang: res.data.response.voice_options.stt.lang,
          });
        
          axios.get(this.dialogflowEndpoint(utterance ? utterance : 'hi'))
            .then((res) => {      
              console.log("res",res)        
            const fulfillmentMessages = this.getMessages(res.data.response.fulfillmentMessages);
        
            fulfillmentMessages.forEach((item, index) => setTimeout(() => {
              if(item.text){
                console.log("item.text",item.text)
                fulfillmentMessages.length - 1 === index ? this.setState({show_typing: false}) : this.setState({show_typing: true})  
                
                messages.push({
                  id: this.state.messages.length,
                  text: item.text.text[0],
                  member: this.state.messages[0].member
                })
                this.setState({messages: messages})
              }
              else if(item.payload){
                console.log("payload here",item.payload);
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
                  }  else if (item.payload.fields.popup){
                    messages.push({
                        id: this.state.messages.length,
                        popup: item.payload.fields.popup.structValue.fields,
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
                } 
                else if (item.payload.fields.singleSelect){
                  console.log("item.payload.fields.singleSelect",item.payload.fields.singleSelect)
                  messages.push({
                      id: this.state.messages.length,
                      singleSelect: ["red", "green", "blue"],
                      member: this.state.messages[0].member
                  })
                  this.setState({messages: messages})
              }
              else if (item.payload.fields.multiSelect){
                messages.push({
                    id: this.state.messages.length,
                    multiSelect:["red", "green", "blue"],
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
        });
      }

      dialogflowEndpoint = (message) => {
        return this.state.langCode ?
        `${api_host}/query/${encodeURIComponent(message)}?project=${this.state.project}&langCode=${this.state.langCode}&sessionId=${global.sessionId}`:
        `${api_host}/query/${encodeURIComponent(message)}?project=${this.state.project}&sessionId=${global.sessionId}`  
      } 
      getMessages = (fulfillmentMessages) => fulfillmentMessages.filter(message => message.platform === "PLATFORM_UNSPECIFIED");
      onSetParam = (param) => {
        console.log("state langcode",this.state.langCode)
        var str = this.state.url.search
        if(this.state.langCode=='en'){
          var res = str.replace("en", param);
          this.props.history.push({
            pathname:this.state.url.pathname,
            search:res
          })
          window.location.reload()
        }
        else{
          var res = str.replace("hi", param);
          this.props.history.push({
            pathname:this.state.url.pathname,
            search:res
          })
          window.location.reload()
        }
        }
      onSendMessage = (message) => {
        this.setState({show_typing: true})
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
            return setTimeout(() => {
              console.log("item",item)
            if(item.text){
              fulfillmentMessages.length - 1 === index ? this.setState({show_typing: false}) : this.setState({show_typing: true})  
              messages.push({
                id: this.state.messages.length,
                text: item.text.text[0],
                member: this.state.messages[0].member
              })
              this.setState({messages: messages, showReplyTextBox: true})
            } 
            else if(item.message === "card"){
              cards.push(item.card);
              this.setState({messages: messages})
            }
            else if(item.message === "quickReplies"){
              console.log("quickReplies",item.message)
              messages.push({
                id: this.state.messages.length,
                buttons: item.quickReplies.quickReplies,
                member: this.state.messages[0].member
              })
              this.setState({show_typing: false})
             this.setState({messages: messages, showReplyTextBox: false})
            }
            else if(item.payload){
              console.log("item.payload",item.payload)
              if(item.payload.fields.buttons){
                //this.setState({show_typing: true})
                console.log("item.payload.fields.buttons",item.payload.fields)
                messages.push({
                    id: this.state.messages.length,
                    buttons: item.payload.fields.buttons.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({show_typing: false})
                this.setState({messages: messages, showReplyTextBox: false})
              } 
              else if (item.payload.fields.linkButtons){
                //this.setState({show_typing: true})
                messages.push({
                    id: this.state.messages.length,
                    linkButtons: item.payload.fields.linkButtons.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages, showReplyTextBox: false})
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
              else if (item.payload.fields.singleSelect){
                console.log("item.payload.fields",item.payload.fields.singleSelect.listValue.values)
                messages.push({
                    id: this.state.messages.length,
                    // singleSelect: [
                    //   { value: 'chocolate', label: 'Chocolate' },
                    //   { value: 'strawberry', label: 'Strawberry' },
                    //   { value: 'vanilla', label: 'Vanilla' },
                    // ],
                    singleSelect:item.payload.fields.singleSelect.listValue.values,
                    member: this.state.messages[0].member
                })
                this.setState({messages: messages})
            }
            else if (item.payload.fields.multiSelect){
              console.log("item.payload.fields.multiSelect",item.payload.fields.multiSelect.listValue.values)
              messages.push({
                  id: this.state.messages.length,
                  // multiSelect:["red", "green", "blue"],
                  multiSelect:item.payload.fields.multiSelect.listValue.values,
                  member: this.state.messages[0].member
              })
              this.setState({messages: messages})
          }
              else if (item.payload.fields.popup){
                messages.push({
                    id: this.state.messages.length,
                    popup: item.payload.fields.popup.structValue.fields,
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
                style = {{padding: "5px", paddingLeft: "10px", textAlign: this.state.align ? this.state.align:"center", color: this.state.top_bar_text_color, backgroundColor: this.state.top_bar_background_color}}
              >
                { this.state.top_bar_logo ? <img style={{display: "inline", "vertical-align": "middle"}} width={this.state.top_bar_logo_width} alt="..." src={this.state.top_bar_logo} /> : ""}
                <h1 style={{display: "inline", "vertical-align": "middle", marginRight: "40px", fontWeight: this.state.font_weight, fontSize: this.state.top_bar_font_size}}> {this.state.top_bar_text}</h1>
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
                {
                  this.state.showReplyTextBox || !this.state.whenButtonHideReplyTextBox ? 
                  <Input
                      default_message={this.state.default_message}
                      onSendMessage={this.onSendMessage}
                      send_button_text_color={this.state.send_button_text_color}
                      send_button_background_color={this.state.send_button_background_color}
                      send_button_text={this.state.send_button_text}
                      stt_button_color={this.state.stt_button_color}
                      showTTS={this.state.show_tts}
                      showSTT={this.state.show_stt}
                      lang={this.state.recognition_lang}
                      STTButtonText={this.state.stt_button_text}
                      onSentParam={this.onSetParam}
                  />: null
                }
                
            </div>
         );
    }
}

export default ChatbotX;
