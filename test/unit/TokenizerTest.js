/*
 * @(#)TokenizerTest.js  1.0  2016-10-29
 *
 * Copyright (c) 2011-2016 Werner Randelshofer, Switzerland.
 * You may not use, copy or modify this file, except in compliance with the
 * accompanying license terms.
 */
"use strict";


var TokenizerTest = TestCase("TokenizerTest");
TokenizerTest.prototype.testRequire=()=>{
  console.log('testRequire');
  const Tokenizer=require("Tokenizer");

  assertNotNull(Tokenizer);
};
TokenizerTest.prototype.testUnconfiguredTokenizer=()=>{
  console.log('testUnconfiguredTokenizer');
  
  const Tokenizer=require("Tokenizer");
  const TT_WORD=Tokenizer.TT_WORD;
  
  const data = [
  [  "a", [TT_WORD,"a"] ],
  [  "hello", [TT_WORD,"hello"] ],
  [  "hello world", [TT_WORD,"hello world"] ],
  [  "hello world ", [TT_WORD,"hello world "] ],
  [  " hello world", [TT_WORD," hello world"] ]
  ];
 
  for (let i in data) {
    let input=data[i][0];
    let expected=data[i][1];
  
  
    let tt = new Tokenizer.Tokenizer();
    tt.setInput(input);
    let actual=[];
    while (tt.next()!=Tokenizer.TT_EOF) {
      actual.push(tt.getTType());
      actual.push(tt.getTString());
    }
    console.log('  input:"'+input+'" expected:"'+expected+'" actual:"'+actual+'"');
  assertEquals(expected,actual);
  }
};
TokenizerTest.prototype.testSkipWhitespace=()=>{
  console.log('testSkipWhitespace');
  
  const Tokenizer=require("Tokenizer");
  const TT_WORD=Tokenizer.TT_WORD;
  
  const data = [
  [  "hello", [TT_WORD,"hello"] ],
  [  "a b", [TT_WORD,"a",TT_WORD,"b"] ],
  [  "hello world", [TT_WORD,"hello",TT_WORD,"world"] ],
  [  "hello  world", [TT_WORD,"hello",TT_WORD,"world"] ],
  [  "hello world ", [TT_WORD,"hello",TT_WORD,"world"] ],
  [  "hello world  ", [TT_WORD,"hello",TT_WORD,"world"] ],
  [  " hello world", [TT_WORD,"hello",TT_WORD,"world"] ],
  [  "  hello world", [TT_WORD,"hello",TT_WORD,"world"] ]
  ];
 
  for (let i in data) {
    let input=data[i][0];
    let expected=data[i][1];
  
  
    let tt = new Tokenizer.Tokenizer();
    tt.skipWhitespaceTokens();
    tt.setInput(input);
    let actual=[];
    while (tt.next()!=Tokenizer.TT_EOF) {
      actual.push(tt.getTType());
      actual.push(tt.getTString());
    }
    console.log('  input:"'+input+'" expected:"'+expected+'" actual:"'+actual+'"');
  assertEquals(expected,actual);
  }
};
  
TokenizerTest.prototype.testKeyword=()=>{
  console.log('testKeyword');
  
  const Tokenizer=require("Tokenizer");
  const TT_WORD=Tokenizer.TT_WORD;
  const TT_KEYWORD=Tokenizer.TT_KEYWORD;
  
  const data = [
  [  "hello", [TT_WORD,"hello"] ],
  [  "world", [TT_KEYWORD,"world"] ],
  [  "hello world", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  "hello  world", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  "hello world ", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  "hello world  ", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  " hello world", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  "  hello world", [TT_WORD,"hello",TT_KEYWORD,"world"] ],
  [  "the world is not enough", [TT_WORD,"the",TT_KEYWORD,"world",TT_WORD,"is",TT_WORD,"not",TT_WORD,"enough"] ],
  [  "the worldis not enough", [TT_WORD,"the",TT_KEYWORD,"world",TT_WORD,"is",TT_WORD,"not",TT_WORD,"enough"] ],
  [  "theworldis not enough", [TT_WORD,"theworldis",TT_WORD,"not",TT_WORD,"enough"] ],
  ];
 
  for (let i in data) {
    let input=data[i][0];
    let expected=data[i][1];
  
  
    let tt = new Tokenizer.Tokenizer();
    tt.skipWhitespaceTokens();
    tt.addKeyword("world");
    tt.setInput(input);
    
    
    let actual=[];
    while (tt.next()!=Tokenizer.TT_EOF) {
      actual.push(tt.getTType());
      actual.push(tt.getTString());
    }
    console.log('  input:"'+input+'" expected:"'+expected+'" actual:"'+actual+'"');
  assertEquals(expected,actual);
  }
};

TokenizerTest.prototype.testDigits=()=>{
  console.log('testKeyword');
  
  const Tokenizer=require("Tokenizer");
  const TT_WORD=Tokenizer.TT_WORD;
  const TT_KEYWORD=Tokenizer.TT_KEYWORD;
  const TT_NUMBER=Tokenizer.TT_NUMBER;
  
  const data = [
  [  "hello", [TT_WORD,null] ],
  [  "0", [TT_NUMBER,0] ],
  ];
 
  for (let i in data) {
    let input=data[i][0];
    let expected=data[i][1];
  
  
    let tt = new Tokenizer.Tokenizer();
    tt.addDigits();
    tt.setInput(input);
    
    
    let actual=[];
    while (tt.next()!=Tokenizer.TT_EOF) {
      actual.push(tt.getTType());
      actual.push(tt.getTNumber());
    }
    console.log('  input:"'+input+'" expected:"'+expected+'" actual:"'+actual+'"');
  assertEquals(expected,actual);
  }
};

