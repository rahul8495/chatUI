import React, { Component } from 'react';
import Polly from "./../../Polly";
const play = require('audio-play');
let playback = '';

class Messages extends Component {
    constructor(){
      super();
      this.handleClick = this.handleClick.bind(this);
      this.handleTTSButtonClick = this.handleTTSButtonClick.bind(this);
    }

    state = {
      playing: false,
      can_pause_tts: false,
    }

    render() {    
      const {messages} = this.props;
      return (
          <div className="Messages-list">
              <ul>
                  {messages.map(m => this.renderMessage(m))}
              </ul>
          </div>
      );
    }

    scrollToBottom = () => {
      this.messagesEnd.scrollIntoView({ behavior: "smooth"} );
    }
    
    componentDidMount() {
      if(this.props.enableAutoScroll){
        this.scrollToBottom();
      }
    }
    
    componentDidUpdate() {
      if(this.props.enableAutoScroll){
        this.scrollToBottom();
      }
    }

    handleClick(e) {
      this.props.onButtonClick(e.target.value);
    }

    handleTTSButtonClick(text){
      console.log('TTS Button Clicked');
      if(this.state.can_pause_tts){
        console.log('Stopping Playback');
        if(playback) playback.pause();
        this.setState({ playing: false, can_pause_tts: false });
      } else {
        console.log('Starting Playback');
        Polly.speak(text, this.props.voice, this.props.ssml)
        .then(audioBuffer => {
          if(this.state.can_pause_tts){
            this.setState({ playing: true });
            console.log('Playback Started');
            playback = play(audioBuffer, {}, () => {
              console.log('Playback Stopped'); 
              this.setState({playing:false, can_pause_tts: false})
            })
          }
        })
        .catch(err => console.log(err))
      }
    }

    renderTTSButton(message, messageFromMe){
      if(this.props.showTTS && !messageFromMe){
        return(
          <button style={{backgroundColor:this.props.tts_button_color}} onClick={() => {
              if(!this.state.playing){
                this.setState({can_pause_tts: true});
                this.handleTTSButtonClick(message.text);
              } else {
                this.setState({can_pause_tts: false});
                this.handleTTSButtonClick(message.text);
              }
            }}> 
            <span aria-label="speaker" role="img">{ this.state.can_pause_tts? "🔊": "🔈" }</span>
          </button>
        )
      }
    }

    renderMessage(message) {
        var regex = /(<([^>]+)>)/ig;
        if(message.text){
          const {id, member, text} = message;
          const {currentMember} = this.props;
          const messageFromMe = member.id === currentMember.id;
          const className = messageFromMe ?
            "Messages-message currentMember" : "Messages-message";
          return (
            <li key={id} className={className}>
              <span
                className={messageFromMe ? "avatar" : "avatar logo"}
                style={{backgroundImage: `url(${member.avatar})`, backgroundColor: member.color}}
              />
              <div className="Message-content">
                <div className="username">
                  {member.username}
                </div>
                <div 
                    className="text"
                    style= {{backgroundColor: member.text_color}}
                > {text.replace(regex, "")}
                </div>
                {
                  this.renderTTSButton(message, messageFromMe)
                }
              </div>
              <div ref={(el) => {this.messagesEnd = el}}></div>
            </li>
          );
        } else if (message.linkButtons){
          const {linkButtons} = message;
          console.log(linkButtons);
          return (
            linkButtons.map(button => (
              <div className="button suggestion_chips">
                  <a rel="noopener noreferrer" target="_blank" href={button.url.uri? button.url.uri: button.url}>
                    <input 
                      type="button" 
                      style = {{backgroundColor: message.member.link_button_color, color: message.member.link_text_color? message.member.link_text_color : 'white', border: 'black'}}
                      value={button.text} 
                    />
                  </a>
              </div>
            ))
          );
        } else if (message.buttons){
          const {id, buttons} = message;
          return (
            buttons.map(button => (
              <div key={id} className="button suggestion_chips">
                  <input 
                    onClick={this.handleClick} 
                    type="button" 
                    style = {{backgroundColor: message.member.quick_reply_button_color, color: message.member.quick_reply_text_color? message.member.quick_reply_text_color : 'white', border: 'black'}}
                    value={button} />
              </div>
            ))
          );
        } else if (message.videos){
          const {id, videos} = message;
          console.log('vide', videos)
          return (
            videos.map(video => (
              <div key={id} className="video">
                  <iframe 
                    title="video" 
                    width={video.width} 
                    height="315" src={video.src} 
                    frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                  </iframe>
              </div>
            ))
          );
        } else if (message.images){
          console.log(message.images);
          const {id, images} = message;
          return (
            images.map(image => (
              <div key={id} className="image">
                  <a target="_blank" rel="noopener noreferrer" href={image.url? image.url: null}>
                  <img 
                    alt={image.alt} 
                    width={image.width} 
                    src={image.src} />
                  </a>
              </div>
            ))
          );
        }
      }
}

export default Messages;