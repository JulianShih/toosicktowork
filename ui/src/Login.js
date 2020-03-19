//region 1. Platform Libraries
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
//endregion

//region 2. Project Libraries
import authenticate from './utils/authenticate';
//endregion

//region U. UI Markups
import './styles/Login.scss';
//endregion

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isLoggedIn: false,
            error: '',
        };
        this.onLogin = this.onLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);
    }

    componentDidMount() {
        const auth = Cookies.get('auth');
        if (auth) {
            const user = authenticate(auth);
            this.setState({
                isLoggedIn: true,
                username: user.username,
            });
        }
    }

    onLogin() {
        const { username, password } = this.state;
        if (!username || !password) {
            return;
        }
        axios.get('/login', {
            auth: {
                username,
                password,
            },
        })
            .then((res) => {
                Cookies.set('auth', res.config.headers.Authorization, { expires: 7 });
                this.setState({
                    error: '',
                    isLoggedIn: true,
                });
            })
            .catch((err) => {
                let error = '';
                if (err.response) {
                    console.log(err.response.status, err.response.data);
                    switch (err.response.status) {
                    case 401:
                        error = '登入失敗！請檢查輸入。 Login failed!!! Please check your input.';
                        break;
                    case 500:
                        error = '連線失敗！請檢查網路。 Fail to connect!!! Please check your network.';
                        break;
                    default:
                        error = '登入失敗！請再試一次。 Login failed!!! Please try again.';
                    }
                } else {
                    console.log(err);
                    error = '登入失敗！請再試一次。 Login failed!!! Please try again.';
                }
                this.setState({ error });
            });
    }

    onLogout() {
        this.setState({
            username: '',
            password: '',
            isLoggedIn: false,
            error: '',
        });
        Cookies.remove('auth');
    }

    render() {
        const {
            username, password, error, isLoggedIn,
        } = this.state;
        return (
            <div className="login-page">
                <h1>Too Sick to Work</h1>
                {!isLoggedIn
                    ? (
                        <div className="login-container">
                            <h2>使用者名稱 Username：</h2>
                            <input type="text" value={username} onChange={(e) => { this.setState({ username: e.target.value }); }} />
                            <h2>密碼 Password：</h2>
                            <input type="password" value={password} onChange={(e) => { this.setState({ password: e.target.value }); }} />
                            <button type="submit" onClick={this.onLogin}>登入 Login</button>
                        </div>
                    )
                    : (
                        <div className="hello-container">
                            <h2>{`哈囉！ Hello, ${username}!`}</h2>
                            <Link to="/users">
                                <button type="button">進入系統 Enter</button>
                            </Link>
                            <button type="button" onClick={this.onLogout}>登出 Logout</button>
                        </div>
                    )}
                {error && <h2 className="error-message">{error}</h2>}
            </div>
        );
    }
}
