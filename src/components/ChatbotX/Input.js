import React, { Component } from 'react';
import PropTypes from "prop-types";
import SpeechRecognition from 'react-speech-recognition';

const propTypes = {
  transcript: PropTypes.string,
  resetTranscript: PropTypes.func,
  browserSupportsSpeechRecognition: PropTypes.bool
};

class Input extends Component {
    constructor(){
      super();
      this.handleSpeakButtonClick = this.handleSpeakButtonClick.bind(this);
    }

    state = {
        text: '',
        default_message: '',
        send_button_color: '',
        stt_button_text: '',
    }
    
    onChange(e) {
      this.setState({text: e.target.value});
    }

    handleSpeakButtonClick(){
      this.setState({
        default_message: "Listening...",
      });
    }

    onSubmit(e, voiceText) {
        e.preventDefault();
        this.setState({
          text: "",
          default_message: this.props.default_message
        });
        if(this.props.showSTT && this.state.default_message === "Listening..."){
          this.props.onSendMessage(voiceText);
        } else
        this.props.onSendMessage(this.state.text);
    }
    LanguageHandlerChnage = (e) =>{
      console.log("props",this.props)

      this.props.onSentParam(e.target.value)
      // URLSearchParams.set('langCode', e.target.value)
      // this.props.history.push(`langCode=${e.target.value}`)
console.log("e",e.target.value)
    }
    render() {
      const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        recognition,
        startListening
      } = this.props;

      if(browserSupportsSpeechRecognition)
      recognition.lang = this.props.lang;

      const recText = this.props.transcript;


      const renderVoiceButtons = () => {
          if(browserSupportsSpeechRecognition){
            return (
              <div style={{"text-align":"center", "margin-right": "50px"}}>
              <button
                  onClick={() => {
                    resetTranscript();
                    startListening();
                    this.handleSpeakButtonClick();
                  }}
                  style = {{backgroundColor: this.props.stt_button_color, display: this.props.showSTT ? "inline-block" : "none"  }}>
                  {this.props.STTButtonText}
                </button>
              </div>
            );
          } else {
            return (
              <div style={{"text-align":"center", "margin-right": "50px"}}>
                <button
                  style = {{backgroundColor: 'gray', display: this.props.showSTT ? "inline-block" : "none"  }}>
                  Voice Conversation Not Supported
                </button>
              </div>
            );
          }
      }

      const renderSendButton = () => {
        if(this.props.send_button_text === ""){
          return(
            "Send"
          )
        } else {
          return (this.props.send_button_text)
        }
      }

        return (
          <div className="Input">
            <form onSubmit={e => this.onSubmit(e, recText)}>
              <input
                style = {{border: `1px solid ${this.props.send_button_background_color}`}}
                onChange={e => this.onChange(e)}
                value={this.state.default_message === "Listening..." ? transcript : this.state.text }
                type="text"
                placeholder = {this.state.default_message}
                autoFocus="{true}"
              />
              <button
                onClick={() => setTimeout(resetTranscript, 1000)}
                style = {{color: this.props.send_button_text_color, background: this.props.send_button_background_color}}>
                {
                  renderSendButton()
                }
              </button>
              <select class="mychoice" onChange={this.LanguageHandlerChnage} id="SelectUserChoice">
            <option >Language</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
                           
        </select>
            </form>
            {
              renderVoiceButtons()
            }
          </div>
        );
      }     
}

Input.propTypes = propTypes;

const options = {
  autoStart: false,
  continuous: false
}

export default SpeechRecognition(options)(Input);