/* eslint-disable */
import React from "react";
import { Chart } from "react-google-charts";
import * as moment from 'moment';
import Picker from 'react-month-picker'
import MonthBox from "components/MonthBox/MonthBox.jsx"
var _ = require('underscore');

const anualData = [
    ["Mes", "Santander UYU", "BROU USD", "BROU UYU"]
];
const options = {
    title: "Balances de cuentas anual",
    curveType: "function",
    legend: { position: "bottom" }
};

const brou_uyu = "001298002-00001";
const boru_usd = "001251612-00001";
const santander_uyu = "007000081226";

let pickerLang = {
    months: ['Jan', 'Feb', 'Mar', 'Spr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    , from: 'From', to: 'To'
    , years: [2018, 2019, 2020, 2021, 2022, 2023]
}
let makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
}

class AccountBalances extends React.Component {

    constructor() {
        super();
        this.state = {
            accountBalancesData: anualData,
            mvalue: {year: 2018, month: 11},
        }

        this.handleClickMonthBox = this.handleClickMonthBox.bind(this)
        this.handleAMonthChange = this.handleAMonthChange.bind(this)
        this.handleAMonthDissmis = this.handleAMonthDissmis.bind(this)

    };


    handleAMonthChange(year, month) {
        this.setState({ mvalue: { year: year, month: month } });
    }
    handleAMonthDissmis(value) {
        this.setState({ mvalue: value });
    }

    handleClickMonthBox(e) {
        this.refs.pickAMonth.show();
    }

    componentDidMount() {
        this.getAccountBalances(2018);
    }

    render() {
        return (
            <div>
                <label><b>Selecciones un mes</b></label>
                <div className="edit">
                    <Picker
                        ref="pickAMonth"
                        years={{ min: 2018 }}
                        value={this.state.mvalue}
                        lang={pickerLang.months}
                        theme="dark"
                        onChange={this.handleAMonthChange}
                        onDismiss={this.handleAMonthDissmis}
                    >
                        <MonthBox value={makeText(this.state.mvalue)} onClick={this.handleClickMonthBox} />
                    </Picker>
                </div>

                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="400px"
                    data={this.state.accountBalancesData}
                    options={this.state.options}
                />
            </div>
        )
    }

    getAccountBalances(year) {
        fetch("http://localhost:3001/accountsBalances?year=2018")
            .then(results => results.json())
            .then(balances => {

                var groups = _.groupBy(balances, function (balance) {
                    return moment(balance.date).startOf('month').format();
                });
                var balancesData = [];
                balancesData.push(anualData[0]);
                Object.keys(groups).map((key) => {
                    if (groups[key].length == 3) {
                        var date = new Date(key);
                        var month = date.getMonth();
                        var santanderBalance = groups[key].find(((b) => b.accountNumber === santander_uyu));
                        var brou_uyu_balance = groups[key].find(((b) => b.accountNumber === brou_uyu));
                        var boru_usd_balance = groups[key].find(((b) => b.accountNumber === boru_usd));
                        balancesData.push([month, santanderBalance.balance, boru_usd_balance.balance, brou_uyu_balance.balance]);
                    }
                    else {

                    }
                    console.log(balancesData);
                });

                this.setState({
                    accountBalancesData: balancesData,
                    options: {
                        title: "Balances de cuentas anual",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                });
                console.log(balancesData);
            });
    }
}

export default (AccountBalances);