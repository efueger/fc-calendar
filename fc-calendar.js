var Calendar = (function () {
    var UNDEFINED,
        // basic calendar configaration
        info = {
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            weekLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthLabel: ['January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December'
            ]
        },
        // check if the year is leap year or not
        checkLeapYear = function (year) {
            return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
        },
        // get current local date
        getCurrentDate = function () {
            var today = new Date(),
                dd = today.getDate(),
                mm = today.getMonth() + 1,
                yyyy = today.getFullYear();

            dd < 10 && (dd = '0' + dd);
            mm < 10 && (mm = '0' + mm);
            return mm + '/' + dd + '/' + yyyy;
        },
        // apply custom style to the container
        setStyle = function (element, graphic) {
            var container,
                property;

            if (typeof element === 'object') {
                container = element;
            } else {
                container = document.getElementById(element);
            }
            for (property in graphic) {
                if (graphic.hasOwnProperty(property)) {
                    container.style[property] = graphic[property];
                }
            }
        },
        // validate Input
        validateDate = function (date) {
            var timestamp = Date.parse(date),
                newDate;

            // check input date is valid or not
            if (isNaN(timestamp) === false) {
                newDate = new Date(date);
                return (newDate.getMonth() + 1) + '/' + newDate.getDate() + '/' + newDate.getFullYear();
            } else {
                throw new Error('invalid Date: ' + date);
            }
        },
        // Change the date to user input date
        setDate = function (date, calendarObj) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                newDate = validateDate(date).split('/');
            calendarInfo.currYear = newDate[2];
            calendarInfo.currMon = newDate[0];
            calendarInfo.currDate = newDate[1];
            update(calendarObj);
        },
        // returns the date that can be selectable
        getDateRange = function (_date, calendarObj) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                date = new Date(_date),
                date1 = calendarInfo.firstDate,
                date2 = calendarInfo.lastDate,
                tempDate;

            date1 > date2 && (tempDate = date1, date1 = date2, date2 = tempDate);
            return date1 <= date && date2 >= date;
        },
        // add event and apply custom functions to date
        addEvent = function (element, calendarObj, func) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                date,
                isRangeSet,
                callFun = func || function () {
                    date = element.dateData;
                    isRangeSet = !!calendarInfo.isRangeSet && !getDateRange(date, calendarObj);
                    if (!isRangeSet) {
                        calendar.previousDate = date;
                        date && setDate(date, calendar);
                        calendar.customEvents.onDateChange && calendar.customEvents.onDateChange(info.date);
                    }
                };
            element.addEventListener('click', callFun);
        },
        // this function will update the calendar
        // without re-drawing the elements
        update = function (calendarObj) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                graphic = calendar.graphic,
                style = graphic.style,
                dayElements = graphic.dayElements,
                weekElements = graphic.weekElements,
                dateSpan = graphic.spanElement,
                len = dayElements.length,
                currMon = calendarInfo.currMon,
                currYear = calendarInfo.currYear,
                dateStr,
                startingDay = calendarInfo.weekStartingDay,
                startingOfMonth = new Date(currMon + '/01/' + currYear),
                weekDay = startingOfMonth.getDay() - startingDay,
                printDate,
                limit,
                monthStr = graphic.monthStr,
                yearStr = graphic.yearStr,
                isRangeSet,
                className,
                i,
                j;

            weekDay < 0 && (weekDay += 7);
            currMon === 2 && checkLeapYear(currYear) ? i = 29 : i = 28;
            info.daysInMonth[1] = i;
            limit = info.daysInMonth[currMon - 1] + weekDay - 1;
            // month and year changed
            monthStr.innerHTML = info.monthLabel[currMon - 1];
            yearStr.innerHTML = currYear;
            // if calendar weeks have to repaint then do it
            if (calendarInfo.weekdayLabelChanged) {
                for (j = 0, i = startingDay; j < (7 - startingDay); i++, j++) {
                    weekElements[j].innerHTML = info.weekLabel[i];
                }
                for (j, i = 7 - i; j < 7; j++, i++) {
                    weekElements[j].innerHTML = info.weekLabel[i];
                }
                calendarInfo.weekdayLabelChanged = false;
            }

            // repaint date elements
            for (i = 0; i < len; i++) {
                if (i < weekDay || i > limit) {
                    dateSpan[i].innerHTML = '';
                    dayElements[i].dateData = '';
                    dateSpan[i].className = 'normal';
                } else {
                    printDate = (i - weekDay + 1);
                    dateStr = currMon + '/' + printDate + '/' + currYear;
                    isRangeSet = !!calendarInfo.isRangeSet && !getDateRange(dateStr, calendarObj);
                    calendar.previousDate === dateStr && !isRangeSet ? className = 'active' : className = 'normal';
                    isRangeSet && (className = 'disabled');
                    dateSpan[i].className = className;
                    dateSpan[i].innerHTML = printDate;
                    dayElements[i].dateData = dateStr;
                }
            }
        },
        // initialise the calendar graphicaration
        init = function (calendar, _graphic) {
            var graphic = calendar.graphic,
                style = {},
                cnt = info.containerCnt || (info.containerCnt = 0);

            graphic.posX = (_graphic.x || 0);
            graphic.posY = (_graphic.y || 0);
            graphic.verticalAlignment = _graphic.verticalalignment || 'top';
            graphic.horizontalAlignment = _graphic.horizontalalignment || 'left';
            graphic.height = (_graphic.height || 200);
            graphic.width = (_graphic.width || 300);


            calendar.graphic.container || (graphic.container = createElement('div', 'calendar ' + cnt, document.body),
             graphic.container.className += ' calendar-container');
            // console.log(calendar.graphic.container,graphic)


            style.position = graphic.position || 'relative';
            style.height = graphic.height + 'px';
            style.width = graphic.width + 'px';
            style.top = (function (conf) {
                if (conf.verticalAlignment.toLowerCase() === 'top') {
                    return conf.posY + 'px';
                } else if (conf.verticalAlignment.toLowerCase() === 'middle') {
                    return (conf.posY + conf.height / 2) + 'px';
                } else if (conf.verticalAlignment.toLowerCase() === 'bottom') {
                    return (conf.posY + conf.height) + 'px';
                }
            })(graphic);
            style.left = (function (conf) {
                if (conf.horizontalAlignment.toLowerCase() === 'left') {
                    return conf.posX + 'px';
                } else if (conf.horizontalAlignment.toLowerCase() === 'middle') {
                    return (conf.posX + conf.width / 2) + 'px';
                } else if (conf.horizontalAlignment.toLowerCase() === 'right') {
                    return (conf.posX + conf.width) + 'px';
                }
            })(graphic);

            graphic.style = style;
            setStyle(graphic.container, style);
            info.containerCnt++;
            return graphic;
        },
        // changeDate on click
        changeDate = function (calendarObj) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                graphic = calendar.graphic,
                style = graphic.style,
                gotoPreviousMon = graphic.prevMon,
                gotoNextMon = graphic.nextMon,
                gotoPreviousYear = graphic.prevYear,
                gotoNextYear = graphic.nextYear,
                date,
                currDate,
                currMon,
                currYear,
                getCurrentDate = (function () {
                    currDate = calendarInfo.currDate;
                    currMon = calendarInfo.currMon;
                    currYear = calendarInfo.currYear;
                    date = {date: currDate, month: currMon, year: currYear};
                    info.date = date;
                    return date;
                })();
            // adding events to the month and year changer
            gotoPreviousMon.addEventListener('click', function () {
                currMon--;
                currMon < 1 && (currMon = 12, currYear--);
                setDate((currMon + '/' + currDate + '/' + currYear), calendar);
                calendar.customEvents.onMonthChange && calendar.customEvents.onMonthChange(getCurrentDate);
            });

            gotoNextMon.addEventListener('click', function () {
                currMon++;
                currMon > 12 && (currMon = 1, currYear++);
                setDate((currMon + '/' + currDate + '/' + currYear), calendar);
                calendar.customEvents.onMonthChange && calendar.customEvents.onMonthChange(getCurrentDate);
            });

            gotoNextYear.addEventListener('click', function () {
                currYear++;
                setDate((currMon + '/' + currDate + '/' + currYear), calendar);
                calendar.customEvents.onYearChange && calendar.customEvents.onYearChange(getCurrentDate);
            });

            gotoPreviousYear.addEventListener('click', function () {
                currYear--;
                setDate((currMon + '/' + currDate + '/' + currYear), calendar);
                calendar.customEvents.onYearChange && calendar.customEvents.onYearChange(getCurrentDate);
            });
        },
        // function to create dom elements
        createElement = function (type, id, appendTo, val, _class) {
            var element = document.createElement(type),
                typeOfVal = typeof val;
            element.id = id;
            element.className = _class || id;

            if (typeOfVal === 'object') {
                element.appendChild(val);
            } else if (typeOfVal === 'string' || typeOfVal === 'number') {
                element.innerHTML = val;
            }
            appendTo && appendTo.appendChild(element);
            return element;
        },
        // function to draw calender for the first time with user graphic
        draw = function (calendarObj) {
            var calendar = calendarObj,
                calendarInfo = calendar.calendarInfo,
                cnt = info.containerCnt,
                graphic = calendar.graphic,
                style = graphic.style,
                dayElements = [],
                weekElements = [],
                spanElement = [],
                container = graphic.container,
                date = new Date(calendar.date),
                currDate = calendarInfo.currDate = date.getDate(),
                currMon = calendarInfo.currMon = (date.getMonth() + 1),
                currYear = calendarInfo.currYear = date.getFullYear(),
                dateStr,
                nextMon = createElement('li', 'gotoNextMon ' + cnt, UNDEFINED, '&#10095;', 'next'),
                nextYear = createElement('li', 'gotoNextYear ' + cnt, UNDEFINED, '&#10095;', 'next'),
                prevYear = createElement('li', 'gotoPreviousYear ' + cnt, UNDEFINED, '&#10094;', 'prev'),
                prevMon = createElement('li', 'gotoPreviousMon ' + cnt, UNDEFINED, '&#10094;', 'prev'),
                monthStr = createElement('span', 'monthStr ' + cnt, UNDEFINED, info.monthLabel[currMon - 1]),
                yearStr = createElement('span', 'yearStr ' + cnt, UNDEFINED, currYear),
                calendarHeader = createElement('div', 'month ' + cnt, container),
                headerMonthUl = createElement('ul', 'month-ul ' + cnt, calendarHeader),
                headerMonthLi = createElement('li', 'month-li ' + cnt, headerMonthUl, ''),
                headerYearLi = createElement('li', 'year-li ' + cnt, headerMonthUl, ''),
                weekDays = createElement('ul', 'weekdays ' + cnt, container),
                days = graphic.dayCell = createElement('ul', 'days ' + cnt, container),
                startingOfMonth = new Date(currMon + '/01/' + currYear),
                weekDay = startingOfMonth.getDay(),
                printDate,
                limit = info.daysInMonth[currMon - 1] + weekDay - 1,
                element,
                isRangeSet,
                className,
                dateSpan,
                i;

            headerMonthLi.appendChild(prevMon);
            headerMonthLi.appendChild(monthStr);
            headerMonthLi.appendChild(nextMon);
            headerYearLi.appendChild(prevYear);
            headerYearLi.appendChild(yearStr);
            headerYearLi.appendChild(nextYear);
            checkLeapYear(currYear) && (info.daysInMonth[1] = 29);

            for (i = 0; i < 7; i++) {
                element = createElement('li', (i + '-weekdays ' + cnt), weekDays, info.weekLabel[i]);
                weekElements.push(element);
            }

            for (i = 0; i < 37; i++) {
                if (i < weekDay || i > limit) {
                    dateSpan = createElement('span', 'normal', UNDEFINED, '');
                    element.dateData = '';
                } else {
                    printDate = (i - weekDay + 1);
                    dateStr = currMon + '/' + printDate + '/' + currYear;
                    isRangeSet = !!calendarInfo.isRangeSet && !getDateRange(dateStr, calendarObj);
                    printDate === currDate && !isRangeSet ? className = 'active' : className = 'normal';
                    isRangeSet && (className = 'disabled');
                    dateSpan = createElement('span', className, UNDEFINED, printDate);
                }
                element = createElement('li', 'dayElement-' + i + cnt, days, dateSpan, true);
                element.dateData = dateStr;
                addEvent(element, calendar);
                spanElement.push(dateSpan);
                dayElements.push(element);
            }

            graphic.dayElements = dayElements;
            graphic.weekElements = weekElements;
            graphic.headerMonthLi = headerMonthLi;
            graphic.headerYearLi = headerYearLi;
            graphic.prevMon = prevMon;
            graphic.monthStr = monthStr;
            graphic.nextMon = nextMon;
            graphic.prevYear = prevYear;
            graphic.yearStr = yearStr;
            graphic.nextYear = nextYear;
            graphic.spanElement = spanElement;
            calendar.isCalendarDrawn = true;
            calendarInfo.weekStartingDay = 0;
            changeDate(calendar);
        },
        calendarProto = Calendar.prototype;
    // calendar constructor
    function Calendar (config) {
        var calendar = this;
        calendar.calendarInfo = {};
        calendar.events = {};
        calendar.graphic = {};
        calendar.configure(config);
    };
    // configure calendar
    calendarProto.configure = function (_config) {
        var calendar = this,
            config = _config || {},
            graphic = _config.style || calendar.graphic,
            customEvents = calendar.customEvents || {},
            userEvents = config.events || {},
            container = config.style.container && document.getElementById(_config.style.container),
            onDateChange,
            onYearChange,
            onMonthChange;

        container && (container.appendChild(calendar.graphic.container));

        typeof userEvents.onDateChange === 'function' && (customEvents.onDateChange = userEvents.onDateChange);
        typeof userEvents.onYearChange === 'function' && (customEvents.onYearChange = userEvents.onYearChange);
        typeof userEvents.onMonthChange === 'function' && (customEvents.onMonthChange = userEvents.onMonthChange);

        calendar.customEvents = customEvents;
        calendar.graphic = init(calendar, graphic);
        calendar.date = config.date && config.date.replace(/[^0-9 ]/g, '/') || getCurrentDate();
        calendar.previousDate = validateDate(calendar.date);
        calendar.isCalendarDrawn ? setDate(calendar.date, calendar) : draw(calendar);
    };
    // call show function show calendar
    calendarProto.show = function () {
        var calendar = this,
            graphic = calendar.graphic,
            container = graphic.container;
        if (calendar.isCalendarDrawn) {
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }
    };
    // call hide function to hide calendar
    calendarProto.hide = function () {
        var calendar = this,
            graphic = calendar.graphic,
            container = graphic.container;
        if (calendar.isCalendarDrawn) {
            container.style.visibility = 'hidden';
            container.style.opacity = '0';
        }
    };
    // returns the current or selected date
    calendarProto.getDate = function () {
        return this.date;
    };
    // goto the desired date
    calendarProto.setDate = function (date) {
        var calendar = this;
        calendar.previousDate = validateDate(date);
        setDate(date, calendar);
    };
    // set calendar date range
    calendarProto.setActiveRange = function (firstDate, lastDate) {
        var calendar = this,
            calendarInfo = calendar.calendarInfo;

        calendarInfo.firstDate = new Date(firstDate);
        calendarInfo.lastDate = new Date(lastDate);
        calendarInfo.isRangeSet = true;
        update(calendar);
    };
    // remove cander date range
    calendarProto.removeActiveRange = function () {
        var calendar = this,
            calendarInfo = calendar.calendarInfo;

        calendarInfo.isRangeSet = false;
        update(calendar);
    };
    // change week starting day
    calendarProto.startingDay = function (day) {
        var calendar = this,
            weekdayLabel = info.weekLabel,
            calendarInfo = calendar.calendarInfo,
            startingDay = weekdayLabel.indexOf(day);

        if (startingDay !== -1) {
            calendarInfo.weekdayLabelChanged = true;
            calendarInfo.weekStartingDay = startingDay;
            update(calendar);
        }
    };
    // add custom funcion on click
    calendarProto.setClickHandler = function (defination) {
        var calendar = this;
        calendar.customeEvents.onDateChange = defination;
        calendar.isSetClickHandler = true;
    };
    // remove custom funcion on click
    calendarProto.removeClickHandler = function () {
        var calendar = this;
        delete calendar.customEvents.onDateChange;
    };

    return Calendar;
})();
