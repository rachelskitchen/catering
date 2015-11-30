/*
 * Revel Systems Online Ordering Application
 *
 *  Copyright (C) 2014 by Revel Systems
 *
 * This file is part of Revel Systems Online Ordering open source application.
 *
 * Revel Systems Online Ordering open source application is free software: you
 * can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Revel Systems Online Ordering open source application is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Revel Systems Online Ordering Application.
 * If not, see <http://www.gnu.org/licenses/>.
 */

define(["backbone"], function(Backbone) {
    'use strict';

    var weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
//
// App.Models.WorkingDay model
//
// Use cases:
// var tt = new App.Models.Timetable(App.Data.settings.get("settings_system").timetables)
// var timetable = tt._get_timetable(new Date());
// var wd = new App.Models.WorkingDay({timetable: timetable['thursday'] })
// var options = wd.pickupTimeOptions({today: true});
// ...
// options = wd.pickupTimeOptions({today: false});
// ...
// wd.setTimetable( new_timetable )
// options = wd.pickupTimeOptions({today: false});
//

    App.Models.WorkingDay = Backbone.Model.extend({
        pickup_time_interval: 0,   // minutes between pickup time options
        start_time: 0, // minutes after start
        end_time: 0, // minutes before end
        delivery_time: 0, // order delivery time
        preparation_time: 0, // order preparation time
        enable_asap: true,
        defaults: {
            timetable: [],            // input param is like [{to:'06:00', from:'05:00'}, {to:'19:00', from:'07:00'}, {to:'23:00', from:'21:00'}]
                                        // if timetable = true or null => the store opened all the day,
                                        // if timetable = false  => the store is closed all the day,
            options: [],                // output param is pickup times array
            curTime: null               // time point for calculating pickup time
        },
        initialize: function() {
            var times = App.Data.settings.get('settings_system');
            this.pickup_time_interval = Math.abs(times.online_order_time_slot) || 1;
            this.start_time = times.online_order_start_time_offset;
            this.end_time = times.online_order_end_time_offset;
            this.delivery_time = times.estimated_delivery_time;
            this.preparation_time = times.estimated_order_preparation_time;
            this.enable_asap = times.enable_asap_due_time;
        },
        /**
         * Set proget_working_hoursperty "Timetable" to use it.
         */
        update: function(data) {
            this.set(data);
        },
        /**
         * Return offset time from current time to order ready time
         */
        get_dining_offset: function(isDelivery) {
            if (isDelivery) {
                return this.delivery_time * 60 * 1000;
            } else {
                return this.preparation_time * 60 * 1000;
            }
        },
        /**
         *  return true if store work all the day else false
         */
        _isAllTheDay: function() {
            var timetable = this.get('timetable');

            return (timetable === null || timetable === true);
        },
        /**
         * return true if store closed all day
         */
        _isClosedToday: function() {
            var timetable = this.get('timetable');
            return (timetable === false || $.isArray(timetable) && timetable.length === 0);
        },
        // Internal function.
        // It returns potentially pickup times for single period:
        _pickupTimesForPeriod: function(period, isDelivery) {
            var start_minutes, end_minutes,
                start_interval = this.start_time + (isDelivery ? this.delivery_time : this.preparation_time),
                end_interval = this.end_time - (isDelivery ? this.delivery_time : this.preparation_time),
                options = [];

            if (period === "all-the-day") {
                start_interval = 0;
                end_interval = 0;
                start_minutes = 0;
                end_minutes = 23 * 60 + 59;
            } else {
                start_minutes = period.from;
                end_minutes = period.to;
            }

            for (var min = start_minutes + start_interval; min <= end_minutes - end_interval; min += this.pickup_time_interval ) {
                options.push(min);
            }

            return options;
        },
        /**
         * merge periods and return minutes equivalent
         * from 09:00 to 11:30 and from 09:20 to 12:00 into from 540 to 750
         */
        _unionPeriods: function(periods) {
            var sorted = deepClone(periods).
                    map(function(el) {
                        return {
                            from: new TimeFrm(0, 0, '24 hour').load_from_str(el.from).get_minutes(),
                            to: new TimeFrm(0, 0, '24 hour').load_from_str(el.to).get_minutes()
                        };
                    }).
                    sort(function(v1,v2) {
                        if (v1.from > v2.from) {
                            return 1;
                        } else if (v1.from === v2.from && v1.to > v2.to) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }),
                    i = 0;

            while (i < sorted.length - 1) {
                if (sorted[i].to > sorted[i + 1].from) {
                    sorted[i].to = Math.max(sorted[i].to, sorted[i + 1].to);
                    sorted.splice(i + 1, 1);
                } else {
                    i++;
                }
            }

            return sorted;
        },
        /**
         * Internal function - it returns sum of potentially pickup times for all timetable periods.
         */
        _pickupSumTimes: function(isDelivery) {
            var self = this,
                timetable = this.get('timetable'),
                sum_pickup_times = [];

            if (this._isAllTheDay()) {
                //calc. the times for round-the-clock period or incorrect timetable
                return this._pickupTimesForPeriod( "all-the-day" );
            } else if (this._isClosedToday()) {
                return [];
            }

            this._unionPeriods(timetable).forEach( function(value) {
                sum_pickup_times = sum_pickup_times.concat(self._pickupTimesForPeriod(value, isDelivery) );
            });

            this.times = sum_pickup_times.sort(function(v1, v2) { return v1 - v2; });
            return this.times;
        },
        /**
         * check if shop works at curTime
         */
        checking_work_shop: function(isDelivery) {
            var timetable = this.get('timetable'),
                curtime = this.get('curTime');

            switch (timetable) {
                case null:
                case true:
                    return true;
                case false:
                    return false;
            }

            var worked = false,
                start_interval = this.start_time,
                end_interval = this.end_time - (isDelivery ? this.delivery_time : this.preparation_time),
                time = new TimeFrm(curtime.getHours(), curtime.getMinutes()).get_minutes();

            this._unionPeriods(timetable).forEach(function(value) {
                if (value.from + start_interval <= time && time <= value.to - end_interval) {
                    worked = true;
                }
            });
            return worked;
        },
        // pickupTimeOptions,
        // Call it to get the pickup time options for dropdown list
        // Returns: the array like ["ASAP", "10:30am", "10:45am", ...]
        //          "ASAP" option presents if isToday = true AND store is not closed now and store is working now.
        //          It returns ["closed"] - the store is alwayes closed for the day OR
        //                                  it's too late to make the order for Today
        //          {today: true/false, isDelivery: true/equal false (undefined)}
        pickupTimeOptions: function(params) {
            /*
                today - true if timetable for current day;
                isDelivery - true if dinning_option is delivery
            */
            params = params || {};
            var options = [],
                isDelivery = params.isDelivery,
                t = new TimeFrm(0, 0),
                isToday = params.today,
                asap = false,
                offest = (this.get_dining_offset(isDelivery) / 60 / 1000),
                asap_text = _loc['TIME_PREFIXES']['ASAP'];


            if (offest > 0) {
                asap_text += ' (' + offest + ' ' + _loc['TIME_PREFIXES']['MINUTES'] + ')';
            }
            // get pickup times grid potentially suited for the day
            var times = this._pickupSumTimes(isDelivery);

            if (isToday && times.length !== 0) {
                var curdate = new Date(this.get('curTime').getTime() + this.get_dining_offset(isDelivery)),
                    cur_min = curdate.getHours() * 60 + curdate.getMinutes(),
                    i, j;

                while (times[0] <= cur_min) {
                    if (this.enable_asap) {
                        asap = true;
                    }
                    times.shift();
                }
            }

            var work_shop = this.checking_work_shop(isDelivery);

            if (times.length === 0) {
                if (isToday && work_shop) {
                    this.set("options", [asap_text]);
                    return this.get("options");
                } else {
                    this.set("options", ["closed"]);
                    return this.get("options");
                }
            }

            if (asap) {
                options.push(asap_text);
            }

            for (i = 0, j = times.length; i < j; i++) {
                options.push(t.set_minutes(times[i]).toString());
            }

            this.set("options", options);
            return options;
        },
        /**
        * It finds the last pickup time available for the working period later then 'curtime'.
        * The working period is detemined by the case when period 'from' time < curtime < period 'to' time
        */
        getLastPTforPeriod: function(curtime, isDelivery) {
            if (this._isAllTheDay()) {
                return "all-the-day";
            }

            var timetable = this._pickupSumTimes(isDelivery),
                lastPT = new Date(curtime.getTime()),

                hour, minutes,
                last_time = timetable.length && timetable[timetable.length - 1],
                cur_t = new TimeFrm(curtime.getHours(), curtime.getMinutes()).get_minutes();

            if (!last_time || last_time < cur_t) {
                return "not-found";
            } else {
                hour = parseInt( last_time / 60 );
                minutes = last_time % 60;

                lastPT.setHours( hour );
                lastPT.setMinutes( minutes );
                lastPT.setSeconds( 0 );
                return lastPT;
            }
        }
    });

    App.Models.Timetable = Backbone.Model.extend({
        pickup_time_interval: 15 * 60 * 1000,
        defaults: {
            timetables: null,        // whole timetable. Dates couldn't be intersected
            holidays: null,
            server_time: null,          // timezone offset in minutes
            hours: null              // array of week days with working hours starting from current day
        },
        initialize: function() {
            var times = App.Data.settings.get('settings_system'),
                hours;
            if (!this.get('timetables')) this.set('timetables', times.timetables);
            if (!this.get('holidays')) this.set('holidays', times.holidays);
            if (this.get('server_time') == null) this.set('server_time', times.server_time);
            this.workingDay = new App.Models.WorkingDay();
            (hours = this.getHoursOnWeek()) && this.set('hours', hours);
        },
        /**
         * Get ID of month in format JS.
         */
        _get_month_id: function(month_text) { //Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
            for (var i = 0; i < EN_ARRAY_MONTH.length; i++) {
                if (month_text === EN_ARRAY_MONTH[i].substr(0, 3)) {
                    return i;
                }
            }
        },
        /**
         * Get day of week from ID of week in format JS.
         */
        get_day_of_week: function(id_week) {
            return weekDays[id_week];
        },
        /**
         * Get current time depends on server time
         */
        get_current_time : function(current_time) {
            return new Date(current_time.getTime() + this.get('server_time'));
        },
        /**
         * Base time
         */
        base: function() {
            return this.get_current_time(new Date());
        },
        /**
         * current time including preparation time and delivery time
         */
        current_dining_time: function(isDelivery) {
            return new Date(this.base().getTime() + this.workingDay.get_dining_offset(isDelivery));
        },
        /**
         * Get timetable on a particular day.
         * current_date - real date
         */
        // {} - always open; FALSE - always closed; NULL - timetables is empty
        _get_timetable: function(current_date) {
            var table = this.get('timetables'),
                current_date_year = current_date.getFullYear();

            if (empty_object(table)) { // check object (empty or not empty)
                return null;
            } else {
                for (var i = 0, j = table.length; i < j; i++) {
                    var cur_date = new Date(current_date.getTime()); //#22327, to get ready for table[] is unsorted
                    // from date (begin)
                    var from_date_month = this._get_month_id($.trim(table[i].from_date.split(",")[0])), // get ID of month in format JS
                        from_date_day = $.trim(table[i].from_date.split(",")[1]),
                        from_date = new Date(current_date_year, from_date_month, from_date_day),
                    // from date (end)
                    // to date (begin)
                        to_date_month = this._get_month_id($.trim(table[i].to_date.split(",")[0])), // get ID of month in format JS
                        to_date_day = $.trim(table[i].to_date.split(",")[1]),
                        to_date = new Date(current_date_year, to_date_month, to_date_day);
                    // to date (end)
                    from_date > to_date && to_date.setFullYear(to_date.getFullYear() + 1);
                    from_date > cur_date && cur_date.setFullYear(cur_date.getFullYear() + 1);

                    if (cur_date <= to_date) {
                        return table[i].timetable_data;
                    }
                }
            }
            return false;
        },
        isHoliday: function(cur_date) {
            /*
            *  returns FALSE - no holiday for cur_date
            *          TRUE - holiday registered for cur_date
            */
            var self = this,
                holidays = this.get("holidays");
            if (holidays == null || !$.isArray(holidays) || !holidays.length) {
                return false;
            }
            if (!cur_date) {
                cur_date = this.base();
            }
            var cur_month = cur_date.getMonth() + 1,
                cur_day = cur_date.getDate(),
                month, day;

            for (var i in holidays) {
                month = /^[^,]{3}/.exec(holidays[i].date);
                month = month[0];
                day = /^[^\d]+(\d{1,2})/.exec(holidays[i].date);
                day = day[1];
                if (cur_month == MonthByStr[month] && cur_day == day) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Get an array of working hours on a particular day.
         */
        get_working_hours: function(current_date, format_output) {
            /*
            current_date - Date() in format JS.
            format_output - format output time:
                1) 0: 12-hours format (default);
                2) 1: 24-hours format.

            // TRUE - around the clock; FALSE - closed; NULL - working hours is undefined. timetables is empty
            */
            format_output = format_output === 1 ? 1 : 0;
            var timetable = this._get_timetable(new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate())); // get timetable on a particular day

            if (this.isHoliday(current_date)) {
                return false;
            }

            if (timetable !== false) {
                if (timetable === null) {
                    return null;
                } else if (!empty_object(timetable)) { // check object (empty or not empty)
                    var current_day_timetable = timetable[weekDays[current_date.getDay()]];
                    if (current_day_timetable) {
                        if (!format_output) {
                            var timetable_in_format = [];
                            for (var i = 0; i < current_day_timetable.length; i++) {
                                var time = current_day_timetable[i],
                                    time_from = new TimeFrm(time.from.split(":")[0] * 1, time.from.split(":")[1] * 1).toString(),
                                    time_to = new TimeFrm(time.to.split(":")[0] * 1, time.to.split(":")[1] * 1).toString();

                                timetable_in_format.push({
                                    from: time_from, // output of time in requirement format
                                    to: time_to // output of time in requirement format
                                });
                            }
                            return timetable_in_format;
                        } else {
                            return current_day_timetable;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
            return false;
        },
        /**
         * Get timetable on the week from the current day.
         */
        get_timetable_on_week: function(format_output) {
            /*
            format_output - format output time:
                1) 0: 12-hours format (default);
                2) 1: 24-hours format.
            */
           // return null if timetable is empty
            format_output = format_output === 1 ? 1 : 0;
            var timetable = {},
                current_date = this.base(), // need to create new, not link (current_date = today)
                current_day_of_week;

            for (var i = 0; i <= 6; i++) {
                current_day_of_week = weekDays[current_date.getDay()];
                timetable[current_day_of_week] = this.get_working_hours(new Date(current_date), format_output); // get an array of working hours on a particular day. send copy of date not date referrer
                if (timetable[current_day_of_week] === null) {
                    return null;
                }
                current_date.setTime(current_date.getTime() + MILLISECONDS_A_DAY);
            }
            return timetable;
        },
        getHoursOnWeek: function() {
            var timetable_on_week = this.get_timetable_on_week(),
                timetable;

            if(timetable_on_week !== null && Object.keys(timetable_on_week).length > 1) {
                timetable = [];
                var today = this.base().getDay();
                for(var i = today; i < today + 7; i++) {
                    var weekDay = this.get_day_of_week(i % 7);
                    timetable.push({
                        weekDay: weekDay,
                        hours: timetable_on_week[weekDay]
                    });
                }
            }

            return timetable;
        },
        /*
        *   returns working hours for current date
        */
        getCurDayHours: function() {
            return Array.isArray(this.get('hours')) ? this.get('hours')[0] : null; //{hours: true};
        },
        /**
         * Checking work shop at a specified time.
         */
        checking_work_shop: function(current_time, isDelivery) {
            this.workingDay.update({timetable: this.get_working_hours(current_time, 1), curTime : current_time});
            return this.workingDay.checking_work_shop(isDelivery);
        },
        round_date: function(date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        },
        /**
         * Get lists "Pickup Date and Pickup Time".
         * returns an array of valid days with pickup time grids
         * index_by_day_delta - is an object which recieves data mapping the delta in days (between cur date and target date) into an index of the array returned by getPickupList.
         * index_by_day_delta is needed beacause getPickupList does not returns invalid days within a App.Settings.online_order_date_range period (which timetable is not set (closed) or holidays).
         * Usage: var out_obj = {};
         *        var list = timetable.getPickupList(true, out_obj);
         *        list[out_obj[1]] - returns tommorow day (if store is not closed for tommorow, otherwise out_obj[1] is undefined)
         */
        getPickupList: function(isDelivery, index_by_day_delta) {
            var self = this, wh, check_day,
                now = this.base(), key_index = 0,
                day = now.getDay();
            var days = [];
            var date_range = App.Settings.online_order_date_range;
            for (var i = 0; i < date_range; i++) {
                check_day = new Date(now.getTime() + i * MILLISECONDS_A_DAY);
                wh = this.get_working_hours(check_day);
                if (wh != false) {
                    if (index_by_day_delta) {
                        index_by_day_delta[i] = key_index++;
                    }
                    days.push({day: weekDays[(day + i) % 7], index: i});
                }
            }

            return days.map(function(ob_day) {
                var date = new Date(now.getTime() + ob_day.index * MILLISECONDS_A_DAY),
                    weekDay = (ob_day.index >= 2) ? ob_day.day : ob_day.index ? _loc['DAYS']['TOMORROW'] : _loc['DAYS']['TODAY'],
                    month = _loc.ARRAY_MONTH[date.getMonth()],
                    _date = date.getDate();
                switch (_date.toString().match(/1?\d$/)[0]) {
                    case "1":
                        _date += _loc['TIME_PREFIXES']['FIRST_DAY_OF_MONTH'];
                        break;
                    case "2":
                        _date += _loc['TIME_PREFIXES']['SECOND_DAY_OF_MONTH'];
                        break;
                    case "3":
                        _date += _loc['TIME_PREFIXES']['THIRD_DAY_OF_MONTH'];
                        break;
                    default:
                        _date += _loc['TIME_PREFIXES']['OTHER_DAY_OF_MONTH'];
                        break;
                }
                if (~weekDays.indexOf(weekDay)) {
                    weekDay = _loc['DAYS_OF_WEEK'][weekDay];
                }

                this.workingDay.update({timetable: self.get_working_hours(date, 1), curTime : self.base()});
                var working_day = this.workingDay.pickupTimeOptions({
                    today: (weekDay === _loc['DAYS']['TODAY']),
                    isDelivery: isDelivery
                }); // set flag "Today" for creating the list of time intervals
                return {
                    weekDay: weekDay + (ob_day.index >=2 ? ', ' + month + ' ' + _date : ''),
                    date: self.round_date(date),
                    workingDay: working_day,
                    delta: ob_day.index
                };
            }, self);
        },
        getLastPTforWorkPeriod: function(curtime) {
            var wd = new App.Models.WorkingDay( {timetable: this.get_working_hours(curtime, 1),
                                                 curTime : curtime});

            return wd.getLastPTforPeriod(curtime);
        },
        check_order_enable: function(isDelivery) {
            var currentTime = this.base(),

                working = this.checking_work_shop(currentTime, isDelivery),
                accept = App.Data.settings.get('settings_system').accept_online_orders_when_store_is_closed;

             if (!working && !accept) {
                return false;
            } else {
                return true;
            }
        },
        openNow: function() {
            if(this.isHoliday()) {
                return false;
            }

            // for Directory there is no need to consider estimated_order_preparation_time, online_order_start_time_offset, online_order_end_time_offset.
            this.workingDay.preparation_time = 0;
            this.workingDay.start_time = 0;
            this.workingDay.end_time = 0;
            return this.checking_work_shop(this.base());
        }
    });
});
