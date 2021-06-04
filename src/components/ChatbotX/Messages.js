import React, { Component } from 'react';
import Polly from "./../../Polly";
import Popup from "reactjs-popup";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { Multiselect } from 'multiselect-react-dropdown';

import "react-responsive-carousel/lib/styles/carousel.min.css";
const play = require('audio-play');
const Carousel = require('react-responsive-carousel').Carousel;

let playback = '';

class Messages extends Component {
    constructor(){
      super();
      this.handleClick = this.handleClick.bind(this);//buttonHide
      this.buttonHide = this.buttonHide.bind(this);
      this.handlePopup = this.handlePopup.bind(this);
      this.handlePopupClick = this.handlePopupClick.bind(this);
      this.handleTTSButtonClick = this.handleTTSButtonClick.bind(this);
      this.singleSelect= this.singleSelect.bind(this);
      this.onMultiSelect= this.onMultiSelect.bind(this);
      this.sendMessage = this.sendMessage.bind(this);

    }

    state = {
      can_pause_tts: false,
      playing: false,
      carousel: '',
      name: '',
      email: '',
      phone: '',
      singleSelctValue:'',
      multiSelectValue:[]
    }
valueMulti=[]
    render() {    
      const {messages} = this.props;
      // console.log("messages props",messages)
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
      if (this.messagesEnd)
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

    singleSelect(options){
      // var select= document.getElementById('singleSelect').value;
      // console.log("options",options.value)
      this.setState({singleSelctValue:options.value})
    }
    onMultiSelect(options){
      var multisel=[]
      options.map(multiselect=>{
        // console.log("multi",multiselect.name)
        this.valueMulti.push(multiselect.name)
        multisel.push(multiselect.name)
        
      })
      this.setState({multiSelectValue:multisel})
      console.log("this.state.multiSelectValue",this.state.multiSelectValue)
      console.log("multisel",multisel)
      console.log("valueMulti",this.valueMulti)
    }

    sendMessage(message) {
      this.props.onButtonClick(message);
    }
    handleClick(e) {
      this.props.onButtonClick(e.target.value);
      // this.buttonHide()
      // document.getElementById(e.target.id).style.visibility="hidden"
      
    }
    buttonHide(e){
      console.log("handleClick",e.target.id)
      document.getElementById(e.target.id).style.display="none"
    }

    handlePopupClick(){
      this.props.onButtonClick(`name: ${this.state.name}, phone: ${this.state.phone}, email: ${this.state.email}`)
    }

    handlePopup(e) {
      console.log(e.target.value)
      const {name, value} = e.target
      this.setState({[name]: value})
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
        // console.log("message",message)
        if(message.text){
          const {id, member, text} = message;
          const {currentMember} = this.props;
          const messageFromMe = member.id === currentMember.id;
          const className = messageFromMe ?
            "Messages-message currentMember" : "Messages-message";
          return (
            text === "HIDDEN" ? "" :
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
                    className={messageFromMe ? "text-me" : "text-bot"}
                    style= {{color: member.text_color, backgroundColor: member.background_color}}
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
        } else if (message.card && message.card.length > 0){
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
                        style = {{color: message.member.link_button_text_color, background: message.member.link_button_background_color}}
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
            <li className="list-buttons" id={id} onClick={this.buttonHide}>
              {
                buttons.map(button => (
                  <div key={id} className={this.props.menuFlow === "vertical" ? "button" : "button suggestion_chips"}>
                      <input 
                        id={id}
                        onClick={this.handleClick} 
                        type="button" 
                        style = {{color: message.member.quick_reply_button_text_color, background: message.member.quick_reply_button_background_color}}
                        value={button.stringValue ? button.stringValue : button} />
                  </div>
                ))
              }
            </li>
          );
        }
        else if (message.singleSelect){
          const {id, buttons} = message;
          const options=[]
          console.log("inside single select", message.singleSelect)
              {
                message.singleSelect.map(value=>{
                  console.log("val",value.stringValue)
                  
                  options.push(value.stringValue)
                  
                  //  = [value.stringValue
                  // ]
                  console.log("opt",options)
                })
              }
              console.log("opt",options)
          return (
            <div style={{width:"25%", marginLeft:"6%"}}>
              <br/>
              &nbsp;&nbsp;&nbsp;&nbsp;
             <Dropdown 
             
              options={options} 
              // id="singleSelect"
              onChange={this.singleSelect} 
              value={this.state.singleSelctValue} 
              placeholder="Select an option" 
              // arrowOpen={<span className="arrow-open" />}
              />
              {
                this.state.singleSelctValue.length>0? <input 
                className='myClassName'
                 type="button" 
                 style = {{ marginLeft:"22%", position:"absolute", marginTop:"-3%",
                   color: message.member.link_button_text_color, background: message.member.link_button_background_color}}
                 value='Ok' 
                 onClick={
                   () => {
                     const dp = document.querySelectorAll('.myClassName')
                     console.log("dp",dp)
                     dp.forEach(el => el.style.display = 'none');
                     this.sendMessage(`${this.state.singleSelctValue}`)
                   }
                 }
               />:""
              }
            
            </div>
          );
        }
        else if (message.multiSelect){
          const {id, buttons} = message;
          console.log("{message.multiSelect",message.multiSelect)
          var multival=[]
          message.multiSelect.map(multivalue=>{
            console.log("multi",multivalue)
            var i=1
            multival.push({"name":multivalue.stringValue,"id":i})
            i++
          })
          console.log("multicheck", this.state.multiSelectValue)
          return (
            <div className="multiselect" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '50px',marginTop:'2%'}}>
            <br/>
            <Multiselect
              options={multival} // Options to display in the dropdown
              // selectedValues={this.state.multiSelectValue} // Preselected value to persist in dropdown
              onSelect={this.onMultiSelect} // Function will trigger on select event
              onRemove={this.onMultiSelect} // Function will trigger on remove event
              displayValue="name" // Property name to display in the dropdown options
              />
            {/* {console.log("multiSelectValue",this.state.multiSelectValue.length)} */}
            {
              this.state.multiSelectValue.length>0? <input 
              className='myClassName'
               type="button" 
               style = {{
                 color: message.member.link_button_text_color, background: message.member.link_button_background_color}}
               value='Ok' 
               onClick={
                 () => {
                   const dp = document.querySelectorAll('.myClassName')
                   console.log("dp",dp)
                   dp.forEach(el => el.style.display = 'none');
                   this.sendMessage(`${this.state.multiSelectValue}`)
                 }
               }
             />:''
            }
         
            </div>
          );
        }
         else if (message.popup) {
          console.log("got a popup", message.popup)
          return (
            <Popup trigger={<button> {message.popup.trigger.stringValue} </button>} position="right center" closeOnDocumentClick>
                  Name:<br />
                  <input type="text" onChange={this.handlePopup} name="name"/><br/>
                  E-mail:<br/>
                  <input type="email" onChange={this.handlePopup} name="email"/><br/>
                  Phone:<br/>
                  <input type="number" onChange={this.handlePopup} name="phone"/><br/><br/>
                  <input type="submit" onClick={this.handlePopupClick} value="Submit"/>
            </Popup>
          )
        }         
        else if (message.videos){
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