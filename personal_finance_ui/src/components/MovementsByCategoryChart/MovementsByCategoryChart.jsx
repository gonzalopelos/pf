import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import AccessTime from "@material-ui/icons/AccessTime";
import CardIcon from "components/Card/CardIcon.jsx";
import CardBody from "components/Card/CardBody.jsx";
import CardFooter from "components/Card/CardFooter.jsx";
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import MaterialTable from 'material-table'
import Table from "components/Table/Table.jsx";
// @material-ui/core
import withStyles from "@material-ui/core/styles/withStyles";
import Icon from "@material-ui/core/Icon";
import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";
import Picker from 'react-month-picker'
import MonthBox from "components/MonthBox/MonthBox.jsx"


var delays = 80,
  durations = 500;
var delays2 = 80,
  durations2 = 500;
var seriesData = [17, 7, 17, 23, 18, 38, 22, 55, 66, 77, 88, 33];
var sum = function (a, b) { return a + b };

let pickerLang = {
  months: ['Jan', 'Feb', 'Mar', 'Spr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  , from: 'From', to: 'To'
  , years: [2018, 2019, 2020, 2021, 2022, 2023]
}
  , mrange = { from: { year: 2014, month: 8 }, to: { year: 2015, month: 5 } }

let makeText = m => {
  if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
  return '?'
}
function showCategoryDescription(cell, row) {
  return cell.category.description;
}

class MovementsByCategoryChart extends Component {
  constructor() {
    super();
    this.state = {
      movementsChartData: {},
      mvalue: {year: 2018, month: 11},
    }

    this.handleClickMonthBox = this.handleClickMonthBox.bind(this)
    this.handleAMonthChange = this.handleAMonthChange.bind(this)
    this.handleAMonthDissmis = this.handleAMonthDissmis.bind(this)

  };

  handleAMonthChange(year, month) {
    this.setState({ mvalue: {year: year, month: month} });
  }
  handleAMonthDissmis(value) {
    this.setState({ mvalue: value });
  }
  
  handleClickMonthBox(e) {
    this.refs.pickAMonth.show();
  }

  componentDidMount() {
    fetch("http://localhost:3001/movementsByCategory")
      .then(results => results.json())
      .then(data => {
        // this.setState({ movementsByCategory: movementsByCategory });
        var labels = [];
        var series = [];
        console.log(data); 
        data.forEach(mbc => {
          if (mbc.category.description != 'Undefined' && mbc.creditAmount == 0) {
            labels.push(mbc.category.description);
            series.push(mbc.creditAmount + mbc.debitAmount);
          }
        });
        this.setState({
          movementsChartData: {
            data: {
              labels: labels,
              series: [series]
            },
            options: {
              seriesBarDistance: 25,
              // axisX: {
              //   showGrid: true,
              //   labelInterpolationFnc: function (value, index) {
              //     return value;
              //   }
              // },
              // axisY: {
              //   offset: 100,
              //   labelInterpolationFnc: function (value) {
              //     return value + ' $'
              //   },
              //   scaleMinSpace: 10
              // },
              horizontalBars: true,
              reverseData: false

            },
            responsiveOptions: [
              [
                // "screen and (max-width: 640px)",
                // {
                //   seriesBarDistance: 10,
                //   // axisX: {
                //   //   labelInterpolationFnc: function (value) {
                //   //     return value[0];
                //   //   }
                //   // }
                // }
              ]
            ],
            animation: {
              draw: function (data) {
                if (data.type === 'Bar') {
                  // We use the group element of the current series to append a simple circle with the bar peek coordinates and a circle radius that is depending on the value
                  data.group.append(new ChartistGraph.Svg('circle', {
                    cx: data.x2,
                    cy: data.y2,
                    r: Math.abs(ChartistGraph.getMultiValue(data.value)) * 2 + 5
                  }, 'ct-slice-pie'));
                }
              }
            }
          }
        })
      });

    fetch("http://localhost:3001/movements").then(results => results.json())
    .then(data =>{
      this.setState({movements: data});
    });
  }

  

  render() {
    const { classes } = this.props;
    const mvalue = this.state.mvalue

    return (
      <div>

        <label><b>Selecciones un mes</b></label>
        <div   className="edit">
          <Picker
            ref="pickAMonth"
            years={{min: 2018}}
            value={mvalue}
            lang={pickerLang.months}
            theme="dark"
            onChange={this.handleAMonthChange}
            onDismiss={this.handleAMonthDissmis}
          >
            <MonthBox value={makeText(mvalue)} onClick={this.handleClickMonthBox} />
          </Picker>
        </div>
        <ChartistGraph
          className="ct-chart"
          data={this.state.movementsChartData.data}
          type="Bar"
          options={this.state.movementsChartData.options}
          // responsiveOptions={this.state.movementsChartData.responsiveOptions}
          // listener={this.state.movementsChartData.animation}
        />

        <MaterialTable
          columns={[
            { title: 'Categoría', dataIndex: "category.description"},
            { title: 'Descripción', field: 'description' },
            { title: 'Fecha', field: 'date', type: 'datetime' },
            { title: 'Debito', field: 'debit', type: 'numeric', cellStyle: data => {
              if (data != 0) {
                return {
                  color: 'red',
                }
              }
            }},
            { title: 'Crédito', field: 'credit', type: 'numeric', cellStyle: data => {
              if (data > 0) {
                return {
                  color: 'green',
                }
              }
            }}
            
          ]}
          data={this.state.movements}
          title="Movimientos"
          
        />
         
      </div >
    );
  }
}

export default withStyles(dashboardStyle)(MovementsByCategoryChart);