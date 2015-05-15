/*jsl:option explicit*/
/*global YAHOO */
// non-locale-specific utility functions that used to be in core.js.
// Broken out here for javascript unit testing.
// 
// These are pure javascript and shouldn't depend on ERB/rails/ruby.

// KylePatrick 2013: I don't like reopening the namespace, as it can causes 
// conflicts for no great gain. Instead we should consider another 
// namespace or a sub-namespace.

YAHOO.namespace("cubetree.util");
YAHOO.namespace("cubetree.util.translations");
(function() {
     var Util = YAHOO.cubetree.util;
     var Dom = YAHOO.util.Dom;

YAHOO.cubetree.util.encode_hash = function(hash) {
    var parts = [];
    for (var name in hash) {
        var part = encodeURIComponent(name)+'='+encodeURIComponent(hash[name]);
        parts.push(part);
    }
    return parts.join("&");
};

/* approximate clones of Rails's I18n.interpolate and pluralize.
     TODO:  escaping, handle errors, match semantics precisely */
  /* also called from client_side_interpolate / csi in lib/locale_helper.rb */
YAHOO.cubetree.util.i18ninterpolate = function( template, values ) {
    var MATCH = /(\\\\)?%\{([^\}]+)\}/g;
    template = YAHOO.cubetree.util.i18npluralize( template, values.count );
    return template.replace( MATCH, function(str,p1esc,p2key,offset,s) {
        return values[p2key];
    });
};
YAHOO.cubetree.util.i18npluralize = function( entry, count ) {
    if( typeof(entry)=='string' ) return entry;
    var key = entry.zero && count==0 ? 'zero' : count==1 ? 'one' : 'other';
    return entry[key];
};

// don't support array scopes yet, just dots
Util.i18nlookup = function(locale, key) {
    var parts = key.split(/\./);
    var root = Util.translations[locale];
    while (root && parts.length > 0) {
        root = root[parts.shift()];
    }
    return root;
};
Util.translate = function(key, values) {
    values = values || {};
    if (values['enable_company_term'] && Cubetree.use_company_term) {
      key += "_" + Cubetree.use_company_term;
    }
    var template = Util.i18nlookup(Cubetree.current_locale, key);
    if (!template) {
        template = Util.i18nlookup('en', key);
    }
    if (!template) {
        return key;
    }
    if (Cubetree.custom_company_terms) {
      values = Object.extend(values, Cubetree.custom_company_terms);
    }
    var result = Util.i18ninterpolate(template, values);
    if(jamApp.betas.pseudo_rtl) {
      result = "\u202e" + result + "\u202c";
    }
    return result;
};
Util.t = Util.translate;

Util.first_last = function(list_id) {
    var list_items = Dom.get(list_id).getElementsByTagName('li');
    if (list_items.length < 1)
        return;
    Dom.batch(list_items, function(li) {
        Dom.removeClass(li, 'first');
        Dom.removeClass(li, 'last');
    });
    Dom.addClass(list_items[0], 'first');
    Dom.addClass(list_items[list_items.length-1], 'last');
};

var outstanding_requests = {};
Util.start_request = function(name) {
    if (outstanding_requests[name]) {
        return false;
    }
    outstanding_requests[name] = true;
    return true;
};
Util.finish_request = function(name) {
    outstanding_requests[name] = null;
};

function build_footer_button(type, options) {
    if (!options) {
        options = {};
    }
    if (!options.text) {
        options.text = Util.translate('infrastructure.cancel');
    }
    if (!options.onclick) {
        options.onclick = "YAHOO.cubetree.widgets.alertDisplay.hide();";
    }
    var button = '<span';
    if (options.id) {
        button += ' id="'+options.id+'"';
    }
    button += ' class="btn btn-'+type+'"';
    button += ' onclick="'+options.onclick+'"';
    button += '>';
    button += options.text;
    button += '</span>';
    return button;
}

Util.footer_buttons = function(options) {
    var html = '<div id="ft_buttons">';
    if( options.main ) {
       html += build_footer_button('primary', options.main);
       html += '&nbsp;&nbsp;';
    } 
    html += build_footer_button('cancel', options.cancel);
    html += '</div>';
    return html;
}

//modified from http://brightbyte.de/page/Loading_script_tags_via_AJAX
Util.runScripts = function(e) {
  if (e.nodeType != 1) return; //if it's not an element node, return

  if (e.tagName.toLowerCase() == 'script') {
    var s = document.createElement('script');
    s.text= e.text;
    document.body.appendChild(s);
  }
  else {
    var n = e.firstChild;
    while (n) {
      if (n.nodeType == 1) Util.runScripts(n); //if it's an element node, recurse
      n = n.nextSibling;
    }
  }
}
 
/**
 Call function 'fn' on each element of array 'arr' and return an array
 of elements for which 'fn' was true.

 On modern browsers you can just use Array.filter but we have to
 support IE.

 */
Util.grep = function (arr, fn) {
    var result = [];
    for (var i=0; i<arr.length; i++) {
        if (fn(arr[i])) {
            result.push(arr[i]);
        }
    }
    return result;
};

  /**
   * for those few times when it's easier to stripe on the client
   * @param id
   * @param className
   */
Util.stripe = function(id, className) {
  var i;
  var children = Dom.getChildren(id);
  for (i = 0; i < children.length; i++) {
    if (i % 2 == 1) {
      Dom.addClass(children[i], className);
    }
  }
};

/**
 * Generates a pseudo-random identifier
 */
Util.generateId = function() {
  var chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"];
  var rand = Math.random;
  var id = [];
  var i;
  for (i = 0; i < 12; i++) {
      id[i] = chars[Math.floor(rand()*62)];
  }
  id[i] = new Date().getTime().toString(16);
  return id.join('');
}

Util.encode64 = function(input, safe) {
    // references
    // http://www.webtoolkit.info/javascript-base64.html
    // http://en.wikipedia.org/wiki/Base64
    // RFC 4648
    
    var outputChars;
    if (safe) {
      outputChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
    } else {
      // note this has one less character than preceding
      outputChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    }
    
    var output = "";
    var inChar1, inChar2, inChar3, outChar1, outChar2, outChar3, outChar4;
    var i = 0;
   
    while (i < input.length) {

        inChar1 = input.charCodeAt(i++);
        inChar2 = input.charCodeAt(i++);
        inChar3 = input.charCodeAt(i++);

        outChar1 = inChar1 >> 2;
        outChar2 = ((inChar1 & 3) << 4) | (inChar2 >> 4);
        outChar3 = ((inChar2 & 15) << 2) | (inChar3 >> 6);
        outChar4 = inChar3 & 63;
        
        if (isNaN(inChar2)) {
            if (safe) {
              outChar3 = outChar4 = null;
            } else {
              outChar3 = outChar4 = 64;
            }
        } else if (isNaN(inChar3)) {
            if (safe) {
              outChar4 = null;
            } else {
              outChar4 = 64;
            }
        }

        output += (outputChars.charAt(outChar1) + outputChars.charAt(outChar2));
        if (outChar3 !== null) {
            output += outputChars.charAt(outChar3)
        }
        if (outChar4 !== null) {
            output += outputChars.charAt(outChar4)
        }
    }

    return output;
}
Util.locale_for_tinymce = function(locale) {
    var allowed_locales = {
      "bg-BG" : "bg",
      "cs-CZ" : "cs",
      "da" : null,
      "de" : null,
      "de-CH" : "de",
      "es" : null,
      "es-MX" : "es",
      "fr-CA" : "fr",
      "fr" : null,
      "fi-FI" : "fi",
      "hu" : null,
      "id" : null,
      "it" : null,
      "ja" : null,
      "ko" : null,
      "nb-NO" : "nb",
      "nl" : null,
      "pl" : null,
      "pt-BR" : "pt",
      "pt-BT" : "pt",
      "ro" : null,
      "ru" : null,
      "sk-SK" : "sk",
      "sl-SI" : "sl",
      "sv-SE" : "sv",
      "tr-TR" : "tr",
      "zh-CN" : "cn",
      "zh-TW" : "zh-tw"
    };

    var tinymce_locale = "en";
    if (locale in allowed_locales) {
      tinymce_locale = allowed_locales[locale];
      if (!tinymce_locale) {
        tinymce_locale = locale;
      }
    }
    return tinymce_locale;
};

Util.tinymce_fonts = function() {
  // tiny_mce default font list
  var fonts = "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats".split(";");

  // CJK fonts selected with localized names
  var localized_fonts = {
    "zh-CN": {
      "NSimSun": ["宋体", "SimSun", "Songti SC"],
      "SimHei": ["黑体", "Heiti SC"],
      "KaiTi": ["楷体", "Kaiti SC"]
    },
    "zh-TW": {
      "MingLiU": ["細明體", "Songti TC"],
      "PMingLiU": ["新細明體", "Songti TC"],
      "Microsoft JhengHei": ["正黑體", "Heiti TC"],
      "DFKai-SB": ["標楷體", "KaiTi", "Kaiti TC"]
    },
    "ja": {
      "Meiryo": ["メイリオ", "Hiragino Maru Gothic ProN", "Hiragino Kaku Gothic ProN"],
      "MS Gothic": ["ＭＳ ゴッシク", "IPAMonaGothic", "Hiragino Maru Gothic ProN"],
      "MS PGothic": ["ＭＳ Ｐゴッシク", "IPAMonaPGothic", "Mona", "Hiragino Maru Gothic ProN"],
      "MS Mincho": ["ＭＳ 明朝", "IPAMonaMincho", "Hiragino Mincho ProN"],
      "MS PMincho": ["ＭＳ Ｐ明朝", "IPAMonaPMincho", "Hiragino Mincho ProN"]
    },
    "ko": {
      "Gulim": ["굴림", "AppleGothic"],
      "Batang": ["바탕", "AppleMyungjo"],
      "Gungsuh": ["궁서", "GungSeo"]
    }
  };

  var top_fonts = [];

  $.each(localized_fonts, function(locale, list){

    $.each(list, function(name, subs) {
      var localized_name = subs.shift();
      var candidates = [name].concat(subs);
      // Only display localized names for the right locale
      var display_name = Cubetree.current_locale === locale ? localized_name : name
      var entry = display_name + "=" + candidates.join(",");
      // Put fonts for current locale on top
      if(Cubetree.current_locale === locale) {
        top_fonts.push(entry);
      } else {
        fonts.push(entry);
      }
  })});

  return top_fonts.concat(fonts.sort()).join(";");
}
})();
