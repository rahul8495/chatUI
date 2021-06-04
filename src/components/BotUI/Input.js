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

    messages = [
      "test",
      "show"
    ]

    autoCompleteListStyle = margin => ({
      color: "gray",
      background: "white",
      listStyleType: "none",
      textAlign: "left",
      fontSize: "20px",
      marginBottom: margin,
      bottom: 0,
      left: "15%",
      right: "20%",
      marginLeft: "10px",
      border: "solid 5px white",
      boxSizing: "border-box",
      position: "absolute",
      zIndex: "99",
      cursor: "pointer",
      padding: "0"
  })

  hover = (e) => {
      console.log(e.target);
      e.target.style.background = "#392776";
      e.target.style.color = "white";
  }
  hoverEnd = (e) => {
      console.log(e.target);
      e.target.style.background = "white";
      e.target.style.color = "gray";
  }

    state = {
        value: '',
        searchTerm: '',
        text: '',
        default_message: '',
        send_button_color: '',
        stt_button_text: '',
        suggestions: []
    }

    renderSuggestions = (allSuggestions, margin) => {

     let suggestions = []
     if(allSuggestions){
      suggestions = allSuggestions
        .filter(suggestion => suggestion.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
        .slice(0, 10)
        .filter((val, index, self) => self.indexOf(val) === index)
      }
     
      if(this.state.searchTerm.length > 0)
      return ( 
        <ul className="autoComplete">
          {
            suggestions
            .map((suggestion_text, index) => 
              <li key={index} data-key={suggestion_text} onMouseEnter={this.hover} onMouseLeave={this.hoverEnd} onClick={this.handleSuggestionClick}> 
                  {suggestion_text}
              </li> 
            ) 
          }
        </ul>
    )
    }
    
    onChange(e) {
      this.setState({suggestions: this.props.suggestions, text: e.target.value, searchTerm: e.target.value});
    }

    handleSuggestionClick = (e) => {
      this.setState({
        searchTerm: '',
        text: "",
        default_message: this.props.default_message,
        suggestions: this.props.suggestions
      });
      this.props.onSendMessage(e.target.getAttribute('data-key'));
  }

    handleSpeakButtonClick(){
      this.setState({
        default_message: "Listening...",
      });
    }

    onSubmit(e, voiceText) {
        e.preventDefault();
        this.setState({
          searchTerm: '',
          text: "",
          default_message: this.props.default_message,
          suggestions: this.props.suggestions
        });
        if(this.props.showSTT && this.state.default_message === "Listening..."){
          this.props.onSendMessage(voiceText);
        } else
        this.props.onSendMessage(this.state.text);
    }

    render() {
      const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        recognition
      } = this.props;

      recognition.lang = this.props.lang;
      const recText = this.props.transcript;

      const renderVoiceButtons = () => {
          if(browserSupportsSpeechRecognition){
            return (
              <div style={{"text-align":"center", "margin-right": "50px"}}>
              <button
                  onClick={() => {
                    resetTranscript();
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
    
        return (
          <div className="Input">
            <form onSubmit={e => this.onSubmit(e, recText)}>
              {
                this.renderSuggestions(this.state.suggestions, this.props.margin)
              }
              <input
                onChange={e => this.onChange(e)}
                value={this.state.default_message === "Listening..." ? transcript : this.state.text }
                type="text"
                placeholder = {this.state.default_message}
                autoFocus="{true}"
              />
              <button
                onClick={() => setTimeout(resetTranscript, 1000)}
                style = {{backgroundColor: this.props.send_button_color}}>
                Send
              </button>
            </form>
            {
              renderVoiceButtons()
            }
          </div>
        );
      }     
}

Input.propTypes = propTypes;
export default SpeechRecognition(Input);