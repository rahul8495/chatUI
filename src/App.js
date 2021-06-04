import React, { Component } from 'react';
import './App.css';
import './scripts';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import BotUI from './components/BotUI';
import ChatbotX from './components/ChatbotX/ChatbotX';
import Landing from './components/Landing';
//import Index from './views/Index.jsx';

// import "./assets/vendor/nucleo/css/nucleo.css";
// import "./assets/vendor/font-awesome/css/font-awesome.min.css";
// import "./assets/scss/argon-design-system-react.scss";


class App extends Component {
  componentDidMount() {
    console.log(this.props);
  }
  
  render() {
    // check
    return(
      <Router>
        <Route path="/" exact component={Landing} />
        <Route path="/chatbot" component={Chatbot}></Route>
        <Route path="/botui" component={BotUI}></Route>
        <Route path="/chatbotx" component={ChatbotX}></Route>
      </Router>
    )
  }
}

export default App;
