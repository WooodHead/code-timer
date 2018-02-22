import React, { Component } from 'react';
import Header from './Header.js';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Header}></Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
