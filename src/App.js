import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './App.css';

import Main from './pages/Main';
import Edit from './pages/Edit';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/edit" component={Edit} />
        </Switch>
      </BrowserRouter>
    )
  }

}

export default App;
