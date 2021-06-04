import React, { Component } from 'react';
import Polly from "./../Polly";
import "react-responsive-carousel/lib/styles/carousel.min.css";
const play = require('audio-play');
const Carousel = require('react-responsive-carousel').Carousel;

let playback = '';

class Messages extends Component {
    constructor(){
      super();
      this.handleClick = this.handleClick.bind(this);
      this.handleTTSButtonClick = this.handleTTSButtonClick.bind(this);
    }

    state = {
      can_pause_tts: false,
      playing: false,
      carousel: ''
    }

    render() {    
      const {messages} = this.props;
      return (
          <div className="Messages-list">
              <ul> 
                {messages.map(m => this.renderMessage(m))}  
                {this.renderTyping()}         
              </ul>
          </div>
      );
    }

    renderTyping(){
      return (
        <div className="typing">
          <img className={this.props.showTyping ? "typingIndicator" : "hidden" } alt="typing" src="https://i.imgur.com/X4e96IB.gif"/>
        </div>
      )
    }

    renderEachSlide(m){
      return (
        <div>
          <img alt="Card" src={m.imageUri} />
          <a rel="noreferrer noopener" target="_blank" href={m.buttons[0].postback}>
            <p className="legend" style={{fontSize: '20px'}}>
              {m.title} <br />
              {m.subtitle} <br />
              <span style={{fontSize: '15px'}}>{m.buttons[0].text}</span>
            </p>
          </a>
        </div>
      );
    }

    renderCarousel(messages) {
      return (
        <div style={{textAlign: "center"}}>
          <br />
          <div className="botui-carousel">
          <Carousel showArrows={true} showIndicators={false} useKeyboardArrows={true}> 
            {
              messages.map(m => this.renderEachSlide(m))
            }       
          </Carousel>
          </div>
        </div>
      )
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
        console.log("message.text",message)
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
                style={
                  {
                    backgroundImage: `url(${member.avatar})`, 
                    backgroundColor: member.color,
                    height: member.avatar_size ? member.avatar_size : "30px",
                    width: member.avatar_size ? member.avatar_size : "30px",
                    borderRadius: member.avatar_shape === "circle" ? "50%" : "0%"
                  }
                }
              />
              <div className="Message-content">
                <div className="username">
                  {member.username}
                </div>
                <div 
                    className="text"
                    style= {{backgroundColor: member.text_color}}
                > 
                {text.replace(regex, "")}
                </div>
                {
                  this.renderTTSButton(message, messageFromMe)
                }
              </div>
              <div ref={(el) => {this.messagesEnd = el}}></div>
            </li>
          );
        } else if (message.card){
          return this.renderCarousel(message.card)
        }
        else if (message.linkButtons){
          const {linkButtons} = message;
          console.log(linkButtons);
          return (
            <li className="list-buttons">
            {
              linkButtons.map(button => (
                <div className={this.props.menuFlow === "vertical" ? "button" : "button suggestion_chips"}>
                    <a rel="noopener noreferrer" target="_blank" href={button.structValue.fields.url.stringValue}>
                      <input 
                        type="button" 
                        style = {{backgroundColor: message.member.link_button_color}}
                        value={button.structValue.fields.text.stringValue} 
                      />
                    </a>
                </div>
              ))
            }
            </li>
          );
        } else if (message.buttons){
          const {id, buttons} = message;
          return (
            <li className="list-buttons">
              {
                buttons.map(button => (
                  <div key={id} className={this.props.menuFlow === "vertical" ? "button" : "button suggestion_chips"}>
                      <input 
                        onClick={this.handleClick} 
                        type="button" 
                        style = {{backgroundColor: message.member.quick_reply_button_color}}
                        value={button.stringValue ? button.stringValue : button} />
                  </div>
                ))
              }
            </li>
          );
        } else if (message.videos){
          const {id, videos} = message;
          const allow = this.props.autoPlayVideo? "accelerometer; autoplay ; encrypted-media; gyroscope; picture-in-picture" : "accelerometer; encrypted-media; gyroscope; picture-in-picture" 
          return (
            videos.map(video => (
              <div key={id} className="video">
                  <iframe 
                    title="video" 
                    width={video.structValue.fields.width.stringValue} 
                    height="315" src={video.structValue.fields.url.stringValue} 
                    frameborder="0" allow={allow}
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
                  <a target="_blank" rel="noopener noreferrer" href={image.structValue.fields.url? image.structValue.fields.url.stringValue: null}>
                  <img 
                    alt={image.structValue.fields.alt.stringValue} 
                    width={image.structValue.fields.width.stringValue} 
                    src={image.structValue.fields.src.stringValue} />
                  </a>
              </div>
            ))
          );
        } else if (message.iframe){
          console.log(message.iframe);
          const {id, iframe} = message;
          return (
              <div key={id} className="iframe">
                  <iframe 
                    frameBorder="0"
                    title="title" 
                    src={iframe.src.stringValue}
                    width="90%"
                    height="600px">
                  </iframe>
              </div>
          );
        }
      }
}

export default Messages;