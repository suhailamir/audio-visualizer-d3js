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
import {miserables} from './miserables'

declare var jQuery : any;
@Component({selector: 'audio-visualizer', template: `
  <div id='main'>

  <a class='waves-effect waves-light btn' id='open-room' (click)='startClass()' *ngIf='!classStarted || !localVideo;'>Start</a>


  <audio controls #localStream  autoplay  class='localAudio'> </audio>

  </div>
  <svg id='svg1' width='960' height='600'></svg>
  <svg id='svg2' width='960' height='600'></svg>
  
`})
export class AudioVisualizerComponent implements OnInit {

  public localState : any;
  public io = io;
  public students = [];
  public localVideo = '';
  public uuid = UUID.UUID();
  public classStarted : Boolean;
  public audioCtx = new AudioContext();
  public helpers : any;
  public darkTheme : any;
  public lightTheme : any;
  public svg : any;
  public color : any;
  public simulation : any;
  link;
  node;
  public miserables = miserables;

  // public Materialize = Materialize; public mediaElement = this.mediaElement;
  // Config

  public connection = new RTCMultiConnection('', '', io);
  ticked() {
    this
      .link
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });

    this
      .node
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });
  }

  render(graph) {
    this.link = this
      .svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke-width', function (d) {
        return Math.sqrt(d.value);
      });

    this.node = this
      .svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => {
        return this.color(d.group);
      })
      .call(d3.drag().on('start', (d) => {
        return this.dragstarted(d)
      }).on('drag', (d) => {
        return this.dragged(d)
      }).on('end', (d) => {
        return this.dragended(d)
      });

      this.node.append('title').text(function (d) {
        return d.id;
      });

      this.simulation.nodes(graph.nodes).on('tick', () => {
        return this.ticked()
      });

      this.simulation.force('link').links(graph.links);}

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d) {
    if (!d3.event.active) 
      this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  dragstarted(d) {
    if (!d3.event.active) 
      this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  // public getMedia = new getMediaElement();

  constructor(public route : ActivatedRoute, private elementRef : ElementRef, private sanitizer : DomSanitizer) {
    this.connection.enableLogs = false;
    // socket.on('connect', function () {});
    this.helpers = {
      secondsToHMS: function secondsToHMS(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return (h > 0
          ? h + ':' + (m < 10
            ? '0'
            : '')
          : '') + m + ':' + (s < 10
          ? '0'
          : '') + s;
      },
      randomProperty: function randomProperty(obj) {
        var keys = Object.keys(obj);
        return obj[keys[keys.length * Math.random() << 0]];
      },
      cycleThroughObject: function cycleThroughObject(obj, i) {
        var keys = Object.keys(obj);
        i < keys.length
          ? i++
          : i = 0;
        return i;
      },
      getAverageVolume: function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        average = values / length;
        return average;
      },
      hexToRgb: function hexToRgb(hex) {
        hex.replace('#', '');
        var bigint = parseInt(hex, 16);
        var r = bigint >> 16 & 255;
        var g = bigint >> 8 & 255;
        var b = bigint & 255;

        return r + ',' + g + ',' + b;
      }
    };
    this.darkTheme = {
      overlayBg: 'rgba(40,40,40,0.9)',
      textColor: '#eee',
      iconColor: '#fff',
      playButtonColor: '#000',
      brightTone: '#898787',
      lightTone: '#333333',
      midTone: '#222222',
      darkTone: '#111111',
      gradient: {
        primary: '#557c89',
        secondary: '#ace33b',
        tertiary: '#ffcf06'
      },
      visualizer: {
        rippleColor: '#557c89',
        barColor: '#fff'
      }
    };
    this.lightTheme = {
      overlayBg: 'rgba(255,255,255,0.9)',
      textColor: '#333',
      iconColor: '#3BD0E3',
      playButtonColor: '#fff',
      brightTone: '#fafafa',
      lightTone: '#eee',
      midTone: '#aaaaaa',
      darkTone: '#777',
      gradient: {
        primary: '#7E5589',
        secondary: '#3BD0E3',
        tertiary: '#FF067E'
      },
      visualizer: {
        rippleColor: '#FF067E',
        barColor: '#3BD0E3'
      }
    };
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
  ngAfterViewInit() {
    // this.svg = d3.select('svg'); var width = +this     .svg     .attr('width'),
    // var height = +this     .svg     .attr('height');   this.color =
    // d3.scaleOrdinal(d3.schemeCategory20);   this.simulation = d3
    // .forceSimulation()     .force('link', d3.forceLink().id(function (d) { return
    // d.id;     }))     .force('charge', d3.forceManyBody()) .force('center',
    // d3.forceCenter(width / 2, height / 2)); this.render(miserables);
    // this.componentDidMount();

  }

  public generateVisualization() {}
  public componentDidMount() {
    /*
          MOVE ALL OF THIS
          - This all should go into the MusicPlayer component and be passed through as props
          - Figure out best way to store and pass the Analyser, Media Element, etc...
       */
    // Get the audio data and format it for clean handoff to D3.js

    let audioCtx = new AudioContext();
    let audio = document.querySelector('audio');
    let audioElement = audio;

    var audioSrc = audioCtx.createMediaElementSource(audioElement);
    var analyser = audioCtx.createAnalyser();

    // Bind our analyser to the media element source.
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);

    /*
         D3 setup
      */
    // Setup the SVG
    let svgHeight = 900;

    let svgWidth = 600;
    this.svg = d3.select('svg');
    function createSvg1(parent, height, width) {
      return d3
        .select('#svg1')
        .attr('height', height)
        .attr('width', width);
    }
    function createSvg2(parent, height, width) {
      return d3
        .select('#svg2')
        .attr('height', height)
        .attr('width', width);
    }

    // Visualizer

    var graph1 = createSvg1('', svgWidth, svgHeight);
    var graph2 = createSvg2('', svgWidth, svgHeight);

    var frequencyData = new Uint8Array(255);
    this.renderFrequencyRipples(graph1, analyser, svgWidth, svgHeight);
    this.renderFrequencyBars(graph2, analyser, svgWidth, svgHeight);

    // switch (this.props.visualizerType) {   case 'RIPPLES':
    // this.renderFrequencyRipples(graph, analyser, svgWidth, svgHeight);
    // this.pulsateArt(analyser);     break;   case 'BARS':
    // this.renderFrequencyBars(graph, analyser, svgWidth, svgHeight);
    // this.pulsateArt(analyser);     break;   default:
    // this.renderFrequencyBars(graph, analyser, svgWidth, svgHeight);
    // this.pulsateArt(analyser); }
  };

  public renderFrequencyRipples(graph, analyser, svgWidth, svgHeight) {
    var i = 0;
    var frequencyData = new Uint8Array(svgWidth);
    var color = 'blue';

    // NEED TO DO THIS THE REACT WAY!! Continuously loop and update chart with
    // frequency data.
    function renderChart() {
      requestAnimationFrame(renderChart);
      var color = d3.hsl((i = (i + 1) % 360), 1, 0.66);
      // var color = this   .helpers   .randomProperty(gradient); Copy frequency data
      // to frequencyData array.
      analyser.getByteFrequencyData(frequencyData);

      graph
        .insert('circle', 'rect')
        .data(frequencyData)
        .attr('cx', function (d, i) {
          return d * (svgWidth / frequencyData.length);
        })
        .attr('cy', function (d) {
          return svgHeight + 10;
        })
        .attr('r', 1e-6)
        .style('stroke', color)
        .style('stroke-opacity', 0.7)
        .transition()
        .duration(10000)
        .ease(Math.sqrt)
        .attr('r', 600)
        .style('stroke-opacity', 0.001)
        .remove();
    }
    // Run the loop
    renderChart();
  };
  public startClass() {
    navigator
      .mediaDevices
      .getUserMedia({audio: true, video: false})
      .then(function (stream) {
        var audioTracks = stream.getAudioTracks();
        console.log('Got stream with constraints:',);
        console.log('Using audio device: ' + audioTracks[0].label);
        stream.oninactive = function () {
          console.log('Stream ended');
        };
        // window.stream = stream; // make variable available to browser console let let
        let audio = document.querySelector('audio');
        audio.srcObject = stream;
        this.componentDidMount();

      }.bind(this))
      .catch(this.handleError);
  };

  public pulsateArt(analyser) {
    // var albumArt = document.getElementById(this.props.playerId + 'AlbumArtImg');
    var frequencyData = new Uint8Array(8);

    function pulsate() {
      requestAnimationFrame(pulsate);
      // Copy frequency data to frequencyData array.
      analyser.getByteFrequencyData(frequencyData);
      // Get the average level
      var average = Math.ceil(this.helpers.getAverageVolume(frequencyData) / 10) * 10;
      // Pulsate the art albumArt.style.webkitFilter = 'blur(' + average / 50 + 'px)';
      // albumArt.style.filter = 'blur(' + average / 50 + 'px)';
    }

    pulsate();
  };
  public renderFrequencyBars(graph, analyser, svgWidth, svgHeight) {
    var barPadding = 1;
    var i = 0;
    var color = this.darkTheme.visualizer.barColor;
    var gradient = this.darkTheme.gradient;
    var frequencyData = new Uint8Array(133);
    graph
      .selectAll('rect')
      .data(frequencyData)
      .enter()
      .append('rect')
      .attr('fill', function (d) {
        // return d3.hsl((d = (d + 1) % 360), 1, 0.66) return d3.hsl((i = (i + 1) %
        // 360), 1, 0.66)
        return color;
      })
      .attr('width', svgWidth / frequencyData.length - barPadding)
      .attr('x', function (d, i) {
        return i * (svgWidth / frequencyData.length);
      });

    // NEED TO DO THIS THE REACT WAY!! Continuously loop and update chart with
    // frequency data.
    function renderChart() {
      requestAnimationFrame(renderChart);

      // Copy frequency data to frequencyData array.
      analyser.getByteFrequencyData(frequencyData);

      // Update d3 chart with new data.
      graph
        .selectAll('rect')
        .data(frequencyData)
        .attr('y', function (d) {
          return svgHeight - d;
        })
        .attr('height', function (d) {
          return d;
        });
    }
    // Run the loop
    renderChart();
  };

  public handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
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
