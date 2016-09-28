class Common {
  static t(key) {
    return Common.prefs.getMsg(key) || `(Unknown key: ${key})`;
  }

  static strftimeFormatToMomentFormat(format) {
    if (!format) {
      return;
    }

    var replacements = {
      Y: 'YYYY',
      y: 'YY',
      m: 'MM',
      '-m': 'M',
      '_m': 'M', // Supposed to be blank-padded
      B: 'MMMM',
      b: 'MMM',
      h: 'MMM',
      d: 'DD',
      '-d': 'D',
      'e': 'D', // Supposed to be blank-padded
      j: 'DDDD',
      H: 'HH',
      k: 'H', // Supposed to be blank-padded
      I: 'hh',
      l: 'h', // Supposed to be blank-padded
      P: 'a',
      p: 'A',
      M: 'mm',
      S: 'ss',
      L: 'SSS',
      N: 'SSSSSSSSS',
      '3N': 'SSS',
      '6N': 'SSSSSS',
      '9N': 'SSSSSSSSS',
      z: 'ZZ',
      ':z': 'Z',
      Z: 'z',
      A: 'dddd',
      a: 'ddd',
      u: 'E',
      w: 'd',
      '%': '%'
    };

    return format.replace(/%([%:-]?[A-Za-z0-9]+)|([^ %]+)/g, function(match, spec, literal) {
      if (spec) {
        return replacements[spec] || ('%' + spec);
      } else {
        return '[' + literal + ']';
      }
    });
  }

  static getMomentLocaleData() {
    var intl = gadgets.sapjam._internal.assets.intl;

    function relativeTimeHandler(number, withoutSuffix, key, isFuture) {
      var bundle = withoutSuffix ? intl.timeStrings : isFuture ? intl.timeStrings.from_now : intl.timeStrings.ago;
      
      var strings = {
        s: bundle.less_than_a_minute,
        m: bundle.a_minute,
        mm: bundle.x_minutes,
        h: bundle['1_hour'],
        hh: bundle.x_hours,
        d: bundle['1_day'],
        dd: bundle.x_days,
        M: bundle['1_month'],
        MM: bundle.x_months,
        y: bundle['1_year'],
        yy: bundle.about_x_years
      };

      var string = strings[key];
      if (string) {
        return string.replace(/%{n}/, number);
      } else {
        return null;
      }
    }

    return {
      months: [
        intl.monthNames.january,
        intl.monthNames.february,
        intl.monthNames.march,
        intl.monthNames.april,
        intl.monthNames.may,
        intl.monthNames.june,
        intl.monthNames.july,
        intl.monthNames.august,
        intl.monthNames.september,
        intl.monthNames.october,
        intl.monthNames.november,
        intl.monthNames.december
      ],
      monthsShort: [
        intl.monthShortNames.jan,
        intl.monthShortNames.feb,
        intl.monthShortNames.mar,
        intl.monthShortNames.apr,
        intl.monthShortNames.may,
        intl.monthShortNames.jun,
        intl.monthShortNames.jul,
        intl.monthShortNames.aug,
        intl.monthShortNames.sep,
        intl.monthShortNames.oct,
        intl.monthShortNames.nov,
        intl.monthShortNames.dec
      ],
      weekdays: intl.dateStrings.day_names,
      weekdaysShort: intl.dateStrings.abbr_day_names,
      weekdaysMin: [
        intl.weekdayShortNames.sunday,
        intl.weekdayShortNames.monday,
        intl.weekdayShortNames.tuesday,
        intl.weekdayShortNames.wednesday,
        intl.weekdayShortNames.thursday,
        intl.weekdayShortNames.friday,
        intl.weekdayShortNames.saturday
      ],
      longDateFormat: {
        LT: Common.strftimeFormatToMomentFormat(intl.timeStrings.formats.short_time_of_day),
        L: Common.strftimeFormatToMomentFormat(intl.dateStrings.formats.default),
        LL: Common.strftimeFormatToMomentFormat(intl.dateStrings.formats.long),
        LLL: Common.strftimeFormatToMomentFormat(intl.dateStrings.formats.date_with_time),
        LLLL: Common.strftimeFormatToMomentFormat(intl.timeStrings.formats.long)
      },
      relativeTime: {
        future: '%s', // deferring to the function
        past: '%s', // deferring to the function
        s: relativeTimeHandler,
        m: relativeTimeHandler,
        mm: relativeTimeHandler,
        h: relativeTimeHandler,
        hh: relativeTimeHandler,
        d: relativeTimeHandler,
        dd: relativeTimeHandler,
        M: relativeTimeHandler,
        MM: relativeTimeHandler,
        y: relativeTimeHandler,
        yy: relativeTimeHandler
      },
      meridiem: function(hour, minute, isLower) {
        var beforeNoon = hour < 12;
        if (isLower) {
          return beforeNoon ? intl.timeStrings.am_identifier : intl.timeStrings.pm_identifier;
        } else {
          return beforeNoon ? intl.timeStrings.am : intl.timeStrings.pm;
        }
      },
      week: {
        dow: intl.startOfWeek
      }
    };
  }

  static initializeMoment(moment) {
    moment.locale(Common.getLocale() + '-sapjam', Common.getMomentLocaleData());
    
    // Make the time thresholds exact
    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('m', 60);
    moment.relativeTimeThreshold('h', 24);
    moment.relativeTimeThreshold('d', 30);
    moment.relativeTimeThreshold('M', 12);
  }

  static getLocale() {
    const lang = Common.prefs.getLang();
    const country = Common.prefs.getCountry();
    return (country !== '') ? `${lang}-${country}` : lang;
  }

  static defaultAvatar() {
    return gadgets.sapjam._internal.assets.defaultAvatarUrl;
  }

  static getMonthInYearMomentFormat() {
    return Common.strftimeFormatToMomentFormat(gadgets.sapjam._internal.assets.intl.timeStrings.formats.month_in_year);
  }

  static format(template, args) {
    return template.replace(/%{([^}]+)}/g, function(match, key) {
      return args[key] || `(Unknown arg: ${key})`;
    });
  }

  static onEvent(element, eventName, callback) {
    if (element.addEventListener) {
      element.addEventListener(eventName, callback);
      
    } else if (element.attachEvent) {
      element.attachEvent('on' + eventName, e => callback(e || window.event));

    } else {
      const before = element[eventName];
      element['on' + eventName] = function(e) {
        if (before) {
          before(e);
        }
        callback(e || window.event);
      };
    }
  }

  static draggableSupported() {
    return 'draggable' in document.createElement('span');
  }
}
Common.prefs = new gadgets.Prefs();

