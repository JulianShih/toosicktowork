//region 1. Platform Libraries
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
//endregion

//region 2. Project Libraries
import authenticate from './utils/authenticate';
import toLocalISOString from './utils/toLocalISOString';
import Pending from './Pending';
import LeaveAdder from './LeaveAdder';
import LeaveEditor from './LeaveEditor';
//endregion

//region U. UI Markups
import './styles/Leaves.scss';
//endregion

export default class Leaves extends Component {
    static onLogout() {
        Cookies.remove('auth');
    }

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            leaveList: [],
            currentState: '',
            currentId: '',
            currentLeave: {},
            message: '',
            error: '',
        };
        this.mounted = false;
        this.user = {};
        this.getLeaveList = this.getLeaveList.bind(this);
        this.chooseId = this.chooseId.bind(this);
        this.handleAdding = this.handleAdding.bind(this);
        this.handleEditing = this.handleEditing.bind(this);
        this.deleteLeave = this.deleteLeave.bind(this);
        this.cancelLeave = this.cancelLeave.bind(this);
        this.pendingApprove = this.pendingApprove.bind(this);
        this.succeed = this.succeed.bind(this);
    }

    componentDidMount() {
        const auth = Cookies.get('auth');
        if (auth) {
            this.mounted = true;
            this.user = authenticate(auth);
            this.setState({
                username: this.user.username,
            });
            this.getLeaveList();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getLeaveList() {
        axios.get('/leaves', {
            auth: {
                username: this.user.username,
                password: this.user.password,
            },
        })
            .then((res) => {
                if (this.mounted) {
                    this.setState({
                        leaveList: res.data,
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

    chooseId(leave) {
        const { currentId } = this.state;
        if (currentId !== leave.id) {
            if (new Date(leave.timeTo) > new Date()) {
                this.setState({
                    currentState: 'choosing',
                    currentId: leave.id,
                    currentLeave: {
                        type: leave.type,
                        timeFrom: leave.timeFrom,
                        timeTo: leave.timeTo,
                    },
                    error: '',
                    message: '',
                });
            }
        } else {
            this.setState({
                currentState: '',
                currentId: '',
                currentLeave: {},
                error: '',
                message: '',
            });
        }
    }

    handleAdding(message) {
        const { currentState } = this.state;
        if (currentState !== 'adding') {
            this.setState({
                currentState: 'adding',
                currentId: '',
                error: '',
                message,
            });
        } else {
            this.setState({
                currentState: '',
                currentId: '',
                error: '',
                message,
            });
        }
    }

    handleEditing() {
        const { currentState } = this.state;
        if (currentState !== 'editing') {
            this.setState({
                currentState: 'editing',
                error: '',
                message: '',
            });
        } else {
            this.setState({
                currentState: 'choosing',
                error: '',
                message: '',
            });
        }
    }

    deleteLeave() {
        this.setState({
            currentState: 'deleting',
            error: '',
            message: '',
        });
        const confirmBox = window.confirm('確定要刪除嗎？ Are you sure to delete?');
        if (confirmBox === true) {
            const { currentId } = this.state;
            axios.delete(`/leaves/${currentId}`, {
                auth: {
                    username: this.user.username,
                    password: this.user.password,
                },
            })
                .then(() => {
                    this.setState({
                        currentId: '',
                        currentState: '',
                        error: '',
                        message: '刪除成功！ Leave deleted!',
                    });
                    this.getLeaveList();
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
                            error = '刪除失敗！請再試一次。 Fail to delete!!! Please try again.';
                        }
                    } else {
                        console.log(err);
                        error = '刪除失敗！請再試一次。 Fail to delete!!! Please try again.';
                    }
                    this.setState({ error, message: err.response.data });
                });
        }
    }

    cancelLeave() {
        this.setState({
            currentState: 'canceling',
            error: '',
            message: '',
        });
        const confirmBox = window.confirm('確定要銷假嗎？ Are you sure to cancel?');
        if (confirmBox === true) {
            const { currentId } = this.state;
            axios.patch(`/leaves/${currentId}`, {}, {
                auth: {
                    username: this.user.username,
                    password: this.user.password,
                },
            })
                .then(() => {
                    this.succeed('銷假成功！ Leave canceled!');
                    this.getLeaveList();
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
                            error = '銷假失敗！請再試一次。 Fail to cancel!!! Please try again.';
                        }
                    } else {
                        console.log(err);
                        error = '銷假失敗！請再試一次。 Fail to cancel!!! Please try again.';
                    }
                    this.setState({ error, message: err.response.data });
                });
        }
    }

    succeed(message) {
        this.setState({
            currentState: 'choosing',
            error: '',
            message,
        });
    }

    pendingApprove() {
        const { currentState } = this.state;
        if (currentState !== 'pending') {
            this.setState({
                currentState: 'pending',
                currentId: '',
                error: '',
                message: '',
            });
        } else {
            this.setState({
                currentState: '',
                currentId: '',
                error: '',
                message: '',
            });
        }
    }

    render() {
        const {
            username, leaveList, currentId, currentState, currentLeave, message, error,
        } = this.state;
        const leaveTable = leaveList.map((leave) => (
            <tr
                key={leave.id}
                className={`${currentId === leave.id ? 'chosen' : ''} ${(new Date(leave.timeTo) <= new Date()) ? 'outdated' : ''}`}
                onClick={() => { this.chooseId(leave); }}
            >
                <td>{leave.id}</td>
                <td>{leave.type}</td>
                <td>{`${toLocalISOString(leave.timeFrom).slice(0, 10)} ${toLocalISOString(leave.timeFrom).slice(11, 16)}`}</td>
                <td>{`${toLocalISOString(leave.timeTo).slice(0, 10)} ${toLocalISOString(leave.timeTo).slice(11, 16)}`}</td>
                <td>{leave.approved}</td>
            </tr>
        ));
        const chooseLeave = currentId
            ? (
                <div className="chosen-leave">
                    <span>{`ID: ${currentId}`}</span>
                    <button type="button" onClick={this.handleEditing}>修改 Edit</button>
                    <button type="button" onClick={this.deleteLeave}>刪除 Delete</button>
                    <button type="button" onClick={this.cancelLeave}>銷假 Cancel</button>
                    {error && <h2 className="error-message">{error}</h2>}
                    <h3 className="success-message">{message}</h3>
                    {(currentState === 'editing')
                    && (
                        <LeaveEditor
                            username={this.user.username}
                            password={this.user.password}
                            currentId={currentId}
                            currentLeave={currentLeave}
                            succeed={this.succeed}
                            getLeaveList={this.getLeaveList}
                        />
                    )}
                </div>
            )
            : (
                <div>
                    <button type="button" className="add-leave-button" onClick={this.handleAdding}>請假 New Leave</button>
                    <h2 className="success-message">{message}</h2>
                </div>
            );
        const addLeave = (currentState === 'adding')
            ? (
                <LeaveAdder
                    username={this.user.username}
                    password={this.user.password}
                    handleAdding={this.handleAdding}
                    getLeaveList={this.getLeaveList}
                />
            )
            : (
                chooseLeave
            );
        const displayContent = (currentState === 'pending')
            ? (
                <div className="pending-page">
                    <button type="button" className="back-to-leaves" onClick={this.pendingApprove}>
                        回到假單 Back To Leaves
                    </button>
                    <Pending username={this.user.username} password={this.user.password} />
                </div>
            )
            : (
                <div className="leave-list">
                    <h1>你的假單 Your Leaves</h1>
                    <div className="button-bar">
                        <Link to="/users">
                            <button type="button">使用者 Users</button>
                        </Link>
                        <button type="button" className="approve-leaves" onClick={this.pendingApprove}>
                            去准假 Approve Leaves
                        </button>
                        <Link to="/">
                            <button type="button" onClick={Leaves.onLogout}>登出 Logout</button>
                        </Link>
                    </div>
                    <table className="leave-table">
                        <thead>
                            <tr>
                                <th>編號 ID</th>
                                <th>假別 Type</th>
                                <th>開始時間 Time from</th>
                                <th>結束時間 Time to</th>
                                <th>核准狀態 Approved?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveTable}
                        </tbody>
                    </table>
                    {addLeave}
                </div>
            );
        return (
            <div className="leave-page">
                {username
                    ? displayContent
                    : (
                        <Link to="/">
                            <button type="button">請先登入 Please Login First</button>
                        </Link>
                    )}
            </div>
        );
    }
}
