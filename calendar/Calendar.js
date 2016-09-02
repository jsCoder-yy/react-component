//公用部分
import React from 'react';
import ReactDom from 'react-dom';
import $ from 'jquery';
//页面部分
import helper from 'common/helper.js';
import { BaseComponent } from "common/component.js";
import moment from "moment";
import app from "common/app.js";
import appcss from "common/app.css";
import calendar from "./Calendar.css";

class Calendar extends BaseComponent{
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(){}
  render(){
    return (
      <div className='calendar'>
        <CalendarHeader  headItem={this.props.calendarHeader} />
        <CalendarMonth year={this.props.year} month={this.props.month} onSelect={this.props.onSelect}/>
      </div>
    )
  }
}
class CalendarHeader extends BaseComponent{
  render(){
    let headItem=this.props.headItem;
    return (
      <div className='calendar-header'>
        {
          headItem.map(function (headItem) {  
            return React.createElement('div',{key:helper.generateID()},headItem)   
          })                  
        }
      </div>
    )
  }
}
class CalendarMonth extends BaseComponent{
  render(){
    console.log(moment);
    
    let monthFirstDay=moment({year:this.props.year,month:this.props.month-1,day:1});
    let monthLastDay=moment(monthFirstDay).add(1,'months').subtract(1,'days');
    let weekDayOfFirstDay=moment(monthFirstDay).day();
    let weekDayOfLastDay=moment(monthLastDay).day();
    let blockFirstDay=moment(monthFirstDay).subtract(weekDayOfFirstDay*1,'days');
    let blockLastDay=moment(monthLastDay).add(6-weekDayOfLastDay,'days');
    let daysCount=blockLastDay.diff(blockFirstDay,'days')+1;

    let days=[];
    for(let i=0;i<daysCount;i++){
      let targetDay=moment(blockFirstDay).add(i,'days'),
          targetDayDate=moment(targetDay).format('YYYY-MM-DD'),
          onSelect=this.props.onSelect(targetDayDate),
          isCurrentMonth=targetDay.month()===this.props.month-1,
          isToday=targetDayDate===moment().format('YYYY-MM-DD'),
          todayClassName='',
          dayClassName='';

          isCurrentMonth&&isToday&&(todayClassName='today');
          !isCurrentMonth&&(dayClassName='hide-day');
      days.push({
        day:targetDayDate,
        onSelect:this.props.onSelect,
        monthClassName:isCurrentMonth?'active':'unactive',
        dayClassName:dayClassName,
        todayClassName:todayClassName
      });
      let dayItems=[];
      days.map((day)=>{
        dayItems.push(<CalendarDay key={`calendar-day-${day.day}`} day={day.day} 
          onSelect={day.onSelect} 
          monthClassName={day.monthClassName} 
          dayClassName={day.dayClassName} 
          todayClassName={day.todayClassName} />);
      })
    }
    return(
      <div className='calendar-day'>
        {dayItems}
      </div>
    )
  }
}
class CalendarDay extends BaseComponent{
  constructor(props) {
    super(props);
    this.state = {};
  }
  onClick(){
    this.props.onSelect();
  }
  render(){
    let dayText=moment(this.props.day).format('DD');
    return(
      <div className={this.props.dayClassName} key={`calendar-item-${this.props.day}`} onClick={this.onClick.bind(this)}>{dayText}</div>
    )
  }
}
Calendar.propTypes = {
  year: React.PropTypes.number
};
Calendar.defaultProps = {
  year:2016,
  month:9,
  calendarHeader:['日','一','二','三','四','五','六'],
  selectedDateRange:[
    {className:'a',from:'2014-9-2',to:'2014-9-12'},
    {className:'b',from:'2014-9-22',to:'2014-9-26'}
  ],
  onSelect:()=>{console.log(123)},
};
ReactDom.render(< Calendar /> , document.getElementById('page'));
export default Calendar