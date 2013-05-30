module.exports = (jsmm) ->

  jsmm.test = {}
  
  class jsmm.test.Console

    constructor: ->
      @result = ''

    log: (str) ->
      @result += str + '\n'

    getAugmentedObject: ->
      that = this
      type: 'object'
      string: '[console object]'
      properties:
        log:
          name: 'log'
          type: 'function'
          string: '[console log function]'
          func: (context, name, args) ->
            that.log args[0]


  jsmm.test.runAll = ->
    jsmm.test.output = ''
    failed = 0

    for name, test of jsmm.test.tests.succeed
      unless jsmm.test.runTest(name.replace(/_/g, ' '), test, true, true)
        failed++
    for name, test of jsmm.test.tests.fail_threeway
      unless jsmm.test.runTest(name.replace(/_/g, ' '), test, true, false)
        failed++
    for name, test of jsmm.test.tests.fail_twoway
      unless jsmm.test.runTest(name.replace(/_/g, ' '), test, false, false)
        failed++

    if failed <= 0
      jsmm.test.output += 'All tests completed successfully!'
    else if failed == 1
      jsmm.test.output += 'Unfortunately 1 test failed...'
    else
      jsmm.test.output += 'Unfortunately ' + failed + ' tests failed...'
    failed <= 0

  jsmm.test.printError1 = (name, name1, error1, code) ->
    jsmm.test.output += 'In test QQQ' + name + 'QQQ ' + name1 + ' was incorrect.\n'
    jsmm.test.output += name1 + ':\n' + JSON.stringify(error1) + '\n'
    jsmm.test.output += 'code:\n' + code + '\n'

  jsmm.test.printError2 = (name, name1, name2, error1, error2, code) ->
    jsmm.test.output += 'In test QQQ' + name + 'QQQ ' + name1 + ' and ' + name2 + ' were incorrect.\n'
    jsmm.test.output += name1 + ':\n' + JSON.stringify(error1) + '\n'
    jsmm.test.output += name2 + ':\n' + JSON.stringify(error2) + '\n'
    jsmm.test.output += 'code:\n' + code + '\n'

  jsmm.test.runTest = (name, code, threeway, succeed) ->
    consoleRaw = new jsmm.test.Console()
    consoleSafe = new jsmm.test.Console()
    
    errorRaw = null
    errorSafe = null
    
    runner = new jsmm.OldSimpleRunner(code)
    if threeway
      runner.setScope console: consoleRaw
      errorRaw = runner.getError()  unless runner.runRaw()

    runner.setScope console: consoleSafe.getAugmentedObject()
    errorSafe = runner.getError()  unless runner.runSafe()
    
    # when it should threeway we can compare against the raw result
    if threeway && !jsmm.test.compareErrors(errorRaw, errorSafe, succeed)
      jsmm.test.printError2 name, 'errorRaw', 'errorSafe', errorRaw, errorSafe, code
      return false
    
    if threeway && consoleRaw.result != consoleSafe.result
      jsmm.test.printError2 name, 'consoleRaw', 'consoleSafe', consoleRaw.result, consoleSafe.result, code
      return false
    
    if threeway && succeed != (errorRaw == null)
      jsmm.test.printError1 name, 'errorRaw', errorRaw, code
      return false
    if succeed != (errorSafe == null)
      jsmm.test.printError1 name, 'errorSafe', errorSafe, code
      return false
    
    # no need to check errorStep for null, since otherwise it would have been caught when comparing errors
    jsmm.test.output += 'Test QQQ' + name + 'QQQ completed successfully!\n'
    true

  jsmm.test.compareErrors = (error1, error2) ->
    if error1 == null && error2 == null
      true
    else if error1 == null || error2 == null
      false
    else
      error1.getHTML() == error2.getHTML()

  jsmm.test.tests =
    succeed: {}
    fail_threeway: {}
    fail_twoway: {}

  jsmm.test.tests.succeed.comments = """
    // one line comment
    var a;
    /* bla */var a; // bla *// ***//// / * */
    /* bla */var a; /* bla * // ***//// / *
    /*start of line comment*/var a;/* multiline
    comment with * and / and /* and /***...
    var a;
    and also // and ///*** and more! */
    var a;
    console.log(QQQHello world!QQQ);
  """

  jsmm.test.tests.succeed.assignments = """
    // variable assignments
    var a;
    a = 0;
    console.log(a);
    var a = 5;
    console.log(a);
    var b = a*a+a/a-a%a+(a*a*a-a);
    console.log(b);
    var c=b, d=c, e=d;
    console.log(e);
    c = b==c && c==d && d==b;
    console.log(c);
    d = c || b > d;
    console.log(d);
    e = (1>2 && 1>=2 && 2<1 && 2<=1) || 2 != 1;
    console.log(e);
    var f = -5 > +3 || !false;
    console.log(f);
    f = !(f || false) || false;
    console.log(f);
    a = 1.4E-02;
    console.log(a);
    a += a;
    console.log(a);
    a *= a;
    console.log(a);
    a -= a/10;
    console.log(a);
    a /= 0.003;
    console.log(a);
    a %= 10;
    console.log(a);
    a++;
    console.log(a);
    a--;
    console.log(a);
    a = 5+3*5+1+9*10/5%2+18/23-52/16%82-53*32;
    console.log(a);
    var str=QQQQQQ;
    console.log(str);
    str += QQQhiQQQ;
    console.log(str);
    str += 10;
    console.log(str);
    str = 5+5+str;
    console.log(str);
    //var len = str.length;
    //console.log(len);
  """

  jsmm.test.tests.succeed.control = """
    // control structures
    var f=true, e=!f;
    if (true) {
      console.log(true);
      if (f && e && false) {
        console.log(false);
      } else {
        if (false) {
          console.log(false);
        } else if (true) {
          if(true) {
            console.log(QQQaQQQ);
          }
          if(false) {
            console.log(QQQbQQQ);
          }
          console.log(true);
        }
      }
    }

    var i=0;
    while (i<10) {
      console.log(i*i-i);
      i++;
    }

    for (var j=0; j<10; j++) {
      console.log(j);
    }
  """

  jsmm.test.tests.succeed.functions_simple = """
    // functions simple
    function f1(n) {
      console.log(n*100);
    }
    function f2(n) {
      return n*100;
    }
    f1(10);
    console.log(f2(20));
  """

  jsmm.test.tests.succeed.functions_complex = """
    // functions complex
    var a, b=100, c=QQQtestQQQ, d=1000;
    function f1(a, b, c, q1, q2, q3) {
      console.log(a+d);
      console.log(f2(b*3)/3);
      console.log(f3(b, c));
      console.log((q1+q2)%q3);
    }
    function f2(n) {
      var c = n;
      return n+(3/c);
    }
    function f3(a,b) {
      console.log(a);
      console.log(b);
      for (var c=0; c>-100; c--) {
        a *= b;
      }
      return a+b;
    }
    var x=5, y=10, z=15;
    f1(x,y,z, 8, 9, 10, QQQtestQQQ, QQQblahQQQ, QQQmore blahQQQ);
  """

  jsmm.test.tests.fail_threeway.missing_semicolon_1 = 'var a'
  jsmm.test.tests.fail_threeway.missing_semicolon_2 = 'var a=5*5'
  jsmm.test.tests.fail_threeway.missing_semicolon_3 = 'var a;\n a=5*5'
  jsmm.test.tests.fail_threeway.missing_semicolon_4 = 'var a;\n if (a) {\n a=5*5 \n}'
  jsmm.test.tests.fail_threeway.missing_semicolon_5 = 'console.log(5)'
  jsmm.test.tests.fail_threeway.missing_semicolon_6 = 'var a;\n a+=a'
  jsmm.test.tests.fail_threeway.missing_semicolon_7 = 'for(var a=0 a<5; a++) {\n }'
  jsmm.test.tests.fail_threeway.missing_bracket_1 = 'if (true) \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_2 = 'if (true) {'
  jsmm.test.tests.fail_threeway.missing_bracket_3 = 'while (true) \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_4 = 'while (true) {'
  jsmm.test.tests.fail_threeway.missing_bracket_5 = 'for (var i=0; i<10; i++) \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_6 = 'for (var i=0; i<10; i++) {\n'
  jsmm.test.tests.fail_threeway.missing_bracket_7 = 'if (true) {\n } else \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_8 = 'if (true) {\n } else { \n'
  jsmm.test.tests.fail_threeway.missing_bracket_9 = 'if (true) {\n  else { \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_10 = 'if (true) \n } else { \n }'
  jsmm.test.tests.fail_threeway.missing_bracket_11 = 'if (5>(5+5) {\n }'
  jsmm.test.tests.fail_threeway.missing_bracket_12 = 'if 5>5) {\n }'
  jsmm.test.tests.fail_threeway.incorrect_string_1 = 'var str = QQQHello World!;'
  jsmm.test.tests.fail_threeway.incorrect_string_2 = 'var str = QQQHello World!'
  jsmm.test.tests.fail_threeway.incorrect_string_3 = 'var str = Hello World!QQQ;'
  jsmm.test.tests.fail_threeway.incorrect_string_4 = 'var str = QQQHello World!\nQQQ;'
  jsmm.test.tests.fail_threeway.incorrect_string_5 = 'var str = QQQHello \\World!\nQQQ;'
  jsmm.test.tests.fail_threeway.reserved_word_1 = 'var jsmmscope;'
  jsmm.test.tests.fail_threeway.reserved_word_2 = 'var jsmmscopeInner;'
  jsmm.test.tests.fail_threeway.reserved_word_3 = 'var jsmmscopeOuter;'
  jsmm.test.tests.fail_threeway.reserved_word_4 = 'var jsmm;'
  jsmm.test.tests.fail_threeway.reserved_word_5 = 'var jsmmparser;'
  jsmm.test.tests.fail_threeway.reserved_word_6 = 'var jsmmExecutionCounter;'
  jsmm.test.tests.fail_threeway.reserved_word_6 = 'var jsmmtemp;'
  jsmm.test.tests.fail_threeway.reserved_word_6 = 'var jsmmtree;'
  jsmm.test.tests.fail_threeway.reserved_word_7 = 'var NaN;'
  jsmm.test.tests.fail_threeway.reserved_word_8 = 'var this;'
  jsmm.test.tests.fail_threeway.reserved_word_9 = 'var arguments;'
  jsmm.test.tests.fail_twoway.unary_1 = 'console.log(+true);'
  jsmm.test.tests.fail_twoway.unary_2 = 'console.log(-false);'
  jsmm.test.tests.fail_twoway.unary_3 = 'console.log(+QQQstringQQQ);'
  jsmm.test.tests.fail_twoway.unary_4 = 'console.log(-QQQstringQQQ);'
  jsmm.test.tests.fail_twoway.unary_5 = 'console.log(!QQQstringQQQ);'
  jsmm.test.tests.fail_twoway.unary_6 = 'console.log(!5);'
  jsmm.test.tests.fail_twoway.invalid_function_call_1 = 'function f(a, b) {\n return a;\n }\n f(1);'
  jsmm.test.tests.fail_twoway.invalid_function_call_2 = 'function f(a, b) {\n return a+b;\n }\n f(1);'

#jsmm.test.tests.fail_twoway.repeated_declaration_1 = 'var a;\n var a;';
#jsmm.test.tests.fail_twoway.repeated_declaration_2 = 'var a = 1;\n var a;';
