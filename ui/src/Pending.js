//region 1. Platform Libraries
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
//endregion

//region 2. Project Libraries
import toLocalISOString from './utils/toLocalISOString';
//endregion

export default class Pending extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pendingList: [],
            currentId: '',
            error: '',
            message: '',
        };
        this.mounted = false;
        this.chooseId = this.chooseId.bind(this);
        this.getPendingList = this.getPendingList.bind(this);
        this.approveLeave = this.approveLeave.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.getPendingList();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getPendingList() {
        const { username, password } = this.props;
        axios.get('/leaves?pendingApproval=true', {
            auth: {
                username,
                password,
            },
        })
            .then((res) => {
                if (this.mounted) {
                    this.setState({
                        pendingList: res.data,
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

    approveLeave(choice) {
        const { currentId } = this.state;
        const { username, password } = this.props;
        let message;
        if (choice === 'Y') {
            message = '已核准！ Leave approved!';
        } else {
            message = '已拒否！ Leave denied!';
        }
        axios.put(`/leaves/${currentId}`, {
            approved: choice,
        }, {
            auth: {
                username,
                password,
            },
        })
            .then((res) => {
                this.setState({
                    error: '',
                    currentId: '',
                    message,
                });
                this.getPendingList();
            })
            .catch((err) => {
                let error = '';
                if (err.response) {
                    console.log(err.response.status, err.response.data);
                    switch (err.response.status) {
                    case 500:
                        error = '連線失敗！請檢查網路。 Fail to connect!!! Please check your network.';
                        break;
                    default:
                        error = '操作失敗！請再試一次。 Failed!!! Please try again.';
                    }
                } else {
                    console.log(err);
                    error = '操作失敗！請再試一次。 Failed!!! Please try again.';
                }
                this.setState({ error, message: err.response.data });
            });
    }

    chooseId(leave) {
        const { currentId } = this.state;
        if (currentId !== leave.id) {
            if (new Date(leave.timeFrom) > new Date()) {
                this.setState({
                    currentId: leave.id,
                    message: '',
                    error: '',
                });
            }
        } else {
            this.setState({
                currentId: '',
                message: '',
                error: '',
            });
        }
    }

    render() {
        const {
            pendingList, currentId, error, message,
        } = this.state;
        const pendingTable = pendingList.map((leave) => (
            <tr
                key={leave.id}
                className={`${currentId === leave.id ? 'chosen' : ''} ${(new Date(leave.timeFrom) < new Date()) ? 'outdated' : ''}`}
                onClick={() => { this.chooseId(leave); }}
            >
                <td>{leave.id}</td>
                <td>{leave.username}</td>
                <td>{leave.type}</td>
                <td>{`${toLocalISOString(leave.timeFrom).slice(0, 10)} ${toLocalISOString(leave.timeFrom).slice(11, 16)}`}</td>
                <td>{`${toLocalISOString(leave.timeTo).slice(0, 10)} ${toLocalISOString(leave.timeTo).slice(11, 16)}`}</td>
            </tr>
        ));
        return (
            <div className="pending-list">
                <h1>待准假單 Pending Approval Leaves</h1>
                <table className="pending-table">
                    <thead>
                        <tr>
                            <th>編號 ID</th>
                            <th>使用者 Username</th>
                            <th>假別 Type</th>
                            <th>開始時間 Time from</th>
                            <th>結束時間 Time to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingTable}
                    </tbody>
                </table>
                {currentId
                    ? (
                        <div className="chosen-leave">
                            <span>{`ID: ${currentId}`}</span>
                            <button type="button" onClick={() => this.approveLeave('Y')}>批准 Approve</button>
                            <button type="button" onClick={() => this.approveLeave('N')}>拒否 Deny</button>
                            {error && <h2 className="error-message">{error}</h2>}
                            <h3>{message}</h3>
                        </div>
                    )
                    : (
                        <h2 className="success-message">{message}</h2>
                    )}
            </div>
        );
    }
}

Pending.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
};
