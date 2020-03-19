//region 1. Platform Libraries
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
//endregion

//region 2. Project Libraries
import authenticate from './utils/authenticate';
import UserAdder from './UserAdder';
import UserDeleter from './UserDeleter';
//endregion

//region U. UI Markups
import './styles/Users.scss';
//endregion

export default class Users extends Component {
    static onLogout() {
        Cookies.remove('auth');
    }

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            userList: [],
            currentState: '',
            message: '',
        };
        this.mounted = false;
        this.user = {};
        this.handleAdding = this.handleAdding.bind(this);
        this.handleDeleting = this.handleDeleting.bind(this);
        this.getUserList = this.getUserList.bind(this);
    }

    componentDidMount() {
        const auth = Cookies.get('auth');
        if (auth) {
            this.mounted = true;
            this.user = authenticate(auth);
            this.setState({
                username: this.user.username,
            });
            this.getUserList();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getUserList() {
        axios.get('/users', {
            auth: {
                username: this.user.username,
                password: this.user.password,
            },
        })
            .then((res) => {
                if (this.mounted) {
                    this.setState({
                        userList: res.data,
                    });
                }
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err.response.status, err.response.data);
                } else {
                    console.log(err);
                }
            });
    }

    handleAdding(message) {
        const { currentState } = this.state;
        if (currentState !== 'adding') {
            this.setState({
                currentState: 'adding',
                message: '',
            });
        } else {
            this.setState({
                currentState: '',
                message,
            });
        }
    }

    handleDeleting(message) {
        const { currentState } = this.state;
        if (currentState !== 'deleting') {
            this.setState({
                currentState: 'deleting',
                message: '',
            });
        } else {
            this.setState({
                currentState: '',
                message,
            });
        }
    }

    render() {
        const {
            username, userList, currentState, message,
        } = this.state;
        const userTable = userList.map((user) => (
            <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.supervisor}</td>
            </tr>
        ));
        const addUser = (currentState === 'adding')
            ? (
                <UserAdder
                    username={this.user.username}
                    password={this.user.password}
                    handleAdding={this.handleAdding}
                    getUserList={this.getUserList}
                />
            )
            : (
                username === 'root'
                && (
                    <button type="button" className="add-user-button" onClick={this.handleAdding}>
                            新增／修改使用者 Add/Edit User
                    </button>
                )
            );
        const deleteUser = (currentState === 'deleting')
            ? (
                <UserDeleter
                    username={this.user.username}
                    password={this.user.password}
                    handleDeleting={this.handleDeleting}
                    getUserList={this.getUserList}
                />
            )
            : (
                username === 'root'
                && (
                    <button type="button" className="delete-user-button" onClick={this.handleDeleting}>
                            刪除使用者 Delete User
                    </button>
                )
            );
        return (
            <div className="user-page">
                {username
                    ? (
                        <div className="user-list">
                            <h1>你和你的戰隊 You And Your Team</h1>
                            <div className="button-bar">
                                <Link to="/leaves">
                                    <button type="button">假單 Leaves</button>
                                </Link>
                                <Link to="/">
                                    <button type="button" onClick={Users.onLogout}>登出 Logout</button>
                                </Link>
                            </div>
                            <table className="user-table">
                                <tbody>
                                    <tr>
                                        <th>使用者 User</th>
                                        <th>上級 Supervisor</th>
                                    </tr>
                                    {userTable}
                                </tbody>
                            </table>
                            {addUser}
                            {deleteUser}
                            {(currentState === '') && <h2 className="success-message">{message}</h2>}
                        </div>
                    )
                    : (
                        <Link to="/">
                            <button type="button">請先登入 Please Login First</button>
                        </Link>
                    )}
            </div>
        );
    }
}
