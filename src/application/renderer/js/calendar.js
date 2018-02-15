module.exports = function Calendar($dom, referenceMoment){
  const moment = require('moment');
  const renderer = require('../renderer')();
  const self = this;

  if(typeof referenceMoment === "undefined" || !moment(referenceMoment).isValid()){
    referenceMoment = moment();
  }
  let reset = function(){
    $dom.off('click');
  };

  let dateBack = function(){
    let backMoment = moment(referenceMoment).subtract(1, 'month');
    reset();
    Calendar($dom, backMoment);
  };

  let dateForward = function(){
    let forwardMoment = moment(referenceMoment).add(1, 'month');
    reset();
    Calendar($dom, forwardMoment);
  };

  let numberOfDays = referenceMoment.daysInMonth();
  let startPos = moment(referenceMoment).date(1).day();
  let cols = 7 * 6;
  let calendar = {};

  for(let i = 1; i <= cols; i++){
    let dateCol = {};
    let dateMoment = moment(referenceMoment).date(i - startPos);
    dateCol.isCurrentMonth = true;
    dateCol.isToday = false;

    if(!dateMoment.isSame(referenceMoment, 'month')){
      dateCol.isCurrentMonth = false;
    }
    if(dateMoment.isSame(moment(), 'day')){
      dateCol.isToday = true;
    }

    dateCol.moment = dateMoment;
    calendar[i] = dateCol;
  }

  let html = renderer.render('calendar', {referenceMoment: referenceMoment, calendar: calendar});

  $dom.html(html);

  $dom.on('click', '.days', function(){
  });

  $dom.on('click', '#date-back', dateBack);
  $dom.on('click', '#date-forward', dateForward);

};