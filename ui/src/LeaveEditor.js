//region 1. Platform Libraries
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
//endregion

//region 2. Project Libraries
import toLocalISOString from './utils/toLocalISOString';
//endregion

//region U. UI Markups
import './styles/Editor.scss';
//endregion

export default class LeaveEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            dateFrom: '',
            dateTo: '',
            timeFrom: '',
            timeTo: '',
            error: '',
            message: '',
        };
        this.editLeave = this.editLeave.bind(this);
    }

    componentDidMount() {
        const { currentLeave: { type, timeFrom, timeTo } } = this.props;
        const from = toLocalISOString(timeFrom);
        const to = toLocalISOString(timeTo);

        this.setState({
            type,
            dateFrom: from.substring(0, 10),
            dateTo: to.substring(0, 10),
            timeFrom: from.substring(11, 16),
            timeTo: to.substring(11, 16),
        });
    }

    editLeave() {
        const {
            type, dateFrom, dateTo, timeFrom, timeTo,
        } = this.state;
        const {
            username, password, currentId, succeed, getLeaveList,
        } = this.props;
        if (!type || !dateFrom || !dateTo || !timeFrom || !timeTo) {
            this.setState({ error: '欄位未填寫完整！ Input not completed!' });
            return;
        }
        axios.put(`/leaves/${currentId}`, {
            type,
            timeFrom: new Date(`${dateFrom}T${timeFrom}:00`).toISOString(),
            timeTo: new Date(`${dateTo}T${timeTo}:00`).toISOString(),
        }, {
            auth: {
                username,
                password,
            },
        })
            .then(() => {
                succeed('修改成功！ Leave edited!');
                getLeaveList();
            })
            .catch((err) => {
                let error = '';
                if (err.response) {
                    console.log(err.response.status, err.response.data);
                    switch (err.response.status) {
                    case 400:
                        error = '時間不符規定！ Invalid time!!!';
                        break;
                    case 403:
                        error = '沒有權限！ Forbidden!!!';
                        break;
                    case 409:
                        error = '時間重疊！ Time Conflicted!!!';
                        break;
                    case 500:
                        error = '連線失敗！請檢查網路。 Fail to connect!!! Please check your network.';
                        break;
                    default:
                        error = '修改失敗！請再試一次。 Fail to edit!!! Please try again.';
                    }
                } else {
                    console.log(err);
                    error = '修改失敗！請再試一次。 Fail to edit!!! Please try again.';
                }
                this.setState({ error, message: err.response.data });
            });
    }

    render() {
        const {
            error, message, type, dateFrom, dateTo, timeFrom, timeTo,
        } = this.state;
        return (
            <div className="leave-editor">
                <span>假別 Type：</span>
                <select value={type} onChange={(e) => { this.setState({ type: e.target.value }); }}>
                    <option value="personal">事假 Personal</option>
                    <option value="sick">病假 Sick</option>
                    <option value="annual">特休 Annual</option>
                    <option value="official">公假 Official</option>
                    <option value="marriage">婚假 Marriage</option>
                    <option value="funeral">喪假 Funeral</option>
                    <option value="maternity">產假 Maternity</option>
                    <option value="paternity">陪產假 Paternity</option>
                    <option value="menstruation">生理假 Menstruation</option>
                    <option value="compensatory">補休 Compensatory</option>
                </select>
                <br />
                <span>開始時間 Time from：</span>
                <input type="date" name="from-date" value={dateFrom} onChange={(e) => { this.setState({ dateFrom: e.target.value }); }} />
                <input type="time" name="from-time" value={timeFrom} onChange={(e) => { this.setState({ timeFrom: e.target.value }); }} />
                <span>結束時間 Time to：</span>
                <input type="date" name="to-date" value={dateTo} onChange={(e) => { this.setState({ dateTo: e.target.value }); }} />
                <input type="time" name="to-time" value={timeTo} onChange={(e) => { this.setState({ timeTo: e.target.value }); }} />
                <br />
                <button type="submit" onClick={this.editLeave}>修改 Edit</button>
                {error && <h2 className="error-message">{error}</h2>}
                <h3>{message}</h3>
            </div>
        );
    }
}

LeaveEditor.propTypes = {
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    currentId: PropTypes.string.isRequired,
    currentLeave: PropTypes.shape({
        type: PropTypes.string.isRequired,
        timeFrom: PropTypes.string.isRequired,
        timeTo: PropTypes.string.isRequired,
    }).isRequired,
    succeed: PropTypes.func.isRequired,
    getLeaveList: PropTypes.func.isRequired,
};
