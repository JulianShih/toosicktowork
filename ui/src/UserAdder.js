//region 1. Platform Libraries
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
//endregion

//region U. UI Markups
import './styles/Editor.scss';
//endregion

export default class UserAdder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newUsername: '',
            newPassword: '',
            newSupervisor: '',
            error: '',
            message: '',
        };
        this.addUser = this.addUser.bind(this);
    }

    addUser() {
        const { newUsername, newPassword, newSupervisor } = this.state;
        const {
            username, password, handleAdding, getUserList,
        } = this.props;
        if (!newUsername || !newPassword || !newSupervisor) {
            this.setState({ error: '欄位不可空白！ Input cannot be empty!' });
            return;
        }
        axios.post('/users', {
            username: newUsername,
            password: newPassword,
            supervisor: newSupervisor,
        }, {
            auth: {
                username,
                password,
            },
        })
            .then((res) => {
                this.setState({
                    error: '',
                });
                handleAdding(res.data);
                getUserList();
            })
            .catch((err) => {
                let error = '';
                if (err.response) {
                    console.log(err.response.status, err.response.data);
                    switch (err.response.status) {
                    case 403:
                        error = '沒有權限！ Forbidden!!!';
                        break;
                    case 500:
                        error = '連線失敗！請檢查網路。 Fail to connect!!! Please check your network.';
                        break;
                    default:
                        error = '新增失敗！請再試一次。 Failed!!! Please try again.';
                    }
                } else {
                    console.log(err);
                    error = '新增失敗！請再試一次。 Failed!!! Please try again.';
                }
                this.setState({ error, message: err.response.data });
            });
    }

    render() {
        const {
            newUsername, newPassword, newSupervisor, error, message,
        } = this.state;
        return (
            <div className="user-adder">
                <span>使用者名稱 Username：</span>
                <input type="text" value={newUsername} onChange={(e) => { this.setState({ newUsername: e.target.value }); }} />
                <span>密碼 Password：</span>
                <input type="password" value={newPassword} onChange={(e) => { this.setState({ newPassword: e.target.value }); }} />
                <br />
                <span>上級 Supervisor：</span>
                <input type="text" value={newSupervisor} onChange={(e) => { this.setState({ newSupervisor: e.target.value }); }} />
                <br />
                <button type="submit" onClick={this.addUser}>新增／修改 Add/Edit</button>
                {error && <h2 className="error-message">{error}</h2>}
                <h3>{message}</h3>
            </div>
        );
    }
}

UserAdder.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    handleAdding: PropTypes.func.isRequired,
    getUserList: PropTypes.func.isRequired,
};
