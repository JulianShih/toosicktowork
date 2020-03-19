//region 1. Platform Libraries
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
//endregion

//region U. UI Markups
import './styles/Editor.scss';
//endregion

export default class UserDeleter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            error: '',
            message: '',
        };
        this.deleteUser = this.deleteUser.bind(this);
    }

    deleteUser() {
        const { user } = this.state;
        const {
            username, password, handleDeleting, getUserList,
        } = this.props;
        if (!user) {
            this.setState({ error: '欄位不可空白！ Input cannot be empty!' });
            return;
        }
        axios.delete(`/users/${user}`, {
            auth: {
                username,
                password,
            },
        })
            .then((res) => {
                this.setState({
                    error: '',
                });
                handleDeleting(res.data);
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
                    case 404:
                        error = '無此使用者！ User not found!!!';
                        break;
                    case 500:
                        error = '連線失敗！請檢查網路。 Fail to connect!!! Please check your network.';
                        break;
                    default:
                        error = '刪除失敗！請再試一次。 Fail to delete!!! Please try again.';
                    }
                } else {
                    console.log(err);
                    error = '刪除失敗！請再試一次。 Fail to delete!!! Please try again.';
                }
                this.setState({ error, message: err.response.data });
            });
    }

    render() {
        const {
            user, error, message,
        } = this.state;
        return (
            <div className="user-adder">
                <span>使用者名稱 Username：</span>
                <input type="text" value={user} onChange={(e) => { this.setState({ user: e.target.value }); }} />
                <button type="submit" onClick={this.deleteUser}>刪除 Delete</button>
                {error && <h2 className="error-message">{error}</h2>}
                <h3>{message}</h3>
            </div>
        );
    }
}

UserDeleter.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    handleDeleting: PropTypes.func.isRequired,
    getUserList: PropTypes.func.isRequired,
};
