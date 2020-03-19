//region 1. Platform Libraries
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
//endregion

//region 2. Project Libraries
import Login from './Login';
import Users from './Users';
import Leaves from './Leaves';
//endregion

//region U. UI Markups
import './styles/index.scss';
//endregion

ReactDOM.render(
    <Router>
        <Route exact path="/" component={Login} />
        <Route path="/users" component={Users} />
        <Route path="/leaves" component={Leaves} />
    </Router>,
    document.getElementById('root'),
);
