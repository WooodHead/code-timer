import React, {Component} from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {

  render() {
    return (
      <div className="App">
      <h1 className="App-title">Code-Timer</h1>
      <h2>A text-based app that sends you daily notifications on the number of commits you made and time spent coding.</h2>
      <h3>Made using WakaTime and Twilio API</h3>
      <a href="/auth">Log In With WakaTime</a>
    </div>);
  }
}

export default Header;
