import {Component, OnInit, AfterContentInit, ElementRef, SecurityContext} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Inject, Injectable} from '@angular/core';
// import {AudioContext} from 'angular-audio-context';
import './rtcMultiConnection.js';
import './mediaElements.js';
import './rtcScreenid.js';

import * as io from 'socket.io-client';
import * as _ from 'underscore';
import {UUID} from 'angular2-uuid';
import $ from 'jquery';

declare var jQuery : any;
@Component({selector: 'teacher', styleUrls: ['./teacher.style.css'], templateUrl: './teacher.template.html'})
export class TeacherComponent implements OnInit {

  public localState : any;
  public io = io;
  public students = [];
  public localVideo = '';
  public uuid = UUID.UUID();
  public classStarted : Boolean;
  public audioCtx = new AudioContext();
  // public Materialize = Materialize; public mediaElement = this.mediaElement;

  public connection = new RTCMultiConnection('', '', io);

  // public getMedia = new getMediaElement();

  constructor(public route : ActivatedRoute, private elementRef : ElementRef, private sanitizer : DomSanitizer) {
    // this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    // let socket = io('https://rtcmulticonnection.herokuapp.com:443/');
    this.connection.socketURL = 'https://webrtcsocketserver.herokuapp.com/';
    let socket = io('https://webrtcsocketserver.herokuapp.com/');

    // this.connection.socketURL = 'http://localhost:9001/'; let socket =
    // io('http://localhost:9001/');
    this.connection.enableLogs = false;
    socket.on('connect', function () {});
    // this.connection.io = 'https://rtcmulticonnection.herokuapp.com:443/';
    this.connection.getScreenConstraints = function (callback) {
      getScreenConstraints(function (error, screen_constraints) {
        if (!error) {
          screen_constraints = this
            .connection
            .modifyScreenConstraints(screen_constraints);
          callback(error, screen_constraints);
          return;
        }
        throw error;
      }.bind(this));
    }.bind(this);

    this.connection.socketMessageEvent = 'audio-video-file-chat-demo';
    this.connection.enableFileSharing = true; // by default, it is "false".
    this.connection.session = {
      audio: true,
      video: true,
      data: true
    };
    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    };
    this.connection.videosContainer = document.getElementById('videoscontainer');
    this.connection.onstream = function (event) {
      let width = 100;
      let mediaElement = event.mediaElement;
      let el = getMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        width,
        showOnMouseEnter: true
      });
      if (event.type === 'remote') {
        // event.blobURL = event.blobURL + event.streamid;
        let src = this.sanitize(event.blobURL);
        this
          .students
          .push({userid: event.userid, src});
        setTimeout(this.getFrequency(event), 5000);
        // setInterval(console.log(frequencyData), 500);
      } else if (event.type === 'local') {
        // event.blobURL = event.blobURL + event.streamid;

        this.localVideo = this.sanitize(event.blobURL);
      }
      // this.elementRef.nativeElement.appendChild(mediaElement);
      setTimeout(function () {
        // mediaElement.media.play();
      }, 5000);
      // this.mediaElement.id = event.streamid;
    }.bind(this);
    this.connection.onstreamended = function (event) {
      this.students = [];
      this.localVideo = null;
    }.bind(this);
    // this.connection.onmessage = appendDIV;
    this.connection.filesContainer = document.getElementById('file-container');
    this.connection.onopen = function () {
      // document.getElementById('share-file').disabled = false;
      // document.getElementById('input-text-chat').disabled = false;
      // document.getElementById('btn-leave-room').disabled = false;
      // document.querySelector('h1').innerHTML = 'You are connected with: ' +
      // this.connection.getAllParticipants().join(', ');
    }.bind(this);
    this.connection.onclose = function (event) {

      this.students = this
        .students
        .filter((o) => {
          return o.userid !== event.userid;
        });
      if (this.connection.getAllParticipants().length) {
        // document.querySelector('h1').innerHTML = 'You are still connected with: ' +
        // this.connection.getAllParticipants().join(', ');
      } else {
        // document.querySelector('h1').innerHTML = 'Seems session has been closed or
        // all participants left.';
      }
    }.bind(this);
    this.connection.onEntireSessionClosed = function (event) {
      // document.getElementById('share-file').disabled = true;
      // document.getElementById('input-text-chat').disabled = true;
      // document.getElementById('btn-leave-room').disabled = true;
      // document.getElementById('open-or-join-room').disabled = false;
      // document.getElementById('open-room').disabled = false;
      // document.getElementById('join-room').disabled = false;
      // document.getElementById('room-id').disabled = false;
      this
        .connection
        .attachStreams
        .forEach(function (stream) {
          stream.stop();
        });
      // don't display alert for moderator
      if (this.connection.userid === event.userid) 
        return;
      document
        .querySelector('h1')
        .innerHTML = 'Entire session has been closed by the moderator: ' + event.userid;
    }.bind(this);
    this.connection.onUserIdAlreadyTaken = function (useridAlreadyTaken, yourNewUserId) {
      // seems room is already opened
      this
        .connection
        .join(useridAlreadyTaken);
    }.bind(this);

  }

  public ngOnInit() {
    this
      .route
      .data
      .subscribe((data : any) => {
        // your resolved data from route
        this.localState = data.yourData;
      });
    let canvas = document.getElementById('myCanvas-qdw81w4k9zc');
    console.log('canvas :', canvas);
    console.log('canvas :', $('#video-qdw81w4k9zc'));
    $('.button-collapse').sideNav();

    // static data that is bundled var mockData =
    // require('assets/mock-data/mock-data.json'); console.log('mockData',
    // mockData); if you're working with mock data you can also use
    // http.get('assets/mock-data/mock-data.json')
    this.asyncDataWithWebpack();
  }
  public startClass() {
    this.disableInputButtons();

    this
      .connection
      .open(this.uuid, function () {
        this.classStarted = true;
      }.bind(this));
  };
  public joinRoom() {
    this.disableInputButtons();
    this
      .connection
      .join('11111');
  };

  // by default, socket.io server is assumed to be deployed on your own URL
  // comment-out below line if you do not have your own socket.io server

  public disableInputButtons() {
    // document.getElementById('open-or-join-room').disabled = true;
    // document.getElementById('open-room').disabled = true;
    // document.getElementById('join-room').disabled = true;
    // document.getElementById('room-id').disabled = true;
  }
  // ......................................................
  // ......................Handling Room-ID................
  // ......................................................
  public showRoomURL(roomid) {
    let roomHashURL = '#' + roomid;
    let roomQueryStringURL = '?roomid=' + roomid;
    let html = '<h2>Unique URL for your room:</h2><br>';
    html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';
    let roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;
    roomURLsDiv.style.display = 'block';
  }
  public endClass() {

    this
      .connection
      .closeEntireSession(() => {
        console.log('entire session closed :');
        this.classStarted = false;
        // document.querySelector('h1').innerHTML = 'Entire session has been closed.';
      });

  }
  public shareScreen() {
    this
      .connection
      .addStream({screen: true, oneway: true});
  };

  public getFrequency(event) {
    // let canvas = $('#myCanvas-qdw81w4k9zc'); let canvas =
    // document.getElementById('myCanvas-qdw81w4k9zc') console.log('canvas :',
    // canvas); console.log('canvas :', $('#video-qdw81w4k9zc')); let analyser =
    // this.audioCtx.createAnalyser(); let source =
    // this.audioCtx.createMediaStreamSource(event.stream);
    // source.connect(analyser); analyser.connect(this.audioCtx.destination);
    // analyser.fftSize = 32; let frequencyData = new
    // Uint8Array(analyser.frequencyBinCount);
    // analyser.getByteFrequencyData(frequencyData); // P10.style.height =
    // ((frequencyData[0] * 100) / 256) + "%"; // P20.style.height =
    // ((frequencyData[1] * 100) / 256) + "%"; // P30.style.height =
    // ((frequencyData[2] * 100) / 256) + "%"; // P40.style.height =
    // ((frequencyData[3] * 100) / 256) + "%"; // P50.style.height =
    // ((frequencyData[4] * 100) / 256) + "%"; // P60.style.height =
    // ((frequencyData[5] * 100) / 256) + "%"; // P70.style.height =
    // ((frequencyData[6] * 100) / 256) + "%"; // P80.style.height =
    // ((frequencyData[7] * 100) / 256) + "%"; // P90.style.height =
    // ((frequencyData[8] * 100) / 256) + "%"; function renderFrame() {
    // requestAnimationFrame(renderFrame);   // update data in frequencyData
    // analyser.getByteFrequencyData(frequencyData);   // render frame based on
    // values in frequencyData   console.log(frequencyData); } audio.start();
    // renderFrame();

  }

  private sanitize(url : string) {
    return this
      .sanitizer
      .bypassSecurityTrustResourceUrl(url);
  }
  private asyncDataWithWebpack() {
    // you can also async load mock data with 'es6-promise-loader' you would do this
    // if you don't want the mock-data bundled remember that 'es6-promise-loader' is
    // a promise
    setTimeout(() => {

      System
        .import ('../../assets/mock-data/mock-data.json')
        .then((json) => {

          this.localState = json;
        });

    });
  }

}
