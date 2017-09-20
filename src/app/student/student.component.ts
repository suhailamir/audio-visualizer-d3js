import {
  Component,
  OnInit, AfterContentInit, ElementRef, SecurityContext
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import './rtcMultiConnection.js';
import './mediaElements.js';
import * as io from 'socket.io-client';
import * as _ from 'underscore';
@Component({
  selector: 'student',
  styleUrls: ['./student.style.css'],
  templateUrl: './student.template.html',
})
export class StudentComponent implements OnInit {

  public localState: any;
  public io = io;
  public students = [];
  public localVideo = '';
  public teacherId: String;
  public teacherVideo: String;
  // public mediaElement = this.mediaElement;

  public connection = new RTCMultiConnection('', '', io);
  // public getMedia = new getMediaElement();

  constructor(
    public route: ActivatedRoute,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer

  ) {
    // this.connection.socketURL = 'https://quiet-bayou-32555.herokuapp.com/';
    // let socket = io('https://quiet-bayou-32555.herokuapp.com/');
    this.connection.socketURL = 'https://webrtcsocketserver.herokuapp.com/';
    let socket = io('https://webrtcsocketserver.herokuapp.com/');
    // this.connection.socketURL = 'http://localhost:9001/';
    // let socket = io('http://localhost:9001/');

    socket.on('connect', function () {
      console.log('socket connected');

    });
    // this.connection.io = 'https://rtcmulticonnection.herokuapp.com:443/';

    this.connection.socketMessageEvent = 'audio-video-file-chat-demo';
    this.connection.enableLogs = false;
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
        if (event.userid === this.teacherId) {

          this.teacherVideo = this.sanitize(event.blobURL);

        } else {
          this.students.push({ userid: event.userid, src: this.sanitize(event.blobURL) });
        }

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
      console.log('stream ended');
      let mediaElement = document.getElementById(event.streamid);
      if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
      }
    }.bind(this);
    // this.connection.onmessage = appendDIV;
    this.connection.filesContainer = document.getElementById('file-container');
    this.connection.onopen = function () {
      // document.getElementById('share-file').disabled = false;
      // document.getElementById('input-text-chat').disabled = false;
      // document.getElementById('btn-leave-room').disabled = false;
      // document.querySelector('h1').innerHTML = 'You are connected with: ' + this.connection.getAllParticipants().join(', ');
    }.bind(this);
    this.connection.onclose = function (event) {
      console.log('connection closed');
      if (event.userid === this.teacherId) {
        this.students = [];
        this.localVideo = null;
      } else {
        this.students = this.students.filter((o) => { return o.userid !== event.userid; });
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
      this.connection.attachStreams.forEach(function (stream) {
        stream.stop();
      });
      // don't display alert for moderator
      if (this.connection.userid === event.userid) return;
      console.log('entire session closed');
      // document.querySelector('h1').innerHTML = 'Entire session has been closed by the moderator: ' + event.userid;
    }.bind(this);
    this.connection.onUserIdAlreadyTaken = function (useridAlreadyTaken, yourNewUserId) {
      // seems room is already opened
      this.connection.join(useridAlreadyTaken);
    }.bind(this);

  }

  public ngOnInit() {
    this.route
      .data
      .subscribe((data: any) => {
        // your resolved data from route
        this.localState = data.yourData;
      });

    // static data that is bundled
    // var mockData = require('assets/mock-data/mock-data.json');
    // console.log('mockData', mockData);
    // if you're working with mock data you can also use http.get('assets/mock-data/mock-data.json')
    this.asyncDataWithWebpack();
  }
  public openRoom() {
    this.disableInputButtons();

    this.connection.open('11111', function () {
      // this.showRoomURL('11111');
    });
  };
  public joinClass(newClassID: string) {
    this.disableInputButtons();
    if (newClassID) {
      this.teacherId = newClassID;
      this.connection.join(newClassID, function (event) {
        console.log('join callback :', event);
        // if (!event) {
        //   console.log('join callback :', event);
        // }
      });
    }
  };
  public leaveClass() {

    this.connection.leave();

  }

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
  private sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  private asyncDataWithWebpack() {
    // you can also async load mock data with 'es6-promise-loader'
    // you would do this if you don't want the mock-data bundled
    // remember that 'es6-promise-loader' is a promise
    setTimeout(() => {

      System.import('../../assets/mock-data/mock-data.json')
        .then((json) => {

          this.localState = json;
        });

    });
  }

}
