import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'audiofrequency',
    template: `
      
        <canvas #canvas></canvas>
     
  `
})
export class AudiofrequencyComponent {
    @ViewChild('canvas') canvasRef: ElementRef;
    private canvas: any;
    @Input() data: number[];
    @Input() width: number;
    @Input() height: number;
    @Input() colors: string[];
    @Input() title: string;

    constructor() {
        console.log("AudiofrequencyComponent constructor: width: ", this.width, ", height: ", this.height, ", colors: ", this.colors, ' this.canvas: ', this.canvas);
    }

    public ngOnInit() {
        console.log("AudiofrequencyComponent ngOnInit: width: ", this.width, ", height: ", this.height, ", colors: ", this.colors, ' this.canvas: ', this.canvas);
    }

    public ngAfterViewInit() {
        console.log("AudiofrequencyComponent ngAfterViewInit: width: ", this.width, ", height: ", this.height, ", colors: ", this.colors, ' this.canvas: ', this.canvas);
        this.canvas = this.canvasRef.nativeElement;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }

    public draw() {
        let drawVisual = requestAnimationFrame(draw);

        let analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }
        this.draw();
    }

    // if (this.canvas.getContext) {
    //     let c = this.canvas.getContext('2d');

    //     c.fillStyle = "#fefefe";
    //     c.fillRect(0, 0, this.width, this.height);

    //     let total = this.data.reduce((prevValue, currentDatapoint) => {
    //         return currentDatapoint['value'] + prevValue;
    //     }, 0);

    //     const center: [number, number] = [this.width / 2, this.height / 2];

    //     //draw pie data
    //     var prevAngle = 0;
    //     for (let i = 0; i < this.data.length; i++) {
    //         //fraction that this pieslice represents
    //         let fraction = this.data[i]['value'] / total;
    //         //calc starting angle
    //         let angle = prevAngle + fraction * Math.PI * 2;
    //         //draw the pie slice
    //         //fill with a radial gradient
    //         let grad = c.createRadialGradient(center[0], center[1], 10, center[0], center[1], 100);
    //         grad.addColorStop(0, 'white');
    //         grad.addColorStop(1, this.colors[i % this.colors.length]);
    //         c.fillStyle = grad;
    //         //create a path
    //         c.beginPath();
    //         c.moveTo(center[0], center[1]);
    //         c.arc(center[0], center[1], 100, prevAngle, angle, false);
    //         c.lineTo(center[0], center[1]);
    //         //fill it
    //         c.fill();
    //         //stroke it
    //         c.strokeStyle = "black";
    //         c.stroke();
    //         //update for next time through the loop
    //         prevAngle = angle;
    //     }

    //     //draw centered text
    //     c.fillStyle = "black";
    //     c.font = "24pt sans-serif";
    //     const text = this.title;
    //     const metrics = c.measureText(text);
    //     c.fillText(text, 250 - metrics.width / 2, 400);
}
}
